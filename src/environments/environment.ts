import { OrderStatus } from '../app/api-services-v2';

export const environment = {
  production: true, // Disable authentication in non-production environments
  apiUrl: 'https://besy.hs-esslingen.com/api/v1',
  apiVersionEndpoint: 'https://besy.hs-esslingen.com/v3/api-docs',
  paperlessUrl: 'https://paperless.besy.hs-esslingen.com',

  bugReportUrl: 'https://github.com/BeSy-Rewrite/BeSy-Frontend/issues/new?template=bug_report.md',

  // Keycloak configuration
  identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
  clientId: 'besy',
  requiredRole: 'orderer',
  approveOrdersRole: 'approver',

  nominatimUrl: 'https://nominatim.openstreetmap.org/search',

  // Caching and performance, in milliseconds
  cacheDurationMs: 5 * 60 * 1000, // 5 minutes
  searchAndFilterDebounceMs: 100,
  saveActiveFiltersDebounceMs: 5000,

  orderFieldClassPrefix: 'order-field-',

  INSY_POSTABLE_STATES: [OrderStatus.SETTLED, OrderStatus.ARCHIVED] as OrderStatus[],
};
