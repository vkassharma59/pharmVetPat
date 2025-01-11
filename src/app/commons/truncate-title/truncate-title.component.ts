import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-truncate-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1
      [ngClass]="customClass"
      [class.expanded]="isExpanded"
    >
      <span [innerHTML]="title"></span> {{ isExpanded ? fullText : truncatedText }}
      <button *ngIf="isTruncated" (click)="toggleExpand()" class="view-more-button">
        {{ isExpanded ? 'View Less' : 'View More' }}
      </button>
    </h1>
  `,
  styleUrls: ['./truncate-title.component.css'],
})
export class TruncateTitleComponent {
  @Input() fullText: string = ''; // Dynamic text to truncate
  @Input() title: string = '';    // Dynamic title to merge with the text
  @Input() maxLength: number = 100;
  @Input() customClass: string = ''; // Dynamic class for styling

  isExpanded = false;

  // Get the truncated version of the text
  get truncatedText(): string {
    return this.fullText.length > this.maxLength
      ? this.fullText.substring(0, this.maxLength) + '...'
      : this.fullText;
  }

  // Determine if the text needs truncation
  get isTruncated(): boolean {
    return this.fullText.length > this.maxLength;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
