import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainSearchService } from '../../services/main-search/main-search.service';
import { NgFor, NgIf } from '@angular/common';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { Auth_operations } from '../../Utils/SetToken';
import { ColumnListService } from '../../services/columnList/column-list.service';
import { environment } from '../../../environment/environment';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';

@Component({
  selector: 'chem-pharma-database-search',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './pharma-database-search.component.html',
  styleUrl: './pharma-database-search.component.css'
})

export class pharmaDatabaseSearchComponent implements OnInit {

  screenColumn = 'Select Filter';
  criteria: string = ''; 
  userAuth: any = {}; 
  column: string = '';
  apiUrl: string;
  searchTypes: any;
    
  chemicalStructure : any = { filter: ''}
  simpleSearch : any = {}
  synthesisSearch : any = {}
  intermediateSearch : any = { filter: '' }
  advanceSearch : any = {
    autosuggestionList : [],
    dateType: '',
  }

  @ViewChild('simpleSearchkeywordInput') simpleSearchkeywordInput!: ElementRef;
  @ViewChild('chemicalStructureKeywordInput') chemicalStructureKeywordInput!: ElementRef;
  @ViewChild('synthesisSearchkeywordInput') synthesisSearchkeywordInput!: ElementRef;
  @ViewChild('intermediateSearchKeywordInput') intermediateSearchKeywordInput!: ElementRef;  

  @Output() setLoadingState: EventEmitter<any> = new EventEmitter<any>();
  @Output() chemSearchResults: EventEmitter<any> = new EventEmitter<any>();
  @Output() priviledgeModal: EventEmitter<any> = new EventEmitter<any>();  
  @Output() showResultFunction: EventEmitter<any> = new EventEmitter<any>();  

  tabs$ = this.utilityService.tabs$;
  resultTabs: any = [];  

  constructor(
    private mainSearchService: MainSearchService,
    private userPriviledgeService: UserPriviledgeService,
    private utilityService: UtilityService,
    private columnListService: ColumnListService){
      this.apiUrl = environment.SIMPLE_SEARCH_RESULTS;
      this.searchTypes = searchTypes;
      this.advanceSearch.filterInputs = [
        { filter: '', keyword: '' }
      ];
    }

  ngOnInit() {
    // Get All tabs name
    this.resultTabs = this.utilityService.getAllTabsName();
    console.log(this.resultTabs.productInfo);
    
    this.getChemicalStructureFilters();
    this.getintermediateSearchFilters();
    this.getAdvanceSearchFilters();
  }

  addFilter() {
    this.advanceSearch.filterInputs.push({ filter: '', keyword: '' });
  }

  removeFilter(index: number) {
    this.advanceSearch.filterInputs.splice(index, 1);
  }

  handleChangeKeyword(searchType = '', index: number = 0) {
    try {
      switch(searchType){
        case searchTypes.simpleSearch: 
          this.getSimpleSearchSuggestions();
          break;
        case searchTypes.chemicalStructure:
          this.getChemicalStructureSuggestions();
          break;
        case searchTypes.synthesisSearch:
          this.getSynthesisSearchSuggestions();
          break;
        case searchTypes.intermediateSearch:
          this.getIntermediateSearchSuggestions();
          break;
        case searchTypes.advanceSearch:
          this.getAdvanceSearchSuggestions(index);
          break;
      }
      
    } catch (err) {
      console.log(err);
    }
  }

  getAdvanceSearchSuggestions(index: number) {

    this.advanceSearch.autosuggestionList = [];
    if (this.advanceSearch.filterInputs[index].keyword === '') {
      if (typeof index !== 'undefined') {
        this.advanceSearch.autosuggestionList[index] = [];
      }
      return;
    }

    if (this.advanceSearch?.filterInputs[index]?.keyword?.length < 3) return;

    this.mainSearchService
    .getAdvanceSearchSuggestions({column: this.advanceSearch.filterInputs[index].filter, keyword: this.advanceSearch?.filterInputs[index]?.keyword })
    .subscribe({
      next: (res: any) => {
        this.advanceSearch.autosuggestionList[index] = res?.data?.suggestions;
      },
      error: (e) => console.error(e),
    });
  }

  getIntermediateSearchSuggestions() {
    if (this.intermediateSearch.keyword == '') {
      this.intermediateSearch.autosuggestionList = [];
      return;
    }

    if (this.intermediateSearch.keyword.length < 3) return;

    this.mainSearchService
    .getChemicalStructureSearchSuggestions({column: this.intermediateSearch.filter ,keyword: this.intermediateSearch.keyword,  })
    .subscribe({
      next: (res: any) => {
        this.intermediateSearch.autosuggestionList = res?.data?.suggestions;
      },
      error: (e) => console.error(e),
    });
  }

