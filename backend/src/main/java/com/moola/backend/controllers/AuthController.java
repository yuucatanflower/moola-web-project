package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
// Handles register, login, and user profile updates
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
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
        safeUserData.put("advisorTone", user.getAdvisorTone()); // Included to remember user preference upon login

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("user", safeUserData);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
        // Extract the original username to find the correct database record
        String currentUsername = (String) body.get("currentUsername");
        if (currentUsername == null || currentUsername.trim().isEmpty()) {
            throw new RuntimeException("Current username is required");
        }

        // Fetch user using the old username
        User user = userRepository.findByUsername(currentUsername.trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Apply the new username if it was changed
        String newUsername = (String) body.get("newUsername");
        if (newUsername != null && !newUsername.trim().isEmpty()) {
            user.setUsername(newUsername.trim());
        }

        // Apply hourly wage update
        if (body.containsKey("hourlyWage")) {
            Object wageObj = body.get("hourlyWage");
            if (wageObj != null) {
                user.setHourlyWage(new BigDecimal(wageObj.toString()));
            }
        }

        // Apply advisor personality tone update
        if (body.containsKey("advisorTone")) {
            String newTone = (String) body.get("advisorTone");
            if (newTone != null) {
                user.setAdvisorTone(newTone.trim());
            }
        }

        // Save modifications to the database
        User updatedUser = userRepository.save(user);

        // Prepare the response payload
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
        safeUserData.put("advisorTone", updatedUser.getAdvisorTone()); // Synchronizes frontend state context after updates

        return ResponseEntity.ok(safeUserData);
    }
}

// Small request DTO used exclusively for registration mapping structures
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