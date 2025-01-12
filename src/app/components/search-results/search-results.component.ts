import {
  Component,
  Output,
  Input,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { LoaderComponent } from '../../commons/loader/loader.component';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../services/utility-service/utility.service';
import { RouteResultComponent } from '../route-result/route-result.component';

@Component({
  selector: 'chem-search-results',
  standalone: true,
  imports: [
    LoaderComponent,
    CommonModule,
    RouteResultComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css',
})

export class SearchResultsComponent {
  
  @Output() showResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() showDataResultFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() backFunction: EventEmitter<any> = new EventEmitter<any>();
  @Output() generatePdf: EventEmitter<any> = new EventEmitter<any>();

  @Input() allDataSets: any = [];  
  @Input() productInfoData: any;  
  @Input() CurrentAPIBody: any;

  userIsLoggedIn: boolean = false;
  loading = false;
  LimitValue = '';

  @ViewChild('priviledgeModal') priviledgeModal!: ElementRef;

  constructor(
    private utilityService: UtilityService
  ) {}

  handleUserLoggedIn(loggedIn: boolean) {
    this.userIsLoggedIn = loggedIn;
  }
  handleLoadingState(data: any) {
    this.loading = data;
  }

  handleBack() {
    this.backFunction.emit(false);
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
}
