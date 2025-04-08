import { TestBed } from '@angular/core/testing';

import { TrrnGbrnService } from './trrn-gbrn.service';

describe('TrrnGbrnService', () => {
  let service: TrrnGbrnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrrnGbrnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
