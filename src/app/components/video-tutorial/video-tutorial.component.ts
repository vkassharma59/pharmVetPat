import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'chem-video-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-tutorial.component.html',
  styleUrl: './video-tutorial.component.css'
})
export class VideoTutorialComponent {

    constructor(public dialogRef: MatDialogRef<VideoTutorialComponent>) {}
  
    onClose() {
      this.dialogRef.close();
    }
}
