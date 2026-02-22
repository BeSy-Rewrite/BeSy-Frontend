import { OrderStatus as state } from '../api-services-v2';

const NBSP = '\u00A0';

export const USED_STATES: state[] = [
  state.IN_PROGRESS,
  state.COMPLETED,
  state.APPROVALS_RECEIVED,
  state.APPROVAL_REQUESTED,
  state.APPROVED,
  state.SENT,
  state.SETTLED,
  state.ARCHIVED,
];

export const STATE_DISPLAY_NAMES = new Map<state | string, string>([
  [state.IN_PROGRESS, `In${NBSP}Bearbeitung`],
  [state.COMPLETED, 'Fertiggestellt'],
  [state.APPROVALS_RECEIVED, `Genehmigungen${NBSP}erhalten`],
  [state.APPROVAL_REQUESTED, `Genehmigung${NBSP}angefordert`],
  [state.APPROVED, 'Genehmigt'],
  [state.REJECTED, 'Abgelehnt'],
  [state.SENT, 'Abgesendet'],
  [state.SETTLED, 'Abgeschlossen'],
  [state.ARCHIVED, 'Archiviert'],
  [state.DELETED, 'Gelöscht'],
]);

export const STATE_ICONS = new Map<state | string, string>([
  [state.IN_PROGRESS, '⏳'],
  [state.COMPLETED, '✔️'],
  [state.APPROVALS_RECEIVED, '🆗'],
  [state.APPROVAL_REQUESTED, '📋'],
  [state.APPROVED, '👌'],
  [state.REJECTED, '❌'],
  [state.SENT, '📤'],
  [state.SETTLED, '✅'],
  [state.ARCHIVED, '📦'],
  [state.DELETED, '🗑️'],
]);

export const STATE_FONT_ICONS = new Map<state | string, string>([
  [state.IN_PROGRESS, 'hourglass_top'],
  [state.COMPLETED, 'check_circle'],
  [state.APPROVALS_RECEIVED, 'task_alt'],
  [state.APPROVAL_REQUESTED, 'assignment_ind'],
  [state.APPROVED, 'thumb_up'],
  [state.REJECTED, 'thumb_down'],
  [state.SENT, 'send'],
  [state.SETTLED, 'verified'],
  [state.ARCHIVED, 'archive'],
  [state.DELETED, 'delete'],
]);

export const STATE_DESCRIPTIONS = new Map<state | string, string>([
  [state.IN_PROGRESS, 'Die Bestellung kann derzeit bearbeitet werden.'],
  [state.COMPLETED, 'Die Bearbeitung der Bestellung ist abgeschlossen.'],
  [state.APPROVALS_RECEIVED, 'Die erforderlichen Genehmigungen wurden erhalten.'],
  [state.APPROVAL_REQUESTED, 'Die Genehmigung wurde angefordert.'],
  [state.APPROVED, 'Die Bestellung wurde vom Dekanat genehmigt.'],
  [state.REJECTED, 'Die Bestellung wurde abgelehnt.'],
  [state.SENT, 'Die Bestellung wurde versendet.'],
  [state.SETTLED, 'Die Bestellung wurde abgeschlossen.'],
  [state.ARCHIVED, 'Die Bestellung wurde archiviert.'],
  [state.DELETED, 'Die Bestellung wurde gelöscht.'],
]);

export const STATE_CHANGE_TO_NAMES = new Map<state | string, string>([
  [state.IN_PROGRESS, "Auf 'In Bearbeitung' setzen"],
  [state.COMPLETED, 'Fertigstellen'],
  [state.APPROVALS_RECEIVED, 'Genehmigungen erhalten'],
  [state.APPROVAL_REQUESTED, 'Genehmigung anfordern'],
  [state.APPROVED, 'Genehmigen'],
  [state.REJECTED, 'Ablehnen'],
  [state.SENT, 'Als Abgesendet markieren'],
  [state.SETTLED, 'Abschließen'],
  [state.ARCHIVED, 'Archivieren'],
  [state.DELETED, 'Löschen'],
]);
