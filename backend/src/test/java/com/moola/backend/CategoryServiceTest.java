package com.moola.backend;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import com.moola.backend.services.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// tests category logic, especially that categories belong to the right user
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private CategoryService categoryService;

    private User testUser;
    private Category testCategory;
    private UUID userId;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");

        testCategory = new Category();
        testCategory.setId(categoryId);
        testCategory.setName("Groceries");
        testCategory.setColorHex("#FFFFFF");
        testCategory.setEmoji("🛒");
        testCategory.setUser(testUser);
    }

    @Test
    void getAllCategories_ShouldReturnUserCategories() {
        when(categoryRepository.findAllByUserId(userId)).thenReturn(List.of(testCategory));

        List<Category> result = categoryService.getAllCategories(testUser);

        assertEquals(1, result.size());
        assertEquals("Groceries", result.get(0).getName());
        verify(categoryRepository, times(1)).findAllByUserId(userId);
    }

    @Test
    void createCategory_ShouldAssignUserAndSave() {
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        Category newCategory = new Category();
        newCategory.setName("Groceries");

        Category result = categoryService.createCategory(newCategory, testUser);

        assertNotNull(result.getUser());
        assertEquals(userId, result.getUser().getId());
        verify(categoryRepository, times(1)).save(newCategory);
    }

    @Test
    void getCategoryById_WhenExistsAndOwnedByUser_ShouldReturnCategory() {
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(testCategory));

        Category result = categoryService.getCategoryById(categoryId, testUser);

        assertEquals(categoryId, result.getId());
    }

    @Test
    void getCategoryById_WhenNotOwnedByUser_ShouldThrowException() {
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            categoryService.getCategoryById(categoryId, testUser);
        });
    }

    @Test
    void deleteCategory_ShouldUnlinkTransactionsAndThenDelete() {
        Transaction mockTransaction = new Transaction();
        mockTransaction.setId(UUID.randomUUID());
        mockTransaction.setCategory(testCategory);

        when(transactionRepository.findByCategoryIdAndUserId(categoryId, userId)).thenReturn(List.of(mockTransaction));
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(testCategory));

        categoryService.deleteCategory(categoryId, testUser);

        // transactions keep existing, but lose the deleted category
        assertNull(mockTransaction.getCategory());
        verify(transactionRepository, times(1)).save(mockTransaction);

        // the category itself is removed after unlinking transactions
        verify(categoryRepository, times(1)).delete(testCategory);
    }
}
