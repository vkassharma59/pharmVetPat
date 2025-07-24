import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
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
import { coerceStringArray } from '@angular/cdk/coercion';

@Component({
  selector: 'chem-pharma-database-search',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './pharma-database-search.component.html',
  styleUrl: './pharma-database-search.component.css'
})
export class pharmaDatabaseSearchComponent implements OnInit {
  keyword = new FormControl('');
  screenColumn = 'Select Filter';
  criteria = '';
  userAuth: any = {};
  column = '';
  searchTypes: any;
  username: string = '';
  password: string = '';
  tabvalue = 'Active Ingredient - ROS Search';
  showTab = false;
  LimitValue = '';
  auth: boolean = false;
  accountType: string = 'test';
  selectedItem: number = 0;
  chemicalStructure: any = { filter: '' }
  simpleSearch: any = {}
  synthesisSearch: any = {}
  intermediateSearch: any = { filter: '' }
  advanceSearch: any = {
    autosuggestionList: [],
    dateType: '',
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
  @Input() CurrentAPIBody: any;
  @ViewChild('simpleSearchkeywordInput') simpleSearchkeywordInput!: ElementRef;
  @ViewChild('chemicalStructureKeywordInput') chemicalStructureKeywordInput!: ElementRef;
  @ViewChild('synthesisSearchkeywordInput') synthesisSearchkeywordInput!: ElementRef;
  @ViewChild('intermediateSearchKeywordInput') intermediateSearchKeywordInput!: ElementRef;

  // Dropdown lists
  suggestionsList = [
    { type: 'Active Ingredient (AI)', type_label: "ACTIVE_INGREDIENT", value: 'SITAGLIPTIN', label: 'SITAGLIPTIN PHOSPHATE' },
    { type: 'Company Name', type_label: "INNOVATOR_ORIGINATOR", value: 'Pfizer', label: 'Pfizer' },
  ];
  intersuggestionsList = [
    { type: 'Chemical Name', type_label: 'chemical_name', value: 'ethyne', label: 'ethyne' },
    { type: 'Smiles Code', type_label: 'smiles_code', value: 'C#C', label: 'C#C' },
    { type: 'CAS RN', type_label: 'cas_rn', value: '74-86-2', label: '74-86-2' }
  ];
  synthsuggestionsList = [
    { type: 'Chemical Name', value: 'Sitagliptin', label: 'Sitagliptin' },
    { type: 'CAS RN', value: 'CAS RN: 41429-16-7', label: 'CAS RN: 41429-16-7' },
    { type: 'Chemical Name', value: 'ethyne', label: 'ethyne' }
  ];


  selectSuggestionSearch(suggestion: { type_label: string, value: string, label: string }) {
    const { type_label, value, label } = suggestion;
    this.simpleSearch.keyword = label;
    this.simpleSearch.filter = type_label;
    this.checkPriviledgeAndHandleSearch(searchTypes.simpleSearch);
  }

  advanceSearchSuggestion(suggestion: { type_label: string, value: string, label: string }) {
    const { type_label, value, label } = suggestion;

    // Initialize filterInputs array if not already
    if (!Array.isArray(this.advanceSearch.filterInputs)) {
      this.advanceSearch.filterInputs = [];
    }
    // Push the suggestion into filterInputs array
    this.advanceSearch.filterInputs.push({
      filter: type_label,
      keyword: label
    });

    this.checkPriviledgeAndHandleSearch(searchTypes.advanceSearch);

  }
  synthesisSearchSuggestionSearch(synthsuggestion: { type: string, value: string, label: string }) {
    const { type, value, label } = synthsuggestion;
    this.synthesisSearch.keyword = label;
    this.synthesisSearch.filter = type;
    this.checkPriviledgeAndHandleSearch(searchTypes.synthesisSearch);
  }
  intermediateSearchSuggestionSearch(intersuggestion: { type_label: string, value: string, label: string }) {
    const { type_label, value, label } = intersuggestion;
    this.intermediateSearch.keyword = label;
    this.intermediateSearch.filter = type_label;
    this.checkPriviledgeAndHandleSearch(searchTypes.intermediateSearch);
  }

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
    const isReload = this.isPageReload();
    if (isReload) {
      this.onPageReload();
    }
    const user = localStorage.getItem('auth');
    this.auth = user ? true : false;
  
    const accountType = localStorage.getItem('account_type');
    this.accountType = accountType ? accountType : '';
  
    // Get saved keyword for each type from sessionStorage
    const savedSimpleKeyword = sessionStorage.getItem('simpleSearch.keyword');
    if (savedSimpleKeyword) {
      this.simpleSearch.keyword = savedSimpleKeyword;
    }
  
    const savedChemicalKeyword = sessionStorage.getItem('chemicalStructure.keyword');
    if (savedChemicalKeyword) {
      this.chemicalStructure.keyword = savedChemicalKeyword;
    }
  
    const savedSynthesisKeyword = sessionStorage.getItem('synthesisSearch.keyword');
    if (savedSynthesisKeyword) {
      this.synthesisSearch.keyword = savedSynthesisKeyword;
    }
  
    const savedIntermediateKeyword = sessionStorage.getItem('intermediateSearch.keyword');
    if (savedIntermediateKeyword) {
      this.intermediateSearch.keyword = savedIntermediateKeyword;
    }
  
    if (this.CurrentAPIBody.currentTab) {
      if (this.CurrentAPIBody.currentTab === 'active_ingredient') {
        this.selectedItem = 0;
      } else if (this.CurrentAPIBody.currentTab === 'intermediate_application') {
        this.selectedItem = 1;
      } else if (this.CurrentAPIBody.currentTab === 'intermediate_synthesis') {
        this.selectedItem = 2;
      } else {
        this.selectedItem = 3;
      }
    }
  }
  

