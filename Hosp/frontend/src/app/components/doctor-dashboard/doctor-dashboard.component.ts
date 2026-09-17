import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html'
})
export class DoctorDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  username = '';

  constructor(private auth: AuthService, private apptService: AppointmentService) {}

  ngOnInit() {
    this.username = this.auth.getUsername() || '';
    this.load();
  }

  load() {
    this.apptService.getDoctorAppointments().subscribe(data => this.appointments = data);
  }

  updateStatus(id: number, status: string) {
    this.apptService.updateStatus(id, status).subscribe(() => this.load());
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
