import { AfterViewInit, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { CommonModule } from '@angular/common';
import { MainSearchService } from '../../../services/main-search/main-search.service';
import { environment } from '../../../../environments/environment';

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
      DmfCardComponent.apiCallCount++;
      this.localCount = DmfCardComponent.apiCallCount;
      this.resultTabs = this.utilityService.getAllTabsName();
      const column_list = Auth_operations.getColumnList();
  
      const dmfColumns = column_list[this.resultTabs.dmf?.name] || [];
  
      // Filter only visible columns based on backend config
      this.columns = dmfColumns.filter(col => col.is_visible !== false);
  
      // Create a lookup map for easier access in the template
      this.dmf_column = {};
      for (const col of this.columns) {
        this.dmf_column[col.value] = col.name;
      }
  
      // Remove hidden data keys from incoming data
      const filteredData = {};
      Object.keys(value).forEach(key => {
        if (this.dmf_column[key]) {
          filteredData[key] = value[key];
        }
      });
  
      this._data = filteredData;
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

  ngOnInit() {
   // console.log('📥 ---------------sdjisgjishjd---------', this._data);
  }

   ngOnChanges(): void {
      //console.log('📥 ------------------------', this._data);
  }
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
    const name = this.dmf_column[value];
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
  getCompanyLogo(value: any): string {
    return `${environment.baseUrl}${environment.domainNameCompanyLogo}${value?.dmf_holder_logo}`;
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
  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.src = '/assets/no-image.jpg'; // Fallback image path
    }
}

