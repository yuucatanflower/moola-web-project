package com.moola.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.math.BigDecimal;
import java.sql.Types;
import java.util.UUID;

@Entity
@Table(name = "moola_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
// Database object for an app user login and wallet data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    @JdbcTypeCode(Types.VARCHAR)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String role = "USER";

    @Column(nullable = false)
    private BigDecimal hourlyWage = BigDecimal.valueOf(15.0);

    // Database column to remember the AI personality tone
    @Column(nullable = false)
    private String advisorTone = "roast";

    // Stores the user's preferred currency
    @Column(nullable = false)
    private String preferredCurrency = "EUR";

    // Stores the user's preference for hiding absolute currency
    @Column(name = "salary_shield", nullable = false)
    private boolean salaryShield = false;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;
}