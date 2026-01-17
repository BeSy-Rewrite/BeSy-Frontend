import { OrderStatus } from '../app/api-services-v2';

export const environment = {
  production: true,
  apiUrl: 'https://test.besy.hs-esslingen.com/api/v1',
  apiVersionEndpoint: 'https://test.besy.hs-esslingen.com/v3/api-docs',
  paperlessUrl: 'https://paperless.test.besy.hs-esslingen.com',

  footerLinks: [{ name: 'InSy', link: 'https://insy.hs-esslingen.com' }],

  bugReportUrl: 'https://github.com/BeSy-Rewrite/BeSy-Frontend/issues/new/choose',

  // Keycloak configuration
  identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
  clientId: 'besy-test',
  requiredRole: 'orderer',
  approveOrdersRole: 'approver',

  nominatimUrl: 'https://nominatim.openstreetmap.org/search',

  // Caching and performance, in milliseconds
  cacheDurationMs: 5 * 60 * 1000, // 5 minutes
  searchAndFilterDebounceMs: 100,
  saveActiveFiltersDebounceMs: 5000,
  trackingInterval: 30 * 1000, // 30 seconds

  orderFieldClassPrefix: 'order-field-',

  INSY_POSTABLE_STATES: [OrderStatus.SETTLED, OrderStatus.ARCHIVED] as OrderStatus[],

  // Wrapped banner configuration
  wrappedEnabled: true,
  wrappedBannerEnabled: true,
  // 0-indexed months: 11 = December, 0 = January (half-year wrap)
  // Length must be 2, first is half-year wrapped month second is full-year wrapped month
  wrappedBannerMonths: [5, 11] as number[],
  wrappedUrl: '/wrap',
};
