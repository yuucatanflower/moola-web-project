package com.moola.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID; // Added import for UUID

@Setter
@Getter
@Entity
@Table(name = "wallets")
public class Wallet {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String currency = "EUR";

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false) // explicit reference to the UUID id column
    @JsonIgnore
    private User user;

    public Wallet() {}

    public Wallet(BigDecimal balance, String currency, User user) {
        this.balance = balance;
        this.currency = currency;
        this.user = user;
    }

}