import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environment/environment';
import { Auth_operations } from '../../Utils/SetToken';

@Injectable({
  providedIn: 'root',
})
export class ColumnListService {
  private apiUrl1 = environment.IMPURITY_TAB_API;
  private auth_token = Auth_operations.getToken();

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.HEADER_API_KEY,
    'access-token': this.auth_token,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });
  constructor(private http: HttpClient) {}

  getColumnList(api: any) {
    return this.http
      .get<any>(api, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
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