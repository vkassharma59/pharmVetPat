import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsApprovalCardComponent } from './us-approval-card.component';

describe('UsApprovalCardComponent', () => {
  let component: UsApprovalCardComponent;
  let fixture: ComponentFixture<UsApprovalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsApprovalCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsApprovalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
