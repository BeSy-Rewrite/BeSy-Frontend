import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'besy-wrapped-banner',
  imports: [CommonModule, RouterModule],
  templateUrl: './wrapped-banner.component.html',
  styleUrl: './wrapped-banner.component.scss',
})
export class WrappedBannerComponent {
  visible = false;
  readonly ctaUrl = environment.wrappedUrl;

  constructor(private readonly authService: AuthenticationService) {
    this.visible = this.shouldShowBanner();
    authService.authStateChanged.subscribe(() => {
      this.visible = this.shouldShowBanner();
    });
  }

  private shouldShowBanner(): boolean {
    if (
      !('wrappedBannerEnabled' in environment) ||
      !environment.wrappedBannerEnabled ||
      !this.isWrappedEnabled()
    ) {
      return false;
    }
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const dismissedKey = this.getDismissKey(year, month);

    const isDismissed = typeof localStorage !== 'undefined' && !!localStorage.getItem(dismissedKey);
    return this.isGenerationMonth() && !isDismissed && this.authService.hasValidToken();
  }

  protected isGenerationMonth(): boolean {
    const months = Array.isArray(environment.wrappedBannerMonths)
      ? environment.wrappedBannerMonths
      : [];
    return months.includes(new Date().getMonth());
  }

  dismiss(): void {
    const now = new Date();
    const key = this.getDismissKey(now.getFullYear(), now.getMonth());
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, 'true');
      }
    } catch {
      // ignore storage failures
    }
    this.visible = false;
  }

  private getDismissKey(year: number, month: number): string {
    return `besy-wrapped-banner-dismissed-${year}-${month}`;
  }

  onWrappedPage(): boolean {
    return globalThis.location.pathname === this.ctaUrl || globalThis.location.hash === this.ctaUrl;
  }

  protected isWrappedEnabled(): boolean {
    return !!('wrappedEnabled' in environment) && environment.wrappedEnabled;
  }
}
