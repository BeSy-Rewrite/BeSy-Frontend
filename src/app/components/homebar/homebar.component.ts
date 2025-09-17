import { Component } from '@angular/core';
import { NavbarButtonComponent } from '../navbar-button/navbar-button.component';
import { AuthenticationService } from '../../services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homebar',
  imports: [NavbarButtonComponent,
    MatButtonModule
  ],
  templateUrl: './homebar.component.html',
  styleUrls: ['./homebar.component.scss'],
})
export class HomebarComponent {
  constructor(public readonly authService: AuthenticationService, private router: Router) { }

navigateToHome() {
  this.router.navigate(['/']);
}

}
