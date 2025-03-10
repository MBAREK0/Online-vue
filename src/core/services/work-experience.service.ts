// work-experience.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkExperience } from '../models/WorkExperience';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WorkExperienceService {
  private apiUrl = `${environment.apiUrl}/v1/portfolio/work-experience`;

  constructor(private http: HttpClient) { }

  createWorkExperience(workExperiences: WorkExperience[], companyLogoFile: File): Observable<WorkExperience[]> {
    const formData = new FormData();

    // Add the file to the form data
    formData.append('companyLogoFile', companyLogoFile);

    // Add the work experience data as a JSON string
    formData.append('workExperiences', JSON.stringify(workExperiences));

    return this.http.post<WorkExperience[]>(this.apiUrl, formData);
  }

  getWorkExperiences(): Observable<WorkExperience[]> {
    return this.http.get<WorkExperience[]>(this.apiUrl);
  }

  deleteWorkExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
