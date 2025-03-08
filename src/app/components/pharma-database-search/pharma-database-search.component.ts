import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MainSearchService } from '../../services/main-search/main-search.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { Auth_operations } from '../../Utils/SetToken';
import { ColumnListService } from '../../services/columnList/column-list.service';
import { AppConfigValues } from '../../config/app-config';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';

@Component({
  selector: 'chem-pharma-database-search',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './pharma-database-search.component.html',
  styleUrl: './pharma-database-search.component.css'
})

export class pharmaDatabaseSearchComponent implements OnInit {

  screenColumn = 'Select Filter';
  criteria: string = ''; 
  userAuth: any = {}; 
  column: string = '';
  searchTypes: any;
    
  chemicalStructure : any = { filter: ''}
  simpleSearch : any = {}
  synthesisSearch : any = {}
  intermediateSearch : any = { filter: '' }
  advanceSearch : any = {
    autosuggestionList : [],
    dateType: 'GENERIC_CONSTRAINING_DATE',
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
  apiUrls = AppConfigValues.appUrls;
  showSuggestions: boolean = false;
  activeSearchTab: string = 'api-search'

  constructor(
    private elementRef: ElementRef,
    private mainSearchService: MainSearchService,
    private userPriviledgeService: UserPriviledgeService,
    private utilityService: UtilityService,
    private columnListService: ColumnListService){      
      this.searchTypes = searchTypes;
      this.advanceSearch.filterInputs = [
        { filter: '', keyword: '' }
      ];
    }

  ngOnInit() {
    // Get All tabs name
    this.utilityService.resetTabs();
    this.resultTabs = this.utilityService.getAllTabsName();
    
    this.getChemicalStructureFilters();
    this.getintermediateSearchFilters();
    this.getAdvanceSearchFilters();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  showContent(searchTab: string) {
    this.activeSearchTab = searchTab;
  }

  addFilter() {
    this.advanceSearch.filterInputs.push({ filter: '', keyword: '' });
  }

  removeFilter(index: number) {
    this.advanceSearch.filterInputs.splice(index, 1);
  }

  handleChangeKeyword(searchType = '', index: number = 0) {
    try {
      this.showSuggestions = true;
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
      this.showSuggestions = false;
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
    this.showSuggestions = false;
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
          dateType: 'GENERIC_CONSTRAINING_DATE',
        }
        this.advanceSearch.filterInputs = [
          { filter: '', keyword: '' }
        ];
        break;
    }
  }

  handleSuggestionClick(value: any, searchType = '', index: number = 0) {
    this.showSuggestions = false;
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
      activeForm: searchTypes.simpleSearch,
    });
  
    const body = {
      criteria: this.criteria,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      keyword: this.simpleSearch?.keyword
    };
  
    const tech_API = this.apiUrls.basicProductInfo.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.productInfo.name, response);
  
        this.mainSearchService.getSimpleSearchResults(body).subscribe({
          next: (res: any) => {
            this.showResultFunction.emit({
              body,
              API_URL: this.apiUrls.basicProductInfo.simpleSearchResults,
              currentTab: this.resultTabs.productInfo.name,
              actual_value: '',
            });
            this.chemSearchResults.emit(res?.data);   
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

  private isValidDate(date) {
    return !isNaN(Date.parse(date));
  }

  private performAdvancedSearch(): void {
   
    // Validations and transformations
    if (!Array.isArray(this.advanceSearch?.filterInputs) || this.advanceSearch?.filterInputs.length === 0) {
      alert("filterInputs must be a non-empty array.");
      return;
    }

    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: '',
      screenColumn: this.screenColumn,
      activeForm: searchTypes.advanceSearch,
    });
    
    const apiBody = {
      criteria: this.advanceSearch?.filterInputs.map((input, index) => {
        if (!input.filter || !input.keyword) {
          throw new Error("Each filterInput must contain 'filter' and 'keyword' properties.");
        }    
        return {
          ...(index > 0 ? { operator: "OR" } : {}), // Add "operator: OR" for subsequent criteria
          column: input.filter,
          keyword: input.keyword
        };
      }),
    
      // Validate date filters (optional fields)
      date_filters: {
        ...(this.advanceSearch?.dateType ? { column: this.advanceSearch?.dateType } : {}),
        ...(this.isValidDate(this.advanceSearch?.startDate) ? { start_date: this.advanceSearch?.startDate } : {}),
        ...(this.isValidDate(this.advanceSearch?.endDate) ? { end_date: this.advanceSearch?.endDate } : {})
      },
      page_no: 1
    };
  
    const tech_API = this.apiUrls.basicProductInfo.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.productInfo.name, response);
  
        this.mainSearchService.getAdvanceSearchResults(apiBody).subscribe({
          next: (res: any) => {                     
            this.showResultFunction.emit({
              apiBody,
              API_URL: this.apiUrls.basicProductInfo.simpleSearchResults,
              currentTab: this.resultTabs.productInfo.name, 
              actual_value: '',
            });
            this.chemSearchResults.emit(res?.data);   
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

  private performSynthesisSearch(): void {
    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: this.synthesisSearch?.keyword,
      screenColumn: this.screenColumn,
      activeForm: searchTypes.synthesisSearch,
    });
  
    const body = {
      criteria: this.criteria,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      keyword: this.synthesisSearch?.keyword
    };
  
    const tech_API = this.apiUrls.technicalRoutes.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.technicalRoutes.name, response);
  
        this.mainSearchService.getSyntheticSearchResults(body).subscribe({
          next: (res: any) => {                     
            this.showResultFunction.emit({
              body,
              API_URL: this.apiUrls.technicalRoutes.synthesisSearch,
              currentTab: this.resultTabs.technicalRoutes.name, 
              actual_value: '',
            });
            this.chemSearchResults.emit(res?.data);   
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

  private performChemicalStructureSearch(): void {

    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: this.chemicalStructure?.keyword,
      screenColumn: this.screenColumn,
      activeForm: searchTypes.chemicalStructure
    });
  
    const body = {
      criteria: this.chemicalStructure?.filter,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      keyword: this.chemicalStructure?.keyword
    };
  
    const tech_API = this.apiUrls.chemicalDirectory.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name , response);
  
        this.mainSearchService.getChemicalStructureResults(body).subscribe({
          next: (res: any) => {                     
            this.showResultFunction.emit({
              body,
              API_URL: this.apiUrls.chemicalDirectory.intermediateApplicationSearch,
              currentTab: this.resultTabs.chemicalDirectory.name, 
              actual_value: '',
            });
            this.chemSearchResults.emit(res?.data);   
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

    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: this.intermediateSearch.keyword,
      screenColumn: this.screenColumn,
      activeForm: searchTypes.intermediateSearch
    });
  
    const body = {
      page_no: 1,
      filter_enable: false,
      filters: {}, 
      order_by: '',
      keyword: this.intermediateSearch?.keyword, 
      criteria: this.intermediateSearch?.filter
    };
  
    const tech_API = this.apiUrls.chemicalDirectory.columnList;  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name , response);
  
        this.mainSearchService.getChemicalStructureResults(body).subscribe({
          next: (res: any) => {                     
            this.showResultFunction.emit({
              body,
              API_URL: this.apiUrls.chemicalDirectory.intermediateApplicationSearch,
              currentTab: this.resultTabs.chemicalDirectory.name, 
              actual_value: '',
            });
            this.chemSearchResults.emit(res?.data);   
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
}
