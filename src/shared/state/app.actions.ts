import { createAction, props } from '@ngrx/store';
import {Language, PortfolioTranslationLanguages} from './app.reducer';

export const reset_app_state = createAction('[App] Reset State');

export const load_languages = createAction(
  "[Languages API] Load Languages"
);

export const load_languages_success = createAction(
  "[Languages API] Load Languages Success",
  props<{ languages: Language[] }>()
);

export const load_languages_error = createAction(
  "[Languages API] Load Languages Error",
  props<{ error: string }>()
);


export const load_portfolio_languages = createAction(
  "[Languages API] Load Portfolio Languages"
);
export const load_portfolio_languages_success = createAction(
  "[Languages API] Load Portfolio Languages Success",
  props<{ ptl: PortfolioTranslationLanguages[] }>()
)

export const load_portfolio_languages_error = createAction(
  "[Languages API] Load Portfolio Languages Error",
  props<{ error: string }>()
)
