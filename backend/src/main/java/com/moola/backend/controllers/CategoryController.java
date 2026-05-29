package com.moola.backend.controllers;

import com.moola.backend.models.Category;
import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
// exposes category CRUD endpoints use this when explaining GET, POST, PUT, DELETE, and PATCH
public class CategoryController {
    private final CategoryService categoryService;
    private final UserRepository userRepository;

    public CategoryController(CategoryService categoryService, UserRepository userRepository) {
        this.categoryService = categoryService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByUsername(principal.getName()).orElseThrow();
    }

    @GetMapping
    public List<Category> getAllCategories(Principal principal) {
        return categoryService.getAllCategories(getAuthenticatedUser(principal));
    }

    @PostMapping
    public Category createCategory(@Valid @RequestBody Category category, Principal principal) {
        return categoryService.createCategory(category, getAuthenticatedUser(principal));
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable UUID id, @Valid @RequestBody Category updatedCategory, Principal principal) {
        return categoryService.updateCategory(id, updatedCategory, getAuthenticatedUser(principal));
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable UUID id, Principal principal) {
        categoryService.deleteCategory(id, getAuthenticatedUser(principal));
    }

    @PatchMapping("/{id}")
    public Category patchCategory(@PathVariable UUID id, @RequestBody Map<String, Object> updates, Principal principal) {
        return categoryService.patchCategory(id, updates, getAuthenticatedUser(principal));
    }
}
