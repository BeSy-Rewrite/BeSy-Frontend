export const environment = {
    production: true,
    apiUrl: 'https://api.test.besy.hs-esslingen.com/api/v1',

    // Keycloak configuration
    identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
    clientId: 'besy-test',
    requiredRole: "besy",
    approveOrdersRole: "dekanat",
    nominatimUrl: 'https://nominatim.openstreetmap.org/search'
};
