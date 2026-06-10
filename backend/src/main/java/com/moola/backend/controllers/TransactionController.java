package com.moola.backend.controllers;

import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AIService;
import com.moola.backend.services.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
// Main transaction API managing resource methods and AI financial auditing
public class TransactionController {
    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final AIService aiService;

    // Injected AIService into the controller constructor
    public TransactionController(TransactionService transactionService, UserRepository userRepository, AIService aiService) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByUsername(principal.getName()).orElseThrow();
    }

    @GetMapping
    public List<Transaction> getAll(Principal principal) {
        return transactionService.getAll(getAuthenticatedUser(principal));
    }

    @GetMapping("/advice")
    public Map<String, String> getAiAdvice(Principal principal) {
        User user = getAuthenticatedUser(principal);
        List<Transaction> transactions = transactionService.getAll(user);

        // Convert the collection of transaction database records into plain text data
        String transactionData = transactions.toString();

        // Extract the tone from the user entity and pass it to the AI service
        String advice = aiService.getFinancialAdvice(transactionData, user.getAdvisorTone());

        return Map.of("advice", advice);
    }

    @PostMapping
    public Transaction create(@Valid @RequestBody Transaction t, Principal principal) {
        return transactionService.create(t, getAuthenticatedUser(principal));
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable UUID id, @Valid @RequestBody Transaction t, Principal principal) {
        return transactionService.update(id, t, getAuthenticatedUser(principal));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, Principal principal) {
        java.util.UUID transactionUuid;

        try {
            // Check the id format before passing it to the service
            transactionUuid = java.util.UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            // Bad ids are shown as "not found" so the API answer stays simple
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Transaction ID structure is invalid or not found."
            );
        }

        transactionService.delete(transactionUuid, getAuthenticatedUser(principal));
    }

    @PatchMapping("/{id}")
    public Transaction patch(@PathVariable UUID id, @RequestBody Map<String, Object> updates, Principal principal) {
        return transactionService.patch(id, updates, getAuthenticatedUser(principal));
    }
}