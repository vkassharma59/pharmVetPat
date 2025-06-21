import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  Component,
  Input,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { LoginService } from '../../services/LoginService/login.service';
import { Auth_operations } from '../../Utils/SetToken';

declare var google: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DropdownModule, NgIf, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() setLoadingState: EventEmitter<any> = new EventEmitter<any>();
@Output() priviledgeModal = new EventEmitter<string>();

  @Input() transparent: boolean = false;
  @Input() homePage: boolean = false;
  @Input() userAuth: any;

  constructor(private LoginService: LoginService) {}

  languages: any = [];
  lists: any = [];
  labels: { label: string; checked: boolean }[] = [];
  selectedCount: number = 0; // Initialize selectedCount here
  selectedLanguage: any = {
    name: '',
    code: '',
  };
  showSecondForm: boolean = false;
  showProducts = false;
  descDropdown:boolean[]= [false,false,false];
  servicesDropdown = false;
  overAgroProducts = false;
  overProductsDropdown = false;
  overHeaderDesc = false;
  overDescDropdown = false;
  overHeaderservices = false;
  overServicesDropdown = false;
  showMenu = false;
  selectedMenu = '';
  loadingState = 'Submit';

  accessKey: any = '';

  email = '';
  password = '';
  user: any = null;

  dropdownOpen = false;

  details = ['Profession', 'Professional Detail', 'Personal Detail'];
  showThirdForm: boolean = false;
  ngOnInit() {
    const LoginCode = localStorage.getItem('loginToken');
    this.accessKey = LoginCode;
    this.getLabels();
    this.languages = [
      { name: 'Australia', code: 'AU' },
      { name: 'Brazil', code: 'BR' },
      { name: 'China', code: 'CN' },
      { name: 'Egypt', code: 'EG' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'India', code: 'IN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Spain', code: 'ES' },
      { name: 'United States', code: 'US' },
    ];
    this.lists = [
      'ChemRobotics offers Trial access to users who wish to evaluate ChemRobotics database. It important to note that ChemRobotics is a premium Database that requires a paid subscription.',
      'According to ChemRobotics Database policy, we kindly request users to register using their official Company Domain email. We regret to inform you that personal email providers such as Gmail, Yahoo and Rediff etc., are not accepted for the Sign-Up process.',
      'ChemRobotics offers Trial access to users who wish to evaluate ChemRobotics database. It important to note that ChemRobotics is a premium Database that requires a paid subscription.',
      'According to ChemRobotics Database policy, we kindly request users to register using their official Company Domain email. We regret to inform you that personal email providers such as Gmail, Yahoo and Rediff etc., are not accepted for the Sign-Up process.',
    ];
    this.user = localStorage.getItem('auth');
    this.user = JSON.parse(this.user);
    this.loadGoogleTranslate();
    this.updateCount();
  }

  loadGoogleTranslate() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
       
      }
      googleTranslateElementInit();
    `;
    document.head.appendChild(script);
  }

  handleOpenDropDown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getLabels() {
    for (let i = 0; i < 15; i++) {
      this.labels.push({
        label: `Patent Agent ${i + 1}`,
        checked: false,
      });
    }
  }

  handleLogout() {
    localStorage.removeItem('auth');
    localStorage.removeItem('priviledge_json');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userIpAddress');
    localStorage.removeItem('userName');
    localStorage.removeItem('loginToken');
    localStorage.removeItem('account_type');
    localStorage.removeItem('starting_date');
    localStorage.removeItem('expired_date');
    this.userAuth = null;
    const urlParams = new URLSearchParams(window.location.search);

    // Check if the access_key is present
    if (urlParams.has('access_key')) {
      // Remove the access_key parameter
      urlParams.delete('access_key');

      // Update the URL without reloading the page
      const newUrl = window.location.pathname + '?' + urlParams.toString();
      window.history.replaceState({}, '', newUrl);
    }

    window.location.reload();
  }

  convertUserIdToBase64(userId: any) {
    return btoa(userId.toString());
  }
 handleLogin(): void {
    debugger
  if (!this.email || !this.password) {
    alert('Fields are required');
    return;
  }

  this.loadingState = 'Loading...';
  this.LoginService.login(this.email, this.password).subscribe({
    next: (res) => {
      if (res && res.data && res.data.user_info) {
        const userInfo = res.data.user_info;
        const privilege_json = userInfo.privilege_json;
        const userPrivilegeKey = `user_${userInfo.user_id}`;
        const privilegeData = privilege_json?.[userPrivilegeKey];

        this.userAuth = {
          name: userInfo.name,
          email: userInfo.email,
          user_id: userInfo.user_id,
          auth_token: userInfo.auth_token,
        };

        this.saveUserDataToLocalStorage(userInfo); // ✅ Save base data
debugger
        // ✅ Privilege check
        if (!this.hasSearchPrivileges(privilegeData)) {
          this.setLoadingState.emit(false);
          this.priviledgeModal.emit(
            'You do not have permission to Search or View. Please upgrade the account.'
          );
          return;
        }

        // ✅ Save specific privilege to localStorage after check
        localStorage.setItem(
          'priviledge_json',
          JSON.stringify(privilegeData)
        );
debugger
        const loginToken = this.convertUserIdToBase64(userInfo.user_id);
        Auth_operations.setLoginToken(loginToken);
        Auth_operations.UpdateToken(this.userAuth.auth_token);

        this.loadingState = 'Submit';
        window.location.reload(); // Refresh page after successful login
      }
    },
    error: (e) => {
      debugger
      console.error('❌ Login Error:', e);
      this.loadingState = 'Submit';
      if (!e.status) {
        alert(e.message);
      }
    },
  });
}

private hasSearchPrivileges(privilegeData: any): boolean {
  if (!privilegeData) return false;

  const dbPrivileges = privilegeData?.['pharmvetpat-mongodb'];
  return (
    dbPrivileges?.View !== 'false' &&
    dbPrivileges?.Search !== '' &&
    dbPrivileges?.Search !== 0
  );
}
 private saveUserDataToLocalStorage(userInfo: any): void {
  const loginToken = this.convertUserIdToBase64(userInfo.user_id);
  localStorage.setItem('userEmail', userInfo.email);
  localStorage.setItem('userName', userInfo.name);
  localStorage.setItem('account_type', userInfo.account_type);
  localStorage.setItem('starting_date', userInfo.start_date);
  localStorage.setItem('expired_date', userInfo.expired_date);
  localStorage.setItem('userId', userInfo.user_id);
  localStorage.setItem('auth', JSON.stringify(this.userAuth));
  localStorage.setItem('loggedIn', JSON.stringify(true));
  localStorage.setItem('loginToken', loginToken);
}
  // handleLogin(): void {
  //   if (!this.email || !this.password) {
  //     return alert('fields are required');
  //   }
  //   this.loadingState = 'Loading...';
  //   this.LoginService.login(this.email, this.password).subscribe({
  //     next: (res) => {
  //       if (res && res.data && res.data.user_info) {
  //         const userInfo = res.data.user_info;
  //         this.userAuth = {
  //           name: userInfo.name,
  //           email: userInfo.email,
  //           user_id: userInfo.user_id,
  //           auth_token: userInfo.auth_token,
  //         };
  //         let priviledge = `user_${this.userAuth?.user_id}`;
  //         const loginToken = this.convertUserIdToBase64(userInfo.user_id);

  //         if (typeof window !== 'undefined' && window.localStorage) {
  //           localStorage.setItem('userEmail', userInfo.email);
  //           localStorage.setItem('userName', userInfo.name);
  //           localStorage.setItem('account_type', userInfo.account_type);
  //           localStorage.setItem('starting_date', userInfo.start_date);
  //           localStorage.setItem('expired_date', userInfo.expired_date);
  //           localStorage.setItem('userId', userInfo.user_id);
  //           localStorage.setItem('auth', JSON.stringify(this.userAuth)); // Store the auth object
  //           localStorage.setItem('loggedIn', JSON.stringify(true));
  //           localStorage.setItem('loginToken', loginToken);
  //           localStorage.setItem(
  //             'priviledge_json',
  //             JSON.stringify(userInfo?.privilege_json[priviledge])
  //           );
  //         }

  //         Auth_operations.setLoginToken(loginToken);
  //         Auth_operations.UpdateToken(this.userAuth.auth_token);
  //       }
  //       // this.auth = true;
  //       // this.showSignInModal.emit(false);
  //       this.loadingState = 'Submit';
  //       window.location.reload();
  //     },
  //     error: (e) => {
  //       console.error('Error:', e);
  //       this.loadingState = 'Submit';
  //       if (!e.status) {
  //         alert(e.message);
  //       }
  //     },
  //   });
  // }

  updateCount() {
    this.selectedCount = this.labels.filter((label) => label.checked).length;
  }

  toggleCheckbox(index: number) {
    this.labels[index].checked = !this.labels[index].checked;
    this.updateCount();
  }

  toggleSecondForm() {
    this.showSecondForm = !this.showSecondForm;
  }

  isNextButtonEnabled() {
    return this.selectedCount > 0;
  }
  toggleThirdForm() {
    this.showThirdForm = !this.showThirdForm;
  }

  enterHeader() {
    this.overProductsDropdown = true;
    this.showDropdown();
  }

  leaveHeader() {
    this.overProductsDropdown = false;
    setTimeout(() => {
      this.hideDropdown();
    }, 10);
  }

  enterProductBox() {
    this.overAgroProducts = true;
    this.showDropdown();
  }

  leaveProductBox() {
    this.overAgroProducts = false;
    setTimeout(() => {
      this.hideDropdown();
    }, 10);
  }

  showDropdown() {
    this.showProducts = true;
  }

  hideDropdown() {
    if (!this.overProductsDropdown && !this.overAgroProducts) {
      this.showProducts = false;
    }
  }

  enterHeaderDesc() {
    this.overHeaderDesc = true;
  }

  leaveHeaderDesc() {
    this.overHeaderDesc = false;
  }

  enterDescBox() {
    this.overDescDropdown = true;
  }

  leaveDescBox() {
    this.overDescDropdown = false;
  }

  enterHeaderServices() {
    this.overHeaderservices = true;
  }

  leaveHeaderServices() {
    this.overHeaderservices = false;
  }

  enterServicesBox() {
    this.overServicesDropdown = true;
  }

  leaveServicesBox() {
    this.overServicesDropdown = false;
  }

  openMenu(value: boolean) {
    this.showMenu = value;
    this.selectedMenu = '';
    if (this.homePage) {
      if (this.showMenu) {
        this.transparent = false;
      } else {
        this.transparent = window.pageYOffset > 70 ? false : true;
      }
    }
  }
isMenuOpen:boolean=false;
dropdown(index:number):void{
    // this.isdataVisible=this.isdataVisible.map(()=> false);
    // this.isdataVisible[index]=true;
    this.descDropdown[index]=!this.descDropdown[index];
  }
  menuDropDown():void{
    this.isMenuOpen=!this.isMenuOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.homePage) {
      if (this.showMenu) {
        this.transparent = false;
      } else {
        this.transparent = window.pageYOffset > 70 ? false : true;
      }
    }
  }
}