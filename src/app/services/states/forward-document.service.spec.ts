import { TestBed } from '@angular/core/testing';

import { ForwardDocumentService } from './forward-document.service';

describe('ForwardDocumentService', () => {
  let service: ForwardDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForwardDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
