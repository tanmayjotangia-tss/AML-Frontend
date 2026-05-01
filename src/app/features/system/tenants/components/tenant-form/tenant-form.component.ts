import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantService } from '../../../../../core/services/tenant.service';
import { TenantValidators } from './tenant.validators';
import { CreateTenantRequestDto, UpdateTenantRequestDto, TenantResponseDto } from '../../../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css'
})
export class TenantFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);

  @Input() tenantToEdit?: TenantResponseDto;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  tenantForm!: FormGroup;
  isSubmitting = false;
  submitError = '';
  tenantStatuses = ['ACTIVE', 'SUSPENDED', 'DEPROVISIONED'];

  get isEditMode(): boolean {
    return !!this.tenantToEdit;
  }

  ngOnInit(): void {
    this.initForm();
    this.setupAutoSchema();
    if (this.tenantToEdit) {
      this.patchForm(this.tenantToEdit);
    }
  }

  private setupAutoSchema() {
    this.tenantForm.get('tenantCode')?.valueChanges.subscribe(value => {
      if (!this.isEditMode && value) {
        const schema = value.toLowerCase() + '_schema';
        this.tenantForm.patchValue({ schemaName: schema }, { emitEvent: false });
      }
    });
  }

  private initForm() {
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
      address: [''],
      status: ['ACTIVE', [Validators.required]]
    });
  }

  private patchForm(tenant: TenantResponseDto) {
    this.tenantForm.patchValue({
      tenantCode: tenant.tenantCode,
      schemaName: tenant.schemaName,
      institutionName: tenant.institutionName,
      countryCode: tenant.countryCode,
      regulatoryJurisdiction: tenant.regulatoryJurisdiction,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      address: tenant.address,
      status: tenant.status
    });

    // Tenant Code and Schema Name are immutable on edit
    this.tenantForm.get('tenantCode')?.disable();
    this.tenantForm.get('schemaName')?.disable();
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

    if (this.isEditMode && this.tenantToEdit) {
      const rawValue = this.tenantForm.getRawValue();
      const req: UpdateTenantRequestDto = {
        institutionName: rawValue.institutionName,
        countryCode: rawValue.countryCode,
        regulatoryJurisdiction: rawValue.regulatoryJurisdiction,
        contactEmail: rawValue.contactEmail,
        contactPhone: rawValue.contactPhone,
        address: rawValue.address,
        status: rawValue.status
      };

      this.tenantService.updateTenant(this.tenantToEdit.id, req).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.submitError = err.error?.message || 'An error occurred while updating the tenant.';
        }
      });
    } else {
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
  }

  onCancel() {
    this.close.emit();
  }
}
