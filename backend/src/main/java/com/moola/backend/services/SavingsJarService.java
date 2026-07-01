package com.moola.backend.services;

import com.moola.backend.models.SavingsJar;
import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.SavingsJarRepository;
import com.moola.backend.repositories.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
// handles jar crud plus moving money between a jar and the user's wallet
public class SavingsJarService {

    private final SavingsJarRepository jarRepository;
    private final WalletRepository walletRepository;

    public SavingsJarService(SavingsJarRepository jarRepository, WalletRepository walletRepository) {
        this.jarRepository = jarRepository;
        this.walletRepository = walletRepository;
    }

    public List<SavingsJar> getAll(User user) {
        return jarRepository.findAllByUserId(user.getId());
    }

    public SavingsJar create(SavingsJar jar, User user) {
        jar.setUser(user);
        jar.setCurrentAmount(BigDecimal.ZERO);
        return jarRepository.save(jar);
    }

    public SavingsJar update(UUID id, SavingsJar updated, User user) {
        SavingsJar existing = getOwnedJar(id, user);
        existing.setName(updated.getName());
        existing.setTargetAmount(updated.getTargetAmount());
        existing.setColorHex(updated.getColorHex());
        existing.setEmoji(updated.getEmoji());
        return jarRepository.save(existing);
    }

    @Transactional
    public void delete(UUID id, User user) {
        SavingsJar jar = getOwnedJar(id, user);

        // refund whatever was saved so deleting a jar never destroys money
        if (jar.getCurrentAmount().compareTo(BigDecimal.ZERO) > 0) {
            Wallet wallet = getWallet(user);
            wallet.setBalance(wallet.getBalance().add(jar.getCurrentAmount()));
            walletRepository.save(wallet);
        }

        jarRepository.delete(jar);
    }

    @Transactional
    public SavingsJar deposit(UUID id, BigDecimal amount, User user) {
        validatePositiveAmount(amount);
        SavingsJar jar = getOwnedJar(id, user);
        Wallet wallet = getWallet(user);

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough balance to move into this jar");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        jar.setCurrentAmount(jar.getCurrentAmount().add(amount));

        walletRepository.save(wallet);
        return jarRepository.save(jar);
    }

    @Transactional
    public SavingsJar withdraw(UUID id, BigDecimal amount, User user) {
        validatePositiveAmount(amount);
        SavingsJar jar = getOwnedJar(id, user);

        if (jar.getCurrentAmount().compareTo(amount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough saved in this jar");
        }

        Wallet wallet = getWallet(user);
        jar.setCurrentAmount(jar.getCurrentAmount().subtract(amount));
        wallet.setBalance(wallet.getBalance().add(amount));

        walletRepository.save(wallet);
        return jarRepository.save(jar);
    }

    private SavingsJar getOwnedJar(UUID id, User user) {
        return jarRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Savings jar not found"));
    }

    private Wallet getWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));
    }

    private void validatePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be greater than zero");
        }
    }
}
