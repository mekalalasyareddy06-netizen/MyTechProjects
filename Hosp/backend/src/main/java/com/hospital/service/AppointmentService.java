package com.hospital.service;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.StatusUpdateRequest;
import com.hospital.model.*;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    @Transactional
    public Appointment bookAppointment(String username, AppointmentRequest req) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        LocalDate date = LocalDate.parse(req.getAppointmentDate());
        LocalTime slot = LocalTime.parse(req.getSlotTime());

        if (appointmentRepository.existsByDoctorAndAppointmentDateAndSlotTime(doctor, date, slot)) {
            throw new RuntimeException("Slot already booked");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .slotTime(slot)
                .notes(req.getNotes())
                .build();

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getMyAppointmentsAsPatient(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
        return appointmentRepository.findByPatient(patient);
    }

    public List<Appointment> getMyAppointmentsAsDoctor(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return appointmentRepository.findByDoctor(doctor);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Transactional
    public Appointment updateStatus(Long appointmentId, StatusUpdateRequest req) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(req.getStatus());
        if (req.getNotes() != null) {
            appointment.setNotes(req.getNotes());
        }
        return appointmentRepository.save(appointment);
    }
}
