import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonPatentComponent } from './non-patent.component';

describe('NonPatentComponent', () => {
  let component: NonPatentComponent;
  let fixture: ComponentFixture<NonPatentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonPatentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NonPatentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
