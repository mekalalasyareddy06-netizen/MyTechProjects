import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  form: RegisterRequest = {
    username: '', password: '', email: '',
    role: 'PATIENT', firstName: '', lastName: '',
    phone: '', specialization: '',
    availableFrom: '09:00', availableTo: '17:00',
    dateOfBirth: '', address: '', bloodGroup: ''
  };
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.auth.register(this.form).subscribe({
      next: res => {
        if (res.role === 'PATIENT') this.router.navigate(['/patient']);
        else if (res.role === 'DOCTOR') this.router.navigate(['/doctor']);
        else this.router.navigate(['/admin']);
      },
      error: err => this.error = err.error?.message || 'Registration failed'
    });
  }
}
