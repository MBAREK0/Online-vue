import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly registerUri = `${environment.apiUrl}/auth/register`;
  private readonly loginUri = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  register(payload: any): Observable<any> {
    return this.http.post(this.registerUri, payload);
  }

  login(payload: any): Observable<any> {
    return this.http.post(this.loginUri, payload);
  }

}
