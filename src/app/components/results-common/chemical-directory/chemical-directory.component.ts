// import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
// import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
// import { CommonModule } from '@angular/common';
// import { UtilityService } from '../../../services/utility-service/utility.service';
// import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
// import { Auth_operations } from '../../../Utils/SetToken';
// import { TechnicalRoutesComponent } from "../technical-routes/technical-routes.component";
// import { ApiConfigService } from '../../../../appservice';
// import { MainSearchService } from '../../../services/main-search/main-search.service';

// @Component({
//   selector: 'chemical-directory',
//   standalone: true,
//   imports: [ChemicalDirectoryDataCardComponent, CommonModule, ChildPagingComponent, TechnicalRoutesComponent],
//   templateUrl: './chemical-directory.component.html',
//   styleUrl: './chemical-directory.component.css'
// })
// export class ChemicalDirectoryComponent implements OnChanges {

//   @Output() handleResultTabData = new EventEmitter<any>();
//   @Output() handleSetLoading = new EventEmitter<boolean>();

//   @Input() currentChildAPIBody: any;
//   @Input() CurrentAPIBody: any;

//   searchThrough: string = '';
//   resultTabs: any = {};
//   _data: any = [];
//   @Input()
//   set data(value: any) {
//     this._data = value;
//     this.handleResultTabData.emit(this._data || []);
//   }

//   get data() {
//     return this._data;
//   }
//  @Input()
//    get currentChildAPIBody() {
//      return this._currentChildAPIBody;
//    }
//    set currentChildAPIBody(value: any) {
//      this._currentChildAPIBody = value;
//    }
//   constructor(private utilityService: UtilityService,
//     private apiConfigService: ApiConfigService,
//     private mainSearchService: MainSearchService,
//   ) {
//     this.resultTabs = this.utilityService.getAllTabsName();
//     this.searchThrough = Auth_operations.getActiveformValues().activeForm;
//   }
//   ngOnChanges() {
//     console.log('europeApproval received data:', this._data);
//     this.handleResultTabData.emit(this._data);
//   }
//   updateDataFromPagination(newData: any) {
//     this._data = newData.chem_dir_data; // or this.data = newData; if you want setter to trigger
//     this.handleResultTabData.emit(newData);
//     console.log("✅ Updated data from pagination:", newData);
//   }
//   showTechnicalRoute = false;

//   handleROSChange(value: string) {
//     this.handleSetLoading.emit(true);

//     const filters = value === 'ROS_filter' ? { types_of_route: 'KSM' } : {};

//     const values = {
//       ...this._currentChildAPIBody,
//       search_type: 'GBRN',
//       keyword: this._data?.trrn, // keyword TRRN ke liye
//       page_no: 1,
//       filter_enable: false,
//       filters: filters,
//     };

//     this.CurrentAPIBody = {
//       body: values,
//       api_url: this.apiConfigService.apiUrls.technicalRoutes.searchSpecific,
//       TabIndex: 0,
//     };

//     // Show technical routes component
//     this.showTechnicalRoute = true;

//     // API call (aapka service use karke)
//     this.mainSearchService.technicalRoutesSearchSpecific(values).subscribe({
//       next: (res) => {
//         this._data = res?.data || [];
//         this.handleResultTabData.emit(this._data);
//         this.handleSetLoading.emit(false);
//       },
//       error: (e) => {
//         console.error(e);
//         this.handleSetLoading.emit(false);
//       }
//     });
//   }




// }
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { TechnicalRoutesComponent } from "../technical-routes/technical-routes.component";
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ApiConfigService } from '../../../../appservice';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { Auth_operations } from '../../../Utils/SetToken';

@Component({
  selector: 'chemical-directory',
  standalone: true,
  imports: [
    ChemicalDirectoryDataCardComponent,
    CommonModule,
    ChildPagingComponent,
    TechnicalRoutesComponent
  ],
  templateUrl: './chemical-directory.component.html',
  styleUrl: './chemical-directory.component.css'
})
export class ChemicalDirectoryComponent implements OnChanges {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Output() activeTabChange = new EventEmitter<string>();

  @Input() CurrentAPIBody: any;
  private _currentChildAPIBody: any;


  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);
  }

  get data() {
    return this._data;
  }

  _data: any = [];
  resultTabs: any = {};
  searchThrough: string = '';
  showTechnicalRoute = false;


  @Input()
  get currentChildAPIBody(): any {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    // optionally add logic here
  }

  constructor(
    private utilityService: UtilityService,
    private apiConfigService: ApiConfigService,
    private mainSearchService: MainSearchService
  ) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      console.log('✅ ChemicalDirectoryComponent received new data:', this._data);
      this.handleResultTabData.emit(this._data);
    }
  }

  updateDataFromPagination(newData: any) {
    this._data = newData.chem_dir_data || [];
    this.handleResultTabData.emit(newData);
    console.log("✅ Updated data from pagination:", newData);
  }

  // handleROSChange(value: string) {
  //   this.handleSetLoading.emit(true);
  //   const filters = value === 'ROS_filter' ? { types_of_route: 'KSM' } : {};
  //   const values = {
  //     ...this.currentChildAPIBody,
  //     search_type: "TRRN",
  //     keyword: ['101054', '101648', '1066', '1077', '14079', '16387', '16773', '17017', '17319', '17370', '1820', '18444', '18445', '19526', '19529', '19530', '19531', '19918', '20370', '20736', '20740', '20746', '21898', '2224', '22254', '23535', '2394', '2407', '24402', '2674', '27171', '2724', '3', '3086', '3143', '3241', '38012', '399', '405', '408', '43502', '43505', '44212', '45858', '51570', '51617', '51707', '51732', '51739', '51749', '51751', '51755', '51763', '51769', '52845', '53114', '53312', '53592', '53611', '53678', '53679', '53799', '53815', '53818', '54021', '54023', '54419', '54453', '54580', '55098', '55334', '55434', '55490', '55535', '56733', '57873', '57915', '57920', '57997', '57998', '58060', '58260', '58409', '58835', '58839', '59385', '59386', '59852', '59983', '60759', '60882', '61060', '61096', '61099', '61100', '61462', '61830', '61831', '62025', '62028',],
  //     page_no: 1,
  //     filter_enable: false,
  //     filters,
  //   };
  //   console.log(values, "bbbfdfbdfbdfbfdbdf----------", this._data?.trrn)
  //   this.CurrentAPIBody = {
  //     body: values,
  //     api_url: this.apiConfigService.apiUrls.technicalRoutes.searchSpecific,
  //     TabIndex: 0,
  //   };

  //   this.showTechnicalRoute = true;

  //   this.mainSearchService.technicalRoutesSearchSpecific(values).subscribe({
  //     next: (res) => {
  //       console.log(values, "bbbfdfbdfbdfbfdbdf----------", res?.data)
  //      // this._data = res?.data || [];
  //       this.handleResultTabData.emit(res?.data);
      
  //     this.handleSetLoading.emit(false);  },
  //     error: (e) => {
  //       console.error(e);
  //       this.handleSetLoading.emit(false);
  //     }
  //   });
  // }

  onActiveTabChange(tabName: string) {
    this.activeTabChange.emit(tabName);
  }

}

