import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AppConfigValues } from '../../config/app-config';
import { environment } from '../../../environments/environment';
import { Auth_operations } from '../../Utils/SetToken';

@Injectable({
  providedIn: 'root'
})

export class MainSearchService {

  private auth_token = Auth_operations.getToken();
  private apiUrls = AppConfigValues.appUrls;
  private ip = Auth_operations.getIp();

  constructor(private http: HttpClient) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.headerApiKey,
    'access-token': this.auth_token,
    'x-forwarded-for': this.ip,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });
  
  getSynthesisSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.technicalRoutes.synthesisAutoSuggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getSimpleSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.basicProductInfo.simpleSearchSuggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getChemicalStructureSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.chemicalDirectory.autoSuggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getAdvanceSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.basicProductInfo.advanceAutoSuggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getSimpleSearchResults(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.basicProductInfo.simpleSearchResults, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  
  getSyntheticSearchResults(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.technicalRoutes.synthesisSearch, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getAdvanceSearchResults(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.basicProductInfo.advanceSearchResults, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getChemicalStructureFilters(): Observable<any> {
    return this.http
      .get(this.apiUrls.chemicalDirectory.structureFilterColumns, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }  

  getIntermediateSearchFilters(): Observable<any> {
    return this.http
      .get(this.apiUrls.chemicalDirectory.filterColumns, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }  

  getAdvanceSearchFilters(): Observable<any> {
    return this.http
      .get(this.apiUrls.basicProductInfo.filterColumns, { headers: this.headers })
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
