export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  phone: string;
  availableFrom: string;
  availableTo: string;
}

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
}

export interface Appointment {
  id: number;
  doctor: Doctor;
  patient: Patient;
  appointmentDate: string;
  slotTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes: string;
  createdAt: string;
}

export interface AppointmentRequest {
  doctorId: number;
  appointmentDate: string;
  slotTime: string;
  notes?: string;
}
