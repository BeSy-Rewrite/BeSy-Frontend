import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';
import { authCodeFlowConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private readonly oAuthService: OAuthService,
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
   * Checks if the user is authenticated and has the required role.
   * @returns {boolean} True if the user is authenticated and has the required role, false otherwise.
   */
  isAuthorized(): boolean {
    return this.isAuthorizedFor(environment.requiredRole);
  }

  /**
   * Checks if the user has a specific role.
   * @param {string} role - The role to check against the user's roles.
   * @returns {boolean} True if the user has the specified role, false otherwise.
   */
  isAuthorizedFor(role: string): boolean {
    return this.getRoles().includes(role) && this.hasValidToken();
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
