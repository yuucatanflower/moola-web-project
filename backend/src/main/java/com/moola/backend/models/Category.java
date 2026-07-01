package com.moola.backend.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
// database object for one spending category
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.VARCHAR)
    private UUID id;

    @NotBlank(message = "Category name cannot be empty")
    @Column(nullable = false)
    private String name;

    private String colorHex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // lets spring create a category from a plain json string
    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public Category(String name) {
        this.name = name;
    }

    // creates a category with a generated color when only a name is provided
    public Category(String name, User user) {
        this.name = name;
        this.user = user;
        this.colorHex = "#" + Integer.toHexString((name.hashCode() & 0xffffff) | 0x1000000).substring(1);
    }
}
