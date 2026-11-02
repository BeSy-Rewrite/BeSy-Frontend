import { computed, Injectable, signal } from '@angular/core';
import { ItemTableModel } from './item-table-model';

/**
 * Keeps the editing state of the items table (added / to be deleted items).
 * IMPORTANT: Do not use `providedIn: 'root'` – it is intentionally registered in the `providers` of
 * `OrderEditComponent`, so that both the tab component AND the save strategy
 * receive the same instance, without having to know about each other.
 */
@Injectable()
export class OrderItemsStateService {
  readonly items = signal<ItemTableModel[]>([]);
  private readonly initialItems = signal<ItemTableModel[]>([]);

  private readonly itemsToDelete = new Set<ItemTableModel>();
  private readonly itemsToUpdate = new Set<ItemTableModel>();

  readonly isDirty = computed(
    () =>
      this.items().some(item => item.item_id === undefined) ||
      this.itemsToDelete.size > 0 ||
      this.itemsToUpdate.size > 0
  );

  /**
   * Resets the item list to the given items, clearing any pending deletions or updates.
   * This is typically called when the component is initialized, the order is reloaded or after the items are saved.
   */
  resetItemList(items?: ItemTableModel[]): void {
    items ??= this.initialItems();
    this.items.set(items);
    this.initialItems.set(items);
    this.itemsToDelete.clear();
    this.itemsToUpdate.clear();
  }

  addItem(item: ItemTableModel): void {
    this.items.update(current => [...current, { ...item, position: current.length + 1 }]);
  }

  updateItem(oldItem: ItemTableModel, newItem: ItemTableModel): void {
    if (oldItem.item_id !== newItem.item_id) {
      throw new Error('Cannot update item_id of an existing item.');
    }

    if (newItem.item_id === undefined) {
      this.items.update(current => current.map(i => (i === oldItem ? { ...i, ...newItem } : i)));
    } else {
      this.itemsToUpdate.add(newItem);

      this.items.update(current =>
        current.map(i => (i.item_id === newItem.item_id ? { ...i, ...newItem } : i))
      );
    }
  }

  removeItem(item: ItemTableModel): void {
    if (item.item_id !== undefined) {
      this.itemsToDelete.add(item);
    }
    this.items.update(current =>
      current.filter(i => i !== item).map((i, index) => ({ ...i, position: index + 1 }))
    );
  }

  getPendingCreations(): ItemTableModel[] {
    return this.items().filter(item => item.item_id === undefined);
  }

  getPendingUpdates(): ItemTableModel[] {
    return [...this.itemsToUpdate];
  }

  getPendingDeletions(): ItemTableModel[] {
    return [...this.itemsToDelete];
  }
}
