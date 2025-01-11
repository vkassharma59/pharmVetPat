import { TestBed } from '@angular/core/testing';
import { MainSearchService } from './main-search.service';

describe('MainSearchService', () => {
  let service: MainSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
