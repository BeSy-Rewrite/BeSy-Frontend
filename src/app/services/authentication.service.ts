import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private oAuthService: OAuthService,
    private readonly router: Router) {
    this.oAuthService.configure(authCodeFlowConfig);
    this.oAuthService.setStorage(localStorage);

    this.initializeAuthentication();

    this.oAuthService.setupAutomaticSilentRefresh();
  }

  /**
   * Initializes the authentication process.
   * This method loads the discovery document and attempts to log in the user.
   * If the user is redirected back to the application after login, it navigates to the original URL. 
   */
  private initializeAuthentication(): void {
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      const url = this.oAuthService.state;

      if (url) {
        this.router.navigateByUrl(decodeURIComponent(url));
      }
    });
  }

  /**
   * Initiates the login process by redirecting the user to the OAuth server.
   * The user will be redirected back to the application after successful login.
   */
  login(): void {
    this.oAuthService.initCodeFlow(window.location.pathname);
  }

  /**
   * Logs out the user and redirects them to the home page.
   */
  logout(): void {
    this.oAuthService.revokeTokenAndLogout();
  }

  /**
   * Checks if the user has a valid token.
   * @returns {boolean} True if the user has a valid ID token and access token, false otherwise.
   */
  hasValidToken(): boolean {
    return this.oAuthService.hasValidIdToken() && this.oAuthService.hasValidAccessToken();
  }

  /**
   * Retrieves the roles of the authenticated user.
   * @returns {string[]} An array of roles assigned to the user.
   */
  getRoles(): string[] {
    return this.oAuthService.getIdentityClaims()?.['realm_access']?.['roles'] ?? [];
  }

  /**
   * Retrieves the username of the authenticated user.
   * @returns {string | undefined} The username if available, otherwise undefined.
   */
  getUsername(): string | undefined {
    return this.oAuthService.getIdentityClaims()?.['name'];
  }
}
