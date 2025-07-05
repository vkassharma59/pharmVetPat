import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-downloadreportmodal',
  standalone: true,
  imports: [NgFor,FormsModule,NgIf],
  templateUrl: './downloadreportmodal.component.html',
  styleUrl: './downloadreportmodal.component.css'
})
export class DownloadreportmodalComponent {
  @Input() resultTabs: any[] = [];
  @Input() SingleDownloadCheckbox: { [key: string]: boolean } = {};
  @Input() generatePDFloader = false;

  @Output() close = new EventEmitter<void>();
  @Output() generatePDF = new EventEmitter<void>();

  isDisabled(): boolean {
    const selected = Object.values(this.SingleDownloadCheckbox).filter(Boolean).length;
    return selected >= 3;
  }

  handleClose() {
    this.close.emit();
  }

  handleGeneratePDF() {
    this.generatePDF.emit();
  }
}

