export const environment = {
  production: true, // Disable authentication in non-production environments
  apiUrl: 'https://besy.hs-esslingen.com/api/v1',
  paperlessUrl: 'https://paperless.besy.hs-esslingen.com',

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
};
