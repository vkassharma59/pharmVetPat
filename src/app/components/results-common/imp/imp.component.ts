import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ImageModalComponent } from '../../../commons/image-modal/image-modal.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ImpPatentsCardComponent } from '../imp-patents-card/imp-patents-card.component';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { MainSearchService } from '../../../services/main-search/main-search.service';
@Component({
  selector: 'chem-imp',
  standalone: true,
  imports: [CommonModule,ImpPatentsCardComponent, ChildPagingComponent],
  templateUrl: './imp.component.html',
  styleUrl: './imp.component.css'
})
export class ImpComponent {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  
  resultTabs: any = {};
  _data: any = [];
  productValue: string = '';
  _currentChildAPIBody: any;
  impPatentApiBody: any;

  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  @Input()
  get currentChildAPIBody() {
    return this._currentChildAPIBody;
  }
  set currentChildAPIBody(value: any) {
    this._currentChildAPIBody = value;
    this.impPatentApiBody = { ...value };
    this.handleFetchFilters();
  }

  constructor(
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
  handleFetchFilters() {
    this.impPatentApiBody.filter_enable = true;
    this.mainSearchService.impPatentsSearchSpecific(this.impPatentApiBody).subscribe({
      next: (res) => {
        console.log(res?.data);
        // this.countryFilters = res?.data?.country_of_company;
        // this.foundationsFilters = res?.data?.dummy_6;
        this.impPatentApiBody.filter_enable = false;
      },
      error: (err) => {
        console.error(err);
        this.impPatentApiBody.filter_enable = false;
      },
    });
  }
}