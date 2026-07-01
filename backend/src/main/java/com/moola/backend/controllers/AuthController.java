package com.moola.backend.controllers;

import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.TransactionRepository;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AuthService;
import com.moola.backend.services.CurrencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// Handles register, login, and user profile updates
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final CurrencyService currencyService;
    private final TransactionRepository transactionRepository;

    public AuthController(AuthService authService, UserRepository userRepository, CurrencyService currencyService, TransactionRepository transactionRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.currencyService = currencyService;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());

        // Keep the hourly wage safe even if the frontend sends nothing
        if (request.getHourlyWage() != null) {
            user.setHourlyWage(BigDecimal.valueOf(request.getHourlyWage().doubleValue()));
        } else {
            user.setHourlyWage(BigDecimal.valueOf(0.0));
        }

        return ResponseEntity.ok(authService.register(user, request.getStartingBalance()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String token = authService.login(username, body.get("password"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal currentBalance = BigDecimal.ZERO;
        String walletCurrency = "EUR";
        if (user.getWallet() != null) {
            currentBalance = user.getWallet().getBalance();
            walletCurrency = user.getWallet().getCurrency();
        }

        Map<String, Object> safeUserData = new HashMap<>();
        safeUserData.put("id", user.getId());
        safeUserData.put("username", user.getUsername());
        safeUserData.put("hourlyWage", user.getHourlyWage());
        safeUserData.put("role", user.getRole());
        safeUserData.put("balance", currentBalance);
        safeUserData.put("currency", walletCurrency);
        safeUserData.put("advisorTone", user.getAdvisorTone()); // included to remember user preference upon login
        safeUserData.put("preferredCurrency", user.getPreferredCurrency());
        safeUserData.put("salaryShield", user.isSalaryShield());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("user", safeUserData);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body, Principal principal) {
        // derive the target user from the authenticated jwt, never from client input,
        // otherwise any caller could edit another user's profile by supplying their username
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // apply the new username if it was changed
        String newUsername = (String) body.get("newUsername");
        if (newUsername != null && !newUsername.trim().isEmpty()) {
            user.setUsername(newUsername.trim());
        }

        // apply hourly wage update
        if (body.containsKey("hourlyWage")) {
            Object wageObj = body.get("hourlyWage");
            if (wageObj != null) {
                user.setHourlyWage(new BigDecimal(wageObj.toString()));
            }
        }

        // apply advisor personality tone update
        if (body.containsKey("advisorTone")) {
            String newTone = (String) body.get("advisorTone");
            if (newTone != null) {
                user.setAdvisorTone(newTone.trim());
            }
        }

        // apply salary shield update
        if (body.containsKey("salaryShield")) {
            Object shieldObj = body.get("salaryShield");
            if (shieldObj != null) {
                user.setSalaryShield(Boolean.parseBoolean(shieldObj.toString()));
            }
        }

        // apply preferred currency update AND convert all monetary values
        if (body.containsKey("preferredCurrency")) {
            String newCurrency = (String) body.get("preferredCurrency");
            if (newCurrency != null && !newCurrency.trim().equalsIgnoreCase(user.getPreferredCurrency())) {
                String oldCurrency = user.getPreferredCurrency();
                String targetCurrency = newCurrency.trim().toUpperCase();

                // 1. Fetch the rate exactly ONCE to avoid API rate limits
                BigDecimal exchangeRate = currencyService.getExchangeRate(oldCurrency, targetCurrency);

                if (exchangeRate.compareTo(BigDecimal.ONE) != 0) {
                    // 2. Convert hourly wage
                    user.setHourlyWage(user.getHourlyWage().multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP));

                    // 3. Convert wallet balance
                    if (user.getWallet() != null) {
                        user.getWallet().setBalance(user.getWallet().getBalance().multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP));
                        user.getWallet().setCurrency(targetCurrency);
                    }

                    // 4. Convert all historical transactions belonging to this user
                    List<Transaction> userTransactions = transactionRepository.findAllByUserId(user.getId());
                    for (Transaction t : userTransactions) {
                        t.setAmount(t.getAmount().multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP));
                        t.setCurrency(targetCurrency);
                    }
                    transactionRepository.saveAll(userTransactions);
                }

                // Update user preference
                user.setPreferredCurrency(targetCurrency);
            }
        }

        // save modifications to the database
        User updatedUser = userRepository.save(user);

        // prepare the response payload
        BigDecimal currentBalance = BigDecimal.ZERO;
        String walletCurrency = "EUR";
        if (updatedUser.getWallet() != null) {
            currentBalance = updatedUser.getWallet().getBalance();
            walletCurrency = updatedUser.getWallet().getCurrency();
        }

        Map<String, Object> safeUserData = new HashMap<>();
        safeUserData.put("id", updatedUser.getId());
        safeUserData.put("username", updatedUser.getUsername());
        safeUserData.put("hourlyWage", updatedUser.getHourlyWage());
        safeUserData.put("role", updatedUser.getRole());
        safeUserData.put("balance", currentBalance);
        safeUserData.put("currency", walletCurrency);
        safeUserData.put("advisorTone", updatedUser.getAdvisorTone()); // synchronizes frontend state context after updates
        safeUserData.put("preferredCurrency", updatedUser.getPreferredCurrency());
        safeUserData.put("salaryShield", updatedUser.isSalaryShield());

        return ResponseEntity.ok(safeUserData);
    }
}

// small request dto used exclusively for registration mapping structures
class RegisterRequest {
    private String username;
    private String password;
    private BigDecimal hourlyWage;
    private BigDecimal startingBalance;

    public RegisterRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public BigDecimal getHourlyWage() { return hourlyWage; }
    public void setHourlyWage(BigDecimal hourlyWage) { this.hourlyWage = hourlyWage; }

    public BigDecimal getStartingBalance() { return startingBalance; }
    public void setStartingBalance(BigDecimal startingBalance) { this.startingBalance = startingBalance; }
}