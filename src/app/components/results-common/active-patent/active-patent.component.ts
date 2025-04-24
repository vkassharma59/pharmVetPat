import { Component,Input,Output,EventEmitter } from '@angular/core';
import { ActivePatentCardComponent } from "../active-patent-card/active-patent-card.component";
import { ChildPagingComponent } from "../../../commons/child-paging/child-paging.component";

@Component({
  selector: 'chem-active-patent',
  standalone: true,
  imports: [ActivePatentCardComponent, ChildPagingComponent],
  templateUrl: './active-patent.component.html',
  styleUrl: './active-patent.component.css'
})
export class ActivePatentComponent {
  
    @Output() handleResultTabData = new EventEmitter<any>();
    @Output() handleSetLoading = new EventEmitter<boolean>();
    @Input() currentChildAPIBody: any;
    
    resultTabs: any = {};
}
