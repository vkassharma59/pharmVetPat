import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.css',
})
export class ImageModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: { dataImage: string }
  ) {}


  @ViewChild('mainDiv', { static: true }) mainDiv!: ElementRef;

  zoomArr: number[] = [1, 1.2, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5];
  indexofArr: number = 4; // Start at normal zoom level (1)
  currentZoom: number = this.zoomArr[this.indexofArr];

  handleChange() {
    this.mainDiv.nativeElement.style.transform = `scale(${this.currentZoom})`;
  }

  zoomIn() {
    if (this.indexofArr < this.zoomArr.length - 1) {
      this.indexofArr += 1;
      this.currentZoom = this.zoomArr[this.indexofArr];
      this.handleChange();
    }
  }

  zoomOut() {
    if (this.indexofArr > 0) {
      this.indexofArr -= 1;
      this.currentZoom = this.zoomArr[this.indexofArr];
      this.handleChange();
    }
  }
}
