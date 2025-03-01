import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalDirectoryComponent } from './chemical-directory.component';

describe('ChemicalDirectoryComponent', () => {
  let component: ChemicalDirectoryComponent;
  let fixture: ComponentFixture<ChemicalDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemicalDirectoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChemicalDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
