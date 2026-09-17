package com.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequest {
    @NotNull
    private Long doctorId;

    @NotNull
    private String appointmentDate;  // "YYYY-MM-DD"

    @NotNull
    private String slotTime;         // "HH:mm"

    private String notes;
}
