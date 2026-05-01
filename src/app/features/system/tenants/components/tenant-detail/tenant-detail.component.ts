import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantResponseDto } from '../../../../../core/models/tenant.model';
import { TenantService } from '../../../../../core/services/tenant.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-detail.component.html',
  styleUrls: ['./tenant-detail.component.css']
})
export class TenantDetailComponent {
  private tenantService = inject(TenantService);
  private toast = inject(ToastService);

  @Input() tenant!: TenantResponseDto;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<TenantResponseDto>();
  @Output() statusChanged = new EventEmitter<void>();

  isProcessing = false;

  deactivate() {
    if (!confirm(`Are you sure you want to deactivate ${this.tenant.institutionName}?`)) return;
    
    this.isProcessing = true;
    this.tenantService.deactivateTenant(this.tenant.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.statusChanged.emit();
        this.close.emit();
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }

  reactivate() {
    this.isProcessing = true;
    this.tenantService.reactivateTenant(this.tenant.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.statusChanged.emit();
        this.close.emit();
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }

  resetAdmin() {
    if (!confirm(`Are you sure you want to reset admin credentials for ${this.tenant.institutionName}?`)) return;
    
    this.isProcessing = true;
    this.tenantService.resetAdminCredentials(this.tenant.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.toast.success('Admin credentials have been reset and sent to the contact email.');
      },
      error: () => {
        this.isProcessing = false;
      }
    });
  }
}
