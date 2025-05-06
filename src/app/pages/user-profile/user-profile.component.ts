import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  user = signal<any>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.user.set(this.authService.getUser());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Show image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async uploadProfileImage(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const formData = new FormData();
      formData.append('avatar', this.selectedFile);

      // Use authService's pb instance directly to update the user's avatar
      const userId = this.user()?.id;
      if (userId) {
        await this.authService.pb.collection('users').update(userId, formData);
        
        // Refresh auth data to get updated avatar URL
        await this.authService.refreshAuth();
        
        // Reload user data to show updated avatar
        this.loadUserData();
        
        this.successMessage.set('Profile picture updated successfully');
        
        // Clear selected file and preview
        this.selectedFile = null;
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set(null);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      this.errorMessage.set(error.message || 'Failed to update profile picture');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelUpload(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Helper function to format role for display
  formatRole(role: string): string {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
}
