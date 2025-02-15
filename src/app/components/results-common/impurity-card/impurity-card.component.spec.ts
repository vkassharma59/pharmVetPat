import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpurityCardComponent } from './impurity-card.component';

describe('ImpurityCardComponent', () => {
  let component: ImpurityCardComponent;
  let fixture: ComponentFixture<ImpurityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpurityCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpurityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
