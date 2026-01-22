import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-unauthorized',
  imports: [
    MatButtonModule
  ],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
})
export class UnauthorizedComponent {
  constructor(protected authService: AuthenticationService) { }
}
