import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap, of } from 'rxjs';
import { TranslationService } from '../../core/services/translation.service';
import {
  load_languages,
  load_languages_success,
  load_languages_error,
  load_portfolio_languages,
  load_portfolio_languages_success, load_portfolio_languages_error
} from './app.actions';

@Injectable()
export class LanguagesEffects {
  private actions$ = inject(Actions);
  private translationService = inject(TranslationService);

  loadLanguages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(load_languages),
      exhaustMap(() =>
        this.translationService.getAllLanguages().pipe(
          map(languages => load_languages_success({ languages })),
          catchError(error => of(load_languages_error({ error: error.message })))
        )
      )
    )
  );
}


@Injectable()
export class PortfolioLanguagesEffects {
  private actions$ = inject(Actions);
  private translationService = inject(TranslationService);

  loadPortfolioLanguages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(load_portfolio_languages),
      exhaustMap(() =>
        this.translationService.getPortfolioLanguages().pipe(
          map(ptl => load_portfolio_languages_success({ ptl })),
          catchError(error => of(load_portfolio_languages_error({ error: error.message })))
        )
      )
    )
  );
}
