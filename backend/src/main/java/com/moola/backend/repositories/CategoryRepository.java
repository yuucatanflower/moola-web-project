package com.moola.backend.repositories;

import com.moola.backend.models.Category;
import com.moola.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// database helper for categories the user id methods stop users from reading each other's categories
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByUserId(UUID userId);
    Optional<Category> findByIdAndUserId(UUID id, UUID userId);


    // finds an existing category by owner and name
    Optional<Category> findByUserAndName(User user, String name);
}
