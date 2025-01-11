import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-demo-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-request.component.html',
  styleUrl: './demo-request.component.css',
})
export class DemoRequestComponent {
  constructor(public dialogRef: MatDialogRef<DemoRequestComponent>) {}

  onClose() {
    this.dialogRef.close();
  }
}
