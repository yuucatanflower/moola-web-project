package com.moola.backend;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import com.moola.backend.repositories.WalletRepository;
import com.moola.backend.services.CurrencyService;
import com.moola.backend.services.TransactionService;
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

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CurrencyService currencyService;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private Category testCategory;
    private Transaction testTransaction;
    private Wallet testWallet;
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

        testWallet = new Wallet(); // Initialize target user wallet
        testWallet.setId(1L);
        testWallet.setBalance(new BigDecimal("1000.00"));
        testWallet.setCurrency("EUR");
        testWallet.setUser(testUser);

        testTransaction = new Transaction();
        testTransaction.setId(transactionId);
        testTransaction.setAmount(new BigDecimal("50.00"));
        testTransaction.setType("expense");
        testTransaction.setCurrency("EUR");
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
        // Mock dependencies introduced during wallet/currency service upgrades
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(testCategory));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        when(currencyService.convertCurrency(any(), any(), any())).thenReturn(new BigDecimal("50.00"));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Transaction newTx = new Transaction();
        newTx.setAmount(new BigDecimal("50.00"));
        newTx.setType("expense");
        newTx.setCategory(testCategory);

        Transaction result = transactionService.create(newTx, testUser);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(testCategory, result.getCategory());
        verify(transactionRepository, times(1)).save(newTx);
        verify(walletRepository, times(1)).save(testWallet); // Verifies ledger calculations commit state shifts
    }

    @Test
    void create_WithForeignCategory_ShouldThrowException() {
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

    @Test
    void create_WithIncomeType_ShouldIncreaseWalletBalance() {
        // Arrange
        BigDecimal startingBalance = new BigDecimal("1000.00");
        BigDecimal incomeAmount = new BigDecimal("500.00");
        testWallet.setBalance(startingBalance);

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        when(currencyService.convertCurrency("EUR", "EUR", incomeAmount)).thenReturn(incomeAmount);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Transaction incomeTx = new Transaction();
        incomeTx.setAmount(incomeAmount);
        incomeTx.setType("INCOME"); // Explicitly setting type to INCOME
        incomeTx.setCurrency("EUR");

        // Act
        transactionService.create(incomeTx, testUser);

        // Assert
        // Starting 1000.00 + Income 500.00 = 1500.00
        assertEquals(new BigDecimal("1500.00"), testWallet.getBalance());
        verify(walletRepository, times(1)).save(testWallet);
    }

    @Test
    void create_WithForeignCurrency_ShouldApplyExchangeRateBeforeDeducting() {
        // Arrange
        BigDecimal startingBalance = new BigDecimal("1000.00");
        BigDecimal usdAmount = new BigDecimal("100.00");
        BigDecimal convertedEurAmount = new BigDecimal("90.00"); // Simulated FX Conversion Rate (100 USD = 90 EUR)
        testWallet.setBalance(startingBalance);

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        // Mock CurrencyService to return the converted EUR amount when fed USD input parameters
        when(currencyService.convertCurrency("USD", "EUR", usdAmount)).thenReturn(convertedEurAmount);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Transaction foreignTx = new Transaction();
        foreignTx.setAmount(usdAmount);
        foreignTx.setType("EXPENSE");
        foreignTx.setCurrency("USD"); // Explicitly setting currency to USD

        // Act
        transactionService.create(foreignTx, testUser);

        // Assert
        // Starting 1000.00 - Converted Expense 90.00 = 910.00
        assertEquals(new BigDecimal("910.00"), testWallet.getBalance());
        verify(currencyService, times(1)).convertCurrency("USD", "EUR", usdAmount);
        verify(walletRepository, times(1)).save(testWallet);
    }
}