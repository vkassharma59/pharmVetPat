import { Component, EventEmitter, Input, Output, AfterViewInit, OnInit } from '@angular/core';
import { BasicRouteCardComponent } from '../basic-route-card/basic-route-card.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../../services/utility-service/utility.service';
import { Auth_operations } from '../../../Utils/SetToken';
import { ChildPagingComponent } from '../../../commons/child-paging/child-paging.component';
import { LoadingService } from '../../../services/loading-service/loading.service';
import { MainSearchService } from '../../../services/main-search/main-search.service';
@Component({
  selector: 'chem-product-info',
  standalone: true,
  imports: [CommonModule, BasicRouteCardComponent, ChildPagingComponent],
  templateUrl: './basic-route.component.html',
  styleUrl: './basic-route.component.css'
})
export class BasicRouteComponent implements OnInit, AfterViewInit {
  
  resultTabs: any = {};
  productInfoApiBody: any;
  _data: any = [];
  count: number = 0;
  searchKeyword: string = '';
  @Output() handleResultTabData = new EventEmitter<any>();
  @Output() handleSetLoading = new EventEmitter<boolean>();
  searchThrough: string = '';
  _currentChildAPIBody: any;
  @Input() index: any;
  @Input() tabName?: string;
  @Input() keyword: string = '';
  isExportingExcel: boolean = false;
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
  
    if (value) {
      this.productInfoApiBody = JSON.parse(JSON.stringify(value)) || value;
      this.searchKeyword = value.keyword || ''; // ✅ store keyword for Excel
    }
  }  
  constructor(private utilityService: UtilityService, public loadingService: LoadingService, private mainSearchService: MainSearchService) {
    this.resultTabs = this.utilityService.getAllTabsName();
    this.searchThrough = Auth_operations.getActiveformValues().activeForm;
   
  }

  ngOnInit(): void {
   // console.log('Current Child API Body (index:', this.currentChildAPIBody);
  }
 


  ngAfterViewInit(): void {
    // ✅ Scroll to top after component loads
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }
  downloadExcel(): void {
    this.isExportingExcel = true;
  
    const keyword =
      this.mainSearchService.simpleSearchKeyword?.trim() ||
      this.productInfoApiBody?.keyword?.trim() ||
      this._currentChildAPIBody?.keyword?.trim() || '';
  
    const page_no = this.productInfoApiBody?.page_no && !isNaN(this.productInfoApiBody.page_no)
      ? Number(this.productInfoApiBody.page_no)
      : 1;
  
    console.log('Download Excel → keyword:', keyword, 'page_no:', page_no);
  
    if (!keyword) {
      this.isExportingExcel = false;
      alert('Please perform a search before downloading Excel.');
      return;
    }
  
    const body = { keyword, page_no };
    console.log('✅ Final Excel download body:', body);
  
    this.mainSearchService.basicProductdownloadexcel(body).subscribe({
      next: async (res: Blob) => {
        try {
          // Directly save the blob
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Basic-product.xlsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Excel processing error:', error);
        } finally {
          this.isExportingExcel = false;
        }
      },
      error: (err) => {
        console.error('Excel download error:', err);
        this.isExportingExcel = false;
      },
    });
  }
  
}
