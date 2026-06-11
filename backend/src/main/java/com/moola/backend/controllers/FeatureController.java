package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AIService;
import com.moola.backend.services.CurrencyService;
import com.moola.backend.services.TransactionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/features")
@CrossOrigin(origins = "*")
// handles specific application features such as dynamic currency conversion and automated ai insights
public class FeatureController {

    private final AIService aiService;
    private final CurrencyService currencyService;
    private final TransactionService transactionService;
    private final UserRepository userRepository;

    // adds userrepository to track user preference profiles
    public FeatureController(AIService aiService, CurrencyService currencyService, TransactionService transactionService, UserRepository userRepository) {
        this.aiService = aiService;
        this.currencyService = currencyService;
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    @GetMapping(value = "/advice", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<AdviceResponse> getAutomatedAdvice(@RequestParam(defaultValue = "30") int days, Principal principal) {
        // fetch the corresponding persistent user context from the database mapping layer
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user metadata context not found"));

        // compile and format active historical ledger rows into a structural summary string
        String dataSummary = transactionService.getAll(user).stream()
                .map(t -> {
                    String safeDesc = t.getDescription() != null ? t.getDescription() : "No description";
                    String categoryName = t.getCategory() != null ? t.getCategory().getName() : "General";
                    return String.format("[%s, Amount: %s, Desc: %s, Impulse: %b, Regret: %b]",
                            categoryName, t.getAmount(), safeDesc, t.isImpulseBuy(), t.isRegret());
                })
                .collect(Collectors.joining("; "));

        // pass the selected user tone into the ai service
        String advice = aiService.getFinancialAdvice(dataSummary, user.getAdvisorTone());

        return ResponseEntity.ok(new AdviceResponse(advice));
    }

    @GetMapping(value = "/convert", produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity<ConversionResponse> convert(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount) {

        BigDecimal convertedAmount = currencyService.convertCurrency(from, to, amount);

        return ResponseEntity.ok(new ConversionResponse(from, to, amount, convertedAmount));
    }

    public static class AdviceResponse {
        public String advice;

        public AdviceResponse() {}

        public AdviceResponse(String advice) {
            this.advice = advice;
        }
    }

    public static class ConversionResponse {
        public String from;
        public String to;
        public BigDecimal originalAmount;
        public BigDecimal convertedAmount;

        public ConversionResponse() {}

        public ConversionResponse(String from, String to, BigDecimal originalAmount, BigDecimal convertedAmount) {
            this.from = from;
            this.to = to;
            this.originalAmount = originalAmount;
            this.convertedAmount = convertedAmount;
        }
    }
}
