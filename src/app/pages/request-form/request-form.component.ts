import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ForwardDocumentService } from '../../services/states/forward-document.service';
import { DocumentsService } from '../../services/documents.service';

@Component({
  selector: 'app-request-form',
  imports: [ReactiveFormsModule],
  templateUrl: './request-form.component.html',
  styleUrl: './request-form.component.css'
})
export class RequestFormComponent {
  form!: FormGroup;
  document: any;
  constructor(
    public authService: AuthService,
    public forwardDocumentSevice: ForwardDocumentService,
    private documentService: DocumentsService,
    private fb: FormBuilder){
    
    this.document = this.forwardDocumentSevice.getDocument(); 
    
    this.form=this.fb.group({
      sent_by: this.authService.getUser().id,
      sent_to: '',
      document: this.document.id
    })
    
    console.log(this.document)
  }
  onSubmit(){
    this.documentService.forwardDocument(this.form.value);
}
}
