package com.moola.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity // tells Spring Boot to make a database table out of this class
@Table(name = "moola_transactions") // names the table in mysql
@Data // generates getters , setters and toString
@NoArgsConstructor // auto-generates an empty constructor
@AllArgsConstructor // auto-generates a constructor with all variables

public class Transaction {

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increments (1, 2, 3...)
    private Long id;

    @Column(nullable = false)
    private BigDecimal amount; // BigDecimal for money to avoid decimal math errors

    @Column(nullable = false)
    private String type; // holds "income" or "expense"

    @Column(nullable = false)
    private LocalDate date; // tracks current date

    @Column(nullable = true)
    private String description;

    @Column(nullable = false)
    private boolean isRecurrent = false;

    @ManyToOne // many transactions can belong to one category
    @JoinColumn(name = "category_id", nullable = true) //creates the Foreign Key column in MySQL
    private Category category;
}