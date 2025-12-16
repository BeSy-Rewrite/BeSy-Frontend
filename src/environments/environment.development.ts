import { OrderStatus } from '../app/api-services-v2';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  paperlessUrl: 'http://localhost:8000',

  // Keycloak configuration
  identityProviderUrl: 'https://auth.it.hs-esslingen.de/realms/he-it',
  clientId: 'test',
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
