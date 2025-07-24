import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
/**
 * DefaultGuard is an Angular route guard that checks if the user is authenticated and authorized
 * before allowing access to certain routes. It uses the AuthenticationService to verify the user's
 * authentication status and roles.
 * If the user is not authenticated or does not have the required role, the unauthorized page is displayed.
 */
export class DefaultGuard implements CanActivate {

  constructor(private readonly authService: AuthenticationService,
    private readonly router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): MaybeAsync<GuardResult> {

    const isAuthenticated = this.authService.hasValidToken();
    const isAuthorized = this.authService.isAuthorized();

    if (isAuthenticated && isAuthorized) {
      return true;
    }
    this.router.navigate(['/unauthorized'], { skipLocationChange: true });
    return false;
  }
}
