import { Injectable } from '@angular/core';
import { GuardResult, MaybeAsync, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DefaultGuard {

  constructor(private readonly authService: AuthenticationService,
    private readonly router: Router) { }

  canActivate(): MaybeAsync<GuardResult> {
    const isAuthenticated = this.authService.hasValidToken();
    const isAuthorised = this.authService.getRoles().includes(environment.requiredRole);
    if (isAuthenticated && isAuthorised) {
      return true;
    }
    this.router.navigate(['/unauthorised'], { skipLocationChange: true });
    return false;
  }
}
