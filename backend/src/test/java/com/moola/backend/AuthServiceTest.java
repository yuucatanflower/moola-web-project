package com.moola.backend;

import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.repositories.WalletRepository; // Added missing import
import com.moola.backend.security.JwtUtils;
import com.moola.backend.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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
        when(jwtUtils.generateToken("testuser")).thenReturn("mocked.jwt.token");

        String token = authService.login("testuser", "rawPassword");

        assertEquals("mocked.jwt.token", token);
    }

    @Test
    void login_WithInvalidPassword_ShouldThrowException() {
        testUser.setPassword("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("testuser", "wrongPassword");
        });

        assertEquals("Invalid password", exception.getMessage());
    }

    @Test
    void login_WithUnknownUser_ShouldThrowException() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login("unknown", "password");
        });

        assertEquals("User not found", exception.getMessage());
    }
}