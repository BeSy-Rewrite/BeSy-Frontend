export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api/v1',
    paperlessUrl: 'http://localhost:8000',

    // Keycloak configuration
    identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
    clientId: 'besy-dev',
    requiredRole: "orderer",
    approveOrdersRole: "approver",

    nominatimUrl: 'https://nominatim.openstreetmap.org/search',

    // Caching and performance, in milliseconds
    cacheDurationMs: 5 * 60 * 1000, // 5 minutes
    searchAndFilterDebounceMs: 100,
    saveActiveFiltersDebounceMs: 5000
};
