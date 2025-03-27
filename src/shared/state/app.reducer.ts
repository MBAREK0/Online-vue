import { createReducer, on } from '@ngrx/store';
import {
  load_languages_success,
  load_portfolio_languages_success,
  load_user_portfolio_languages, load_user_portfolio_languages_success,
  reset_app_state
} from "./app.actions";

export interface Language {
  id: number;
  language: string;
  code: string;
  name: string;
  selected: boolean;
}

export interface PortfolioTranslationLanguages {
  language: string;
  code: string;
  primary: boolean;
}


export interface AppState {
  languages: Language[];
  ptl: PortfolioTranslationLanguages[];
  userPtl: PortfolioTranslationLanguages[];

}

export const initialState: AppState = {
  languages: [],
  ptl: [],
  userPtl: []
};


export const appReducer = createReducer(
  initialState,
  on(load_languages_success, (state, { languages }) => ({
    ...state,
    languages
  })),
  on(load_portfolio_languages_success, (state, { ptl }) => ({
    ...state,
    ptl
  })),
  on(load_user_portfolio_languages_success, (state, { ptl }) => ({
    ...state,
    userPtl: ptl
  })),
  on(reset_app_state, () => initialState)
);
