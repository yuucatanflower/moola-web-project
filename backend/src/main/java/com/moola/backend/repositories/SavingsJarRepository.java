package com.moola.backend.repositories;

import com.moola.backend.models.SavingsJar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// database helper for savings jars the user id methods stop users from reading each other's jars
public interface SavingsJarRepository extends JpaRepository<SavingsJar, UUID> {
    List<SavingsJar> findAllByUserId(UUID userId);
    Optional<SavingsJar> findByIdAndUserId(UUID id, UUID userId);
}
