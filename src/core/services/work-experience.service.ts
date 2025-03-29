// work-experience.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { WorkExperience } from '../models/WorkExperience';
import {environment} from "../../environments/environment";
import {WorkExperienceResponseVM} from "../interfaces/WorkExperienceResponseVM";
import {ReorderRequest} from "../interfaces/ReorderRequest";

@Injectable({
  providedIn: 'root'
})
export class WorkExperienceService {
  private apiUrl = `${environment.apiUrl}/v1/portfolio/work-experience`;

  constructor(private http: HttpClient) {

  }
  createWorkExperience(workExperiences: WorkExperience[], companyLogoFile: File | null): Observable<WorkExperience[]> {
    const formData = new FormData();

    // Add the file to the form data if it exists
    if (companyLogoFile) {
      formData.append('companyLogoFile', companyLogoFile);
    }

    // Add the work experience data as a JSON string
    formData.append('workExperiences', JSON.stringify(workExperiences));

    return this.http.post<WorkExperience[]>(this.apiUrl, formData);
  }

  getAllWorkExperiences(): Observable<WorkExperienceResponseVM[]> {
    const username = localStorage.getItem('username'); // Fetch dynamically when needed
    return this.http.get<WorkExperienceResponseVM[]>(`${this.apiUrl}/user/${username}/primary`);
  }

  reorderWorkExperiences(reorderRequests: ReorderRequest[]): Observable<WorkExperienceResponseVM[]> {
    return this.http.put<WorkExperienceResponseVM[]>(`${this.apiUrl}/reorder`, reorderRequests);
  }

  deleteWorkExperience(experienceId: string): Observable<WorkExperienceResponseVM[]> {

    return this.http.delete<WorkExperienceResponseVM[]>(`${this.apiUrl}/${experienceId}`);
  }

  archiveWorkExperience(experienceId: string): Observable<WorkExperienceResponseVM[]> {
    return this.http.put<WorkExperienceResponseVM[]>(`${this.apiUrl}/${experienceId}/archive`, {});
  }

  fetchWorkExperienceById(experienceId: string): Observable<WorkExperienceResponseVM[]> {
    const username = localStorage.getItem('username');
    return this.http.get<WorkExperienceResponseVM[]>(`${this.apiUrl}/user/${username}/experience/${experienceId}`);

  }
}
