import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { GlobalScenarioService } from '../../../../../core/services/global-scenario.service';
import { GlobalRuleService } from '../../../../../core/services/global-rule.service';
import { CreateGlobalScenarioRequestDto, GlobalScenarioResponseDto, GlobalRuleResponseDto } from '../../../../../core/models/rule-engine.model';

@Component({
  selector: 'app-scenario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './scenario-form.component.html',
  styleUrls: ['./scenario-form.component.css']
})
export class ScenarioFormComponent implements OnInit {
  @Input() editData?: GlobalScenarioResponseDto;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private scenarioService = inject(GlobalScenarioService);
  private ruleService = inject(GlobalRuleService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isSubmitting = false;
  submitError = '';

  // Rule Selection
  availableRules: GlobalRuleResponseDto[] = [];
  selectedRuleIds = new Set<string>();
  isLoadingRules = true;

  ngOnInit() {
    this.initForm();
    if (this.editData) {
      this.populateForm();
    } else {
      // Only load available rules when creating a new scenario
      this.loadRules();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      scenarioName: ['', [Validators.required, Validators.maxLength(255)]],
      category: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['']
    });
  }

  private populateForm() {
    this.form.patchValue({
      scenarioName: this.editData?.scenarioName,
      category: this.editData?.category,
      description: this.editData?.description || ''
    });
  }

  private loadRules() {
    this.isLoadingRules = true;
    this.ruleService.listRules(0, 100).subscribe({
      next: (res) => {
        try {
          if (Array.isArray(res.data)) {
            this.availableRules = res.data;
          } else {
            this.availableRules = res.data?.content || [];
          }
        } catch(e) {
          console.error(e);
        } finally {
          this.isLoadingRules = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoadingRules = false;
        console.error('Failed to load rules for mapping', err);
        this.cdr.detectChanges();
      }
    });
  }

  toggleRuleSelection(ruleId: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedRuleIds.add(ruleId);
    } else {
      this.selectedRuleIds.delete(ruleId);
    }
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
    
    const requestDto: CreateGlobalScenarioRequestDto = {
      scenarioName: formValue.scenarioName,
      category: formValue.category,
      description: formValue.description
    };

    if (this.editData) {
      // Update Mode
      this.scenarioService.updateScenario(this.editData.id, requestDto).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.submitError = err.error?.message || 'Failed to update scenario.';
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create Mode with Rule Mapping
      this.scenarioService.createScenario(requestDto).pipe(
        switchMap((res) => {
          const newScenarioId = res.data.id;
          
          if (this.selectedRuleIds.size === 0) {
            return of(true); // Nothing to map
          }

          // Map all selected rules concurrently
          const mapRequests = Array.from(this.selectedRuleIds).map(ruleId => 
            this.scenarioService.addRuleToScenario(newScenarioId, ruleId).pipe(catchError(() => of(null)))
          );
          
          return forkJoin(mapRequests);
        })
      ).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.saved.emit();
          this.close.emit();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.submitError = err.error?.message || 'Failed to create scenario.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
