import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthenticationService } from './services/authentication.service';
import { HomebarComponent } from './components/homebar/homebar.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatButtonModule,
    HomebarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'besy-frontend';
  environment = environment;

  constructor(public readonly authService: AuthenticationService) { }

}
