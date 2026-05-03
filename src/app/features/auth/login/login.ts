import { Component, OnInit, inject } from '@angular/core';
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
export class Login implements OnInit {
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
        this.isSubmitting = false;
        
        const role = res.data?.role;
        const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN';
        
        if (res.data?.isFirstLogin && !isSuperAdmin) {
          this.isFirstLogin = true;
          this.changePasswordForm.patchValue({ oldPassword: req.password });
        } else {
          this.routeUser(role);
        }
      },
      error: (err) => {

        setTimeout(() => {
          this.isSubmitting = false;
          this.loginError = err.error?.message || 'Authentication failed. Please check your credentials.';
        });
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
        const role = localStorage.getItem('user_role'); 
        this.routeUser(role || '');
      },
      error: (err) => {
        setTimeout(() => {
          this.isSubmitting = false;
          this.loginError = err.error?.message || 'Failed to change password. Please ensure your old password is correct.';
        });
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
