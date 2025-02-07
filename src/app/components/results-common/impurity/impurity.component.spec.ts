import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpurityComponent } from './impurity.component';

describe('ImpurityComponent', () => {
  let component: ImpurityComponent;
  let fixture: ComponentFixture<ImpurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpurityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
