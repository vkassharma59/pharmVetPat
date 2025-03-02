import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicRouteComponent } from './basic-route.component';

describe('BasicRouteComponent', () => {
  let component: BasicRouteComponent;
  let fixture: ComponentFixture<BasicRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicRouteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
