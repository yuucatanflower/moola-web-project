package com.moola.backend.services;

import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.WalletRepository;

@Service
// contains register and login logic for users
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final WalletRepository walletRepository;

    // injects the database, password, and token helpers
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            WalletRepository walletRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.walletRepository = walletRepository;
    }

    public String login(String username, String password) {
        // find the user and reject the login if it is missing
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        // verify the password using the encoder
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        // generate and return the jwt token
        return jwtUtils.generateToken(username, user.getRole());
    }

    // creates a new user account
    public User register(User user, BigDecimal startingBalance) {
        // check if username is already taken
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is already taken");
        }

        // encrypt the password before saving to the database
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // self-service registration must never grant anything but a plain user role
        user.setRole("USER");

        // save the user
        User savedUser = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(
                startingBalance != null
                        ? startingBalance
                        : BigDecimal.ZERO
        );
        wallet.setCurrency("EUR");

        walletRepository.save(wallet);

        return savedUser;
    }
}
