import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeographicRiskService } from '../../../../../core/services/geographic-risk.service';
import { CreateGeographicRiskRequestDto, GeographicRiskRatingResponseDto } from '../../../../../core/models/geographic-risk.model';

@Component({
  selector: 'app-geo-risk-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './geo-risk-form.component.html',
  styleUrls: ['./geo-risk-form.component.css']
})
export class GeoRiskFormComponent implements OnInit {
  @Input() editData?: GeographicRiskRatingResponseDto;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private geoRiskService = inject(GeographicRiskService);

  form!: FormGroup;
  isSubmitting = false;
  submitError = '';

  ngOnInit() {
    this.initForm();
    if (this.editData) {
      this.populateForm();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      countryCode: [
        { value: '', disabled: !!this.editData }, 
        [Validators.required, Validators.minLength(2), Validators.maxLength(3)]
      ],
      countryName: ['', [Validators.required]],
      fatfStatus: ['COMPLIANT', [Validators.required]],
      baselAmlIndexScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      riskTier: ['LOW', [Validators.required]],
      notes: [''],
      effectiveFrom: [new Date().toISOString().substring(0, 16), [Validators.required]] // YYYY-MM-DDThh:mm format for datetime-local
    });
  }

  private populateForm() {
    // Format effectiveFrom for datetime-local input
    let effectiveFromStr = '';
    if (this.editData?.effectiveFrom) {
      try {
        const date = new Date(this.editData.effectiveFrom);
        effectiveFromStr = date.toISOString().substring(0, 16);
      } catch(e) {
        effectiveFromStr = new Date().toISOString().substring(0, 16);
      }
    }

    this.form.patchValue({
      countryCode: this.editData?.countryCode,
      countryName: this.editData?.countryName,
      fatfStatus: this.editData?.fatfStatus,
      baselAmlIndexScore: this.editData?.baselAmlIndexScore,
      riskTier: this.editData?.riskTier,
      notes: this.editData?.notes || '',
      effectiveFrom: effectiveFromStr
    });
  }

  get f() {
    return this.form.controls;
  }

  onCancel() {
    if (this.isSubmitting) return;
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const formValue = this.form.getRawValue();
    
    const requestDto: CreateGeographicRiskRequestDto = {
      countryCode: formValue.countryCode.toUpperCase(),
      countryName: formValue.countryName,
      fatfStatus: formValue.fatfStatus,
      baselAmlIndexScore: Number(formValue.baselAmlIndexScore),
      riskTier: formValue.riskTier,
      notes: formValue.notes,
      effectiveFrom: new Date(formValue.effectiveFrom).toISOString() // Convert back to ISO instant for backend
    };

    this.geoRiskService.upsertRating(requestDto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Failed to save geographic risk rating.';
      }
    });
  }
}
