import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildPagingComponent } from './child-paging.component';

describe('ChildPagingComponent', () => {
  let component: ChildPagingComponent;
  let fixture: ComponentFixture<ChildPagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildPagingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChildPagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
