import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard('PATIENT')],
    loadComponent: () => import('./components/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
  },
  {
    path: 'book',
    canActivate: [authGuard, roleGuard('PATIENT')],
    loadComponent: () => import('./components/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
  },
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard('DOCTOR')],
    loadComponent: () => import('./components/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  { path: '**', redirectTo: 'login' }
];
