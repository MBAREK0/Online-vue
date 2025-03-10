import {ResolveFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AppState} from "../../shared/state/app.reducer";
import {Store} from "@ngrx/store";
import {load_portfolio_languages} from "../../shared/state/app.actions";
import {selectPortfolioLanguages} from "../../shared/state/app.selectors";
import {catchError, filter, of, switchMap, take, tap} from "rxjs";
import {TranslationService} from "../services/translation.service";

export const portfolioLanguagesResolverResolver: ResolveFn<boolean> = (route, state) => {
  const store = inject(Store<AppState>);
  const router = inject(Router);
  const ptlService = inject(TranslationService);

  // Dispatch action to load portfolio languages
  store.dispatch(load_portfolio_languages());

  // Wait for data to be loaded, then check and redirect if needed
  return ptlService.getPortfolioLanguages().pipe(
    filter(ptl => Array.isArray(ptl)), // Make sure we have a valid response
    take(1),
    tap(ptl => {
      console.log('Resolver received portfolio languages:', ptl);
      if (ptl && ptl.length > 0) {
        console.log('Languages exist, redirecting');
        router.navigate(['/']);
      }
    }),
    switchMap(ptl => of(ptl.length === 0)),
    catchError(() => of(true))
  );};
