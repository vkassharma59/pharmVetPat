import { AfterViewInit, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';

@Component({
  selector: 'app-dmf-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dmf-card.component.html',
  styleUrl: './dmf-card.component.css'
})
export class DmfCardComponent implements OnDestroy{
  _data: any = [];
  noMatchingData: boolean = false;
  MoreInfo: boolean = false;
  pageNo: number = 1;
  dmf_column: Record<string, string> = {};
  resultTabs: any = {};
  columns: any[] = [];
  dmfApiBody: any;
  filteredCountries: any[] = [];
  @Input() countryConfig: any[] = [];
  static apiCallCount: number = 0;
  localCount: number = 0;

  constructor(private dialog: MatDialog,
    private utilityService: UtilityService,
    private mainSearchService: MainSearchService,

  ) {

  }

  routesList = {
    countries: [
      { key: 'USA', total: 78 },
      { key: 'Europe', total: 45 },
      { key: 'Japan', total: 3 },

    ]
  };
  @Input() selectedCountry: any;
  @Input()
  get data() {
    return this._data;
  }

  set data(value: any) {
    if (value && Object.keys(value).length > 0) {
      // this.noMatchingData = false;
      DmfCardComponent.apiCallCount++;
      this.localCount = DmfCardComponent.apiCallCount;
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();

      if (column_list[this.resultTabs.dmf?.name]?.length > 0) {
        for (let i = 0; i < column_list[this.resultTabs.dmf.name].length; i++) {
          const col = column_list[this.resultTabs.dmf.name][i];
          this.dmf_column[col.value] = col.name;
        }
      }
      this._data = value;
    }
  }
  // @Input()
  // get currentChildAPIBody() {
  //   return this._currentChildAPIBody;
  // }
  // set currentChildAPIBody(value: any) {
  //   this._currentChildAPIBody = value;
  //  }

  @Input() countryList: any[] = []; // ← This replaces processCountryData

  // ngOnInit() {
  //   if (DmfCardComponent.apiCallCount === 0) {
  //     DmfCardComponent.apiCallCount = 0;
  //   }
  // }

  //  ngOnChanges(): void {
  //   //  console.log('📥 ------------------------', this._data);
  // }
  getDmfPrefix(country: string): string {
    const upperKey = (country || '').toUpperCase();
    const prefixMap: { [key: string]: string } = {
      'USA': 'USDMF',
      'EUROPE': 'EPDMF',
      'JAPAN': 'JDMF',
      'KOREA': 'KDMF',
      'BRAZIL': 'BDMF'
    };
    return prefixMap[upperKey] || 'DMF';
  }

  ngOnDestroy() {
    DmfCardComponent.apiCallCount = 0;
  }
 showFull = false;
  toggleView() {
    this.showFull = !this.showFull;
  }

  toggleMoreInfo(): void {
    this.MoreInfo = !this.MoreInfo;
  }

  getColumnName(value: any): string {
    const name = this.dmf_column[value] || value;
    return name;
  }


  handleCopy(text: string, event: MouseEvent) {

    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textArea);

    // Get the clicked element from event
    const target = event.currentTarget as HTMLElement;
    const icon = target.querySelector('i');

    if (icon?.classList.contains('fa-copy')) {
      icon.classList.remove('fa-copy');
      icon.classList.add('fa-check');
      setTimeout(() => {
        icon.classList.remove('fa-check');
        icon.classList.add('fa-copy');
      }, 1500);
    }
  }

  copyText(elementId: string, event: Event) {
    const el = event.currentTarget as HTMLElement;
    const textToCopy = document.getElementById(elementId)?.innerText;

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (el.classList.contains('fa-copy')) {
          el.classList.remove('fa-copy');
          el.classList.add('fa-check');
          setTimeout(() => {
            el.classList.remove('fa-check');
            el.classList.add('fa-copy');
          }, 1500);
        }
      }).catch(err => {
        console.error('[DmfCardComponent] ❌ Failed to copy text:', err);
      });
    }
  }
}

