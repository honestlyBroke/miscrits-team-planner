/**
 * Filter utilities for Team Planner
 */

import { MiscritMeta, StatusTag, StatRating, StatKey } from './miscritsMeta';

export interface PlannerFilters {
  name: string;
  rarities: Set<string>;
  elements: Set<string>;
  stats: Record<StatKey, number | undefined>; // undefined = no filter, 1-5 = minimum rating
  buffTags: Set<StatusTag>;
  debuffTags: Set<StatusTag>;
}

/**
 * Create default filter state
 */
export function createDefaultFilters(): PlannerFilters {
  return {
    name: '',
    rarities: new Set(),
    elements: new Set(),
    stats: {
      hp: undefined,
      spd: undefined,
      ea: undefined,
      pa: undefined,
      ed: undefined,
      pd: undefined,
    },
    buffTags: new Set(),
    debuffTags: new Set(),
  };
}

/**
 * Check if a Miscrit matches the current filters
 */
export function matchesFilters(miscrit: MiscritMeta, filters: PlannerFilters): boolean {
  // Name filter (case-insensitive substring match)
  if (filters.name.trim() !== '') {
    const searchTerm = filters.name.toLowerCase();
    if (!miscrit.firstName.toLowerCase().includes(searchTerm)) {
      return false;
    }
  }

  // Rarity filter
  if (filters.rarities.size > 0) {
    if (!filters.rarities.has(miscrit.rarity)) {
      return false;
    }
  }

  // Element filter
  if (filters.elements.size > 0) {
    if (!filters.elements.has(miscrit.element)) {
      return false;
    }
  }

  // Stat filters: minRating means "this stat must be >= minRating"
  const statKeys: StatKey[] = ['hp', 'spd', 'ea', 'pa', 'ed', 'pd'];
  for (const key of statKeys) {
    const minRating = filters.stats[key];
    if (minRating !== undefined) {
      const rating = miscrit.statRatings[key];
      if (rating < minRating) {
        return false;
      }
    }
  }

  // Buff tags filter
  if (filters.buffTags.size > 0) {
    let hasAnyBuffTag = false;
    for (const tag of filters.buffTags) {
      if (miscrit.tags.has(tag)) {
        hasAnyBuffTag = true;
        break;
      }
    }
    if (!hasAnyBuffTag) {
      return false;
    }
  }

  // Debuff tags filter
  if (filters.debuffTags.size > 0) {
    let hasAnyDebuffTag = false;
    for (const tag of filters.debuffTags) {
      if (miscrit.tags.has(tag)) {
        hasAnyDebuffTag = true;
        break;
      }
    }
    if (!hasAnyDebuffTag) {
      return false;
    }
  }

  return true;
}
