package com.moola.backend.services;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {
    private final TransactionRepository repository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository repository, CategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    public List<Transaction> getAll() { return repository.findAll(); }

    public Transaction create(Transaction transaction) {
        if (transaction.getCategory() != null && transaction.getCategory().getId() != null) {
            Category fullCategory = categoryRepository.findById(transaction.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found!"));
            transaction.setCategory(fullCategory);
        }
        return repository.save(transaction);
    }

    //Full update method that handles the Category lookup correctly
    public Transaction update(Long id, Transaction updatedTransaction) {
        return repository.findById(id).map(existing -> {
            existing.setAmount(updatedTransaction.getAmount());
            existing.setType(updatedTransaction.getType());
            existing.setDate(updatedTransaction.getDate());
            existing.setDescription(updatedTransaction.getDescription());
            existing.setRecurrent(updatedTransaction.isRecurrent());

            // Handle Category lookup properly
            if (updatedTransaction.getCategory() != null && updatedTransaction.getCategory().getId() != null) {
                Category fullCategory = categoryRepository.findById(updatedTransaction.getCategory().getId())
                        .orElseThrow(() -> new RuntimeException("Category not found!"));
                existing.setCategory(fullCategory);
            } else {
                existing.setCategory(null);
            }

            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Transaction not found with id " + id));
    }

    public Transaction patch(Long id, Map<String, Object> updates) {
        return repository.findById(id).map(existing -> {
            if (updates.containsKey("description")) existing.setDescription((String) updates.get("description"));
            if (updates.containsKey("isRecurrent")) existing.setRecurrent((boolean) updates.get("isRecurrent"));
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Not found"));
    }

    public void delete(Long id) { repository.deleteById(id); }
}