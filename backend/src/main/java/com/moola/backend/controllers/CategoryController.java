package com.moola.backend.controllers;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryRepository repository;
    private final TransactionRepository transactionRepository;

    public CategoryController(CategoryRepository repository, TransactionRepository transactionRepository) {
        this.repository = repository;
        this.transactionRepository = transactionRepository;
    }

    //GET: fetch all categories
    @GetMapping
    public List<Category> getAllCategories() {
        return repository.findAll();
    }

    //POST: create a new category
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return repository.save(category);
    }

    //PUT: update a category name, color, or emoji
    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category updatedCategory) {
        return repository.findById(id).map(existingCategory -> {
            existingCategory.setName(updatedCategory.getName());
            existingCategory.setColorHex(updatedCategory.getColorHex());
            existingCategory.setEmoji(updatedCategory.getEmoji());
            return repository.save(existingCategory);
        }).orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }

    //DELETE: safely delete a category
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        //find all transactions using this category
        List<Transaction> attachedTransactions = transactionRepository.findByCategoryId(id);

        //unlink them (set category to null)
        for (Transaction t : attachedTransactions) {
            t.setCategory(null);
            transactionRepository.save(t);
        }

        repository.deleteById(id);
    }

    //PATCH Request: partially update a category
    @PatchMapping("/{id}")
    public Category patchCategory(@PathVariable Long id, @RequestBody java.util.Map<String, Object> updates) {
        return repository.findById(id).map(existingCategory -> {

            if (updates.containsKey("name")) {
                existingCategory.setName((String) updates.get("name"));
            }
            if (updates.containsKey("colorHex")) {
                existingCategory.setColorHex((String) updates.get("colorHex"));
            }
            if (updates.containsKey("emoji")) {
                existingCategory.setEmoji((String) updates.get("emoji"));
            }

            return repository.save(existingCategory);
        }).orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }
}