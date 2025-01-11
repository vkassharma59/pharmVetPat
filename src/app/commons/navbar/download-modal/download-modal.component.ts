import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-download-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './download-modal.component.html',
  styleUrl: './download-modal.component.css'
})
export class DownloadModalComponent {
  isclose: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<DownloadModalComponent>
  ) { }

  handleCross() {
    this.isclose = true;
    this.dialogRef.close();
  }
}