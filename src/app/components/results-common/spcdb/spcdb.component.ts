import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges
} from '@angular/core';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { CommonModule } from '@angular/common';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { SpcdbCardComponent } from '../spcdb-card/spcdb-card.component';

@Component({
  selector: 'chem-spcdb',
  standalone: true,
  imports: [ChildPagingComponent, CommonModule, SpcdbCardComponent],
  templateUrl: './spcdb.component.html',
  styleUrl: './spcdb.component.css'
})
export class SpcdbComponent implements OnChanges {

  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  @Input() currentChildAPIBody: any;

  @Input()
  set data(value: any) {
    this._data = value;
    this.handleResultTabData.emit(this._data?.rows || []);
  }

  get data() {
    return this._data;
  }

  resultTabs: any = {};
  _data: any = { columns: [], rows: [] }; // expected structure

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }

  ngOnChanges() {
    console.log('scientificDocs received data:', this._data);
  }
}
