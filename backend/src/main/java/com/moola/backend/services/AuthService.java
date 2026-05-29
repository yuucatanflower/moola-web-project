package com.moola.backend.services;

import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.repositories.WalletRepository;
import com.moola.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
// contains the real register/login logic behind AuthController
public class AuthService {
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional // if wallet creation fails, the new user is rolled back too
    public User register(User user, BigDecimal initialBalance) {
        // save only the hashed password, never the plain text one
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");

        // save the user first so the wallet can point to the user id
        User savedUser = userRepository.save(user);

        // every new user starts with one default wallet
        BigDecimal balance = initialBalance != null ? initialBalance : BigDecimal.ZERO;
        Wallet defaultWallet = new Wallet(balance, "EUR", savedUser);
        walletRepository.save(defaultWallet);

        return savedUser;
    }

    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (passwordEncoder.matches(password, user.getPassword())) {
            return jwtUtils.generateToken(username);
        }
        throw new RuntimeException("Invalid password");
    }
}
