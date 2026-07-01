package com.moola.backend;

import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.repositories.WalletRepository; // added missing import
import com.moola.backend.security.JwtUtils;
import com.moola.backend.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
// tests registration and login rules without using the real database
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setPassword("rawPassword");
        testUser.setRole("ADMIN"); // pretend someone tried to sneak in an admin role
    }

    @Test
    void register_ShouldEncodePasswordAndForceUserRole() {
        when(passwordEncoder.encode("rawPassword")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = authService.register(testUser, BigDecimal.valueOf(100.00));

        assertEquals("USER", result.getRole());
        assertEquals("hashedPassword", result.getPassword());
        verify(userRepository, times(1)).save(testUser);
        verify(walletRepository, times(1)).save(any(Wallet.class)); // verify safe wallet allocation execution
    }

    @Test
    void login_WithValidCredentials_ShouldReturnToken() {
        testUser.setPassword("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("rawPassword", "hashedPassword")).thenReturn(true);
        when(jwtUtils.generateToken("testuser", "ADMIN")).thenReturn("mocked.jwt.token");

        String token = authService.login("testuser", "rawPassword");

        assertEquals("mocked.jwt.token", token);
    }

    @Test
    void login_WithInvalidPassword_ShouldThrowException() {
        testUser.setPassword("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.login("testuser", "wrongPassword");
        });

        assertEquals("Invalid username or password", exception.getReason());
    }

    @Test
    void login_WithUnknownUser_ShouldThrowException() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.login("unknown", "password");
        });

        assertEquals("Invalid username or password", exception.getReason());
    }

    @Test
    void register_WithNullStartingBalance_ShouldDefaultWalletToZero() {
        // arrange
        when(passwordEncoder.encode("rawPassword")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // capture the wallet passed to walletrepositorysave() to inspect its initial balance state
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // act
        // passing null as the initial balance argument to trigger the fallback filter condition
        User result = authService.register(testUser, null);

        // assert
        assertNotNull(result);
        verify(walletRepository, times(1)).save(argThat(wallet ->
                wallet.getBalance().compareTo(BigDecimal.ZERO) == 0 && "EUR".equals(wallet.getCurrency())
        ));
    }
}
