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
    'Für Hardware und Software, die in der Vorzugsliste des Rechenzentrums - RZ nicht enthalten ist, ist die Beschaffung mit dem RZ geklärt und liegt dieser Bestellung bei.',
  flag_furniture_permission:
    'Für Gegenstände, die in der Vorzugsliste des Facility Managements nicht enthalten sind, ist die Beschaffung mit dem FM geklärt und liegt dieser Bestellung bei',
  flag_furniture_room: 'Der erforderliche Raum für die Aufnahme der Möbel steht zur Verfügung.',
  flag_investment_room: 'Der erforderliche Raum für die Aufnahme der Geräte steht zur Verfügung.',
  flag_investment_structural_measures:
    'Für Gegenstände, die in der Vorzugsliste des Facility Managements nicht enthalten sind, ist die Beschaffung mit dem FM geklärt und liegt dieser Bestellung bei.',
  flag_media_permission:
    'Für die Beschaffung ist die Zustimmung der Medientechnik erforderlich. Die Zustimmung der Medientechnik liegt dieser Bestellung bei.',
};

export const APPROVALS_FIELD_GROUPS: ApprovalFieldGroup[] = [
  {
    title: 'Zustimmung bei Bestellung von DV-Komponenten (Hardware/ Software)',
    fields: ['flag_edv_permission'],
  },
  {
    title: 'Zustimmung bei Bestellung von Möbeln',
    fields: ['flag_furniture_permission', 'flag_furniture_room'],
  },
  {
    title: 'Zustimmung bei Bestellung von Geräten (baulich-infrastrukturell relevant)',
    hint: 'Hinweis: Folgekosten sind aus Mittel der Organisationseinheit zur finanzieren',
    fields: ['flag_investment_room', 'flag_investment_structural_measures'],
  },
  {
    title: 'Zustimmung bei Bestellung von medientechnischen Einrichtungen und Geräten',
    fields: ['flag_media_permission'],
  },
];

export type ApprovalFieldGroup = {
  title: string;
  hint?: string;
  fields: string[];
};
