import { OrderStatus as state } from '../apiv2';

const NBSP = '\u00A0';

export const USED_STATES: state[] = [
    state.InProgress,
    state.Completed,
    state.ApprovalsReceived,
    state.Approved,
    state.Sent,
    state.Settled,
    state.Archived
];

export const STATE_DISPLAY_NAMES = new Map<state | string, string>([
    [state.InProgress, `In${NBSP}Bearbeitung`],
    [state.Completed, 'Fertiggestellt'],
    [state.ApprovalsReceived, `Genehmigungen${NBSP}erhalten`],
    [state.Approved, 'Genehmigt'],
    [state.Rejected, 'Abgelehnt'],
    [state.Sent, 'Abgesendet'],
    [state.Settled, 'Abgeschlossen'],
    [state.Archived, 'Archiviert'],
    [state.Deleted, 'Gelöscht']
]);

export const STATE_ICONS = new Map<state | string, string>([
    [state.InProgress, '⏳'],
    [state.Completed, '✔️'],
    [state.ApprovalsReceived, '🆗'],
    [state.Approved, '👌'],
    [state.Rejected, '❌'],
    [state.Sent, '📤'],
    [state.Settled, '✅'],
    [state.Archived, '📦'],
    [state.Deleted, '🗑️']
]);

export const STATE_FONT_ICONS = new Map<state | string, string>([
    [state.InProgress, 'hourglass_top'],
    [state.Completed, 'check_circle'],
    [state.ApprovalsReceived, 'task_alt'],
    [state.Approved, 'thumb_up'],
    [state.Rejected, 'thumb_down'],
    [state.Sent, 'send'],
    [state.Settled, 'verified'],
    [state.Archived, 'archive'],
    [state.Deleted, 'delete']
]);

export const STATE_DESCRIPTIONS = new Map<state | string, string>([
    [state.InProgress, 'Die Bestellung kann derzeit bearbeitet werden.'],
    [state.Completed, 'Die Bearbeitung der Bestellung ist abgeschlossen.'],
    [state.ApprovalsReceived, 'Die erforderlichen Genehmigungen wurden erhalten.'],
    [state.Approved, 'Die Bestellung wurde vom Dekanat genehmigt.'],
    [state.Rejected, 'Die Bestellung wurde abgelehnt.'],
    [state.Sent, 'Die Bestellung wurde versendet.'],
    [state.Settled, 'Die Bestellung wurde abgeschlossen.'],
    [state.Archived, 'Die Bestellung wurde archiviert.'],
    [state.Deleted, 'Die Bestellung wurde gelöscht.']
]);

export const STATE_CHANGE_TO_NAMES = new Map<state | string, string>([
    [state.InProgress, "Auf 'In Bearbeitung' setzen"],
    [state.Completed, 'Fertigstellen'],
    [state.ApprovalsReceived, 'Genehmigungen erhalten'],
    [state.Approved, 'Genehmigen'],
    [state.Rejected, 'Ablehnen'],
    [state.Sent, 'Als Abgesendet markieren'],
    [state.Settled, 'Abschließen'],
    [state.Archived, 'Archivieren'],
    [state.Deleted, 'Löschen']
]);
