package com.moola.backend.controllers;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.repositories.TransactionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") //CORS bypass
public class TransactionController {

    private final TransactionRepository repository;
    private final com.moola.backend.repositories.CategoryRepository categoryRepository;

    public TransactionController(TransactionRepository repository, com.moola.backend.repositories.CategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    //GET Request: fetches all transactions for the dashboard
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return repository.findAll();
    }

    //POST Request: saves a new transaction from the quick entry screen
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        if (transaction.getCategory() != null) {
            Long catId = transaction.getCategory().getId();
            if (catId != null) {
                Category fullCategory = categoryRepository.findById(catId)
                        .orElseThrow(() -> new RuntimeException("Category not found!"));
                transaction.setCategory(fullCategory);
            }
        }
        return repository.save(transaction);
    }

    //PUT Request: overwrites the whole transaction
    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Long id, @RequestBody Transaction updatedTransaction) {
        return repository.findById(id).map(existingTransaction -> {
            existingTransaction.setAmount(updatedTransaction.getAmount());
            existingTransaction.setType(updatedTransaction.getType());
            existingTransaction.setDate(updatedTransaction.getDate());
            existingTransaction.setDescription(updatedTransaction.getDescription());

            existingTransaction.setCategory(updatedTransaction.getCategory());

            return repository.save(existingTransaction);
        }).orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }

    //DELETE Request: trashes a transaction
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        repository.deleteById(id);
    }

    //PATCH Request: partially updates (eg adding a category later)
    @PatchMapping("/{id}")
    public Transaction patchTransaction(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        return repository.findById(id).map(existingTransaction -> {

            if (updates.containsKey("description")) {
                existingTransaction.setDescription((String) updates.get("description"));
            }

            if (updates.containsKey("category")) {
                //  Category is a complex object (with emojis/colors)
                // we use Jackson's ObjectMapper to safely convert the JSON into Java
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Category updatedCategory = mapper.convertValue(updates.get("category"), Category.class);
                existingTransaction.setCategory(updatedCategory);
            }

            return repository.save(existingTransaction);
        }).orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }
}