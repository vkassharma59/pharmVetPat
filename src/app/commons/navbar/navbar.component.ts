import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DemoRequestComponent } from '../../components/demo-request/demo-request.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  @Output() UpdateSignIn: EventEmitter<any> = new EventEmitter<any>();
  @Output() showSignInModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() SignInModal: any;
  @Input()
  userAuth: any;
  showMenu = false;
  openDropdown: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private dialog: MatDialog) {}

  // ngOnInit(): void {
  //   this.UpdateSignIn.emit();
  //   console.log(this.userAuth)
  // }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['userAuth']) {
  //     // Handle the change in userAuth input
  //     console.log(this.userAuth);
  //     this.updateUI();
  //   }
  // }

  handleOpenSignInModal() {
    this.showSignInModal.emit(true);
    this.toggleNavbar();
  }

  handleLogout() {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('userEmail', '');
      localStorage.setItem('userName', '');
      localStorage.setItem('userId', '');
      localStorage.setItem('auth', ''); // Store the auth object
      localStorage.setItem('loggedIn', '');
    }
    window.location.reload();
  }
  toggleNavbar() {
    this.showMenu = !this.showMenu;
  }

  toggleDropdown(event: Event, dropdownName: string) {
    event.stopPropagation();
    if (this.openDropdown === dropdownName) {
      this.openDropdown = null;
    } else {
      this.openDropdown = dropdownName;
    }
  }

  updateUI() {
    // Mark the component for check to trigger change detection
    this.cdr.markForCheck();
  }

  OpenQueryModal() {
    const dialogRef = this.dialog.open(DemoRequestComponent, {
      width: '800px',
      height: '800px',
      panelClass: 'full-screen-modal',
    });
  }
}
