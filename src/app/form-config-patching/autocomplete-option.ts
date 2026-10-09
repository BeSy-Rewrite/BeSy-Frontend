/**
 * Represents an option for an autocomplete field.
 *
 * @template T The type of the value associated with the option.
 * @property {string} label - The display label for the option.
 * @property {T} value - The underlying value associated with the option.
 */
export type AutocompleteOption<T> = {
  label: string;
  value: T;
};
