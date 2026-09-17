package com.hospital.repository;

import com.hospital.model.Doctor;
import com.hospital.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUserId(Long userId);
}
