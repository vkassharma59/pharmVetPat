import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit
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
import { SharedRosService } from '../../shared-ros.service';
import { CasRnService } from '../../services/casRn';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'chem-pharma-database-search',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './pharma-database-search.component.html',
  styleUrl: './pharma-database-search.component.css'
})
export class pharmaDatabaseSearchComponent implements OnInit, AfterViewInit, OnDestroy {
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
  searchKeyword: string = '';
  selectedItem: number = 0;
  chemicalStructure: any = { filter: '' };
  simpleSearch: any = {};
  synthesisSearch: any = {};
  intermediateSearch: any = { filter: '' };
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
  };
  private subscription!: Subscription;
  private routerSub!: Subscription;
  receivedCasRn: string | null = null;
  receivedType: string | null = null;
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
    { type: 'CAS RN', value: '41429-16-7', label: '41429-16-7' },
    { type: 'Chemical Name', value: 'ethyne', label: 'ethyne' }
  ];

  devStages: string[] = ['Stage 1', 'Stage 2', 'Stage 3'];
  innovators: string[] = ['Pfizer', 'Roche', 'Novartis'];

  filteredDevStages: string[] = [];
  filteredInnovators: string[] = [];
  selectedCasRn: string | null = null;
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
    private sharedRosService: SharedRosService,
    private mainSearchService: MainSearchService,
    private userPriviledgeService: UserPriviledgeService,
    private utilityService: UtilityService,
    private columnListService: ColumnListService,
    private casRnService: CasRnService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.searchTypes = searchTypes;
  }

  ngOnInit() {
    this.utilityService.resetTabs();
    this.resultTabs = this.utilityService.getAllTabsName();
    this.getAllFilters();
    console.log("🔄 ngOnInit called - Search Page initialized");

    // Restore previously saved session state (if any)
    this.restoreAllFromSession();

    // restore cas/type auto-search info (as you had before)
    const type = sessionStorage.getItem("searchType") || localStorage.getItem("searchType") || null;
    const cas = sessionStorage.getItem("casRN") || localStorage.getItem("casRN") || null;
    console.log("📦 Loaded from storage -> type:", type, "| cas:", cas);

    if (cas && type) {
      this.selectedCasRn = cas;

      if (type === "synthesis") {
        this.synthesisSearch.keyword = cas;
        this.selectedItem = 2;
        console.log("🟦 Auto-filled synthesisSearch from storage:", cas);
        this.performSynthesisSearch();
        this.setLoadingState.emit(true);
        localStorage.removeItem("searchType");
        localStorage.removeItem("casRN");
      }

      if (type === "intermediate") {
        this.intermediateSearch.keyword = cas;
        this.selectedItem = 1;
        console.log("🟩 Auto-filled intermediateSearch from storage:", cas);
        this.performIntermediateSearch();
        this.setLoadingState.emit(true);
        localStorage.removeItem("searchType");
        localStorage.removeItem("casRN");
      }
    } else {
      console.warn("⚠️ Nothing found in storage → skipping auto search");
    }

    // Subscribe to router navigation to re-restore state on Back navigation
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // restore state when navigation ends (useful for back button)
        this.restoreAllFromSession();
      }
    });
  }

  // ✅ Unified HostListener to close dropdowns
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.dev-stage-container')) {
      this.showDevStageDropdown = false;
    }

    if (!target.closest('.innovator-container')) {
      this.showInnovatorDropdown = false;
    }

    // If you have autosuggestions lists:
    if (!target.closest('.suggestions-dropdown')) {
      this.simpleSearch.autosuggestionList = [];
      this.intermediateSearch.autosuggestionList = [];
      // For advance, clear arrays
      if (Array.isArray(this.advanceSearch?.autosuggestionList)) {
        this.advanceSearch.autosuggestionList.forEach((_, i) => {
          this.advanceSearch.autosuggestionList[i] = [];
        });
      }
    }

    // For dynamically generated filters
    if (Array.isArray(this.advanceSearch?.autosuggestionList)) {
      this.advanceSearch.autosuggestionList.forEach((_, i) => {
        if (!target.closest(`#filter-input-${i}`)) {
          this.advanceSearch.autosuggestionList[i] = [];
        }
      });
    }
  }

  storeSearchState(searchType: string) {
    try {
      switch (searchType) {
        case this.searchTypes.simpleSearch:
          sessionStorage.setItem('simpleSearch', JSON.stringify(this.simpleSearch || {}));
          break;
        case this.searchTypes.chemicalStructure:
          sessionStorage.setItem('chemicalStructure', JSON.stringify(this.chemicalStructure || {}));
          break;
        case this.searchTypes.synthesisSearch:
          sessionStorage.setItem('synthesisSearch', JSON.stringify(this.synthesisSearch || {}));
          break;
        case this.searchTypes.intermediateSearch:
          sessionStorage.setItem('intermediateSearch', JSON.stringify(this.intermediateSearch || {}));
          break;
        case this.searchTypes.advanceSearch:
          sessionStorage.setItem('advanceSearch', JSON.stringify(this.advanceSearch || {}));
          break;
      }
      // general debug
      // console.log('Session saved for', searchType, sessionStorage.getItem(searchType));
    } catch (e) {
      console.error('Error saving search state:', e);
    }
  }

  
  restoreSearchState(searchType: string) {
    try {
      switch (searchType) {
        case this.searchTypes.simpleSearch: {
          const saved = sessionStorage.getItem('simpleSearch');
          if (saved) this.simpleSearch = JSON.parse(saved);
          break;
        }
        case this.searchTypes.chemicalStructure: {
          const saved = sessionStorage.getItem('chemicalStructure');
          if (saved) this.chemicalStructure = JSON.parse(saved);
          break;
        }
        case this.searchTypes.synthesisSearch: {
          const saved = sessionStorage.getItem('synthesisSearch');
          if (saved) this.synthesisSearch = JSON.parse(saved);
          break;
        }
        case this.searchTypes.intermediateSearch: {
          const saved = sessionStorage.getItem('intermediateSearch');
          if (saved) this.intermediateSearch = JSON.parse(saved);
          break;
        }
        case this.searchTypes.advanceSearch: {
          const saved = sessionStorage.getItem('advanceSearch');
          if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure filterInputs exists and is an array
            if (!Array.isArray(parsed.filterInputs)) {
              parsed.filterInputs = [{ filter: '', keyword: '' }];
            }
            this.advanceSearch = { ...this.advanceSearch, ...parsed };
          }
          break;
        }
      }
    } catch (e) {
      console.error('Error restoring search state:', e);
    }
  }

  restoreAllFromSession() {
    this.restoreSearchState(this.searchTypes.simpleSearch);
    this.restoreSearchState(this.searchTypes.chemicalStructure);
    this.restoreSearchState(this.searchTypes.synthesisSearch);
    this.restoreSearchState(this.searchTypes.intermediateSearch);
    this.restoreSearchState(this.searchTypes.advanceSearch);

    // Optionally restore activeSearchTab if saved
    const savedTab = sessionStorage.getItem('activeSearchTab');
    if (savedTab) {
      this.activeSearchTab = savedTab;
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
    // persist
    this.storeSearchState(this.searchTypes.advanceSearch);
  }

  selectInnovator(name: string) {
    this.advanceSearch.innovator = name;
    this.showInnovatorDropdown = false;
    // persist
    this.storeSearchState(this.searchTypes.advanceSearch);
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
          // persist on typing (safe)
          this.storeSearchState(this.searchTypes.simpleSearch);
          break;
        case searchTypes.chemicalStructure:
          this.getChemicalStructureSuggestions();
          this.storeSearchState(this.searchTypes.chemicalStructure);
          break;
        case searchTypes.synthesisSearch:
          this.getSynthesisSearchSuggestions();
          this.storeSearchState(this.searchTypes.synthesisSearch);
          break;
        case searchTypes.intermediateSearch:
          this.getIntermediateSearchSuggestions();
          this.storeSearchState(this.searchTypes.intermediateSearch);
          break;
        case searchTypes.advanceSearch:
          this.getAdvanceSearchSuggestions(index);
          // persist advance object
          this.storeSearchState(this.searchTypes.advanceSearch);
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
      this.storeSearchState(this.searchTypes.advanceSearch);
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
    this.storeSearchState(this.searchTypes.advanceSearch);
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

  ngAfterViewInit(): void {
    // ✅ Scroll to top after component loads
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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

  selectSuggestionSearch(suggestion: { type_label: string, value: string, label: string }) {
    const { type_label, value, label } = suggestion;
    this.simpleSearch.keyword = label;
    this.simpleSearch.filter = type_label;
    // persist the whole simpleSearch object
    this.storeSearchState(this.searchTypes.simpleSearch);
    this.checkPriviledgeAndHandleSearch(searchTypes.simpleSearch);
  }

  advanceSearchSuggestion(suggestion: { type_label: string, value: string, label: string }) {
    const { type_label, value, label } = suggestion;
    if (!Array.isArray(this.advanceSearch.filterInputs)) {
      this.advanceSearch.filterInputs = [];
    }
    this.advanceSearch.filterInputs.push({
      filter: type_label,
      keyword: label
    });
    // persist
    this.storeSearchState(this.searchTypes.advanceSearch);
    this.checkPriviledgeAndHandleSearch(searchTypes.advanceSearch);
  }

  synthesisSearchSuggestionSearch(synthsuggestion: { type: string, value: string, label: string }) {
    const { type, value, label } = synthsuggestion;
    this.synthesisSearch.keyword = label;
    this.synthesisSearch.filter = type;
    this.storeSearchState(this.searchTypes.synthesisSearch);
    this.checkPriviledgeAndHandleSearch(searchTypes.synthesisSearch);
  }

  intermediateSearchSuggestionSearch(intersuggestion: { type_label: string, value: string, label: string }) {
    const { type_label, value, label } = intersuggestion;
    this.intermediateSearch.keyword = label;
    this.intermediateSearch.filter = type_label;
    this.storeSearchState(this.searchTypes.intermediateSearch);
    this.checkPriviledgeAndHandleSearch(searchTypes.intermediateSearch);
  }

  clearInputAndSuggetions(searchType: string = '') {
    this.showSuggestions = false;

    switch (searchType) {
      case searchTypes.simpleSearch:
        this.simpleSearch = {};
        sessionStorage.removeItem('simpleSearch');
        this.getSimpleSearchSuggestions();
        break;

      case searchTypes.chemicalStructure:
        this.chemicalStructure = { filter: '' };
        this.getChemicalStructureFilters();
        sessionStorage.removeItem('chemicalStructure');
        break;

      case searchTypes.synthesisSearch:
        this.synthesisSearch = {};
        sessionStorage.removeItem('synthesisSearch');
        break;

      case searchTypes.intermediateSearch:
        this.intermediateSearch = { filter: '' };
        this.getintermediateSearchFilters();
        sessionStorage.removeItem('intermediateSearch');
        break;

      case searchTypes.advanceSearch:
        this.advanceSearch = {
          autosuggestionList: [],
          dateType: '',
          filterInputs: [
            { filter: '', keyword: '' }
          ]
        };
        this.getAdvanceSearchFilters();
        sessionStorage.removeItem('advanceSearch');
        break;

      // ✅ New case: clear everything
      case 'ALL':
        // Simple Search
        this.simpleSearch = {};
        sessionStorage.removeItem('simpleSearch');

        // Chemical Structure
        this.chemicalStructure = { filter: '' };
        this.getChemicalStructureFilters();
        sessionStorage.removeItem('chemicalStructure');

        // Synthesis
        this.synthesisSearch = {};
        sessionStorage.removeItem('synthesisSearch');

        // Intermediate
        this.intermediateSearch = { filter: '' };
        this.getintermediateSearchFilters();
        sessionStorage.removeItem('intermediateSearch');

        // Advance
        this.advanceSearch = {
          autosuggestionList: [],
          dateType: '',
          filterInputs: [
            { filter: '', keyword: '' }
          ]
        };
        this.getAdvanceSearchFilters();
        sessionStorage.removeItem('advanceSearch');

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
        // store full object
        this.storeSearchState(this.searchTypes.simpleSearch);

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

        this.storeSearchState(this.searchTypes.chemicalStructure);
        this.checkPriviledgeAndHandleSearch(this.searchTypes.chemicalStructure)
        setTimeout(() => {
          this.chemicalStructureKeywordInput?.nativeElement?.focus();
        }, 0);
        break;

      case searchTypes.synthesisSearch:
        this.synthesisSearch.keyword = value;
        this.synthesisSearch.autosuggestionList = [];
        this.storeSearchState(this.searchTypes.synthesisSearch);
        this.checkPriviledgeAndHandleSearch(this.searchTypes.synthesisSearch);
        setTimeout(() => {
          this.synthesisSearchkeywordInput?.nativeElement?.focus();
        }, 0);
        break;

      case searchTypes.intermediateSearch:
        this.intermediateSearch.keyword = value;
        this.intermediateSearch.autosuggestionList = [];
        this.storeSearchState(this.searchTypes.intermediateSearch);
        this.checkPriviledgeAndHandleSearch(this.searchTypes.intermediateSearch);

        setTimeout(() => {
          this.intermediateSearchKeywordInput?.nativeElement?.focus();
        }, 0);
        break;

      case searchTypes.advanceSearch:
        this.advanceSearch.filterInputs[index].keyword = value;
        this.advanceSearch.autosuggestionList[index] = [];
        // persist entire advanceSearch
        this.storeSearchState(this.searchTypes.advanceSearch);
        this.checkPriviledgeAndHandleSearch(this.searchTypes.advanceSearch);

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
      // store whole object
      this.storeSearchState(this.searchTypes.simpleSearch);
    }
    if (searchType === this.searchTypes.advanceSearch) {
      this.storeSearchState(this.searchTypes.advanceSearch);
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

    const keyword = this.simpleSearch?.keyword?.trim();
    if (!keyword) {
      alert('Please enter a keyword before searching.');
      return;
    }
  
    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: keyword,
      screenColumn: this.screenColumn,
      activeForm: searchTypes.simpleSearch,
    });
  
    const body = {
      criteria: this.criteria,
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      keyword: keyword,
    };
  
    this.searchKeyword = keyword;
  
    // ✅ Store globally so any component (like BasicRouteComponent) can use it later
    this.mainSearchService.simpleSearchKeyword = keyword;
  
    // ✅ For reference/history tracking
    this.sharedRosService.setSearchData('Simple Search', keyword, this.criteria);
  
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

    const body = {
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
    console.log("Advance Search API Body", body);
    this.sharedRosService.setSearchData('advance Search', this.advanceSearch?.keyword, this.criteria);
    const tech_API = this.apiUrls.basicProductInfo.columnList;
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns;
        Auth_operations.setColumnList(this.resultTabs.productInfo.name, response);
        this.mainSearchService.getAdvanceSearchResults(body).subscribe({
          next: (res: any) => {
            this.showResultFunction.emit({
              body,
             // apiBody,
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
    this.sharedRosService.setSearchData('synthesis Search', this.synthesisSearch?.keyword, this.criteria);

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
    // persist active tab
    sessionStorage.setItem('activeSearchTab', this.activeSearchTab);

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
    console.log('🔍 Starting Chemical Structure Search...');
  
    this.setLoadingState.emit(true);
  
    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: this.chemicalStructure?.keyword,
      screenColumn: this.screenColumn,
      activeForm: searchTypes.chemicalStructure,
    });
  
    const filterType = (this.chemicalStructure?.filter || '').toLowerCase().trim();
    const keyword = (this.chemicalStructure?.keyword || '').trim();
    console.log('keyword',keyword);
    if (!keyword) {
      this.setLoadingState.emit(false);
      return;
    }
  
    const body: any = {
      criteria: filterType || 'smiles_code',
      keyword,
      page_no: 1,
      filter_enable: true,
      order_by: '',
      formType: 'chemical',
  
      filters: {
        CAS_RN: filterType === 'cas_rn' ? keyword : '',
        chemicalName:keyword ,
      },
    };
  
    console.log('🧪 Final Chemical Search Body:', body);
  
    this.casRnService.setCasRn(
      'intermediate',
      filterType === 'cas_rn' ? keyword : undefined,
      keyword
    );
  
    const tech_API = this.apiUrls.chemicalDirectory.columnList;
  
    this.columnListService.getColumnList(tech_API).subscribe({
      next: (res: any) => {
        const response = res?.data?.columns || [];
        Auth_operations.setColumnList(this.resultTabs.chemicalDirectory.name, response);
  
        const apiUrl = this.apiUrls.chemicalDirectory.intermediateApplicationSearch;
  
        this.mainSearchService.getChemicalStructureResults(body).subscribe({
          next: (res: any) => {
            this.showResultFunction.emit({
              body,
              API_URL: apiUrl,
              currentTab: this.resultTabs.chemicalDirectory.name,
              actual_value: '',
            });
  
            this.chemSearchResults.emit(res?.data || []);
            this.setLoadingState.emit(false);
          },
          error: () => this.setLoadingState.emit(false),
        });
      },
      error: () => this.setLoadingState.emit(false),
    });
  }
  
  private performIntermediateSearch(): void {
    // Force set filter and keyword so that UI shows values
    this.intermediateSearch.filter = this.intermediateSearch.filter ;
    this.intermediateSearch.keyword = this.intermediateSearch.keyword ;
  
    console.log("🔹 Intermediate Search invoked:", {
      filter: this.intermediateSearch.filter,
      keyword: this.intermediateSearch.keyword
    });
  
    Auth_operations.setActiveformValues({
      column: this.column,
      keyword: this.intermediateSearch.keyword,
      screenColumn: this.screenColumn,
      activeForm: searchTypes.intermediateSearch
    });
  
    const filterType = (this.intermediateSearch.filter || '').toLowerCase().trim();
    const keyword = (this.intermediateSearch.keyword || '').trim();
  
    // Build body (if you still use it somewhere)
    const body = {
      page_no: 1,
      filter_enable: false,
      filters: {},
      order_by: '',
      keyword: keyword,
      criteria: filterType
    };
  
    // CORRECT setCasRn: put CAS_RN only when searched by CAS, and chemicalName only when searched by name
    const casValue = filterType === 'cas_rn' ? keyword : '';
    const nameValue = filterType !== 'cas_rn' ? keyword : '';
  
    console.log("🔁 Setting CasRnService with:", { casValue, nameValue, filterType });
  
    // IMPORTANT: this calls service setCasRn
    this.casRnService.setCasRn('intermediate', casValue, nameValue);
  
    // Save to shared for EXIM component if used
    this.sharedRosService.setSearchData(
      'intermediateSearch',
      this.intermediateSearch?.keyword,
      this.intermediateSearch?.filter
    );
  
    // fetch columns + results (unchanged)
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
    this.storeSearchState(this.searchTypes.chemicalStructure);
    this.checkPriviledgeAndHandleSearch(searchTypes.chemicalStructure);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
