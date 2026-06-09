package com.moola.backend.services;

import com.moola.backend.models.Category;
import com.moola.backend.models.Transaction;
import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.CategoryRepository;
import com.moola.backend.repositories.TransactionRepository;
import com.moola.backend.repositories.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TransactionService {
    private final TransactionRepository repository;
    private final CategoryRepository categoryRepository;
    private final WalletRepository walletRepository;
    private final CurrencyService currencyService;

    public TransactionService(TransactionRepository repository,
                              CategoryRepository categoryRepository,
                              WalletRepository walletRepository,
                              CurrencyService currencyService) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
        this.walletRepository = walletRepository;
        this.currencyService = currencyService;
    }

    public List<Transaction> getAll(User user) {
        return repository.findAllByUserId(user.getId());
    }

    @Transactional
    public Transaction create(Transaction transaction, User user) {
        transaction.setUser(user);

        // --- UPGRADED: AUTOMATIC FIND-OR-CREATE CATEGORY RESOLUTION ---
        if (transaction.getCategory() != null) {
            Category incomingCategory = transaction.getCategory();

            if (incomingCategory.getId() != null) {
                // If an ID is provided, look it up normally
                Category fullCategory = categoryRepository.findByIdAndUserId(incomingCategory.getId(), user.getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
                transaction.setCategory(fullCategory);
            } else if (incomingCategory.getName() != null && !incomingCategory.getName().trim().isEmpty()) {
                // If only a Name string is provided, find it or generate it on the fly!
                String cleanName = incomingCategory.getName().trim();
                Category resolvedCategory = categoryRepository.findByUserAndName(user, cleanName)
                        .orElseGet(() -> {
                            Category newCategory = new Category(cleanName, user);
                            return categoryRepository.save(newCategory);
                        });
                transaction.setCategory(resolvedCategory);
            }
        }

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));

        String sourceCurrency = (transaction.getCurrency() != null) ? transaction.getCurrency() : wallet.getCurrency();
        BigDecimal walletNormalizedAmount = currencyService.convertCurrency(
                sourceCurrency,
                wallet.getCurrency(),
                transaction.getAmount()
        );

        if (transaction.getType() != null && transaction.getType().equalsIgnoreCase("INCOME")) {
            wallet.setBalance(wallet.getBalance().add(walletNormalizedAmount));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(walletNormalizedAmount));
        }
        walletRepository.save(wallet);

        return repository.save(transaction);
    }

    @Transactional
    public Transaction update(UUID id, Transaction updatedTransaction, User user) {
        return repository.findByIdAndUserId(id, user.getId()).map(existing -> {

            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));

            String existingCurrency = (existing.getCurrency() != null) ? existing.getCurrency() : wallet.getCurrency();
            BigDecimal existingNormalizedRefund = currencyService.convertCurrency(
                    existingCurrency,
                    wallet.getCurrency(),
                    existing.getAmount()
            );

            BigDecimal balanceBeforeOldTransaction;
            if (existing.getType() != null && existing.getType().equalsIgnoreCase("INCOME")) {
                balanceBeforeOldTransaction = wallet.getBalance().subtract(existingNormalizedRefund);
            } else {
                balanceBeforeOldTransaction = wallet.getBalance().add(existingNormalizedRefund);
            }

            String updatedCurrency = (updatedTransaction.getCurrency() != null) ? updatedTransaction.getCurrency() : wallet.getCurrency();
            BigDecimal newlyNormalizedDeduction = currencyService.convertCurrency(
                    updatedCurrency,
                    wallet.getCurrency(),
                    updatedTransaction.getAmount()
            );

            if (updatedTransaction.getType() != null && updatedTransaction.getType().equalsIgnoreCase("INCOME")) {
                wallet.setBalance(balanceBeforeOldTransaction.add(newlyNormalizedDeduction));
            } else {
                wallet.setBalance(balanceBeforeOldTransaction.subtract(newlyNormalizedDeduction));
            }
            walletRepository.save(wallet);

            existing.setAmount(updatedTransaction.getAmount());
            existing.setCurrency(updatedCurrency);
            existing.setType(updatedTransaction.getType());
            existing.setDate(updatedTransaction.getDate());
            existing.setDescription(updatedTransaction.getDescription());
            existing.setRecurrent(updatedTransaction.isRecurrent());
            existing.setImpulseBuy(updatedTransaction.isImpulseBuy());
            existing.setRegret(updatedTransaction.isRegret());

            // --- UPGRADED: HANDLE UPDATE CATEGORIES AUTOMATICALLY TOO ---
            if (updatedTransaction.getCategory() != null) {
                Category incomingCategory = updatedTransaction.getCategory();
                if (incomingCategory.getId() != null) {
                    Category fullCategory = categoryRepository.findByIdAndUserId(incomingCategory.getId(), user.getId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
                    existing.setCategory(fullCategory);
                } else if (incomingCategory.getName() != null && !incomingCategory.getName().trim().isEmpty()) {
                    String cleanName = incomingCategory.getName().trim();
                    Category resolvedCategory = categoryRepository.findByUserAndName(user, cleanName)
                            .orElseGet(() -> {
                                Category newCategory = new Category(cleanName, user);
                                return categoryRepository.save(newCategory);
                            });
                    existing.setCategory(resolvedCategory);
                }
            } else {
                existing.setCategory(null);
            }
            return repository.save(existing);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction entry could not be located"));
    }

    @Transactional
    public Transaction patch(UUID id, Map<String, Object> updates, User user) {
        return repository.findByIdAndUserId(id, user.getId()).map(existing -> {
            if (updates.containsKey("description")) existing.setDescription((String) updates.get("description"));
            if (updates.containsKey("isRecurrent")) existing.setRecurrent((boolean) updates.get("isRecurrent"));
            if (updates.containsKey("isImpulseBuy")) existing.setImpulseBuy((boolean) updates.get("isImpulseBuy"));
            if (updates.containsKey("isRegret")) existing.setRegret((boolean) updates.get("isRegret"));
            return repository.save(existing);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction entry could not be located"));
    }

    @Transactional
    public void delete(UUID id, User user) {
        Transaction existing = repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction entry could not be located"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));

        String existingCurrency = (existing.getCurrency() != null) ? existing.getCurrency() : wallet.getCurrency();
        BigDecimal refundAmount = currencyService.convertCurrency(
                existingCurrency,
                wallet.getCurrency(),
                existing.getAmount()
        );

        if (existing.getType() != null && existing.getType().equalsIgnoreCase("INCOME")) {
            wallet.setBalance(wallet.getBalance().subtract(refundAmount));
        } else {
            wallet.setBalance(wallet.getBalance().add(refundAmount));
        }
        walletRepository.save(wallet);

        repository.delete(existing);
    }
}