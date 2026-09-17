import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Appointment, AppointmentRequest, Doctor } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private base = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getAllDoctors() {
    return this.http.get<Doctor[]>(`${this.base}/doctors`);
  }

  // AJAX call for real-time slot availability
  getAvailableSlots(doctorId: number, date: string) {
    const params = new HttpParams().set('date', date);
    return this.http.get<string[]>(`${this.base}/doctors/${doctorId}/slots`, { params });
  }

  bookAppointment(req: AppointmentRequest) {
    return this.http.post<Appointment>(`${this.base}/appointments`, req);
  }

  getMyAppointments() {
    return this.http.get<Appointment[]>(`${this.base}/appointments/my`);
  }

  getDoctorAppointments() {
    return this.http.get<Appointment[]>(`${this.base}/appointments/doctor`);
  }

  getAllAppointments() {
    return this.http.get<Appointment[]>(`${this.base}/appointments`);
  }

  updateStatus(id: number, status: string, notes?: string) {
    return this.http.put<Appointment>(`${this.base}/appointments/${id}/status`, { status, notes });
  }
}
