/**
 * Team Store and persistence utilities
 * Manages saving/loading teams from localStorage
 */

export interface TeamSlot {
  miscritId: number | null;
}

export interface Team {
  id: string;
  name: string;
  slots: TeamSlot[];
  createdAt: number;
  updatedAt: number;
}

export interface TeamStore {
  teams: Team[];
  lastSelectedTeamId?: string;
}

const STORAGE_KEY = 'miscrits_team_planner_v1';

/**
 * Load the team store from localStorage
 */
export function loadTeamStore(): TeamStore {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as TeamStore;
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load team store:', error);
  }
  return { teams: [] };
}

/**
 * Save the team store to localStorage
 */
export function saveTeamStore(store: TeamStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save team store:', error);
  }
}

/**
 * Create a new empty team
 */
export function createNewTeam(name: string = 'New Team'): Team {
  const now = Date.now();
  return {
    id: `team_${now}`,
    name,
    slots: [
      { miscritId: null },
      { miscritId: null },
      { miscritId: null },
      { miscritId: null },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Clone a team
 */
export function cloneTeam(team: Team): Team {
  const now = Date.now();
  return {
    id: `team_${now}`,
    name: `${team.name} (copy)`,
    slots: team.slots.map(slot => ({ ...slot })),
    createdAt: now,
    updatedAt: now,
  };
}
