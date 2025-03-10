import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
// import { provideAnimations } from '@angular/platform-browser/animations';
import {HttpClientModule, provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptorInterceptor} from "../core/interceptors/auth-interceptor.interceptor";
import { provideStore } from '@ngrx/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // provideAnimations(),
    importProvidersFrom(MatButtonModule, MatToolbarModule, HttpClientModule),
    provideHttpClient(withInterceptors([authInterceptorInterceptor])),
    provideStore()
],
};
