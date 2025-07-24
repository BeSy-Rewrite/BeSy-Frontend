import { Injectable } from '@angular/core';
import { GuardResult, MaybeAsync, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
/**
 * DefaultGuard is an Angular route guard that checks if the user is authenticated and authorized
 * before allowing access to certain routes. It uses the AuthenticationService to verify the user's
 * authentication status and roles.
 * If the user is not authenticated or does not have the required role, they are redirected to
 * the unauthorized page.
 */
export class DefaultGuard {

  constructor(private readonly authService: AuthenticationService,
    private readonly router: Router) { }

  canActivate(): MaybeAsync<GuardResult> {
    const isAuthenticated = this.authService.hasValidToken();
    const isAuthorized = this.authService.getRoles().includes(environment.requiredRole);

    if (isAuthenticated && isAuthorized) {
      return true;
    }
    this.router.navigate(['/unauthorized'], { skipLocationChange: true });
    return false;
  }
}
