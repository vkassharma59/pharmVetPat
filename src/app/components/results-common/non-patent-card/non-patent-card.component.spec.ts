import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonPatentCardComponent } from './non-patent-card.component';

describe('NonPatentCardComponent', () => {
  let component: NonPatentCardComponent;
  let fixture: ComponentFixture<NonPatentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonPatentCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NonPatentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
