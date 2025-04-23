import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestComponent } from './request.component';
import { AuthService } from '../../services/auth/auth.service';
import { DocumentsService } from '../../services/documents.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Import if animations are used
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import forms modules if needed by template

describe('RequestComponent', () => {
  let component: RequestComponent;
  let fixture: ComponentFixture<RequestComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDocumentsService: jasmine.SpyObj<DocumentsService>;

  beforeEach(async () => {
    // Create spy objects for the services
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUser', 'isLoggedIn', 'authStoreModel']); // Add methods/getters used by component
    mockDocumentsService = jasmine.createSpyObj('DocumentsService', ['createDocumentWithAttachment']);

    // Configure the testing module
    await TestBed.configureTestingModule({
      imports: [
        RequestComponent, // Import the standalone component
        NoopAnimationsModule, // Use NoopAnimationsModule for testing animations
        FormsModule,          // Include if template uses template-driven forms features
        ReactiveFormsModule // Include if template uses reactive forms features
      ],
      providers: [
        // Provide the mock services
        { provide: AuthService, useValue: mockAuthService },
        { provide: DocumentsService, useValue: mockDocumentsService }
      ]
    }).compileComponents();

    // Set up mock return values before creating the component
    // Example: Simulate logged-in user
    // Mock getters using Object.getOwnPropertyDescriptor
    (Object.getOwnPropertyDescriptor(mockAuthService, 'isLoggedIn')?.get as jasmine.Spy<() => boolean>).and.returnValue(true);
    (Object.getOwnPropertyDescriptor(mockAuthService, 'authStoreModel')?.get as jasmine.Spy<() => any>).and.returnValue({ id: 'testUserId' });
    mockAuthService.getUser.and.returnValue({ id: 'testUserId' }); // Mock getUser if directly called

    fixture = TestBed.createComponent(RequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more specific tests here for component methods and interactions
  // Example:
  // it('should call createDocumentWithAttachment on submitRequest with valid data', () => {
  //   // Arrange: Set up component state (selectedPlaceholder, selectedFile, etc.)
  //   component.selectedPlaceholder = 'Contracts';
  //   component.selectedSubType = '1.1 Contracts with vendors';
  //   component.selectedFile = new File([''], 'test.pdf', { type: 'application/pdf' });
  //   mockDocumentsService.createDocumentWithAttachment.and.resolveTo({ id: 'newDocId' }); // Mock successful creation
  //
  //   // Act
  //   component.submitRequest();
  //
  //   // Assert
  //   expect(mockDocumentsService.createDocumentWithAttachment).toHaveBeenCalled();
  //   // Add more specific assertions about the arguments passed if needed
  // });
  //
  // it('should NOT call createDocumentWithAttachment if file is missing', () => {
  //   // Arrange
  //   component.selectedPlaceholder = 'Contracts';
  //   component.selectedFile = undefined;
  //
  //   // Act
  //   component.submitRequest();
  //
  //   // Assert
  //   expect(component.fileRequiredError).toBeTrue();
  //   expect(mockDocumentsService.createDocumentWithAttachment).not.toHaveBeenCalled();
  // });
});
