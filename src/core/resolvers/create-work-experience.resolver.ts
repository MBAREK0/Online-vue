import {ResolveFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {AppState} from "../../shared/state/app.reducer";
import {TranslationService} from "../services/translation.service";
import {load_portfolio_languages, load_user_portfolio_languages} from "../../shared/state/app.actions";
import {catchError, filter, of, switchMap, take, tap} from "rxjs";

export const createWorkExperienceResolver: ResolveFn<boolean> = (route, state) => {
  const store = inject(Store<AppState>);
  const router = inject(Router);
  const ptlService = inject(TranslationService);

  // Dispatch action to load portfolio languages
  store.dispatch(load_user_portfolio_languages());

  // Wait for data to be loaded, then check and redirect if needed
  return ptlService.getUserPortfolioLanguages().pipe(
    filter(ptl => Array.isArray(ptl)), // Make sure we have a valid response
    take(1),
    tap(ptl => {
      console.log('Resolver received user portfolio languages:', ptl);
      if (ptl && ptl.length === 0) {
        console.log('Languages do not exist, redirecting');
        router.navigate(['/auth/ptl']);
      }
    }),
    switchMap(ptl => of(ptl.length === 0)),
    catchError(() => of(true))
  );
};
