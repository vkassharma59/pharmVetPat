import { ComponentFixture, TestBed } from '@angular/core/testing';

import { pharmaDatabaseSearchComponent } from './pharma-database-search.component';

describe('pharmaDatabaseSearchComponent', () => {
  let component: pharmaDatabaseSearchComponent;
  let fixture: ComponentFixture<pharmaDatabaseSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [pharmaDatabaseSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(pharmaDatabaseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
