import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';
import { LoginRequestDto, ChangePasswordRequestDto } from '../../../core/auth/models/auth.models';
import { TokenService } from '../../../core/auth/token';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  changePasswordForm: FormGroup;

  isSubmitting = false;
  loginError = '';
  isFirstLogin = false;
  isPlatform = false;
  // Track credentials to use if change password is required
  private currentEmail = '';

  constructor() {
    this.loginForm = this.fb.group({
      tenantCode: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.isPlatform = data['isPlatform'] === true;
      if (!this.isPlatform) {
        this.loginForm.get('tenantCode')?.setValidators([Validators.required]);
        this.loginForm.get('tenantCode')?.updateValueAndValidity();
      }
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
    
    if (!this.isPlatform) {
      req.tenantCode = this.loginForm.value.tenantCode;
    }

    this.currentEmail = req.email;

    this.authService.login(req).subscribe({
      next: (res) => {
        try {
          this.isSubmitting = false;
          
          // Handle cases where the backend might return success HTTP status but internal error
          if (res.status && res.status !== 200 && res.status !== 201) {
            this.loginError = res.message || 'Authentication failed.';
            this.toast.error(this.loginError);
            return;
          }

          const role = res.data?.role;
          const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN';
          
          if (res.data?.isFirstLogin && !isSuperAdmin) {
            this.isFirstLogin = true;
            this.changePasswordForm.patchValue({ oldPassword: req.password });
          } else {
            this.routeUser(role);
          }
        } catch (e) {
          console.error('Error processing login success:', e);
          this.loginError = 'An unexpected error occurred during login. Please try again.';
          this.toast.error(this.loginError);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isSubmitting = false;
        
        // Comprehensive error message extraction
        let errorMessage = '';
        
        if (err.error) {
          if (typeof err.error === 'object') {
            errorMessage = err.error.message || err.error.detail || err.error.error || '';
          } else if (typeof err.error === 'string') {
            try {
              const parsed = JSON.parse(err.error);
              errorMessage = parsed.message || parsed.detail || parsed.error || '';
            } catch {
              // If it's a string but not JSON, and looks like an error message, use it
              if (err.error.length < 200) {
                errorMessage = err.error;
              }
            }
          }
        }
        
        if (!errorMessage && err.message) {
          // Angular's default message often contains the status code and text
          errorMessage = err.message;
        }
        
        this.loginError = errorMessage || 'Authentication failed. Please check your credentials.';
        
        // Specific handling for common auth errors and generic backend fallbacks
        const lowError = this.loginError.toLowerCase();
        if (lowError.includes('bad credentials') || 
            lowError.includes('unexpected system error') || 
            lowError.includes('internal server error') ||
            lowError.includes('unhandled exception')) {
          this.loginError = 'Invalid email or password. Please try again.';
        }

        // Show toast as well to ensure it's seen
        this.toast.error(this.loginError);
      }
    });
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) return;

    this.isSubmitting = true;
    this.loginError = '';

    const formValue = this.changePasswordForm.value;
    const req: ChangePasswordRequestDto = {
      oldPassword: formValue.oldPassword,
      newPassword: formValue.newPassword
    };

    this.authService.changePassword(req).subscribe({
      next: () => {
        this.isSubmitting = false;
        const role = this.tokenService.getRole(); 
        this.routeUser(role || '');
      },
      error: (err) => {
        console.error('Password change error:', err);
        this.isSubmitting = false;
        this.loginError = err.error?.message || 'Failed to change password. Please ensure your old password is correct.';
      }
    });
  }

  private routeUser(role: string | undefined) {
    const formattedRole = role?.startsWith('ROLE_') ? role.substring(5) : role;
    if (formattedRole === 'SUPER_ADMIN') {
      this.router.navigate(['/system/dashboard']);
    } else {
      this.router.navigate(['/tenant/dashboard']);
    }
  }
}
