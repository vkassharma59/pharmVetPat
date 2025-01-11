import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './commons/navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './components/home/home.component';
import { LoaderComponent } from './commons/loader/loader.component';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Auth_operations } from './Utils/SetToken';
import { UserPriviledgeService } from './services/user_priviledges/user-priviledge.service';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginService } from './services/LoginService/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FooterComponent,
    RouterOutlet,
    NavbarComponent,
    HttpClientModule,
    HomeComponent,
    SearchResultsComponent,
    CommonModule,
    LoaderComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'project';
  showResult: boolean = false;
  MainDataResultShow: any = {};
  SignInModal: boolean = false;

  username: string | null = null;
  loading = false;
  userAuth = {
    name: '',
    email: '',
    user_id: '',
    auth_token: '',
  };
  code: any = '';

  AllDataStates: any = {
    0: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    1: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    2: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    3: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    4: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    5: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    6: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    7: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    8: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    9: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    10: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    11: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    12: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    13: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    14: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    15: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    16: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    17: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    18: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    19: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    20: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    21: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    22: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    23: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
    24: {
      technical_route: {},
      chemical_directory: {},
      basic_product: {},
      dmf_supplier: {},
      impurity: {},
    },
  };

  emptyAllDataStates = this.AllDataStates;

  CurrentAPIBody = {
    body: {},
    page_no: 1,
    api_url: '',
    currentTab: '',
    actual_value: '',
  };

  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private UserPriviledgeService: UserPriviledgeService,
    private LoginService: LoginService,
    private route: ActivatedRoute
  ) {}

  disableRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  handleScrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  showSuccess(toast: any) {
    this.toastr.error('hello success', 'thank you');
  }

  handleShowResult(data: any) {
    this.showResult = true;
    this.CurrentAPIBody.api_url = data?.API_URL;
    this.CurrentAPIBody.body = data?.body;
    this.CurrentAPIBody.currentTab = data?.currentTab;
    this.CurrentAPIBody.actual_value = data?.actual_value;
  }

  handleShowSignInModal(data: any) {
    this.SignInModal = data;
  }

  handleSetLoading(data: any) {
    this.loading = data;
  }

  handleBackButton(data: any) {
    this.showResult = data;
  }

  handleDataResult(data: any) {
    this.AllDataStates = this.emptyAllDataStates;
    this.MainDataResultShow = { ...data };
    if (
      this.MainDataResultShow?.ros_count &&
      this.MainDataResultShow?.ros_data
    ) {
      for (let i = 0; i < this.MainDataResultShow?.ros_data?.length; i++) {
        this.AllDataStates[i].technical_route =
          this.MainDataResultShow?.ros_data[i];
      }
    } else {
      if (this.MainDataResultShow?.chem_dir_data) {
        for (
          let i = 0;
          i < this.MainDataResultShow?.chem_dir_data?.length;
          i++
        ) {
          this.AllDataStates[i].chemical_directory =
            this.MainDataResultShow?.chem_dir_data[i];
        }
      }
    }
  }

  handleShow() {
    // console.log(this.MainDataResultShow);
  }

  ngOnInit() {
    // this.router.resetConfig(routes);
    this.UpdateSignIn(true);
  }

  UserPriviledgeUpdate() {
    this.UserPriviledgeService.getUserPriviledgesData().subscribe({
      next: (res: any) => {
        if (res && res?.data && res?.data?.user_info) {
          const userInfo = res.data.user_info;
          this.userAuth = {
            name: userInfo.name,
            email: userInfo.email,
            user_id: userInfo.user_id,
            auth_token: userInfo.auth_token,
          };
          let priviledge = `user_${this.userAuth?.user_id}`;

          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(
              'priviledge_json',
              JSON.stringify(userInfo?.privilege_json[priviledge])
            );
          }
        }
      },
      error: (e) => {
        console.error('Error:', e);
      },
    });
  }

  UpdateSignIn(data: any) {
    if (localStorage && typeof localStorage !== 'undefined') {
      const loggedInString = localStorage.getItem('loggedIn');
      if (loggedInString) {
        try {
          const userLoggedIn = JSON.parse(loggedInString);
          if (userLoggedIn) {
            const authString = localStorage.getItem('auth');
            let auth = JSON.parse(authString || '');
            Auth_operations.UpdateToken(auth?.auth_token);
            if (authString) {
              this.userAuth = JSON.parse(authString);
              this.username = this.userAuth.name;
            }
            this.UserPriviledgeUpdate();
          }
        } catch (error) {
          console.error('Error parsing loggedIn from localStorage', error);
        }
      } else {
        try {
          this.code = this.route.snapshot.queryParamMap.get('access_key');
          const urlParams = new URLSearchParams(window.location.search);
          this.code = urlParams.get('access_key');
          Auth_operations.setLoginToken(this.code);
          if (this.code) {
            this.LoginService.loginWithCode(this.code).subscribe({
              next: (res: any) => {
                if (res && res.data && res.data.user_info) {
                  const userInfo = res.data.user_info;
                  this.userAuth = {
                    name: userInfo.name,
                    email: userInfo.email,
                    user_id: userInfo.user_id,
                    auth_token: userInfo.auth_token,
                  };
                  let priviledge = `user_${this.userAuth?.user_id}`;
                  if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('userEmail', userInfo.email);
                    localStorage.setItem('userName', userInfo.name);
                    localStorage.setItem('account_type', userInfo.account_type);
                    localStorage.setItem('starting_date', userInfo.start_date);
                    localStorage.setItem('expired_date', userInfo.expired_date);
                    localStorage.setItem('userId', userInfo.user_id);
                    localStorage.setItem('auth', JSON.stringify(this.userAuth)); // Store the auth object
                    localStorage.setItem('loggedIn', JSON.stringify(true));
                    localStorage.setItem('loginToken', this.code);
                    localStorage.setItem(
                      'priviledge_json',
                      JSON.stringify(userInfo?.privilege_json[priviledge])
                    );
                  }
                  const urlParams = new URLSearchParams(window.location.search);

                  // Check if the access_key is present
                  if (urlParams.has('access_key')) {
                    // Remove the access_key parameter
                    urlParams.delete('access_key');

                    // Update the URL without reloading the page
                    const newUrl =
                      window.location.pathname + '?' + urlParams.toString();
                    window.history.replaceState({}, '', newUrl);
                  }

                  Auth_operations.UpdateToken(this.userAuth.auth_token);
                }
                // this.auth = true;
                // this.showSignInModal.emit(false);
                window.location.reload();
              },
              error: (e) => {
                console.error('Error:', e);
              },
            });
          }
        } catch (error) {
          console.error('Error while login with code :', error);
        }
      }
    }
  }
}
