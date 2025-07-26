export const environment = {
    production: true,
    apiUrl: 'https://api.besy.hs-esslingen.com',

    // Keycloak configuration
    identityProviderUrl: 'https://auth.insy.hs-esslingen.com/realms/insy',
    clientId: 'besy',
    requiredRole: "besy",
    approveOrdersRole: "dekanat"
};
