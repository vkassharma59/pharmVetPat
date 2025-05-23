import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildPagningTableComponent } from './child-pagning-table.component';

describe('ChildPagningTableComponent', () => {
  let component: ChildPagningTableComponent;
  let fixture: ComponentFixture<ChildPagningTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildPagningTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChildPagningTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
