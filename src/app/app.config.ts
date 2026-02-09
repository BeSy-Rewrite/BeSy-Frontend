import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthConfig, provideOAuthClient } from 'angular-oauth2-oidc';
import * as zod from 'zod';
import { de } from 'zod/v4/locales';
import { environment } from '../environments/environment';
import { provideApi } from './api-services-v2';
import { routes } from './app.routes';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { trackingInterceptor } from './services/tracking.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideLuxonDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    provideHttpClient(withFetch(), withInterceptorsFromDi(), withInterceptors([trackingInterceptor])),
    provideOAuthClient({
      resourceServer: {
        allowedUrls: [environment.apiUrl],
        sendAccessToken: true,
      },
    }),
    UnsavedChangesGuard,
    provideApi(environment.apiUrl),
  ],
};

// Configure Zod for German error messages
zod.config(de());

// Reference: https://www.npmjs.com/package/angular-oauth2-oidc
export const authCodeFlowConfig: AuthConfig = {
  // URL of the Identity Provider
  issuer: environment.identityProviderUrl,

  // URL of the SPA to redirect the user after login
  redirectUri: globalThis.location.origin + '/',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: environment.clientId,

  // Just needed if your auth server demands a secret. In general, this
  // is a sign that the auth server is not configured with SPAs in mind
  // and it might not enforce further best practices vital for security
  // such applications.
  // dummyClientSecret: 'secret',

  responseType: 'code',

  // set the scope for the permissions the client should request
  // The first four are defined by OIDC.
  // Important: Request offline_access to get a refresh token
  // The api scope is a usecase specific one
  scope: 'profile email offline_access roles',
};
