import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemiTrackerComponent } from './chemi-tracker.component';

describe('ChemiTrackerComponent', () => {
  let component: ChemiTrackerComponent;
  let fixture: ComponentFixture<ChemiTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemiTrackerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChemiTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
