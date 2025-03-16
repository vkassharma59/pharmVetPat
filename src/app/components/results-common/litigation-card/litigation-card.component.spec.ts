import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LitigationCardComponent } from './litigation-card.component';

describe('LitigationCardComponent', () => {
  let component: LitigationCardComponent;
  let fixture: ComponentFixture<LitigationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LitigationCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LitigationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
