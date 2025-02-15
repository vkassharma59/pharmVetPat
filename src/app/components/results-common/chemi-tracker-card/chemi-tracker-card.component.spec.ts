import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemiTrackerCardComponent } from './chemi-tracker-card.component';

describe('ChemiTrackerCardComponent', () => {
  let component: ChemiTrackerCardComponent;
  let fixture: ComponentFixture<ChemiTrackerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemiTrackerCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChemiTrackerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
