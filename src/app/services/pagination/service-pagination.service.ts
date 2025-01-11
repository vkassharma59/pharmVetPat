import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Auth_operations } from '../../Utils/SetToken';

@Injectable({
  providedIn: 'root',
})
export class ServicePaginationService {
  private auth_token = Auth_operations.getToken();

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.HEADER_API_KEY,
    'access-token': this.auth_token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) {}

  getNextPaginationData(props: any): Observable<any> {
    const body = props?.body;

    return this.http.post<any>(props.api_url, body, { headers: this.headers });
  }
}