  getSynthesisSearchSuggestions() {
    if (this.synthesisSearch.keyword == '') {
      this.synthesisSearch.autosuggestionList = [];
      return;
    }
    if (this.synthesisSearch.keyword.length < 3) return;

    this.mainSearchService
      .getSynthesisSearchSuggestions({keyword: this.synthesisSearch.keyword })
      .subscribe({
        next: (res: any) => {
          this.synthesisSearch.autosuggestionList = res?.data?.suggestions;
        },
        error: (e) => console.error(e),
      });
  }

  getSimpleSearchSuggestions() {
    if (this.simpleSearch.keyword == '') {
      this.simpleSearch.autosuggestionList = [];
      return;
    }
    if (this.simpleSearch.keyword.length < 3) return;

    this.mainSearchService
      .getSimpleSearchSuggestions({keyword: this.simpleSearch.keyword })
      .subscribe({
        next: (res: any) => {
          this.simpleSearch.autosuggestionList = res?.data?.suggestions;
        },
        error: (e) => console.error(e),
      });
  }

  getChemicalStructureSuggestions() {
    if (this.chemicalStructure.keyword == '') {
      this.chemicalStructure.autosuggestionList = [];
      return;
    }

    if (this.chemicalStructure.keyword.length < 3) return;

    this.mainSearchService
    .getChemicalStructureSearchSuggestions({column: this.chemicalStructure.filter ,keyword: this.chemicalStructure.keyword,  })
    .subscribe({
      next: (res: any) => {
        this.chemicalStructure.autosuggestionList = res?.data?.suggestions;
      },
      error: (e) => console.error(e),
    });
  }

  clearInputAndSuggetions(searchType = '') {
    switch(searchType){
      case searchTypes.simpleSearch:
        this.simpleSearch = {};
        break;
      case searchTypes.chemicalStructure:
        this.chemicalStructure = { filter: '' };
        break;
      case searchTypes.synthesisSearch:
        this.synthesisSearch = {};
        break;
      case searchTypes.intermediateSearch:
        this.intermediateSearch = { filter: '' };
        break;
      case searchTypes.advanceSearch:
        this.advanceSearch = {
          autosuggestionList : [],
          dateType: '',
        }
        this.advanceSearch.filterInputs = [
          { filter: '', keyword: '' }
        ];
        break;
    }
  }

  handleSuggestionClick(value: any, searchType = '', index: number = 0) {
    switch(searchType){
      case searchTypes.simpleSearch:
        this.simpleSearch.keyword = value;
        this.simpleSearch.autosuggestionList = [];
        setTimeout(() => {
          this.simpleSearchkeywordInput.nativeElement.focus();
        }, 0);
        break;
      case searchTypes.chemicalStructure:
        this.chemicalStructure.keyword = value;
        this.chemicalStructure.autosuggestionList = [];
        setTimeout(() => {
          this.chemicalStructureKeywordInput.nativeElement.focus();
        }, 0);
        break;
      case searchTypes.synthesisSearch:
        this.synthesisSearch.keyword = value;
        this.synthesisSearch.autosuggestionList = [];
        setTimeout(() => {
          this.synthesisSearchkeywordInput.nativeElement.focus();
        }, 0);
        break;
      case searchTypes.intermediateSearch:
        this.intermediateSearch.keyword = value;
        this.intermediateSearch.autosuggestionList = [];
        setTimeout(() => {
          this.intermediateSearchKeywordInput.nativeElement.focus();
        }, 0);
        break;
      case searchTypes.advanceSearch:
        this.advanceSearch.filterInputs[index].keyword = value;
        this.advanceSearch.autosuggestionList[index] = [];
        break;
    }
  }

  getChemicalStructureFilters() {
    this.mainSearchService.getChemicalStructureFilters().subscribe({
      next: (res: any) => {        
        this.chemicalStructure.filters = res?.data?.columns;
        this.chemicalStructure.example = res?.data?.examples;
      },
      error: (e: any) => {
        console.error('Error:', e);
      }
    })
  }

  getintermediateSearchFilters() {
    this.mainSearchService.getIntermediateSearchFilters().subscribe({
      next: (res: any) => {        
        this.intermediateSearch.filters = res?.data?.columns;
      },
      error: (e: any) => {
        console.error('Error:', e);
      }
    })
  }

  getAdvanceSearchFilters() {
    this.mainSearchService.getAdvanceSearchFilters().subscribe({
      next: (res: any) => {       
        this.advanceSearch.filters = res?.data?.filter_columns;
      },
      error: (e: any) => {
        console.error('Error:', e);
      }
    })
  }

