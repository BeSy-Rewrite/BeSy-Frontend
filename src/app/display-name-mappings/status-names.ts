import { OrderStatus as state } from '../api';

export const statusDisplayNames = new Map<state | string, string>([
    [state.IN_PROGRESS, 'In Bearbeitung'],
    [state.COMPLETED, 'Fertiggestellt'],
    [state.APPROVALS_RECEIVED, 'Genehmigungen erhalten'],
    [state.APPROVED, 'Genehmigt'],
    [state.REJECTED, 'Abgelehnt'],
    [state.SENT, 'Abgesendet'],
    [state.SETTLED, 'Abgeschlossen'],
    [state.ARCHIVED, 'Archiviert'],
    [state.DELETED, 'Gelöscht']
]);

export const statusIcons = new Map<state | string, string>([
    [state.IN_PROGRESS, '⏳'],
    [state.COMPLETED, '✔️'],
    [state.APPROVALS_RECEIVED, '🆗'],
    [state.APPROVED, '👌'],
    [state.REJECTED, '❌'],
    [state.SENT, '📤'],
    [state.SETTLED, '✅'],
    [state.ARCHIVED, '📦'],
    [state.DELETED, '🗑️']
]);
