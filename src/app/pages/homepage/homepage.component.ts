import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-homepage',
  imports: [
    MatButtonModule,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent {
  constructor(public readonly authService: AuthenticationService) { }
}
