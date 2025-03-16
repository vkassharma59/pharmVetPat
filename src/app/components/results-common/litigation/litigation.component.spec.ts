import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LitigationComponent } from './litigation.component';

describe('LitigationComponent', () => {
  let component: LitigationComponent;
  let fixture: ComponentFixture<LitigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LitigationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LitigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
