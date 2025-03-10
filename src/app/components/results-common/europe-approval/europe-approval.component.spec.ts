import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EuropeApprovalComponent } from './europe-approval.component';

describe('EuropeApprovalComponent', () => {
  let component: EuropeApprovalComponent;
  let fixture: ComponentFixture<EuropeApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EuropeApprovalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EuropeApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