  // ✅ Unified HostListener to close dropdowns
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Assuming you're using ViewChild for wrapper elements like devStageWrapper
    if (!target.closest('.dev-stage-container')) {
      this.showDevStageDropdown = false;
    }

    if (!target.closest('.innovator-container')) {
      this.showInnovatorDropdown = false;
    }

    // Add similar checks for other dropdowns
    // If you have autosuggestions lists:
    if (!target.closest('.suggestions-dropdown')) {
      this.simpleSearch.autosuggestionList = [];
      this.intermediateSearch.autosuggestionList = [];
      this.advanceSearch.autosuggestionList = [];
    }

    // For dynamically generated filters
    this.advanceSearch.autosuggestionList.forEach((_, i) => {
      if (!target.closest(`#filter-input-${i}`)) {
        this.advanceSearch.autosuggestionList[i] = [];
      }
    });
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

  handleChangeKeywordDL(column: 'DEVELOPMENT_STAGE' | 'INNOVATOR_ORIGINATOR', isFocus: boolean = false) {
    let keyword = '';
    if (column === 'DEVELOPMENT_STAGE') keyword = this.advanceSearch.devStage;
    if (column === 'INNOVATOR_ORIGINATOR') keyword = this.advanceSearch.innovator;
    console.log("keyword", keyword, "column", column, "isFocus", isFocus);
    // if (!keyword || keyword.length < 2) {
    //   if (column === 'DEVELOPMENT_STAGE') this.filteredDevStages = [];
    //   if (column === 'INNOVATOR_ORIGINATOR') this.filteredInnovators = [];
    //   return;
    // }
    // Clear suggestions if input is empty or very short
   if (!isFocus && (!keyword || keyword.length < 3)) {
    if (column === 'DEVELOPMENT_STAGE') this.filteredDevStages = [];
    if (column === 'INNOVATOR_ORIGINATOR') this.filteredInnovators = [];
    return;
  }
    const payload = { column, keyword };
    console.log("payload", payload);
    this.mainSearchService.getAdvanceSearchSuggestions(payload).subscribe({
      next: (res: any) => {
        const list = res?.data?.suggestions || [];
        console.log("list", list);
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
    const {
      filterInputs,
      devStage,
      innovator,
      startSales,
      endSales,
      dateType,
      startDate,
      endDate
    } = this.advanceSearch;

    const hasFilterKeyword = filterInputs?.some(
      (input: any) => input.filter?.trim() && input.keyword?.trim()
    );

    const hasDateFilters =
      dateType?.trim() !== '' &&
      this.isValidDate(startDate) &&
      this.isValidDate(endDate);

    return (
      hasFilterKeyword ||
      hasDateFilters ||
      devStage?.trim() !== '' ||
      innovator?.trim() !== '' ||
      (startSales && endSales)
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
        this.getChemicalStructureFilters();
        break;
      case searchTypes.synthesisSearch:
        this.synthesisSearch = {};
        break;
      case searchTypes.intermediateSearch:
        this.intermediateSearch = { filter: '' };
        this.getintermediateSearchFilters();
        break;
      case searchTypes.advanceSearch:
        this.advanceSearch = {
          autosuggestionList: [],
          dateType: '',
        }
        this.advanceSearch.filterInputs = [
          { filter: '', keyword: '' }
        ];
        this.getAdvanceSearchFilters();
        break;
    }
  }
  handleSuggestionClick(value: any, searchType = '', index: number = 0) {
    this.showSuggestions = false;

  // Common save for all types (optional global)
  sessionStorage.setItem('searchKeyword', value);

  switch (searchType) {
    case searchTypes.simpleSearch:
      this.simpleSearch.keyword = value;
      this.simpleSearch.autosuggestionList = [];

      // ✅ Save both keyword and filter for persistence
      sessionStorage.setItem('simpleSearch.keyword', this.simpleSearch.keyword || '');
      sessionStorage.setItem('simpleSearch.filter', this.simpleSearch.filter || '');

      this.checkPriviledgeAndHandleSearch(this.searchTypes.simpleSearch);

      // Restore input focus
      setTimeout(() => {
        this.simpleSearchkeywordInput?.nativeElement?.focus();
      }, 0);

      // Update FormControl if you're using reactive form
      this.keyword.setValue(value);
      break;
  
      case searchTypes.chemicalStructure:
        this.chemicalStructure.keyword = value;
        this.chemicalStructure.autosuggestionList = [];

        this.checkPriviledgeAndHandleSearch(this.searchTypes.chemicalStructure)
        setTimeout(() => {
          this.chemicalStructureKeywordInput?.nativeElement?.focus();
        }, 0);
        break;
  
      case searchTypes.synthesisSearch:
        this.synthesisSearch.keyword = value;
        this.synthesisSearch.autosuggestionList = [];
        this.checkPriviledgeAndHandleSearch(this.searchTypes.synthesisSearch);
        setTimeout(() => {
          this.synthesisSearchkeywordInput?.nativeElement?.focus();
        }, 0);
        break;
  
      case searchTypes.intermediateSearch:
        this.intermediateSearch.keyword = value;
        this.intermediateSearch.autosuggestionList = [];

        this.checkPriviledgeAndHandleSearch(this.searchTypes.intermediateSearch);

        setTimeout(() => {
          this.intermediateSearchKeywordInput?.nativeElement?.focus();
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
  
    // ✅ Save simpleSearch values if this is a simple search
    if (searchType === this.searchTypes.simpleSearch) {
      sessionStorage.setItem('simpleSearch.keyword', this.simpleSearch.keyword || '');
      sessionStorage.setItem('simpleSearch.filter', this.simpleSearch.filter || '');
    }
  
    // 🚨 Validate sales range if only one value is given
    if (startSales && !endSales) {
      this.priviledgeModal.emit('Please enter End Range.');
      return;
    }
    if (endSales && !startSales) {
      this.priviledgeModal.emit('Please enter Start Range.');
      return;
    }
  
    const hasFilledKeyword = filterInputs?.some(input =>
      input.filter?.trim() && input.keyword?.trim()
    );
  
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
            console.log("Dailylimit", privilegeData?.['pharmvetpat-mongodb']?.DailySearchLimit);
            console.log("limittodays", todaysLimit?.searchCount);
            console.log("remaining limit", remainingLimit);
  
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
    // ✅ Check if object is assigned
    if (!dbPrivileges) return false;
    return (
      dbPrivileges?.View !== 'false' &&
      dbPrivileges?.Search !== '' &&
      dbPrivileges?.Search !== "0" &&
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
    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: '',
      screenColumn: this.screenColumn,
      activeForm: searchTypes.advanceSearch,
    });

    const validFilters = this.advanceSearch?.filterInputs
      ?.filter(input => input.filter?.trim() && input.keyword?.trim());

    const hasValidCriteria = validFilters && validFilters.length > 0;

    const criteria = hasValidCriteria
      ? validFilters.map((input, index) => ({
        ...(index > 0 ? { operator: input.operator || 'OR' } : {}),
        column: input.filter,
        keyword: input.keyword
      }))
      : undefined;

    const hasValidDateFilters =
      this.advanceSearch?.dateType &&
      this.isValidDate(this.advanceSearch?.startDate) &&
      this.isValidDate(this.advanceSearch?.endDate);

    const apiBody = {
      ...(hasValidCriteria && { criteria }),
      ...(hasValidDateFilters && {
        date_filters: {
          column: this.advanceSearch.dateType,
          start_date: this.advanceSearch.startDate,
          end_date: this.advanceSearch.endDate
        }
      }),
      ...(this.advanceSearch?.devStage && { development_stage: this.advanceSearch.devStage }),
      ...(this.advanceSearch?.innovator && { innovators: this.advanceSearch.innovator }),
      ...(this.advanceSearch?.startSales !== null &&
        this.advanceSearch?.startSales !== undefined &&
        this.advanceSearch?.endSales !== null &&
        this.advanceSearch?.endSales !== undefined && {
        sale_range: {
          start: this.advanceSearch.startSales,
          end: this.advanceSearch.endSales
        }
      }),
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

    // Do NOT reset input values — just optionally refocus the relevant input
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
      }
    }, 0);
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
    console.log("Intermediate search body", body);
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
  onPageReload(){
    sessionStorage.removeItem(this.simpleSearch.keyword);
    sessionStorage.removeItem(this.simpleSearch.filter);
  }
  isPageReload(): boolean {
    // Modern browsers
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry && navEntry.type === 'reload') return true;
  
    // Fallback (deprecated in modern browsers)
    // @ts-ignore
    if (performance.navigation && performance.navigation.type === 1){
      sessionStorage.removeItem(this.simpleSearch.keyword);
    sessionStorage.removeItem(this.simpleSearch.filter);
    return true 
    } ;
    
    return false;
}
}