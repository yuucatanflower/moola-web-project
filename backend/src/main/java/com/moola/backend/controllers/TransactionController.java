package com.moola.backend.controllers;

import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
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
public class TransactionController {
    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByUsername(principal.getName()).orElseThrow();
    }

    @GetMapping
    public List<Transaction> getAll(Principal principal) {
        return transactionService.getAll(getAuthenticatedUser(principal));
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
    public void delete(@PathVariable String id, Principal principal) { // Intercept as String
        java.util.UUID transactionUuid;

        try {
            // Safe validation step
            transactionUuid = java.util.UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            // If it isn't a valid UUID string structure, instantly drop a 404 instead of a 400
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