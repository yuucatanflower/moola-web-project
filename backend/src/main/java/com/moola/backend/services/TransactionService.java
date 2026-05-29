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
// business logic for transactions it also updates the wallet balance when money moves
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

    @Transactional // if one database change fails, the whole transaction save is undone
    public Transaction create(Transaction transaction, User user) {
        transaction.setUser(user);

        if (transaction.getCategory() != null && transaction.getCategory().getId() != null) {
            Category fullCategory = categoryRepository.findByIdAndUserId(transaction.getCategory().getId(), user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            transaction.setCategory(fullCategory);
        }

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));

        // convert the transaction amount into the wallet currency before changing the balance
        String sourceCurrency = (transaction.getCurrency() != null) ? transaction.getCurrency() : wallet.getCurrency();
        BigDecimal walletNormalizedAmount = currencyService.convertCurrency(
                sourceCurrency,
                wallet.getCurrency(),
                transaction.getAmount()
        );

        // income adds money, everything else subtracts money
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

            // first undo the old transaction's effect on the wallet
            String existingCurrency = (existing.getCurrency() != null) ? existing.getCurrency() : wallet.getCurrency();
            BigDecimal existingNormalizedRefund = currencyService.convertCurrency(
                    existingCurrency,
                    wallet.getCurrency(),
                    existing.getAmount()
            );

            // put the wallet back to where it was before the old transaction
            BigDecimal balanceBeforeOldTransaction;
            if (existing.getType() != null && existing.getType().equalsIgnoreCase("INCOME")) {
                balanceBeforeOldTransaction = wallet.getBalance().subtract(existingNormalizedRefund);
            } else {
                balanceBeforeOldTransaction = wallet.getBalance().add(existingNormalizedRefund);
            }

            // then calculate the new transaction amount in wallet currency
            String updatedCurrency = (updatedTransaction.getCurrency() != null) ? updatedTransaction.getCurrency() : wallet.getCurrency();
            BigDecimal newlyNormalizedDeduction = currencyService.convertCurrency(
                    updatedCurrency,
                    wallet.getCurrency(),
                    updatedTransaction.getAmount()
            );

            // apply the updated transaction to the wallet balance
            if (updatedTransaction.getType() != null && updatedTransaction.getType().equalsIgnoreCase("INCOME")) {
                wallet.setBalance(balanceBeforeOldTransaction.add(newlyNormalizedDeduction));
            } else {
                wallet.setBalance(balanceBeforeOldTransaction.subtract(newlyNormalizedDeduction));
            }
            walletRepository.save(wallet);

            // store the new transaction fields
            existing.setAmount(updatedTransaction.getAmount());
            existing.setCurrency(updatedCurrency); // persist updated currency code
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
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction entry could not be located"));
    }

    @Transactional
    public Transaction patch(UUID id, Map<String, Object> updates, User user) {
        return repository.findByIdAndUserId(id, user.getId()).map(existing -> {
            // patch changes small metadata fields only, so the wallet balance does not need recalculation
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

        // convert to wallet currency before undoing this transaction
        String existingCurrency = (existing.getCurrency() != null) ? existing.getCurrency() : wallet.getCurrency();
        BigDecimal refundAmount = currencyService.convertCurrency(
                existingCurrency,
                wallet.getCurrency(),
                existing.getAmount()
        );

        // deleting reverses the original balance change
        if (existing.getType() != null && existing.getType().equalsIgnoreCase("INCOME")) {
            wallet.setBalance(wallet.getBalance().subtract(refundAmount));
        } else {
            wallet.setBalance(wallet.getBalance().add(refundAmount));
        }
        walletRepository.save(wallet);

        repository.delete(existing);
    }
}
