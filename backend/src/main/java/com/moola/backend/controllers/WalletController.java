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
// gives the logged-in user their wallet balance and currency
public class WalletController {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletController(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Wallet> getWallet(Principal principal) {
        // find the user from the JWT security context
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context invalid"));

        // load the wallet that belongs to this user
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet ledger missing for user context"));

        return ResponseEntity.ok(wallet);
    }
}
