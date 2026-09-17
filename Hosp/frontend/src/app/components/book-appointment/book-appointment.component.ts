import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Doctor } from '../../models/appointment.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html'
})
export class BookAppointmentComponent implements OnInit {
  doctors: Doctor[] = [];
  selectedDoctorId: number | null = null;
  selectedDate = '';
  availableSlots: string[] = [];
  selectedSlot = '';
  notes = '';
  error = '';
  success = '';
  loadingSlots = false;
  today = new Date().toISOString().split('T')[0];

  constructor(private apptService: AppointmentService, private router: Router) {}

  ngOnInit() {
    this.apptService.getAllDoctors().subscribe(data => this.doctors = data);
  }

  // AJAX call every time doctor or date changes
  onDoctorOrDateChange() {
    this.availableSlots = [];
    this.selectedSlot = '';
    if (!this.selectedDoctorId || !this.selectedDate) return;

    this.loadingSlots = true;
    this.apptService.getAvailableSlots(this.selectedDoctorId, this.selectedDate).subscribe({
      next: slots => {
        this.availableSlots = slots;
        this.loadingSlots = false;
      },
      error: () => this.loadingSlots = false
    });
  }

  onSubmit() {
    this.error = '';
    if (!this.selectedDoctorId || !this.selectedDate || !this.selectedSlot) {
      this.error = 'Please select a doctor, date, and time slot.';
      return;
    }

    this.apptService.bookAppointment({
      doctorId: this.selectedDoctorId,
      appointmentDate: this.selectedDate,
      slotTime: this.selectedSlot,
      notes: this.notes
    }).subscribe({
      next: () => this.router.navigate(['/patient']),
      error: err => this.error = err.error?.message || 'Booking failed'
    });
  }

  back() {
    this.router.navigate(['/patient']);
  }
}
