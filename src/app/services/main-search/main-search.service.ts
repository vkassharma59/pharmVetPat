import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Auth_operations } from '../../Utils/SetToken';

@Injectable({
  providedIn: 'root'
})

export class MainSearchService {

  private auth_token = Auth_operations.getToken();
  private simple_search_suggesstions =
    environment.SIMPLE_SEARCH_SUGGESTIONS;
  private simple_search_results =
    environment.SIMPLE_SEARCH_RESULTS;
  private chemical_structure_filters =
    environment.CHEMICAL_STRUCTURE_FILTER_API;
  private chemical_structure_auto_suggestions =
    environment.CHEMICAL_STRUCTURE_AUTO_SUGGESTIONS_API;
  private synthesis_auto_suggestions =
    environment.SYNTHESIS_AUTO_SUGGESTIONS_API;
  private intermediate_application_filter =
    environment.INTERMEDIATE_APPLICATION_FILTER_API;
  private advance_search_filter_columns = environment.ADVANCE_SEARCH_FILTER_COLUMNS_API;
  private advance_auto_suggestions = environment.ADVANCE_AUTO_SUGGESTIONS_API;
  private ip = Auth_operations.getIp();

  constructor(private http: HttpClient) {}

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.HEADER_API_KEY,
    'access-token': this.auth_token,
    'x-forwarded-for': this.ip,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
  });
  
  getSynthesisSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.synthesis_auto_suggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getSimpleSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.simple_search_suggesstions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getChemicalStructureSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.chemical_structure_auto_suggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getAdvanceSearchSuggestions(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.advance_auto_suggestions, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getSimpleSearchResults(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.simple_search_results, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  getChemicalStructureFilters(): Observable<any> {
    return this.http
      .get(this.chemical_structure_filters, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }  

  getIntermediateSearchFilters(): Observable<any> {
    return this.http
      .get(this.intermediate_application_filter, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }  

  getAdvanceSearchFilters(): Observable<any> {
    return this.http
      .get(this.advance_search_filter_columns, { headers: this.headers })
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
