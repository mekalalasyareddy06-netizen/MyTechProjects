package com.hospital.dto;

import com.hospital.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Email
    @NotBlank
    private String email;

    @NotNull
    private Role role;

    // Doctor fields (required when role = DOCTOR)
    private String firstName;
    private String lastName;
    private String specialization;
    private String phone;
    private String availableFrom;  // "HH:mm"
    private String availableTo;    // "HH:mm"

    // Patient extra fields (required when role = PATIENT)
    private String dateOfBirth;    // "YYYY-MM-DD"
    private String address;
    private String bloodGroup;
}
