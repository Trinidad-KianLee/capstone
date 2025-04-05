import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase'; // Ensure the correct import for PocketBase

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private pb: PocketBase;
  private collection = 'documents';

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

async createDocument(data: any){
  const createdRecord = await this.pb.collection('document').create(data);
}

async forwardDocument(data: any){
  const createdRecord = await this.pb.collection('request').create(data);
}

}
