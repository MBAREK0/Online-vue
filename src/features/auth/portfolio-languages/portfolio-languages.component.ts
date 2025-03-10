import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import {TranslationService} from "../../../core/services/translation.service";
import {Store} from "@ngrx/store";
import {AppState, Language, PortfolioTranslationLanguages} from "../../../shared/state/app.reducer";
import {selectLanguages, selectPortfolioLanguages} from "../../../shared/state/app.selectors";
import {load_languages, load_portfolio_languages} from "../../../shared/state/app.actions";

interface LanguageViewModel {
  code: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-portfolio-languages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './portfolio-languages.component.html',
  styleUrl: './portfolio-languages.component.css'
})
export class PortfolioLanguagesComponent implements OnInit {
  private store = inject(Store<AppState>);

  languages: LanguageViewModel[] = [];
  portfolioLanguages: PortfolioTranslationLanguages[] = [];

  selectedLanguages: string[] = [];
  searchTerm: string = '';
  filteredLanguages: LanguageViewModel[] = [];

  constructor(
    private translationService: TranslationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Dispatch actions to load data
    // this.fetchPortfolioLanguages();
    this.fetchLanguages();

    // Subscribe to the languages from the store
    this.store.select(selectLanguages).subscribe((langs) => {
      if (langs && langs.length > 0) {
        // Map state language model to view model
        this.languages = langs.map(lang => ({
          code: lang.code,
          name: lang.language,
          selected: this.isLanguageSelected(lang.code)
        }));

        // Sort languages alphabetically by name
        this.languages.sort((a, b) => a.name.localeCompare(b.name));

        // Update filtered languages whenever languages change
        this.updateFilteredLanguages();
      }
    });

    // Subscribe to portfolio languages
    this.store.select(selectPortfolioLanguages).subscribe((ptl) => {
      if (ptl && ptl.length > 0) {
        this.portfolioLanguages = ptl;
      }
    });
  }

  // Get selected language view models for displaying chips
  getSelectedLanguageViewModels(): LanguageViewModel[] {
    return this.languages.filter(lang => lang.selected);
  }

  // Check if a language is selected based on portfolio languages
  isLanguageSelected(code: string): boolean {
    return this.portfolioLanguages.some(pl => pl.code === code);
  }

  // Update language selection based on portfolio languages
  updateLanguageSelection(): void {
    if (this.languages.length > 0 && this.portfolioLanguages.length > 0) {
      // Mark languages as selected if they exist in portfolio languages
      this.languages.forEach(lang => {
        lang.selected = this.isLanguageSelected(lang.code);
      });

      // Update the selected languages array
      this.updateSelectedLanguages();
    }
  }

  // Update filtered languages based on search term
  updateFilteredLanguages(): void {
    if (this.searchTerm.trim()) {
      this.searchLanguages();
    } else {
      this.filteredLanguages = [...this.languages];
    }
  }

  toggleLanguage(language: LanguageViewModel): void {
    language.selected = !language.selected;
    this.updateSelectedLanguages();
  }

  updateSelectedLanguages(): void {
    this.selectedLanguages = this.languages
      .filter(lang => lang.selected)
      .map(lang => lang.code);
  }

  searchLanguages(): void {
    if (!this.searchTerm.trim()) {
      this.filteredLanguages = [...this.languages];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredLanguages = this.languages.filter(
        lang => lang.name.toLowerCase().includes(term) || lang.code.toLowerCase().includes(term)
      );
    }
  }

  saveLanguages(): void {
    if (this.selectedLanguages.length > 0) {
      this.translationService.insertPortfolioLanguages(this.selectedLanguages)
        .subscribe({
          next: (response) => {
            console.log('Languages saved successfully', response);
            // Navigate to the next page after successful save
            this.router.navigate(['/next-page']);
          },
          error: (error) => {
            console.error('Error saving languages', error);
          }
        });
    }
  }

  clearAll(): void {
    this.languages.forEach(lang => lang.selected = false);
    this.updateSelectedLanguages();
  }

  fetchLanguages() {
    this.store.dispatch(load_languages());
  }
  // fetchPortfolioLanguages() {
  //   this.store.dispatch(load_portfolio_languages());
  // }

}
