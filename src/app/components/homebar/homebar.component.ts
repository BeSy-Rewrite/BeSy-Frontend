import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginComponent } from "../login-indicator/login.component";
import { NavbarButtonComponent } from '../navbar-button/navbar-button.component';

@Component({
  selector: 'app-homebar',
  imports: [
    NavbarButtonComponent,
    MatButtonModule,
    LoginComponent
  ],
  templateUrl: './homebar.component.html',
  styleUrls: ['./homebar.component.css'],
})
export class HomebarComponent {
  constructor(public readonly authService: AuthenticationService, private readonly router: Router) { }

  navigateToHome() {
    this.router.navigate(['/']);
  }

}
