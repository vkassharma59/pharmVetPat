import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinaryUsApprovalComponent } from './veterinary-us-approval.component';

describe('VeterinaryUsApprovalComponent', () => {
  let component: VeterinaryUsApprovalComponent;
  let fixture: ComponentFixture<VeterinaryUsApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinaryUsApprovalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VeterinaryUsApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
