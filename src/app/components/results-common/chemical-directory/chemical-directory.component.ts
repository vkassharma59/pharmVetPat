import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ChemicalDirectoryDataCardComponent } from '../chemical-directory-card/chemical-directory-data-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';

@Component({
  selector: 'chemical-directory',
  standalone: true,
  imports: [ChemicalDirectoryDataCardComponent, CommonModule, ChildPagingComponent],
  templateUrl: './chemical-directory.component.html',
  styleUrl: './chemical-directory.component.css'
})
export class ChemicalDirectoryComponent implements OnChanges {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;

  resultTabs: any = {};
  _data: any = [];
  @Input()
    set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data || []);
  }

  get data() {
    return this._data;
  }

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
  ngOnChanges() {
    console.log('europeApproval received data:', this._data);
    this.handleResultTabData.emit(this._data);
  }
    updateDataFromPagination(newData: any) {
  this._data = newData; // or this.data = newData; if you want setter to trigger
  this.handleResultTabData.emit(newData);
  console.log("✅ Updated data from pagination:", newData);
}
}
