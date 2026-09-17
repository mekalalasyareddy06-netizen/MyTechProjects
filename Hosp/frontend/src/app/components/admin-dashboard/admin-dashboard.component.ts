import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private auth: AuthService, private apptService: AppointmentService) {}

  ngOnInit() {
    this.apptService.getAllAppointments().subscribe(data => this.appointments = data);
  }

  updateStatus(id: number, status: string) {
    this.apptService.updateStatus(id, status).subscribe(() =>
      this.apptService.getAllAppointments().subscribe(data => this.appointments = data)
    );
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
