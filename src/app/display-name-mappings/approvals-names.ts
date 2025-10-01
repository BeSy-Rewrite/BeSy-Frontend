export const APPROVALS_FIELD_NAMES: Record<string, string> = {
    flag_edv_permission: 'RZ/EDV-Genehmigung',
    flag_furniture_permission: 'FM/Möbel-Genehmigung',
    flag_furniture_room: 'Möbel Platz vorhanden',
    flag_investment_room: 'Geräte Platz vorhanden',
    flag_investment_structural_measures: 'Investition: Bauliche Maßnahmen',
    flag_media_permission: 'Medientechnik Genehmigung',
};

export const APPROVALS_FIELD_DESCRIPTIONS: Record<string, string> = {
    flag_edv_permission:
        'Beschaffung von DV-Komponenten (Hardware/Software), die nicht in der RZ-Vorzugsliste stehen, ist mit dem Rechenzentrum abgestimmt; Zustimmung/Unterschrift des RZ liegt der Bestellung bei.',
    flag_furniture_permission:
        'Beschaffung von Möbeln, die nicht in der Vorzugsliste des Facility Managements stehen, ist mit dem FM abgestimmt; Zustimmung/Unterschrift des FM liegt der Bestellung bei.',
    flag_furniture_room:
        'Der erforderliche Raum für die Aufnahme der Möbel steht zur Verfügung.',
    flag_investment_room:
        'Der erforderliche Raum für die Aufnahme der Geräte steht zur Verfügung.',
    flag_investment_structural_measures:
        'Bei baulich-infrastrukturell relevanten Geräten sind Folgekosten durch die Organisationseinheit zu tragen; Beschaffung ist mit dem FM geklärt und Zustimmung/Unterschrift liegt der Bestellung bei.',
    flag_media_permission:
        'Für medientechnische Einrichtungen und Geräte ist die Zustimmung der Medientechnik erforderlich; Zustimmung/Unterschrift der Medientechnik liegt der Bestellung bei.',
};
