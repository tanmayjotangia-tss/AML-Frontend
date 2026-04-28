import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService } from '../../../../../core/services/tenant.service';
import { TenantValidators } from './tenant.validators';
import { CreateTenantRequestDto } from '../../../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css'
})
export class TenantFormComponent {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  tenantForm: FormGroup;
  isSubmitting = false;
  submitError = '';

  constructor() {
    this.tenantForm = this.fb.group({
      tenantCode: ['', 
        [Validators.required, Validators.maxLength(50), Validators.pattern('^[A-Z0-9_]+$')],
        [TenantValidators.uniqueTenantCode(this.tenantService)]
      ],
      schemaName: ['', 
        [Validators.required, Validators.maxLength(63), Validators.pattern('^[a-z0-9_]+$')],
        [TenantValidators.uniqueSchemaName(this.tenantService)]
      ],
      institutionName: ['', [Validators.required, Validators.maxLength(255)]],
      countryCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(3)]],
      regulatoryJurisdiction: ['', [Validators.maxLength(100)]],
      contactEmail: ['', [Validators.email, Validators.maxLength(255)]],
      contactPhone: ['', [Validators.maxLength(50)]],
      address: ['']
    });
  }

  // Helper getters for template
  get f() { return this.tenantForm.controls; }

  onSubmit() {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const req: CreateTenantRequestDto = this.tenantForm.value;

    this.tenantService.createTenant(req).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'An error occurred while provisioning the tenant.';
      }
    });
  }

  onCancel() {
    this.close.emit();
  }
}
