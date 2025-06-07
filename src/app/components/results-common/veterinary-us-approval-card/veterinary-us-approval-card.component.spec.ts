import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinaryUsApprovalCardComponent } from './veterinary-us-approval-card.component';

describe('VeterinaryUsApprovalCardComponent', () => {
  let component: VeterinaryUsApprovalCardComponent;
  let fixture: ComponentFixture<VeterinaryUsApprovalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinaryUsApprovalCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VeterinaryUsApprovalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
