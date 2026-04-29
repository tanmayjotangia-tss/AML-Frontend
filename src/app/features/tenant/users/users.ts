import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TenantUserService } from '../../../core/services/tenant-user.service';
import { TenantUserResponseDto, Role, CreateTenantUserRequestDto, UpdateTenantUserRequestDto } from '../../../core/models/user.model';
import { Page } from '../../../core/models/tenant.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private userService = inject(TenantUserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  usersPage?: Page<TenantUserResponseDto>;
  loading = false;
  showModal = false;
  isEditing = false;
  selectedUserId?: string;
  userForm: FormGroup;
  roles = Object.values(Role).filter(r => r !== Role.SUPER_ADMIN);

  constructor() {
    this.userForm = this.fb.group({
      employeeId: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.COMPLIANCE_OFFICER, [Validators.required]],
      isLocked: [false]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.userService.listUsers(undefined, page)
      .subscribe({
        next: (response) => {
          this.usersPage = response.data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedUserId = undefined;
    this.userForm.reset({ role: Role.COMPLIANCE_OFFICER, isLocked: false });
    this.userForm.get('employeeId')?.enable();
    this.userForm.get('email')?.enable();
    this.userForm.get('role')?.enable();
    this.showModal = true;
  }

  openEditModal(user: TenantUserResponseDto): void {
    this.isEditing = true;
    this.selectedUserId = user.id;
    this.userForm.patchValue({
      employeeId: user.employeeId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isLocked: user.isLocked
    });
    this.userForm.get('employeeId')?.disable();
    this.userForm.get('email')?.disable();
    this.userForm.get('role')?.disable();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    const formData = this.userForm.getRawValue();

    const request$ = this.isEditing && this.selectedUserId
      ? this.userService.updateUser(this.selectedUserId, {
          fullName: formData.fullName,
          role: formData.role,
          isLocked: formData.isLocked
        })
      : this.userService.createComplianceOfficer({
          employeeId: formData.employeeId,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role
        });

    request$.subscribe({
      next: () => {
        const message = this.isEditing ? 'User updated successfully' : 'User created successfully and onboarding email sent';
        alert(message);
        this.closeModal();
        this.loadUsers(0);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving user:', err);
        alert('Failed to save user. Please try again.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deactivateUser(id: string): void {
    if (confirm('Are you sure you want to deactivate this user?')) {
      this.loading = true;
      this.userService.deactivateUser(id)
        .subscribe({
          next: () => {
            alert('User deactivated successfully');
            this.loadUsers(this.usersPage?.number);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error deactivating user:', err);
            alert('Failed to deactivate user.');
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    }
  }

  resetPassword(id: string): void {
    if (confirm('Reset password for this user?')) {
      this.loading = true;
      this.userService.resetPassword(id).subscribe({
        next: () => {
          alert('Password reset successfully. A new temporary password has been emailed to the user.');
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error resetting password:', err);
          alert('Failed to reset password.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  unlockUser(id: string): void {
    if (confirm('Unlock this user account?')) {
      this.loading = true;
      this.userService.unlockUser(id).subscribe({
        next: () => {
          alert('User account unlocked successfully');
          this.loadUsers(this.usersPage?.number);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error unlocking user:', err);
          alert('Failed to unlock user.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
