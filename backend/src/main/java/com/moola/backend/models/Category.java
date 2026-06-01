package com.moola.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;
import java.util.UUID;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
// database object for one spending category, like Food or Rent
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.VARCHAR)
    private java.util.UUID id; //

    @NotBlank(message = "Category name cannot be empty")
    @Column(nullable = false)
    private String name;

    private String colorHex;
    private String emoji;

    // this connects the category to the user who owns it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
