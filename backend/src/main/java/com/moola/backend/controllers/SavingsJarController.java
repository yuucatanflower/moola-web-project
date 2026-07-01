package com.moola.backend.controllers;

import com.moola.backend.models.SavingsJar;
import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.SavingsJarService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/jars")
// crud endpoints for savings jars, plus deposit/withdraw to move money to and from the wallet
public class SavingsJarController {

    private final SavingsJarService savingsJarService;
    private final UserRepository userRepository;

    public SavingsJarController(SavingsJarService savingsJarService, UserRepository userRepository) {
        this.savingsJarService = savingsJarService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByUsername(principal.getName()).orElseThrow();
    }

    @GetMapping
    public List<SavingsJar> getAll(Principal principal) {
        return savingsJarService.getAll(getAuthenticatedUser(principal));
    }

    @PostMapping
    public SavingsJar create(@Valid @RequestBody SavingsJar jar, Principal principal) {
        return savingsJarService.create(jar, getAuthenticatedUser(principal));
    }

    @PutMapping("/{id}")
    public SavingsJar update(@PathVariable UUID id, @Valid @RequestBody SavingsJar jar, Principal principal) {
        return savingsJarService.update(id, jar, getAuthenticatedUser(principal));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, Principal principal) {
        savingsJarService.delete(id, getAuthenticatedUser(principal));
    }

    @PatchMapping("/{id}/deposit")
    public SavingsJar deposit(@PathVariable UUID id, @RequestBody Map<String, BigDecimal> body, Principal principal) {
        return savingsJarService.deposit(id, body.get("amount"), getAuthenticatedUser(principal));
    }

    @PatchMapping("/{id}/withdraw")
    public SavingsJar withdraw(@PathVariable UUID id, @RequestBody Map<String, BigDecimal> body, Principal principal) {
        return savingsJarService.withdraw(id, body.get("amount"), getAuthenticatedUser(principal));
    }
}
