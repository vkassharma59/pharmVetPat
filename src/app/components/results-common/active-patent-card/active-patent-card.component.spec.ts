import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivePatentCardComponent } from './active-patent-card.component';

describe('ActivePatentCardComponent', () => {
  let component: ActivePatentCardComponent;
  let fixture: ComponentFixture<ActivePatentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivePatentCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivePatentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