  checkPriviledgeAndHandleSearch(searchType: string = '') {
    
    let todaysLimit: any = '';
    this.setLoadingState.emit(true);
  
    // Fetch user privileges
    this.userPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        const userInfo = res?.data?.user_info;
        if (!userInfo) {
          this.setLoadingState.emit(false);
          return;
        }
  
        const { account_type, start_date, expired_date, privilege_json } = userInfo;
        const currentDate = new Date();
        const endTargetDate = new Date(expired_date);
        endTargetDate.setFullYear(endTargetDate.getFullYear() + 1);

  
        // Check for expired premium account
        if (account_type === 'premium' && currentDate > endTargetDate) {
          this.setLoadingState.emit(false);
          this.priviledgeModal.emit('Your Premium Account is expired. Please renew your account');
          return;
        }
  
        // Save user data in localStorage
        this.saveUserDataToLocalStorage(userInfo);
  
        const userPrivilegeKey = `user_${userInfo.user_id}`;
        const privilegeData = privilege_json?.[userPrivilegeKey];
  
        if (!this.hasSearchPrivileges(privilegeData)) {
          this.setLoadingState.emit(false);
          this.priviledgeModal.emit('You do not have permission to Search or View. Please upgrade the account.');
          return;
        }
  
        // Fetch today's privileges
        this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
          next: (res: any) => {
            todaysLimit = res?.data;
  
            const remainingLimit = privilegeData?.technicalroutesmongo?.DailySearchLimit - todaysLimit?.searchCount;
            if (remainingLimit <= 0) {
              this.setLoadingState.emit(false);
              this.priviledgeModal.emit('Your Daily Search Limit is over for this Platform.');
              return;
            }
  
            // Perform main search operation
            this.searchBasedOnTypes(searchType);
          },
          error: (e) => {
            console.error('Error fetching today’s privileges:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching user privileges:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private saveUserDataToLocalStorage(userInfo: any): void {
    const { account_type, start_date, expired_date, privilege_json, user_id, name, email, auth_token } = userInfo;
  
    localStorage.setItem('account_type', account_type);
    localStorage.setItem('starting_date', start_date);
    localStorage.setItem('expired_date', expired_date);
    if (privilege_json) {
      const privilegeKey = `user_${user_id}`;
      localStorage.setItem('priviledge_json', JSON.stringify(privilege_json[privilegeKey]));
    }
  
    this.userAuth = { name, email, user_id, auth_token };
  }

  private hasSearchPrivileges(privilegeData: any): boolean {
    if (!privilegeData) return false;
  
    const { technicalroutesmongo } = privilegeData;
    return (
      technicalroutesmongo?.View !== 'false' &&
      technicalroutesmongo?.Search !== '' &&
      technicalroutesmongo?.Search !== 0
    );
  }

  private searchBasedOnTypes(searchType: string) {
    switch(searchType) {
      case searchTypes.simpleSearch:
        this.performSimpleSearch();
        break;
      case searchTypes.intermediateSearch:
        this.performIntermediateSearch();
        break;
      case searchTypes.advanceSearch:
        this.performAdvancedSearch();
        break;
      case searchTypes.synthesisSearch:
        this.performSynthesisSearch();  
        break;
      case searchTypes.chemicalStructure:
        this.performChemicalStructureSearch();
        break;
    }
  }

  private performSimpleSearch(): void {

    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: this.simpleSearch?.keyword,
      screenColumn: this.screenColumn,
    });
  
    const body = {
      criteria: this.criteria,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
    };
  
    const tech_API = environment.PPRODUCT_INFO_COLUMN_LIST;
  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList('product_info_column_list', response);
  
        this.mainSearchService.getSimpleSearchResults({ keyword: this.simpleSearch?.keyword, page_no: 1 }).subscribe({
          next: (res: any) => {
            this.chemSearchResults.emit(res?.data);            
            this.showResultFunction.emit({
              body,
              API_URL: this.apiUrl,
              currentTab: this.resultTabs.productInfo.name,
              actual_value: '',
            });
            this.setLoadingState.emit(false);
          },
          error: (e) => {
            console.error('Error during main search:', e);
            this.setLoadingState.emit(false);
          },
        });
      },
      error: (e) => {
        console.error('Error fetching column list:', e);
        this.setLoadingState.emit(false);
      },
    });
  }

  private performIntermediateSearch(): void {

  }

  private performAdvancedSearch(): void {
  }

  private performSynthesisSearch(): void {

  }

  private performChemicalStructureSearch(): void {
    
  }
}