import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable, of} from 'rxjs';
import {Language, PortfolioTranslationLanguages} from "../../shared/state/app.reducer";

@Injectable({
  providedIn: 'root'
})
export class TranslationService  {


  private apiUrl = `${environment.apiUrl}/v1/portfolio/translation/language`;


  private portfolioLanguagesUri = `${this.apiUrl}/user/`;

  constructor(private http: HttpClient) { }


  getAllLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(this.apiUrl);
  }

  getPortfolioLanguages(): Observable<PortfolioTranslationLanguages[]> {
    const username = localStorage.getItem('username'); // Fetch dynamically when needed
    if (!username) {
      console.error('No username found in localStorage');
      return of([]); // Return empty array to prevent errors
    }
    return this.http.get<PortfolioTranslationLanguages[]>(this.portfolioLanguagesUri + username);
  }


  insertPortfolioLanguages(languages: string[]): Observable<any> {
    return this.http.post(this.apiUrl, { languages });
  }
}
