import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-Chem_Robotics_ViewModal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chem-discription-viewmodel.component.html',
  styleUrl: './chem-discription-viewmodelcomponent.css',
})

export class ChemDiscriptionViewModelComponent {
  constructor(
    public dialogRef: MatDialogRef<ChemDiscriptionViewModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataRecord: any; title: any }
  ) {}

  onClose() {
    this.dialogRef.close();
  }
}
