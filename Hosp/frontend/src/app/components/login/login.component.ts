import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: res => {
        if (res.role === 'PATIENT') this.router.navigate(['/patient']);
        else if (res.role === 'DOCTOR') this.router.navigate(['/doctor']);
        else this.router.navigate(['/admin']);
      },
      error: () => this.error = 'Invalid username or password'
    });
  }
}
