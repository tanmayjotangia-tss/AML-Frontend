import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { TenantService } from '../../../../../core/services/tenant.service';

export class TenantValidators {
  static uniqueTenantCode(tenantService: TenantService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return timer(500).pipe(
        switchMap(() => tenantService.checkTenantCodeAvailability(control.value)),
        map(res => {
          return res.data ? null : { codeTaken: true };
        }),
        catchError(() => of(null))
      );
    };
  }

  static uniqueSchemaName(tenantService: TenantService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }
      return timer(500).pipe(
        switchMap(() => tenantService.checkSchemaNameAvailability(control.value)),
        map(res => {
          return res.data ? null : { schemaTaken: true };
        }),
        catchError(() => of(null))
      );
    };
  }
}
