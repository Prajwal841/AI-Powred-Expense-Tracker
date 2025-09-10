package com.example.user.userservice.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // expense belongs to user
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Name is mandatory")
    private String name;  // e.g., Sandwich, Movie Ticket

    private String description; // optional notes

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    private Double amount;

    private LocalDate date; // when expense happened

    @Column(name = "source") 
    private String source; // "manual", "AI", "receipt"
    
    @Column(name = "receipt_path")
    private String receiptPath; // Optional: path to stored receipt image
    
    @Column(name = "payment_method")
    private String paymentMethod; // Optional: "cash", "card", "upi", etc.
    
    @Column(name = "tags")
    private String tags; // Optional: comma-separated tags
}
