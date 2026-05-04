import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { ErrorResponse, ApiResponse } from '../models/api-response.model';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as ApiResponse | null;
        if (req.method !== 'GET' && body?.message) {
          toast.success(body.message);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return throwError(() => error);
      }

      let errorMessage = 'An unexpected system error occurred';
      
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server.';
      } else if (error.error) {
        if (typeof error.error === 'object') {
          const errorBody = error.error as ErrorResponse;
          errorMessage = errorBody.message || errorBody.error || error.statusText || errorMessage;
        } else if (typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error);
            errorMessage = parsed.message || parsed.error || error.error;
          } catch {
            errorMessage = error.error;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (!errorMessage || errorMessage === 'Http failure response for (unknown url): 0 Unknown Error') {
        errorMessage = 'An unexpected error occurred (Status: ' + (error.status || 'Unknown') + ')';
      }

      toast.error(errorMessage);
      return throwError(() => error);
    })
  );
};
