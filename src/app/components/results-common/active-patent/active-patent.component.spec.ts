import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivePatentComponent } from './active-patent.component';

describe('ActivePatentComponent', () => {
  let component: ActivePatentComponent;
  let fixture: ComponentFixture<ActivePatentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivePatentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivePatentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
