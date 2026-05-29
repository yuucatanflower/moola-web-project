package com.moola.backend.repositories;

import com.moola.backend.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID; // Added import for UUID

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    // Look up using the user's UUID
    Optional<Wallet> findByUserId(UUID userId);
}