
export const statusDisplayNames = new Map<string, string>([
    ['IN_PROGRESS', 'In Bearbeitung'],
    ['COMPLETED', 'Fertiggestellt'],
    ['APPROVALS_RECEIVED', 'Genehmigungen erhalten'],
    ['APPROVED', 'Genehmigt'],
    ['REJECTED', 'Abgelehnt'],
    ['SENT', 'Abgesendet'],
    ['SETTLED', 'Abgeschlossen'],
    ['ARCHIVED', 'Archiviert'],
    ['DELETED', 'Gelöscht']
]);

export const statusIcons = new Map<string, string>([
    ['IN_PROGRESS', '⏳'],
    ['COMPLETED', '✔️'],
    ['APPROVALS_RECEIVED', '🆗'],
    ['APPROVED', '👌'],
    ['REJECTED', '❌'],
    ['SENT', '📤'],
    ['SETTLED', '✅'],
    ['ARCHIVED', '📦'],
    ['DELETED', '🗑️']
]);
