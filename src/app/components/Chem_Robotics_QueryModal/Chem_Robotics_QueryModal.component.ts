import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoginService } from '../../services/LoginService/login.service';

@Component({
  selector: 'app-Chem_Robotics_QueryModal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Chem_Robotics_QueryModal.component.html',
  styleUrls: ['./Chem_Robotics_QueryModal.component.css'], // ✅ corrected 'styleUrl' to 'styleUrls'
})
export class Chem_Robotics_QueryModalComponent {
  constructor(
    public dialogRef: MatDialogRef<Chem_Robotics_QueryModalComponent>,
    private LoginService: LoginService,
    @Inject(MAT_DIALOG_DATA)
    public data: { raise_query_object: any; handleLoading: any }
  ) {}

  private auth: any;
  email: any;
  comment: any;
  platform: any;
  search = '';
  selectedFile: File | null = null;
  fileSizeError: boolean = false;
  isSubmitDisabled: boolean = true;

  ngOnInit() {
    this.auth = localStorage.getItem('auth');
    this.auth = JSON.parse(this.auth);
    this.email = this.auth.email;

    // ✅ Updated platform name
    this.platform = 'pharmVetPat-N';

    if (this.data.raise_query_object?.keyword) {
      this.search = this.data.raise_query_object.keyword;
    } else {
      this.search = this.data.raise_query_object?.criteria[0]?.keyword;
    }
    this.validateForm();
  }

  validateForm() {
    this.isSubmitDisabled =
      !this.email || !this.comment || this.fileSizeError;
  }

  handleSendRaiseQuery() {
    if (this.isSubmitDisabled) {
      return; // Prevent accidental submission
    }

    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('comment', this.comment);
    formData.append('query', JSON.stringify(this.data.raise_query_object));
    formData.append('platform', this.platform); // ✅ uses 'pharmVetPat-N'
    formData.append('search', this.search);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.dialogRef.close();
    this.data.handleLoading.emit(true);

    this.LoginService.queryWithFile(formData, this.auth.auth_token).subscribe({
      next: (res) => {
        this.data.handleLoading.emit(false);
        alert('Query Sent');
      },
      error: (e) => {
        console.error('Error:', e);
        this.data.handleLoading.emit(false);
        alert(e.message || 'Error occurred while sending the query.');
      },
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files ? input.files[0] : null;

    if (this.selectedFile && this.selectedFile.size > 2 * 1024 * 1024) {
      this.fileSizeError = true;
    } else {
      this.fileSizeError = false;
    }
    this.validateForm();
  }
}
