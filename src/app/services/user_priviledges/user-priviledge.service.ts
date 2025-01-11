import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment as env } from '../../../environments/environment';
import { Auth_operations } from '../../Utils/SetToken';
import { AppConfigValues } from '../../config/app-config';

@Injectable({
  providedIn: 'root',
})
export class UserPriviledgeService {

  private apiUrls = AppConfigValues.appUrls;
  private auth_token = Auth_operations.getToken();

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': env.headerApiKey,
    'access-token': this.auth_token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) {}

  getUserPriviledgesData() {
    let auth_token = Auth_operations.getToken();

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': env.headerApiKey,
      'access-token': auth_token,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    });

    return this.http
      .get(this.apiUrls.user.privilegeApi, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  getUserTodayPriviledgesData() {
    const body = {
      vertical: 'Technical Routes (MongoDB)',
    };
    let auth_token = Auth_operations.getToken();

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'api-key': env.headerApiKey,
      'access-token': auth_token,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    });

    return this.http
      .post(this.apiUrls.user.privilegeApi, body, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }
}
