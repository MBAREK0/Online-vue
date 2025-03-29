// work-experience.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { WorkExperienceRequest } from '../vm/work-experience/WorkExperienceRequest';
import {environment} from "../../environments/environment";
import {WorkExperienceResponse} from "../vm/work-experience/WorkExperienceResponse";
import {ReorderRequest} from "../vm/ReorderRequest";

@Injectable({
  providedIn: 'root'
})
export class WorkExperienceService {
  private apiUrl = `${environment.apiUrl}/v1/portfolio/work-experience`;

  constructor(private http: HttpClient) {

  }
  createWorkExperience(workExperiences: WorkExperienceRequest[], companyLogoFile: File | null): Observable<WorkExperienceRequest[]> {
    const formData = new FormData();

    // Add the file to the form data if it exists
    if (companyLogoFile) {
      formData.append('companyLogoFile', companyLogoFile);
    }

    // Add the work experience data as a JSON string
    formData.append('workExperiences', JSON.stringify(workExperiences));

    return this.http.post<WorkExperienceRequest[]>(this.apiUrl, formData);
  }

  getAllWorkExperiences(): Observable<WorkExperienceResponse[]> {
    const username = localStorage.getItem('username'); // Fetch dynamically when needed
    return this.http.get<WorkExperienceResponse[]>(`${this.apiUrl}/user/${username}/primary`);
  }

  reorderWorkExperiences(reorderRequests: ReorderRequest[]): Observable<WorkExperienceResponse[]> {
    return this.http.put<WorkExperienceResponse[]>(`${this.apiUrl}/reorder`, reorderRequests);
  }

  deleteWorkExperience(experienceId: string): Observable<WorkExperienceResponse[]> {

    return this.http.delete<WorkExperienceResponse[]>(`${this.apiUrl}/${experienceId}`);
  }

  archiveWorkExperience(experienceId: string): Observable<WorkExperienceResponse[]> {
    return this.http.put<WorkExperienceResponse[]>(`${this.apiUrl}/${experienceId}/archive`, {});
  }

  fetchWorkExperienceById(experienceId: string): Observable<WorkExperienceResponse[]> {
    const username = localStorage.getItem('username');
    return this.http.get<WorkExperienceResponse[]>(`${this.apiUrl}/user/${username}/experience/${experienceId}`);

  }
}
