package com.moola.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;

import java.math.BigDecimal;
import java.sql.Types;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "moola_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
// database object for one income or expense entry
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    @JdbcTypeCode(Types.VARCHAR)
    private UUID id;

    @Positive(message = "Amount must be greater than zero")
    @Column(nullable = false)
    private BigDecimal amount;

    // stores the currency used when the transaction was entered
    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = true)
    private String description;

    @Column(nullable = false)
    private boolean isRecurrent = false;

    @Column(nullable = false)
    private boolean isImpulseBuy = false;

    @Column(nullable = false)
    private boolean isRegret = false;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;

    // this connects the transaction to the user who owns it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
