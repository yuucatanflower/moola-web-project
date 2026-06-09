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
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public CategoryService(CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Category> getAllCategories(User user) {
        return categoryRepository.findAllByUserId(user.getId());
    }

    public Category createCategory(Category category, User user) {
        category.setUser(user);
        return categoryRepository.save(category);
    }

    public Category getCategoryById(UUID id, User user) {
        return categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    public Category updateCategory(UUID id, Category updatedCategory, User user) {
        Category existing = getCategoryById(id, user);
        existing.setName(updatedCategory.getName());
        existing.setColorHex(updatedCategory.getColorHex()); // Keeps your optional hex colors clean
        return categoryRepository.save(existing);
    }

    public void deleteCategory(UUID id, User user) {
        List<Transaction> attachedTransactions = transactionRepository.findByCategoryIdAndUserId(id, user.getId());
        for (Transaction t : attachedTransactions) {
            t.setCategory(null);
            transactionRepository.save(t);
        }
        Category category = getCategoryById(id, user);
        categoryRepository.delete(category);
    }

    public Category patchCategory(UUID id, Map<String, Object> updates, User user) {
        Category existing = getCategoryById(id, user);
        if (updates.containsKey("name")) existing.setName((String) updates.get("name"));
        if (updates.containsKey("colorHex")) existing.setColorHex((String) updates.get("colorHex"));
        return categoryRepository.save(existing);
    }
}