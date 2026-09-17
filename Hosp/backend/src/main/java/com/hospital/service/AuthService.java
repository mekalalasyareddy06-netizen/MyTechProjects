package com.hospital.service;

import com.hospital.config.JwtUtil;
import com.hospital.dto.AuthRequest;
import com.hospital.dto.AuthResponse;
import com.hospital.dto.RegisterRequest;
import com.hospital.model.*;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .role(req.getRole())
                .build();
        userRepository.save(user);

        if (req.getRole() == Role.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .specialization(req.getSpecialization())
                    .phone(req.getPhone())
                    .availableFrom(LocalTime.parse(req.getAvailableFrom(), DateTimeFormatter.ofPattern("HH:mm")))
                    .availableTo(LocalTime.parse(req.getAvailableTo(), DateTimeFormatter.ofPattern("HH:mm")))
                    .build();
            doctorRepository.save(doctor);
        } else if (req.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .user(user)
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .phone(req.getPhone())
                    .dateOfBirth(req.getDateOfBirth() != null ? LocalDate.parse(req.getDateOfBirth()) : null)
                    .address(req.getAddress())
                    .bloodGroup(req.getBloodGroup())
                    .build();
            patientRepository.save(patient);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token, user.getRole().name(), user.getUsername());
    }

    public AuthResponse login(AuthRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );
        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        User user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        return new AuthResponse(token, user.getRole().name(), user.getUsername());
    }
}
