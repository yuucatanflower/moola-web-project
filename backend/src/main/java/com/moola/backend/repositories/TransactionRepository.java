package com.moola.backend.repositories;

import com.moola.backend.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// database helper for transactions most methods include userId so data stays private per user
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByCategoryIdAndUserId(UUID categoryId, UUID userId);
    List<Transaction> findAllByUserId(UUID userId);
    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);
    List<Transaction> findAllByUserIdAndDateAfter(UUID userId, LocalDate cutoffDate);
}
