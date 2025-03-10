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
import {appReducer} from "../shared/state/app.reducer";
import {provideEffects} from "@ngrx/effects";
import {LanguagesEffects, PortfolioLanguagesEffects} from "../shared/state/app.effects";
import {provideStoreDevtools} from "@ngrx/store-devtools";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // provideAnimations(),
    importProvidersFrom(MatButtonModule, MatToolbarModule, HttpClientModule),
    provideHttpClient(withInterceptors([authInterceptorInterceptor])),
    provideStore({ app: appReducer }),
    provideEffects([LanguagesEffects,PortfolioLanguagesEffects]),
    provideHttpClient(),
    provideStoreDevtools({ maxAge: 25 }),
],
};
