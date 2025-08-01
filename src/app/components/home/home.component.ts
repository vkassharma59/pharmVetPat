import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { pharmaDatabaseSearchComponent } from '../pharma-database-search/pharma-database-search.component';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { LoaderComponent } from '../../commons/loader/loader.component';
import { UtilityService } from '../../services/utility-service/utility.service';
import { DemoRequestComponent } from '../demo-request/demo-request.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedRosService } from '../../shared-ros.service';

@Component({
  selector: 'chem-home',
  standalone: true,
  imports: [NgIf, CommonModule, pharmaDatabaseSearchComponent, SearchResultsComponent, LoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  playVideo: boolean = false;
  LimitValue = '';
  user: any = null;
  showResult: boolean = false;
  loading: boolean = false;
  searchData: any = {};
  accordionData: any = {
    "accordionItem1": true,
    "accordionItem2": false,
    "accordionItem3": false,
  };
  allDataSets: any = [];
  CurrentAPIBody = {
    body: {},
    page_no: 1,
    count: 0,
    api_url: '',
    currentTab: '',
    actual_value: '',
  };


  @ViewChild('priviledgeModal') priviledgeModal!: ElementRef;
  resultTabs: any = {};

  constructor(
    private dialog: MatDialog,
    private sharedRosService: SharedRosService,
    private cdr: ChangeDetectorRef,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
    const auth = localStorage.getItem('auth');
    this.allDataSets = this.utilityService.getDataStates();
    this.resultTabs = this.utilityService.getAllTabsName();
    this.CurrentAPIBody.count = 0;

    try {
      this.user = auth ? JSON.parse(auth) : null; // Safely parse only if `auth` exists
    } catch (error) {
      console.error('Error parsing auth data from localStorage', error);
      this.user = null;
    }
  }

  activeAccordion: string | null = null;

  openCloseAccordion(key: string, event?: Event): void {
    this.activeAccordion = this.activeAccordion === key ? null : key;

    // If event exists, toggle 'active' class on clicked button
    if (event) {
      const buttons = document.querySelectorAll(".btn-link");
      buttons.forEach((btn) => btn.classList.remove("active"));
      (event.target as HTMLElement).classList.add("active");
    }
  }


  disableRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  handleBackButton(data: any) {
    this.showResult = data;
  }

  handleLoading(event: boolean) {
    setTimeout(() => {
      this.loading = event;
    }, 100);
  }

  handleSetLoading(data: any) {
    setTimeout(() => {
      this.loading = data;
    }, 100);
  }

  handleSearchResults(data: any) {
    this.allDataSets = this.utilityService.getDataStates();
    this.searchData = { ...data };
    this.sharedRosService.setAllDataSets(this.allDataSets);
    switch (this.CurrentAPIBody.currentTab) {
      case this.resultTabs.productInfo.name:
        if (
          this.searchData?.basic_product_count &&
          this.searchData?.basic_product_data
        ) {
          this.utilityService.setActiveTab(this.resultTabs.productInfo.name);
          this.CurrentAPIBody.count = this.searchData?.basic_product_count;
          // Remove extra keys from allDataSets beyond the length
          this.allDataSets = this.allDataSets.slice(0, this.searchData?.basic_product_data?.length);
          for (let i = 0; i < this.searchData?.basic_product_data?.length; i++) {
            this.allDataSets[i][this.resultTabs.productInfo.name][0] =
              this.searchData?.basic_product_data[i];
          }
        } else {
          this.allDataSets = [];
        }
        break;
      case this.resultTabs.technicalRoutes.name:
        if (
          this.searchData?.ros_count &&
          this.searchData?.ros_data
        ) {
          this.utilityService.setActiveTab(this.resultTabs.technicalRoutes.name);
          this.CurrentAPIBody.count = this.searchData?.ros_count;
          // Remove extra keys from allDataSets beyond the length
          this.allDataSets = this.allDataSets.slice(0, this.searchData?.ros_data?.length);
          const {
            ros_data = [],
            uniq_products = [],
            KSM = 0,
            ros_count = 0
          } = this.searchData || {};

          ros_data.forEach((item, i) => {
            const tempObj = {
              ros_data: [item],
              uniq_products,
              KSM,
              ros_count
            };

            this.allDataSets[i][this.resultTabs.technicalRoutes.name] = tempObj;
          });

        } else {
          this.allDataSets = [];
        }
        break;
      case this.resultTabs.chemicalDirectory.name:
        if (
          this.searchData?.chem_dir_count &&
          this.searchData?.chem_dir_data
        ) {
          this.utilityService.setActiveTab(this.resultTabs.chemicalDirectory.name);
          this.CurrentAPIBody.count = this.searchData?.chem_dir_count;
          // Remove extra keys from allDataSets beyond the length
          this.allDataSets = this.allDataSets.slice(0, this.searchData?.chem_dir_data?.length);
          for (let i = 0; i < this.searchData?.chem_dir_data?.length; i++) {
            this.allDataSets[i][this.resultTabs.chemicalDirectory.name][0] =
              this.searchData?.chem_dir_data[i];
          }
        } else {
          this.allDataSets = [];
        }
        break;
    }
  }

  handleShowResult(data: any) {
    this.showResult = true;
    this.CurrentAPIBody.api_url = data?.API_URL;
    this.CurrentAPIBody.body = data?.body;
    this.CurrentAPIBody.currentTab = data?.currentTab;
    this.CurrentAPIBody.actual_value = data?.actual_value;
  }

  closeModal() {
    const modalElement = this.priviledgeModal.nativeElement;
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
  }

  openPriviledgeModal(data: any) {
    this.LimitValue = data;
    const modalElement = this.priviledgeModal.nativeElement;
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
    modalElement.setAttribute('aria-hidden', 'false');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
  }

  requestADemo() {
    const dialogRef = this.dialog.open(DemoRequestComponent, {
      width: '800px',
      height: '800px',
      panelClass: 'full-screen-modal',
    });
  }
  videoTutorial() {
    this.playVideo = !this.playVideo;
  }
}