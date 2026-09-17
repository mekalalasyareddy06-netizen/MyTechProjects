export interface AuthResponse {
  token: string;
  role: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'DOCTOR' | 'PATIENT';
  firstName: string;
  lastName: string;
  specialization?: string;
  phone?: string;
  availableFrom?: string;
  availableTo?: string;
  dateOfBirth?: string;
  address?: string;
  bloodGroup?: string;
}
