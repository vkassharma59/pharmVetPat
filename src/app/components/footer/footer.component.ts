import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  footerdata: any = [];
  baseurl = 'https://www.chemrobotics.com/agropat/uploads/thumbnail/';
  accessKey: any = '';

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit() {
    const LoginCode = localStorage.getItem('loginToken');
    this.accessKey = LoginCode;
  }
}
