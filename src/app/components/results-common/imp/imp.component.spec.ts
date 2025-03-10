import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpComponent } from './imp.component';

describe('ImpComponent', () => {
  let component: ImpComponent;
  let fixture: ComponentFixture<ImpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
