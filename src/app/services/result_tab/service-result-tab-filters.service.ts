import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Auth_operations } from '../../Utils/SetToken';

@Injectable({
  providedIn: 'root',
})
export class ServiceResultTabFiltersService {
  private auth_token = Auth_operations.getToken();
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.headerApiKey,
    'access-token': this.auth_token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  private generate_PDF_header = new HttpHeaders({
    'Content-Type': 'application/json',
    accept: 'application/pdf',
    'api-key': environment.headerApiKey,
    'access-token': this.auth_token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });

  constructor(private http: HttpClient) {}

  getGeneratePDF(props: any): Observable<Blob> {
    const generate_PDF_header = {
      'Content-Type': 'application/json',
      accept: 'application/pdf',
      'api-key': environment.headerApiKey,
      'access-token': this.auth_token,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
    };

    return this.http
      .post(props.api_url, props.body, {
        headers: generate_PDF_header,
        observe: 'response',
        responseType: 'blob', // important1
      })

      .pipe(catchError(this.handleError));
  }

  getFilterOptions(props: any): Observable<any> {
    return this.http
      .post<any>(props.api_url, props.body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    // if (error.error instanceof ErrorEvent) {
    //   console.error('An error occurred:', error.error.message);
    // } else {
    //   console.error(
    //     `Backend returned code ${error.status}, ` + `body was: ${error.error}`
    //   );
    // }
    console.log(error);
    return throwError(error);
  }
}
