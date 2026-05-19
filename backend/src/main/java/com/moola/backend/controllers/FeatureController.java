package com.moola.backend.controllers;

import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.TransactionRepository;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AIService;
import com.moola.backend.services.CurrencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/features")
@CrossOrigin(origins = "*")
public class FeatureController {
    private final AIService aiService;
    private final CurrencyService currencyService;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public FeatureController(AIService aiService, CurrencyService currencyService, TransactionRepository transactionRepository, UserRepository userRepository) {
        this.aiService = aiService;
        this.currencyService = currencyService;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/advice")
    public ResponseEntity<Map<String, String>> getAutomatedAdvice(@RequestParam(defaultValue = "30") int days, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        LocalDate cutoffDate = LocalDate.now().minusDays(days);

        // Security Fix: Fetch ONLY the authenticated user's transactions
        List<Transaction> transactions = transactionRepository.findAllByUserIdAndDateAfter(user.getId(), cutoffDate);

        if (transactions.isEmpty()) {
            return ResponseEntity.ok(Map.of("advice", "No transaction logs found for this timeframe. Add expenses first."));
        }

        String dataSummary = transactions.stream()
                .map(t -> {
                    // Security Fix: Sanitize description to prevent prompt injection
                    String safeDesc = t.getDescription() != null ?
                            t.getDescription().replaceAll("[^a-zA-Z0-9 ]", "").substring(0, Math.min(t.getDescription().length(), 20))
                            : "No details";
                    return String.format("[%s, amt:%s, desc:%s, impulse:%b, regret:%b]",
                            t.getCategory() != null ? t.getCategory().getName() : "General",
                            t.getAmount(), safeDesc, t.isImpulseBuy(), t.isRegret());
                })
                .collect(Collectors.joining("; "));

        String advice = aiService.getFinancialAdvice(dataSummary);
        return ResponseEntity.ok(Map.of("advice", advice));
    }

    @GetMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(@RequestParam String from,
                                                       @RequestParam String to,
                                                       @RequestParam BigDecimal amount) {
        BigDecimal convertedAmount = currencyService.convertCurrency(from, to, amount);
        return ResponseEntity.ok(Map.of("from", from, "to", to, "originalAmount", amount, "convertedAmount", convertedAmount));
    }
}