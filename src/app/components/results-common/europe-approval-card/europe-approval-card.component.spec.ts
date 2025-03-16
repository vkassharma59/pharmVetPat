import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EuropeApprovalCardComponent } from './europe-approval-card.component';

describe('EuropeApprovalCardComponent', () => {
  let component: EuropeApprovalCardComponent;
  let fixture: ComponentFixture<EuropeApprovalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EuropeApprovalCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EuropeApprovalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
