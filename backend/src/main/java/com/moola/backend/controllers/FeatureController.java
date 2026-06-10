package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AIService;
import com.moola.backend.services.CurrencyService;
import com.moola.backend.services.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/features")
@CrossOrigin(origins = "*")
// Handles specific application features such as dynamic currency conversion and automated AI insights
public class FeatureController {

    private final AIService aiService;
    private final CurrencyService currencyService;
    private final TransactionService transactionService;
    private final UserRepository userRepository;

    // Added UserRepository to the constructor to track user preference profiles
    public FeatureController(AIService aiService, CurrencyService currencyService, TransactionService transactionService, UserRepository userRepository) {
        this.aiService = aiService;
        this.currencyService = currencyService;
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/advice")
    public ResponseEntity<Map<String, String>> getAutomatedAdvice(@RequestParam(defaultValue = "30") int days, Principal principal) {
        // Fetch the corresponding persistent user context from the database mapping layer
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user metadata context not found"));

        // Compile and format active historical ledger rows into a structural summary string
        String dataSummary = transactionService.getAll(user).stream()
                .map(t -> {
                    String safeDesc = t.getDescription() != null ? t.getDescription() : "No description";
                    String categoryName = t.getCategory() != null ? t.getCategory().getName() : "General";
                    return String.format("[%s, Amount: %s, Desc: %s, Impulse: %b, Regret: %b]",
                            categoryName, t.getAmount(), safeDesc, t.isImpulseBuy(), t.isRegret());
                })
                .collect(Collectors.joining("; "));

        // Resolved the signature mismatch by explicitly passing user preference configurations
        String advice = aiService.getFinancialAdvice(dataSummary, user.getAdvisorTone());

        return ResponseEntity.ok(Map.of("advice", advice));
    }

    @GetMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount) {

        BigDecimal convertedAmount = currencyService.convertCurrency(from, to, amount);

        return ResponseEntity.ok(Map.of(
                "from", from,
                "to", to,
                "originalAmount", amount,
                "convertedAmount", convertedAmount
        ));
    }
}