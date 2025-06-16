import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Auth_operations } from '../../Utils/SetToken';

@Injectable({
  providedIn: 'root',
})

export class ServiceChildPaginationService {
  private auth_token = Auth_operations.getToken();
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.headerApiKey,
    'access-token': this.auth_token,
    'platforms': environment.platforms,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });
  constructor(private http: HttpClient) {}
  getNextChildPaginationData(body: any): Observable<any> {
             return this.http.post<any>(body.api_url, body, { headers: this.headers });

  }
}
