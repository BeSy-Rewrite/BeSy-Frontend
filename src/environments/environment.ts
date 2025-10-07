export const environment = {
    production: true, // Disable authentication in non-production environments
    apiUrl: 'https://api.besy.hs-esslingen.com',

    // Keycloak configuration
    identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
    clientId: 'besy',
    requiredRole: "besy",
    approveOrdersRole: "dekanat",
    
    nominatimUrl: 'https://nominatim.openstreetmap.org/search',
    cacheDurationMs: 5 * 60 * 1000 // 5 minutes
};
