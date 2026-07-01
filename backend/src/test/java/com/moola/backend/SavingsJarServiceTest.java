package com.moola.backend;

import com.moola.backend.models.SavingsJar;
import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.SavingsJarRepository;
import com.moola.backend.repositories.WalletRepository;
import com.moola.backend.services.SavingsJarService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// tests jar crud and that money moves correctly between a jar and the wallet
public class SavingsJarServiceTest {

    @Mock
    private SavingsJarRepository jarRepository;

    @Mock
    private WalletRepository walletRepository;

    @InjectMocks
    private SavingsJarService savingsJarService;

    private User testUser;
    private SavingsJar testJar;
    private Wallet testWallet;
    private UUID userId;
    private UUID jarId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        jarId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");

        testJar = new SavingsJar();
        testJar.setId(jarId);
        testJar.setName("New Laptop");
        testJar.setTargetAmount(new BigDecimal("1000.00"));
        testJar.setCurrentAmount(new BigDecimal("100.00"));
        testJar.setUser(testUser);

        testWallet = new Wallet();
        testWallet.setId(1L);
        testWallet.setBalance(new BigDecimal("500.00"));
        testWallet.setCurrency("EUR");
        testWallet.setUser(testUser);
    }

    @Test
    void getAll_ShouldReturnUserJars() {
        when(jarRepository.findAllByUserId(userId)).thenReturn(List.of(testJar));

        List<SavingsJar> result = savingsJarService.getAll(testUser);

        assertEquals(1, result.size());
        verify(jarRepository, times(1)).findAllByUserId(userId);
    }

    @Test
    void create_ShouldAssignUserAndResetCurrentAmount() {
        when(jarRepository.save(any(SavingsJar.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SavingsJar newJar = new SavingsJar();
        newJar.setName("Vacation");
        newJar.setCurrentAmount(new BigDecimal("999.00")); // should be ignored on create

        SavingsJar result = savingsJarService.create(newJar, testUser);

        assertEquals(testUser, result.getUser());
        assertEquals(BigDecimal.ZERO, result.getCurrentAmount());
    }

    @Test
    void deposit_ShouldMoveMoneyFromWalletIntoJar() {
        when(jarRepository.findByIdAndUserId(jarId, userId)).thenReturn(Optional.of(testJar));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        when(jarRepository.save(any(SavingsJar.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SavingsJar result = savingsJarService.deposit(jarId, new BigDecimal("50.00"), testUser);

        assertEquals(new BigDecimal("150.00"), result.getCurrentAmount());
        assertEquals(new BigDecimal("450.00"), testWallet.getBalance());
        verify(walletRepository, times(1)).save(testWallet);
    }

    @Test
    void deposit_WhenWalletBalanceTooLow_ShouldThrowException() {
        when(jarRepository.findByIdAndUserId(jarId, userId)).thenReturn(Optional.of(testJar));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));

        assertThrows(ResponseStatusException.class, () ->
                savingsJarService.deposit(jarId, new BigDecimal("999999.00"), testUser));

        verify(walletRepository, never()).save(any());
    }

    @Test
    void withdraw_ShouldMoveMoneyFromJarIntoWallet() {
        when(jarRepository.findByIdAndUserId(jarId, userId)).thenReturn(Optional.of(testJar));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));
        when(jarRepository.save(any(SavingsJar.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SavingsJar result = savingsJarService.withdraw(jarId, new BigDecimal("40.00"), testUser);

        assertEquals(new BigDecimal("60.00"), result.getCurrentAmount());
        assertEquals(new BigDecimal("540.00"), testWallet.getBalance());
    }

    @Test
    void withdraw_WhenJarBalanceTooLow_ShouldThrowException() {
        when(jarRepository.findByIdAndUserId(jarId, userId)).thenReturn(Optional.of(testJar));

        assertThrows(ResponseStatusException.class, () ->
                savingsJarService.withdraw(jarId, new BigDecimal("500.00"), testUser));
    }

    @Test
    void delete_ShouldRefundRemainingBalanceToWallet() {
        when(jarRepository.findByIdAndUserId(jarId, userId)).thenReturn(Optional.of(testJar));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(testWallet));

        savingsJarService.delete(jarId, testUser);

        assertEquals(new BigDecimal("600.00"), testWallet.getBalance());
        verify(jarRepository, times(1)).delete(testJar);
    }

    @Test
    void delete_WhenNotOwnedByUser_ShouldThrowException() {
        when(jarRepository.findByIdAndUserId(jarId, userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> savingsJarService.delete(jarId, testUser));
    }
}
