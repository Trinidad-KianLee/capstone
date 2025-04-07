import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ForwardDocumentService {

  document: any;

  getDocument(): any {
    return this.document;
  }

  setDocument(doc: any): void {
    this.document = doc;
  }
}
