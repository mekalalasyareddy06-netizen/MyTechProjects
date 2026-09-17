package com.hospital.controller;

import com.hospital.model.Patient;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Patient> getMyProfile(Principal principal) {
        var user = userRepository.findByUsername(principal.getName()).orElseThrow();
        var patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }
}
