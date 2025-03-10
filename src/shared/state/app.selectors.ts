
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.reducer';

// Select the entire state for AppState
export const selectAppState = createFeatureSelector<AppState>('app');

// Select languages from the state
export const selectLanguages = createSelector(
  selectAppState,
  (state: AppState) => state.languages
);

// Select portfolio translation languages (ptl) from the state
export const selectPortfolioLanguages = createSelector(
  selectAppState,
  (state: AppState) => state.ptl
);

// Select a specific language by code
export const selectLanguageByCode = (code: string) =>
  createSelector(selectLanguages, (languages) =>
    languages.find((language) => language.code === code)
  );

// Select a specific language by primary
export const selectPrimaryLanguage = createSelector(
  selectPortfolioLanguages,
  (ptl) => ptl.find((language) => language.primary)
);
