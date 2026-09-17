package com.hospital.dto;

import com.hospital.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull
    private AppointmentStatus status;

    private String notes;
}
