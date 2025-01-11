import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Auth_operations } from '../../Utils/SetToken';
import { AppConfigValues } from '../../config/app-config';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  private apiUrl = AppConfigValues.appUrls;
  private auth_token = Auth_operations.getToken();

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.headerApiKey,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };

    return this.http
      .post<any>(this.apiUrl.authentication.loginUrl, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  loginWithCode(code: any): Observable<any> {
    const code_login_api = this.apiUrl.authentication.loginUrl;
    const new_url = `${code_login_api}${code}`;
    return this.http
      .get<any>(new_url, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  query(
    email: any,
    comment: any,
    query: any,
    platform: any,
    search: any,
    access_token: any
  ): Observable<any> {
    const body = { email, comment, query, platform, search };
    const access_headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'access-token': access_token,
      'api-key': environment.headerApiKey,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    });

    return this.http
      .post<any>(this.apiUrl.query.raiseQuery, body, { headers: access_headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.log(error.error);
    // if (!error.error.status) {
    //   alert(error.error.message);
    // }
    return throwError(error.error);
  }
}
