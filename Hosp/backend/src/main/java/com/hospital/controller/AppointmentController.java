package com.hospital.controller;

import com.hospital.dto.AppointmentRequest;
import com.hospital.dto.StatusUpdateRequest;
import com.hospital.model.Appointment;
import com.hospital.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> book(@Valid @RequestBody AppointmentRequest req,
                                            Principal principal) {
        return ResponseEntity.ok(appointmentService.bookAppointment(principal.getName(), req));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<Appointment>> myPatientAppointments(Principal principal) {
        return ResponseEntity.ok(appointmentService.getMyAppointmentsAsPatient(principal.getName()));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<Appointment>> myDoctorAppointments(Principal principal) {
        return ResponseEntity.ok(appointmentService.getMyAppointmentsAsDoctor(principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> all() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id,
                                                    @Valid @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, req));
    }
}
