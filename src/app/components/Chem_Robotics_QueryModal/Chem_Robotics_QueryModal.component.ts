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
  styleUrl: './Chem_Robotics_QueryModal.component.css',
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

  ngOnInit() {
    this.auth = localStorage.getItem('auth');
    this.auth = JSON.parse(this.auth);
    this.email = this.auth.email;
    this.platform = 'technical-routes';
    if (this.data.raise_query_object?.keyword) {
      this.search = this.data.raise_query_object.keyword;
    } else {
      this.search = this.data.raise_query_object?.criteria[0]?.keyword;
    }
    console.log(this.data.raise_query_object?.criteria[0]?.keyword,"gvdfbdf",this.data.raise_query_object.keyword)
  }

  handleSendRaiseQuery() {
    if (!this.email || !this.comment) {
      return alert('All Fields are required');
    }
    this.dialogRef.close();
    this.data.handleLoading.emit(true);
    this.LoginService.query(
      this.email,
      this.comment,
      this.data.raise_query_object,
      this.platform,
      this.search,
      this.auth.auth_token
    ).subscribe({
      next: (res) => {
        this.data.handleLoading.emit(false);
        alert('Query Sent');
      },
      error: (e) => {
        console.error('Error:', e);
        this.data.handleLoading.emit(false);
        if (!e.status) {
          alert(e.message);
        }
      },
    });
  }
  onClose() {
    this.dialogRef.close();
  }
}
