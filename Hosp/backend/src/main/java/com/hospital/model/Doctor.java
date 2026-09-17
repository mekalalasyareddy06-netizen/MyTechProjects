package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "doctors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(length = 20)
    private String phone;

    // Slot availability window (e.g. 09:00 to 17:00)
    private LocalTime availableFrom;
    private LocalTime availableTo;

    // Slot duration in minutes (default 30)
    @Builder.Default
    private int slotDurationMinutes = 30;
}
