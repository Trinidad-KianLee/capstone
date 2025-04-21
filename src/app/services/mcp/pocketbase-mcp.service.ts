import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class PocketBaseMcpService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('http://127.0.0.1:8090');
  }

  // MCP Tool: Create Document
  async createDocument(data: any) {
    try {
      return await this.pb.collection('document').create(data);
    } catch (error) {
      console.error('MCP Error - Create Document:', error);
      throw error;
    }
  }

  // MCP Tool: Get Document
  async getDocument(id: string) {
    try {
      return await this.pb.collection('document').getOne(id);
    } catch (error) {
      console.error('MCP Error - Get Document:', error);
      throw error;
    }
  }

  // MCP Tool: List Documents
  async listDocuments(filter?: string) {
    try {
      return await this.pb.collection('document').getList(1, 50, {
        filter: filter
      });
    } catch (error) {
      console.error('MCP Error - List Documents:', error);
      throw error;
    }
  }

  // MCP Tool: Update Document
  async updateDocument(id: string, data: any) {
    try {
      return await this.pb.collection('document').update(id, data);
    } catch (error) {
      console.error('MCP Error - Update Document:', error);
      throw error;
    }
  }

  // MCP Tool: Delete Document
  async deleteDocument(id: string) {
    try {
      return await this.pb.collection('document').delete(id);
    } catch (error) {
      console.error('MCP Error - Delete Document:', error);
      throw error;
    }
  }

  // MCP Tool: Forward Document
  async forwardDocument(data: any) {
    try {
      return await this.pb.collection('request').create(data);
    } catch (error) {
      console.error('MCP Error - Forward Document:', error);
      throw error;
    }
  }
}