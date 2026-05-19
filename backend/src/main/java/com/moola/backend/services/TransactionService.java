package com.moola.backend.services;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TransactionService {
    private final TransactionRepository repository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository repository, CategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    public List<Transaction> getAll(User user) {
        return repository.findAllByUserId(user.getId());
    }

    public Transaction create(Transaction transaction, User user) {
        transaction.setUser(user);
        if (transaction.getCategory() != null && transaction.getCategory().getId() != null) {
            Category fullCategory = categoryRepository.findByIdAndUserId(transaction.getCategory().getId(), user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            transaction.setCategory(fullCategory);
        }
        return repository.save(transaction);
    }

    public Transaction update(UUID id, Transaction updatedTransaction, User user) {
        return repository.findByIdAndUserId(id, user.getId()).map(existing -> {
            existing.setAmount(updatedTransaction.getAmount());
            existing.setType(updatedTransaction.getType());
            existing.setDate(updatedTransaction.getDate());
            existing.setDescription(updatedTransaction.getDescription());
            existing.setRecurrent(updatedTransaction.isRecurrent());
            existing.setImpulseBuy(updatedTransaction.isImpulseBuy());
            existing.setRegret(updatedTransaction.isRegret());

            if (updatedTransaction.getCategory() != null && updatedTransaction.getCategory().getId() != null) {
                Category fullCategory = categoryRepository.findByIdAndUserId(updatedTransaction.getCategory().getId(), user.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
                existing.setCategory(fullCategory);
            } else {
                existing.setCategory(null);
            }
            return repository.save(existing);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public Transaction patch(UUID id, Map<String, Object> updates, User user) {
        return repository.findByIdAndUserId(id, user.getId()).map(existing -> {
            if (updates.containsKey("description")) existing.setDescription((String) updates.get("description"));
            if (updates.containsKey("isRecurrent")) existing.setRecurrent((boolean) updates.get("isRecurrent"));
            if (updates.containsKey("isImpulseBuy")) existing.setImpulseBuy((boolean) updates.get("isImpulseBuy"));
            if (updates.containsKey("isRegret")) existing.setRegret((boolean) updates.get("isRegret"));
            return repository.save(existing);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public void delete(UUID id, User user) {
        Transaction existing = repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        repository.delete(existing);
    }
}