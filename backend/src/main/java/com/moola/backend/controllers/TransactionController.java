package com.moola.backend.controllers;

import com.moola.backend.models.Transaction;
import com.moola.backend.services.TransactionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    private final TransactionService transactionService;

    // Use ONLY the service, not repositories
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<Transaction> getAll() { return transactionService.getAll(); }

    @PostMapping
    public Transaction create(@RequestBody Transaction t) { return transactionService.create(t); }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @RequestBody Transaction t) {
        return transactionService.update(id, t); // This calls the service logic we built
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { transactionService.delete(id); }

    @PatchMapping("/{id}")
    public Transaction patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return transactionService.patch(id, updates);
    }
}