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
  public simpleSearchKeyword: string = '';
  constructor(private http: HttpClient) { }

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'api-key': environment.headerApiKey,
    'platforms': environment.platforms,
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

  getChemicalStructureResults(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.chemicalDirectory.intermediateApplicationSearch, body, { headers: this.headers })
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
 getProductHighlights(): Observable<any> {
    return this.http
      .get(this.apiUrls.basicProductInfo.productHighlights, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  technicalRoutesSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.technicalRoutes.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  basicProductSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.basicProductInfo.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  chemicalDirectorySearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.chemicalDirectory.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  impuritySearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.impurity.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  chemiTrackerSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.chemiTracker.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  canadaApprovalSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.canadaApproval.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  japanApprovalSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.japanApproval.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  koreaApprovalSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.koreaApproval.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  indianMedicineSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.indianMedicine.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  litigationSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.litigation.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  gppdDbSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.gppdDb.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getgppdDbColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.gppdDb.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  scientificDocsSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.scientificDocs.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getScientificDocsColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.scientificDocs.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  spcdbSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.spcDb.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getSpcdbColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.spcDb.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  impPatentsSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.impPatents.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  europeApprovalSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.europeApproval.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getusApprovalColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.usApproval.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  usApprovalSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.usApproval.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  veterinaryusApprovalSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.veterinaryUsApproval.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  activePatentSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.activePatent.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getactivePatentColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.activePatent.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  NonPatentSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.nonPatentLandscape.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getNonPatentColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.nonPatentLandscape.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  EximDataSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.eximData.searchSpecific, body, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  getEximDataColumnList(): Observable<any> {
    return this.http
      .get(this.apiUrls.eximData.columnList, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }
  dmfSearchSpecific(props: any): Observable<any> {
    const body = props;
    return this.http
      .post(this.apiUrls.dmf.searchSpecific, body, { headers: this.headers })
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
