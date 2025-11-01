import { create } from 'zustand';

/**
 * Type of a single filter value:
 * - `[string, string]`: for range filters (e.g., ['100', '500'] for price range)
 * - `boolean`: for toggle filters (e.g., isActive: true)
 */
type FilterValue = [string, string] | boolean;

/**
 * Global filter store state and actions
 */
type FilterState = {
  /** Current active filters stored as { [filterKey]: FilterValue } */
  filters: Record<string, FilterValue>;

  /** Set of callback functions to notify when filters are "applied" */
  listeners: Set<(filters: Record<string, FilterValue>) => void>;

  // ==================== Actions ====================

  /**
   * Update a specific filter by key
   * @param key - Filter identifier (e.g., 'category', 'price', 'inStock')
   * @param value - New filter value (boolean or range tuple)
   *
   * Note: This only updates local state. Use `applyFilters()` to trigger side effects.
   */
  setFilter: (key: string, value: FilterValue) => void;

  /**
   * Reset all filters to initial empty state
   */
  resetFilters: () => void;

  /**
   * Notify all subscribed listeners with the current filter state
   * Use this to trigger data fetching, URL updates, analytics, etc.
   */
  applyFilters: () => void;

  /**
   * Subscribe to filter "apply" events
   * @param callback - Function called every time `applyFilters()` is triggered
   * @returns void - Call `unsubscribeApply` to remove
   */
  subscribeApply: (callback: (filters: Record<string, FilterValue>) => void) => void;

  /**
   * Unsubscribe a previously added listener
   * @param callback - Exact same function reference passed to `subscribeApply`
   */
  unsubscribeApply: (callback: (filters: Record<string, FilterValue>) => void) => void;
};

/**
 * Filter Store using Zustand
 *
 * Usage:
 * - Use `setFilter` to update filters locally
 * - Call `applyFilters()` to broadcast changes (e.g., refetch data)
 * - Use `subscribeApply` in components/effects that need to react to apply
 *
 * Why separate `setFilter` and `applyFilters`?
 * → Prevents refetching on every keystroke during range input
 * → Allows "Apply" button or debounced apply
 */
export const useFilterStore = create<FilterState>((set, get) => ({
  // Initial state
  filters: {},
  listeners: new Set(),

  // Update a single filter in state
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  // Clear all filters
  resetFilters: () => set({ filters: {} }),

  // Trigger all listeners with current filters
  applyFilters: () => {
    const filters = get().filters;
    get().listeners.forEach((callback) => callback(filters));
  },

  // Add a listener for apply events
  subscribeApply: (callback) => {
    const { listeners } = get();
    listeners.add(callback);
    // Note: No auto-unsubscribe on component unmount — caller must manage
  },

  // Remove a listener
  unsubscribeApply: (callback) => {
    const { listeners } = get();
    listeners.delete(callback);
  },
}));
