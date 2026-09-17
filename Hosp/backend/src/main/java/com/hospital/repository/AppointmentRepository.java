package com.hospital.repository;

import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByDoctorAndAppointmentDate(Doctor doctor, LocalDate date);
    boolean existsByDoctorAndAppointmentDateAndSlotTime(Doctor doctor, LocalDate date, LocalTime slotTime);
}
