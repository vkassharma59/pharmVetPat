import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MainSearchService } from '../../services/main-search/main-search.service';
import { UserPriviledgeService } from '../../services/user_priviledges/user-priviledge.service';
import { Auth_operations } from '../../Utils/SetToken';
import { ColumnListService } from '../../services/columnList/column-list.service';
import { AppConfigValues } from '../../config/app-config';
import { searchTypes, UtilityService } from '../../services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { VideoTutorialComponent } from '../video-tutorial/video-tutorial.component';

@Component({
  selector: 'chem-pharma-database-search',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './pharma-database-search.component.html',
  styleUrl: './pharma-database-search.component.css'
})
export class pharmaDatabaseSearchComponent implements OnInit {

  screenColumn = 'Select Filter';
  criteria = '';
  userAuth: any = {};
  column = '';
  searchTypes: any;

  chemicalStructure: any = { filter: '' }
  simpleSearch: any = {}
  synthesisSearch: any = {}
  intermediateSearch: any = { filter: '' }
  advanceSearch: any = {
    autosuggestionList: [],
    dateType: 'GENERIC_CONSTRAINING_DATE',
    developmentStage: '',
    innovatorOriginator: '',
    devStage: '',
    innovator: '',
    startSales: null,
    endSales: null,
    filterInputs: [{ filter: '', keyword: '' }]
  }

  @Output() setLoadingState = new EventEmitter<any>();
  @Output() chemSearchResults = new EventEmitter<any>();
  @Output() priviledgeModal = new EventEmitter<any>();
  @Output() showResultFunction = new EventEmitter<any>();

  @ViewChild('simpleSearchkeywordInput') simpleSearchkeywordInput!: ElementRef;
  @ViewChild('chemicalStructureKeywordInput') chemicalStructureKeywordInput!: ElementRef;
  @ViewChild('synthesisSearchkeywordInput') synthesisSearchkeywordInput!: ElementRef;
  @ViewChild('intermediateSearchKeywordInput') intermediateSearchKeywordInput!: ElementRef;

  // Dropdown lists
  allDevelopmentStages: string[] = ['Preclinical', 'Phase I', 'Phase II', 'Phase III', 'Approved'];
  allInnovators: string[] = ['Pfizer', 'Moderna', 'Cipla', 'Sun Pharma', 'Dr. Reddy\'s'];
  devStages: string[] = ['Stage 1', 'Stage 2', 'Stage 3'];
  innovators: string[] = ['Pfizer', 'Roche', 'Novartis'];

  filteredDevStages: string[] = [];
  filteredInnovators: string[] = [];

  showDevStageDropdown = false;
  showInnovatorDropdown = false;
  devStageSearch = '';
  innovatorSearch = '';

  tabs$ = this.utilityService.tabs$;
  resultTabs: any = [];
  apiUrls = AppConfigValues.appUrls;
  showSuggestions = false;
  activeSearchTab = 'api-search';

  exampleSearchData = [
    { type: 'smiles_code', value: 'C#C', label: 'C#C' },
    { type: 'iupac', value: 'acetylene', label: 'acetylene' },
    { type: 'molecular_formula', value: 'C2H2', label: 'C₂H₂' },
    { type: 'chemical_name', value: 'ethyne', label: 'ethyne' },
    { type: 'inchi', value: 'InChI=1S/C2H2/c1-2/h1-2H', label: 'InChI=1S/C2H2/c1-2/h1-2H' },
    { type: 'inchikey', value: 'HSFWRNGVRCDJHI-UHFFFAOYSA-N', label: 'HSFWRNGVRCDJHI-UHFFFAOYSA-N' },
    { type: 'cas_rn', value: '74-86-2', label: '74-86-2' }
  ];

  constructor(
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private mainSearchService: MainSearchService,
    private userPriviledgeService: UserPriviledgeService,
    private utilityService: UtilityService,
    private columnListService: ColumnListService
  ) {
    this.searchTypes = searchTypes;
  }

