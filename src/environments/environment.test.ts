export const environment = {
    production: true,
    apiUrl: 'https://api.test.besy.hs-esslingen.com/api/v1',

    // Keycloak configuration
    identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
    clientId: 'besy-test',
    requiredRole: "besy",
    approveOrdersRole: "dekanat",

    nominatimUrl: 'https://nominatim.openstreetmap.org/search',

    // Caching and performance, in milliseconds
    cacheDurationMs: 5 * 60 * 1000, // 5 minutes
    searchAndFilterDebounceMs: 100
};
