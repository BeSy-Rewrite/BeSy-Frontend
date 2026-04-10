import { OrderStatus as state } from '../api-services-v2';

const NBSP = '\u00A0';

export const USED_STATES: state[] = [
  state.IN_PROGRESS,
  state.COMPLETED,
  state.DEKAN_PENDING,
  state.APPROVED,
  state.SENT,
  state.SETTLED,
  state.ARCHIVED,
  state.DELETED,
];

export const STATE_DISPLAY_NAMES = new Map<state | string, string>([
  [state.IN_PROGRESS, `In${NBSP}Bearbeitung`],
  [state.COMPLETED, 'Fertiggestellt'],
  [state.APPROVALS_RECEIVED, `Genehmigungen${NBSP}erhalten`],
  [state.DEKAN_PENDING, `Genehmigung${NBSP}angefordert`],
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
  [state.DEKAN_PENDING, '📋'],
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
  [state.DEKAN_PENDING, 'assignment_ind'],
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
  [state.DEKAN_PENDING, 'Die Genehmigung durch das Dekanat wurde angefordert.'],
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
  [state.DEKAN_PENDING, 'Genehmigung anfordern'],
  [state.APPROVED, 'Genehmigen'],
  [state.REJECTED, 'Ablehnen'],
  [state.SENT, 'Jetzt an BIC senden!'],
  [state.SETTLED, 'Abschließen'],
  [state.ARCHIVED, 'Archivieren'],
  [state.DELETED, 'Löschen'],
]);

export const STATE_CHANGE_TO_DESCRIPTIONS = new Map<state, string>([
  [
    state.IN_PROGRESS,
    'Die Bestellung auf "In Bearbeitung" setzen, damit sie bearbeitet werden kann.',
  ],
  [state.COMPLETED, 'Die Bearbeitung der Bestellung abschließen.'],
  [state.APPROVALS_RECEIVED, 'Die erforderlichen Genehmigungen als erhalten markieren.'],
  [state.DEKAN_PENDING, 'Die Genehmigung durch das Dekanat anfordern.'],
  [state.APPROVED, 'Die Bestellung genehmigen.'],
  [state.REJECTED, 'Die Bestellung ablehnen.'],
  [state.SENT, 'Die Bestellung jetzt an BIC senden!'],
  [state.SETTLED, 'Die Bestellung abschließen.'],
  [state.ARCHIVED, 'Die Bestellung archivieren.'],
  [state.DELETED, 'Die Bestellung löschen.'],
]);

export type StateTransitionLookup = Partial<Record<state, Partial<Record<state, string>>>>;

export const STATE_CHANGE_FROM_TO_NAMES: StateTransitionLookup = {
  [state.IN_PROGRESS]: {
    [state.COMPLETED]: 'Fertigstellen',
    [state.DELETED]: 'Löschen',
  },
  [state.COMPLETED]: {
    [state.DEKAN_PENDING]: 'Genehmigung anfordern',
    [state.IN_PROGRESS]: 'Zurück zu "In Bearbeitung"',
    [state.DELETED]: 'Löschen',
    [state.APPROVED]: 'Dekanat überspringen',
  },
  [state.DEKAN_PENDING]: {
    [state.APPROVED]: 'Genehmigen',
    [state.COMPLETED]: 'Ablehnen',
  },
  [state.APPROVED]: {
    [state.SENT]: 'An BIC senden!',
  },
  [state.SENT]: {
    [state.SETTLED]: 'Abschließen',
  },
  [state.SETTLED]: {
    [state.ARCHIVED]: 'Archivieren',
  },
  [state.DELETED]: {
    [state.IN_PROGRESS]: 'Wiederherstellen',
  },
};

export const STATE_CHANGE_FROM_TO_DESCRIPTIONS: StateTransitionLookup = {
  [state.IN_PROGRESS]: {
    [state.COMPLETED]: 'Die Bearbeitung der Bestellung abschließen.',
    [state.DELETED]: 'Die Bestellung löschen.',
  },
  [state.COMPLETED]: {
    [state.DEKAN_PENDING]: 'Die Bestellung zur Genehmigung durch das Dekanat einreichen.',
    [state.IN_PROGRESS]: 'Die Bestellung zurück in den Bearbeitungsmodus setzen.',
    [state.DELETED]: 'Die fertiggestellte Bestellung löschen.',
    [state.APPROVED]: 'Die Bestellung direkt genehmigen - Dekanat überspringen.',
  },
  [state.DEKAN_PENDING]: {
    [state.APPROVED]: 'Die Bestellung vom Dekanat genehmigen.',
    [state.COMPLETED]: 'Die Bestellung vom Dekanat ablehnen.',
  },
  [state.APPROVED]: {
    [state.SENT]: 'Die genehmigte Bestellung an BIC senden.',
  },
  [state.SENT]: {
    [state.SETTLED]: 'Die versendete Bestellung als abgeschlossen markieren.',
  },
  [state.SETTLED]: {
    [state.ARCHIVED]: 'Die abgeschlossene Bestellung archivieren.',
  },
  [state.DELETED]: {
    [state.IN_PROGRESS]:
      'Die gelöschte Bestellung wiederherstellen und zur Bearbeitung aktivieren.',
  },
};

export const STATE_CHANGE_FROM_TO_ICONS: StateTransitionLookup = {
  [state.IN_PROGRESS]: {
    [state.COMPLETED]: '✔️',
    [state.DELETED]: '🗑️',
  },
  [state.COMPLETED]: {
    [state.DEKAN_PENDING]: '📋',
    [state.IN_PROGRESS]: '↩️',
    [state.DELETED]: '🗑️',
    [state.APPROVED]: '👌',
  },
  [state.DEKAN_PENDING]: {
    [state.APPROVED]: '👌',
    [state.COMPLETED]: '❌',
  },
  [state.APPROVED]: {
    [state.SENT]: '📤',
  },
  [state.SENT]: {
    [state.SETTLED]: '✅',
  },
  [state.SETTLED]: {
    [state.ARCHIVED]: '📦',
  },
  [state.DELETED]: {
    [state.IN_PROGRESS]: '🔄',
  },
};

// Order of states for the buttons in the order details view.
export const STATE_CHANGE_BUTTON_DISPLAY_ORDER: state[] = [
  state.ARCHIVED,
  state.SETTLED,
  state.SENT,
  state.DEKAN_PENDING,
  state.APPROVED,
  state.REJECTED,
  state.COMPLETED,
  state.IN_PROGRESS,
  state.DELETED,
];
