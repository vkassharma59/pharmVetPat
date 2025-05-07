import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScientificDocsComponent } from './scientific-docs.component';

describe('ScientificDocsComponent', () => {
  let component: ScientificDocsComponent;
  let fixture: ComponentFixture<ScientificDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScientificDocsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScientificDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
