package com.hospital.service;

import com.hospital.model.Doctor;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    // Returns available time slots for a doctor on a given date
    public List<String> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = getDoctorById(doctorId);

        if (doctor.getAvailableFrom() == null || doctor.getAvailableTo() == null) {
            return List.of();
        }

        List<String> available = new ArrayList<>();
        LocalTime slot = doctor.getAvailableFrom();
        int duration = doctor.getSlotDurationMinutes();

        while (slot.isBefore(doctor.getAvailableTo())) {
            boolean booked = appointmentRepository
                    .existsByDoctorAndAppointmentDateAndSlotTime(doctor, date, slot);
            if (!booked) {
                available.add(slot.toString());
            }
            slot = slot.plusMinutes(duration);
        }

        return available;
    }
}
