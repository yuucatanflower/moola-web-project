package com.moola.backend.services;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    // Constructor injection for repositories
    public CategoryService(CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    // GET: fetch all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // POST: create a new category
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Helper: find category or throw error
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }

    // PUT: update an entire category
    public Category updateCategory(Long id, Category updatedCategory) {
        Category existing = getCategoryById(id);
        existing.setName(updatedCategory.getName());
        existing.setColorHex(updatedCategory.getColorHex());
        existing.setEmoji(updatedCategory.getEmoji());
        return categoryRepository.save(existing);
    }

    /**
     * DELETE: Safely removes a category by first unlinking all transactions.
     * This prevents Foreign Key constraint errors or orphaned records.
     */
    public void deleteCategory(Long id) {
        // find all transactions using this category
        List<Transaction> attachedTransactions = transactionRepository.findByCategoryId(id);

        // unlink them (set category to null)
        for (Transaction t : attachedTransactions) {
            t.setCategory(null);
            transactionRepository.save(t);
        }

        categoryRepository.deleteById(id);
    }

    // PATCH: update only specific fields
    public Category patchCategory(Long id, Map<String, Object> updates) {
        Category existing = getCategoryById(id);

        if (updates.containsKey("name")) {
            existing.setName((String) updates.get("name"));
        }
        if (updates.containsKey("colorHex")) {
            existing.setColorHex((String) updates.get("colorHex"));
        }
        if (updates.containsKey("emoji")) {
            existing.setEmoji((String) updates.get("emoji"));
        }

        return categoryRepository.save(existing);
    }
}