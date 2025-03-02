import { Component, Input } from '@angular/core';
import { TechnicalRoutesCardComponent } from '../technical-routes-card/technical-routes-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';

@Component({
  selector: 'chem-technical-route',
  standalone: true,
  imports: [TechnicalRoutesCardComponent, CommonModule],
  templateUrl: './technical-routes.component.html',
  styleUrl: './technical-routes.component.css'
})
export class TechnicalRoutesComponent {

  resultTabs: any = {};
  _data: any = [];
  @Input()
  get data() {
    return this._data;
  }
  set data(value: any) {
    this._data = value;
  }

  constructor(private utilityService: UtilityService) {
    this.resultTabs = this.utilityService.getAllTabsName();
  }
}
