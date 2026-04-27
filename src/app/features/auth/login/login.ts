import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { LoginRequestDto, ChangePasswordRequestDto } from '../../../core/auth/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  changePasswordForm: FormGroup;

  isSubmitting = false;
  loginError = '';
  isFirstLogin = false;
  isPlatform = false;
  tenantCode: string | null = null;
  
  // Track credentials to use if change password is required
  private currentEmail = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.route.data.subscribe(data => {
      this.isPlatform = data['isPlatform'] === true;
    });

    this.route.paramMap.subscribe(params => {
      this.tenantCode = params.get('tenantCode');
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.loginError = '';
    
    const req: LoginRequestDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    if (!this.isPlatform && this.tenantCode) {
      req.tenantAlias = this.tenantCode;
    }

    this.currentEmail = req.email;

    this.authService.login(req).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        
        if (res.data?.isFirstLogin) {
          this.isFirstLogin = true;
          // Pre-fill the old password for convenience if we wanted to, but let's let user type it or pre-fill it behind the scenes
          this.changePasswordForm.patchValue({ oldPassword: req.password });
        } else {
          this.routeUser(res.data?.role);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.loginError = err.error?.message || 'Authentication failed. Please check your credentials.';
      }
    });
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) return;

    this.isSubmitting = true;
    this.loginError = '';

    const req: ChangePasswordRequestDto = this.changePasswordForm.value;

    this.authService.changePassword(req).subscribe({
      next: () => {
        this.isSubmitting = false;
        // After successful password change, route the user based on role 
        // Note: the backend clears refresh tokens but the access token is still valid from the initial login
        // Alternatively, we could force them to re-login. Let's just route them.
        // We need the role, let's just get it from localStorage (TokenService)
        const role = localStorage.getItem('user_role'); 
        this.routeUser(role || '');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.loginError = err.error?.message || 'Failed to change password. Please ensure your old password is correct.';
      }
    });
  }

  private routeUser(role: string | undefined) {
    if (role === 'PLATFORM_ADMIN') {
      this.router.navigate(['/system/dashboard']);
    } else {
      this.router.navigate(['/tenant/dashboard']);
    }
  }
}