  ngOnInit() {
    this.utilityService.resetTabs();
    this.resultTabs = this.utilityService.getAllTabsName();
    this.getAllFilters();
  }

  // ✅ Unified HostListener to close dropdowns
  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const devContainer = this.elementRef.nativeElement.querySelector('.dev-stage-container');
    const innovatorContainer = this.elementRef.nativeElement.querySelector('.innovator-container');

    if (devContainer && !devContainer.contains(target)) {
      this.showDevStageDropdown = false;
    }

    if (innovatorContainer && !innovatorContainer.contains(target)) {
      this.showInnovatorDropdown = false;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.showSuggestions = false;
    }
  }

  getAllFilters() {
    this.getChemicalStructureFilters();
    this.getintermediateSearchFilters();
    this.getAdvanceSearchFilters();
  }

  openDevStageDropdown() {
    this.showDevStageDropdown = true;
    this.showInnovatorDropdown = false;
    this.filteredDevStages = [...this.devStages];
  }

  openInnovatorDropdown() {
    this.showInnovatorDropdown = true;
    this.showDevStageDropdown = false;
    this.filteredInnovators = [...this.innovators];
  }

  selectDevStage(stage: string) {
    this.advanceSearch.devStage = stage;
    this.showDevStageDropdown = false;
  }

  selectInnovator(name: string) {
    this.advanceSearch.innovator = name;
    this.showInnovatorDropdown = false;
  }

  handleDevStageChange() {
    this.filteredDevStages = this.devStages.filter(stage =>
      stage.toLowerCase().includes(this.devStageSearch.toLowerCase())
    );
  }

  handleInnovatorChange() {
    this.filteredInnovators = this.innovators.filter(name =>
      name.toLowerCase().includes(this.innovatorSearch.toLowerCase())
    );
  }

  handleChangeKeywordDL(column: 'DEVELOPMENT_STAGE' | 'INNOVATOR_ORIGINATOR') {
    let keyword = '';
    if (column === 'DEVELOPMENT_STAGE') keyword = this.advanceSearch.devStage;
    if (column === 'INNOVATOR_ORIGINATOR') keyword = this.advanceSearch.innovator;

    if (!keyword || keyword.length < 3) {
      if (column === 'DEVELOPMENT_STAGE') this.filteredDevStages = [];
      if (column === 'INNOVATOR_ORIGINATOR') this.filteredInnovators = [];
      return;
    }

    const payload = { column, keyword };
    this.mainSearchService.getAdvanceSearchSuggestions(payload).subscribe({
      next: (res: any) => {
        const list = res?.data?.suggestions || [];
        if (column === 'DEVELOPMENT_STAGE') this.filteredDevStages = list;
        if (column === 'INNOVATOR_ORIGINATOR') this.filteredInnovators = list;
      },
      error: (err) => console.error('❌ API Error:', err)
    });
  }

  handleChangeKeyword(searchType = '', index: number = 0) {
    try {
      this.showSuggestions = true;
      switch (searchType) {
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
      this.showSuggestions = false;
    }
  }

  addFilter() {
    const lastFilter = this.advanceSearch.filterInputs[this.advanceSearch.filterInputs.length - 1];
    if (lastFilter?.filter && lastFilter?.keyword) {
      this.advanceSearch.filterInputs.push({ filter: '', keyword: '' });
    } else {
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Incomplete Filter',
          message: 'Please fill in the current filter before adding a new one.'
        },
        width: '400px',
        panelClass: 'custom-dialog'
      });
    }
  }

  removeFilter(index: number) {
    this.advanceSearch.filterInputs.splice(index, 1);
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
      .getAdvanceSearchSuggestions({ column: this.advanceSearch.filterInputs[index].filter, keyword: this.advanceSearch?.filterInputs[index]?.keyword })
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
      .getChemicalStructureSearchSuggestions({ column: this.intermediateSearch.filter, keyword: this.intermediateSearch.keyword, })
      .subscribe({
        next: (res: any) => {
          this.intermediateSearch.autosuggestionList = res?.data?.suggestions;
        },
        error: (e) => console.error(e),
      });
  }

  getSynthesisSearchSuggestions() {
    if (this.synthesisSearch.keyword == '' || this.synthesisSearch.keyword.length < 3) {
      this.synthesisSearch.autosuggestionList = [];
      return;
    }

    this.mainSearchService
      .getSynthesisSearchSuggestions({ keyword: this.synthesisSearch.keyword })
      .subscribe({
        next: (res: any) => {
          this.synthesisSearch.autosuggestionList = res?.data?.suggestions;
        },
        error: (e) => console.error(e),
      });
  }
  isSearchEnabled(): boolean {
    const { devStage, innovator, startSales, endSales, filterInputs } = this.advanceSearch;

    // Check if any filter column has a keyword and is enabled
    const hasFilterKeyword = filterInputs?.some(
      (input: any) => input.filter && input.keyword?.trim() !== ''
    );

    return !!(
      devStage?.trim() ||
      innovator?.trim() ||
      startSales ||
      endSales ||
      hasFilterKeyword
    );
  }

  isInputEnabled(): boolean {
    return !!(this.intermediateSearch.filter && this.intermediateSearch.keyword?.trim());
  }

  getSimpleSearchSuggestions() {
    if (this.simpleSearch.keyword == '') {
      this.simpleSearch.autosuggestionList = [];
      return;
    }
    if (this.simpleSearch.keyword.length < 3) return;

    this.mainSearchService
      .getSimpleSearchSuggestions({ keyword: this.simpleSearch.keyword })
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
      .getChemicalStructureSearchSuggestions({ column: this.chemicalStructure.filter, keyword: this.chemicalStructure.keyword, })
      .subscribe({
        next: (res: any) => {
          this.chemicalStructure.autosuggestionList = res?.data?.suggestions;
        },
        error: (e) => console.error(e),
      });
  }

  clearInputAndSuggetions(searchType = '') {
    this.showSuggestions = false;
    switch (searchType) {
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
          autosuggestionList: [],
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
    switch (searchType) {
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
        this.advanceSearch.date_columns = res?.data?.date_columns;
      },
      error: (e: any) => {
        console.error('Error:', e);
      }
    })
  }
