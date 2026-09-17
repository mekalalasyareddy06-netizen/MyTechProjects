import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-dashboard.component.html'
})
export class PatientDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  username = '';

  constructor(private auth: AuthService, private apptService: AppointmentService) {}

  ngOnInit() {
    this.username = this.auth.getUsername() || '';
    this.apptService.getMyAppointments().subscribe(data => this.appointments = data);
  }

  logout() {
    this.auth.logout();
  }

  statusClass(status: string) {
    return {
      'status-pending': status === 'PENDING',
      'status-confirmed': status === 'CONFIRMED',
      'status-cancelled': status === 'CANCELLED',
      'status-completed': status === 'COMPLETED'
    };
  }
}
