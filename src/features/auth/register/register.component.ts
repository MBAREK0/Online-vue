import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NgOptimizedImage],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  serverErrorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('.*[a-z].*'),
          Validators.pattern('.*[A-Z].*'),
          Validators.pattern('.*[0-9].*'),
        ],
      ],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get passwordMismatch(): boolean {
    const { password, confirmPassword } = this.registerForm.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      if (this.passwordMismatch) {
        this.serverErrorMessage = 'Passwords do not match';
        return;
      }

      // Create a copy of the form values without confirmPassword
      const { confirmPassword, ...formData } = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/']).then(r => console.log(r));
          this.serverErrorMessage = null;
        },
        error: (err) => {
          this.serverErrorMessage = err.error?.message || 'Registration failed';
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
