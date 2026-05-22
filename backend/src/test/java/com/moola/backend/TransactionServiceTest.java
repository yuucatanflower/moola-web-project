package com.moola.backend.services;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
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
public class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private Category testCategory;
    private Transaction testTransaction;
    private UUID userId;
    private UUID categoryId;
    private UUID transactionId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        transactionId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");

        testCategory = new Category();
        testCategory.setId(categoryId);
        testCategory.setUser(testUser);

        testTransaction = new Transaction();
        testTransaction.setId(transactionId);
        testTransaction.setAmount(new BigDecimal("50.00"));
        testTransaction.setType("expense");
        testTransaction.setDate(LocalDate.now());
        testTransaction.setUser(testUser);
        testTransaction.setCategory(testCategory);
    }

    @Test
    void getAll_ShouldReturnUserTransactions() {
        when(transactionRepository.findAllByUserId(userId)).thenReturn(List.of(testTransaction));

        List<Transaction> result = transactionService.getAll(testUser);

        assertEquals(1, result.size());
        assertEquals(transactionId, result.get(0).getId());
        verify(transactionRepository, times(1)).findAllByUserId(userId);
    }

    @Test
    void create_WithValidCategory_ShouldSaveTransaction() {
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(testCategory));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Transaction newTx = new Transaction();
        newTx.setCategory(testCategory);

        Transaction result = transactionService.create(newTx, testUser);

        assertEquals(testUser, result.getUser());
        assertEquals(testCategory, result.getCategory());
        verify(transactionRepository, times(1)).save(newTx);
    }

    @Test
    void create_WithForeignCategory_ShouldThrowException() {
        // Simulating an IDOR attempt: user tries to attach a category they don't own
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.empty());

        Transaction newTx = new Transaction();
        newTx.setCategory(testCategory);

        assertThrows(ResponseStatusException.class, () -> {
            transactionService.create(newTx, testUser);
        });
    }

    @Test
    void patch_ShouldUpdateBehavioralTags() {
        when(transactionRepository.findByIdAndUserId(transactionId, userId)).thenReturn(Optional.of(testTransaction));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Map<String, Object> updates = new HashMap<>();
        updates.put("isImpulseBuy", true);
        updates.put("isRegret", true);

        Transaction result = transactionService.patch(transactionId, updates, testUser);

        assertTrue(result.isImpulseBuy());
        assertTrue(result.isRegret());
        verify(transactionRepository, times(1)).save(testTransaction);
    }

    @Test
    void delete_WhenNotOwnedByUser_ShouldThrowException() {
        when(transactionRepository.findByIdAndUserId(transactionId, userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            transactionService.delete(transactionId, testUser);
        });
    }
}