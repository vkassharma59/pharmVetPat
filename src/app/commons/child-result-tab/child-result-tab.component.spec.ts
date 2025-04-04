import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildResultTabComponent } from './child-result-tab.component';

describe('ChildResultTabComponent', () => {
  let component: ChildResultTabComponent;
  let fixture: ComponentFixture<ChildResultTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildResultTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChildResultTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
