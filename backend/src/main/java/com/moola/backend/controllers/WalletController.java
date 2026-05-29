package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.models.Wallet;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.repositories.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletController(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Wallet> getWallet(Principal principal) {
        // Find user by authenticated security context
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context invalid"));

        // Fetch user's dedicated wallet layout metrics
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));

        return ResponseEntity.ok(wallet);
    }
}