export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000',

    // Keycloak configuration
    identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
    clientId: 'besy-dev',
    requiredRole: "besy",
    approveOrdersRole: "dekanat"
};
