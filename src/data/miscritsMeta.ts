/**
 * Data layer for Miscrits
 * Loads and processes miscrits.json, provides utilities for stats and tags
 */

import miscritsData from '../../miscrits.json';

// ============= TYPES =============

export type StatTier = 'Weak' | 'Moderate' | 'Strong' | 'Elite' | 'Max';
export type StatRating = 1 | 2 | 3 | 4 | 5;
export type StatKey = 'hp' | 'spd' | 'ea' | 'pa' | 'ed' | 'pd';

export type StatusTag =
  | 'poison'
  | 'sleep'
  | 'confuse'
  | 'stat_down'
  | 'stat_up'
  | 'hp_steal'
  | 'hp_heal'
  | 'hot'
  | 'bleed'
  | 'dot'
  | 'accuracy_down'
  | 'accuracy_up'
  | 'paralyze'
  | 'negate'
  | 'chaos'
  | 'switch_curse'
  | 'antiheal'
  | 'antiheal_immunity'
  | 'block'
  | 'ethereal'
  | 'stat_steal';

export interface AbilityAdditional {
  type: string;
  ap?: number;
  turns?: number;
  target?: 'Self' | 'Foe';
  element?: string;
  name?: string;
  accuracy?: number;
  keys?: string[];
  true_dmg?: boolean;
  cooldown?: number;
  times?: number;
}

export interface Ability {
  id: number;
  name: string;
  ap?: number;
  accuracy?: number;
  element: string;
  type: string;
  target?: 'Self' | 'Foe';
  desc: string;
  enchant_desc?: string;
  keys?: string[];
  additional?: AbilityAdditional[];
  turns?: number;
  immunity?: number;
  cooldown?: number;
  times?: number;
}

export interface Miscrit {
  id: number;
  element: string;
  names: string[];
  rarity: string;
  hp: StatTier;
  spd: StatTier;
  ea: StatTier;
  pa: StatTier;
  ed: StatTier;
  pd: StatTier;
  abilities: Ability[];
  ability_order: number[];
  [key: string]: any;
}

export interface MiscritMeta {
  id: number;
  firstName: string;
  element: string;
  rarity: string;
  statRatings: Record<StatKey, StatRating>;
  tags: Set<StatusTag>;
}

// ============= CONVERSION UTILITIES =============

export function tierToRating(tier: StatTier): StatRating {
  const mapping: Record<StatTier, StatRating> = {
    'Weak': 1,
    'Moderate': 2,
    'Strong': 3,
    'Max': 4,
    'Elite': 5,
  };
  return mapping[tier] || 1;
}

export function ratingToTier(rating: StatRating): StatTier {
  const mapping: Record<StatRating, StatTier> = {
    1: 'Weak',
    2: 'Moderate',
    3: 'Strong',
    4: 'Max',
    5: 'Elite',
  };
  return mapping[rating];
}

// ============= TAG INFERENCE =============

