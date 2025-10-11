import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
/**
 * ApproveOrdersGuard is an Angular route guard that checks if the user is authorized to approve orders.
 * It uses the AuthenticationService to verify if the user has the required role for approving orders.
 * If the user does not have the required role, the unauthorized page is displayed.
 *
 * This guard does not check for authentication status, it only checks for authorization.
 * In non-production environments, the guard allows access without checks for easier development and testing.
 */
export class ApproveOrdersGuard implements CanActivate {

  constructor(private readonly authService: AuthenticationService,
    private readonly router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): MaybeAsync<GuardResult> {

    const isAuthorized = this.authService.isAuthorizedFor(environment.approveOrdersRole);
    if (!environment.production || isAuthorized) {
      return true;
    }
    this.router.navigate(['/unauthorized'], { skipLocationChange: true });
    return false;
  }

}
