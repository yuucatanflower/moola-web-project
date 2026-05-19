package com.moola.backend.controllers;

import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.TransactionService;
import jakarta.validation.Valid;
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
    public void delete(@PathVariable UUID id, Principal principal) {
        transactionService.delete(id, getAuthenticatedUser(principal));
    }

    @PatchMapping("/{id}")
    public Transaction patch(@PathVariable UUID id, @RequestBody Map<String, Object> updates, Principal principal) {
        return transactionService.patch(id, updates, getAuthenticatedUser(principal));
    }
}