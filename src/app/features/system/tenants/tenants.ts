import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../../core/services/tenant.service';
import { TenantResponseDto } from '../../../core/models/tenant.model';
import { TenantFormComponent } from './components/tenant-form/tenant-form.component';
import { TenantDetailComponent } from './components/tenant-detail/tenant-detail.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, TenantFormComponent, TenantDetailComponent],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css',
})
export class Tenants implements OnInit {
  private tenantService = inject(TenantService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  tenants: TenantResponseDto[] = [];
  isLoading = true;
  error = '';
  
  showCreateForm = false;
  viewingTenant?: TenantResponseDto;
  tenantToEdit?: TenantResponseDto;

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading = true;
    this.error = '';
    
    // Hardcoding page=0, size=50 for MVP. Pagination UI can be added later.
    this.tenantService.listTenants(0, 50).subscribe({
      next: (res) => {
        console.log('Received response from API (Tenants):', res);
        try {
          // Robust checking in case response format differs
          if (Array.isArray(res.data)) {
            this.tenants = res.data;
          } else {
            this.tenants = res.data?.content || [];
          }
          console.log('Processed tenants:', this.tenants);
        } catch (e) {
          console.error('Error processing tenant response:', e);
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('API Error (Tenants):', err);
        this.error = err?.error?.message || 'Failed to load tenants.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.tenantToEdit = undefined;
  }

  onTenantCreated(): void {
    this.showCreateForm = false;
    this.tenantToEdit = undefined;
    this.loadTenants();
  }

  viewTenantDetail(tenant: TenantResponseDto): void {
    this.viewingTenant = tenant;
    this.cdr.detectChanges();
  }

  openEditForm(tenant: TenantResponseDto, event?: MouseEvent): void {
    if (event) event.stopPropagation(); // Prevent opening detail view when clicked from list
    this.viewingTenant = undefined; // Close detail drawer if open
    this.tenantToEdit = tenant;
    this.showCreateForm = true;
    this.cdr.detectChanges();
  }

  closeTenantDetail(): void {
    this.viewingTenant = undefined;
    this.cdr.detectChanges();
  }

  resetAdminCredentials(tenant: TenantResponseDto, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(`Are you sure you want to reset admin credentials for ${tenant.institutionName}?`)) return;

    this.tenantService.resetAdminCredentials(tenant.id).subscribe({
      next: (res) => {
        this.toast.success(res?.message || 'Admin credentials have been reset and sent to the contact email.');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to reset credentials.');
      }
    });
  }
}