isAdvancedInputDisabled(): boolean {
  const mainInput = this.advanceSearch?.filterInputs?.[0];
  return !(mainInput?.filter?.trim() && mainInput?.keyword?.trim());
}



  checkPriviledgeAndHandleSearch(searchType: string = '') {
    const { startSales, endSales, filterInputs, simpleSearch, devStage, innovator } = this.advanceSearch;

    // 🚨 Validate sales range if only one value is given
    if (startSales && !endSales) {
      this.priviledgeModal.emit('Please enter End Range.');
      return;
    }
    if (endSales && !startSales) {
      this.priviledgeModal.emit('Please enter Start Range.');
      return;
    }

    // ✅ New check: Proceed if any advanced filter input is filled
    // ✅ Check if any valid input is filled: simple search, advanced filters, sales range, etc.
    const hasFilledKeyword = filterInputs?.some((input: any) => input.keyword && input.keyword.trim() !== '');
    const hasSimpleKeyword = simpleSearch?.keyword?.trim() !== '';
    const hasDevStage = devStage?.trim() !== '';
    const hasInnovator = innovator?.trim() !== '';

    if (!hasFilledKeyword && !hasSimpleKeyword && !startSales && !endSales && !hasDevStage && !hasInnovator) {
      this.priviledgeModal.emit('Please enter at least one search input to continue.');
      return;
    }


    let todaysLimit: any = '';
    this.setLoadingState.emit(true);

    this.userPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        const userInfo = res?.data?.user_info;
        if (!userInfo) {
          this.setLoadingState.emit(false);
          return;
        }

        const { account_type, expired_date, privilege_json } = userInfo;
        const currentDate = new Date();
        const endTargetDate = new Date(expired_date);
        endTargetDate.setFullYear(endTargetDate.getFullYear() + 1);

        if (account_type === 'premium' && currentDate > endTargetDate) {
          this.setLoadingState.emit(false);
          this.priviledgeModal.emit('Your Premium Account is expired. Please renew your account');
          return;
        }

        this.saveUserDataToLocalStorage(userInfo);
        const userPrivilegeKey = `user_${userInfo.user_id}`;
        const privilegeData = privilege_json?.[userPrivilegeKey];

        if (!this.hasSearchPrivileges(privilegeData)) {
          this.setLoadingState.emit(false);
          this.priviledgeModal.emit('You do not have permission to Search or View. Please upgrade the account.');
          return;
        }

        this.userPriviledgeService.getUserTodayPriviledgesData().subscribe({
          next: (res: any) => {
            todaysLimit = res?.data;
           
            const remainingLimit = privilegeData?.['pharmvetpat-mongodb']?.DailySearchLimit - todaysLimit?.searchCount;
            if (remainingLimit <= 0) {
              this.setLoadingState.emit(false);
              this.priviledgeModal.emit('Your Daily Search Limit is over for this Platform.');
             
              return;
            }

            // ✅ All checks passed, perform the actual search
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

    const dbPrivileges = privilegeData?.['pharmvetpat-mongodb'];
    return (
      dbPrivileges?.View !== 'false' &&
      dbPrivileges?.Search !== '' &&
      dbPrivileges?.Search !== 0
    );
  }
 

  private searchBasedOnTypes(searchType: string) {
    switch (searchType) {
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
          ...(index > 0 ? { operator: input.operator || "OR" } : {}),  // use selected operator
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
      ...(this.advanceSearch?.devStage && { development_stage: this.advanceSearch.devStage }),
      ...(this.advanceSearch?.innovator && { innovators: this.advanceSearch.innovator }),
      ...(this.advanceSearch?.startSales !== null && this.advanceSearch?.startSales !== undefined && { start_sale_range: this.advanceSearch.startSales }),
      ...(this.advanceSearch?.endSales !== null && this.advanceSearch?.endSales !== undefined && { end_sale_range: this.advanceSearch.endSales }),
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
  showContent(searchTab: string) {
    this.activeSearchTab = searchTab;
    this.showSuggestions = false;

    // Reset all search input states when switching tabs
    this.simpleSearch = {};
    this.chemicalStructure = { filter: '' };
    this.synthesisSearch = {};
    this.intermediateSearch = { filter: '' };
    this.advanceSearch = {
      autosuggestionList: [],
      dateType: 'GENERIC_CONSTRAINING_DATE',
      developmentStage: '',
      innovatorOriginator: '',
      devStage: '',
      innovator: '',
      startSales: null,
      endSales: null,
      filterInputs: [{ filter: '', keyword: '' }]
    };

    // Optionally: refocus the input of the selected tab
    setTimeout(() => {
      switch (searchTab) {
        case searchTypes.simpleSearch:
          this.simpleSearchkeywordInput?.nativeElement?.focus();
          break;
        case searchTypes.chemicalStructure:
          this.chemicalStructureKeywordInput?.nativeElement?.focus();
          break;
        case searchTypes.synthesisSearch:
          this.synthesisSearchkeywordInput?.nativeElement?.focus();
          break;
        case searchTypes.intermediateSearch:
          this.intermediateSearchKeywordInput?.nativeElement?.focus();
          break;
        case searchTypes.advanceSearch:
          this.devStageSearch = '';
          this.innovatorSearch = '';
          this.filteredDevStages = [];
          this.filteredInnovators = [];
          break;
      }

      // Get all the filters again
      this.getAllFilters();
    }, 100);
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
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name, response);

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
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name, response);

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

  openTutorialModal() {
    const dialogRef = this.dialog.open(VideoTutorialComponent, {
      width: '800px',
      height: '550px',
      panelClass: 'full-screen-modal',
    });
  }

  chemicalStructureSearch(type: string, value: string) {
    this.chemicalStructure.keyword = value;
    this.chemicalStructure.filter = type;
    this.checkPriviledgeAndHandleSearch(searchTypes.chemicalStructure);
  }
}