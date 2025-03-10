import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {inject} from "@angular/core";
import {Router} from "@angular/router";

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Inject AuthService

  const token = localStorage.getItem('token');
  let clonedRequest = req; // Initialize the request

  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Unauthorized request:', error.message);
        // navigate  to login page
        const router = inject(Router);
        router.navigate(['/auth/login']).then(r => console.log(r));

      }
      // Pass other errors along
      return throwError(() => error);
    })
  );
};
