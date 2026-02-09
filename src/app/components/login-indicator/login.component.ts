import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  imports: [MatTooltipModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    readonly authService: AuthenticationService,
    private readonly router: Router
  ) {}

  /**
   * Handles the login/logout functionality based on the user's authentication status.
   * If the user has a valid token, it logs them out and navigates to the home page.
   * If the user does not have a valid token, it initiates the login process.
   */
  handleLogInOut() {
    if (this.authService.hasValidToken()) {
      this.authService.logout();
      this.router.navigate(['/']);
    } else {
      this.authService.login();
    }
  }

  /**
   * Generates user initials based on the username from the authentication service.
   * It extracts the first letter of each word in the username, converts them to uppercase,
   * and joins them together.
   *
   * @returns {string} - The initials of the user, or '?' if the username is not available.
   */
  getUserInitials(): string {
    const username = this.authService.getUsername();
    if (!username) return '?';

    // Match Unicode letters that are preceded by a non-letter or start of string
    const initials = username.match(/(?:^|[^\p{L}])(\p{L})/gu);
    return initials
      ? initials
          .map(match => match.replaceAll(/[^\p{L}]/gu, ''))
          .join('')
          .toUpperCase()
      : '?';
  }
}