export function inferTagsFromAbilities(abilities: Ability[]): Set<StatusTag> {
  const tags = new Set<StatusTag>();

  for (const ability of abilities) {
    const typeUpper = ability.type?.toUpperCase() || '';
    const descLower = (ability.desc || '').toLowerCase();
    const additionalList = ability.additional || [];

    // Type-based inference
    if (typeUpper === 'POISON') tags.add('poison');
    else if (typeUpper === 'SLEEP') tags.add('sleep');
    else if (typeUpper === 'CONFUSE') tags.add('confuse');
    else if (typeUpper === 'PARALYZE') tags.add('paralyze');
    else if (typeUpper === 'DOT') tags.add('dot');
    else if (typeUpper === 'HEAL') tags.add('hp_heal');
    else if (typeUpper === 'NEGATE') tags.add('negate');           // ✅ NEW
    else if (typeUpper === 'STAT_STEAL' || typeUpper === 'STATSTEAL') tags.add('stat_steal'); // ✅ NEW
    else if (typeUpper === 'BUFF') {
      // Buff can be positive or negative
      if (ability.ap !== undefined && ability.ap < 0) {
        tags.add('stat_down');
      } else if (ability.ap !== undefined && ability.ap > 0) {
        tags.add('stat_up');
      }
    }

    // Ability additional effects
    for (const additional of additionalList) {
      const addTypeUpper = additional.type?.toUpperCase() || '';

      if (addTypeUpper === 'POISON') tags.add('poison');
      else if (addTypeUpper === 'SLEEP') tags.add('sleep');
      else if (addTypeUpper === 'CONFUSE') tags.add('confuse');
      else if (addTypeUpper === 'PARALYZE') tags.add('paralyze');
      else if (addTypeUpper === 'HEAL') tags.add('hp_heal');
      else if (addTypeUpper === 'HOT') tags.add('hot');
      else if (addTypeUpper === 'LIFESTEAL') tags.add('hp_steal');
      else if (addTypeUpper === 'BLEED') tags.add('bleed');
      else if (addTypeUpper === 'DOT') tags.add('dot');
      else if (addTypeUpper === 'NEGATE') tags.add('negate');                  // ✅ NEW
      else if (addTypeUpper === 'STAT_STEAL' || addTypeUpper === 'STATSTEAL')  // ✅ NEW
        tags.add('stat_steal');
      else if (addTypeUpper === 'BUFF') {
        if (additional.ap !== undefined && additional.ap < 0) {
          tags.add('stat_down');
        } else {
          tags.add('stat_up');
        }
      }
    }

    // Description-based inference (case-insensitive)
    if (descLower.includes('poison')) tags.add('poison');
    if (descLower.includes('sleep')) tags.add('sleep');
    if (descLower.includes('confuse')) tags.add('confuse');
    if (descLower.includes('paralyze')) tags.add('paralyze');
    if (descLower.includes('heal') || descLower.includes('recover')) tags.add('hp_heal');
    if (descLower.includes('steals') && descLower.includes('hp')) tags.add('hp_steal');
    if (descLower.includes('bleed')) tags.add('bleed');
    if (descLower.includes('lower')) tags.add('stat_down');
    if (descLower.includes('raise') || descLower.includes('increase')) tags.add('stat_up');
    if (descLower.includes('accuracy')) {
      if (descLower.includes('lower')) tags.add('accuracy_down');
      else if (descLower.includes('raise') || descLower.includes('increase')) tags.add('accuracy_up');
    }
    if (descLower.includes('chaos') || descLower.includes('stat chaos')) tags.add('chaos');
    if (descLower.includes('negate')) tags.add('negate');
    // broaden stat steal detection:
    if (
      descLower.includes('stat steal') ||
      descLower.includes('steals stats') ||
      descLower.includes('steal stats')
    ) {
      tags.add('stat_steal');
    }
    if (descLower.includes('block')) tags.add('block');
    if (descLower.includes('ethereal')) tags.add('ethereal');
    if (descLower.includes('stat steal')) tags.add('stat_steal');
    if (descLower.includes('switch') || descLower.includes('curse')) tags.add('switch_curse');
    // Detect antiheal effects (applies antiheal to opponent)
    if (descLower.includes('antiheal') || descLower.includes('anti heal') || descLower.includes('anti-heal')) {
      tags.add('antiheal');
    }
    // Detect antiheal immunity (protects from antiheal)
    if (descLower.includes('antiheal immunity') || descLower.includes('anti heal immunity') || 
        descLower.includes('anti-heal immunity') || descLower.includes('immune to antiheal') ||
        descLower.includes('immune to anti heal') || descLower.includes('immune to anti-heal')) {
      tags.add('antiheal_immunity');
    }
  }

  return tags;
}

// ============= DATA LOADING =============

export const allMiscrits: Miscrit[] = miscritsData as Miscrit[];

export const miscritsMeta: MiscritMeta[] = allMiscrits.map((miscrit) => {
  const firstName = miscrit.names?.[0] || 'Unknown';
  const statRatings: Record<StatKey, StatRating> = {
    hp: tierToRating(miscrit.hp),
    spd: tierToRating(miscrit.spd),
    ea: tierToRating(miscrit.ea),
    pa: tierToRating(miscrit.pa),
    ed: tierToRating(miscrit.ed),
    pd: tierToRating(miscrit.pd),
  };
  const tags = inferTagsFromAbilities(miscrit.abilities || []);

  return {
    id: miscrit.id,
    firstName,
    element: miscrit.element,
    rarity: miscrit.rarity,
    statRatings,
    tags,
  };
});
