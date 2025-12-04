import React, { useState, useEffect, useMemo } from 'react';
import FilterPanel from './FilterPanel';
import MiscritGrid from './MiscritGrid';
import TeamView from './TeamView';
import TeamSlotsModal from './TeamSlotsModal';
import {
  createDefaultFilters,
  matchesFilters,
} from '../../data/filters';
import { miscritsMeta, allMiscrits } from '../../data/miscritsMeta';
import {
  loadTeamStore,
  saveTeamStore,
  createNewTeam,
} from '../../data/teamStore';
import '../../styles/TeamPlanner.css';

/**
 * @typedef {Object} TeamPlannerPageProps
 * @property {(miscritId: number) => void} [onSelectMiscritForCalculator]
 */

/**
 * Main Team Planner page component
 * @param {TeamPlannerPageProps} props
 */
export default function TeamPlannerPage({ onSelectMiscritForCalculator }) {
  const [filters, setFilters] = useState(createDefaultFilters());
  const [currentTeam, setCurrentTeam] = useState([
    { miscritId: null },
    { miscritId: null },
    { miscritId: null },
    { miscritId: null },
  ]);
  const [teamStore, setTeamStore] = useState({ teams: [] });
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  // Load team store on mount
  useEffect(() => {
    const store = loadTeamStore();
    setTeamStore(store);
  }, []);

  // Compute filtered miscrits
  const filteredMiscrits = useMemo(() => {
    return miscritsMeta.filter((miscrit) => matchesFilters(miscrit, filters));
  }, [filters]);

  // Handle selecting a miscrit from the grid
  const handleSelectMiscrit = (miscritId) => {
    const newTeam = [...currentTeam];
    
    // If a slot is selected, replace it
    if (selectedSlotIndex !== null) {
      newTeam[selectedSlotIndex] = { miscritId };
      setSelectedSlotIndex(null);
    } else {
      // Find first empty slot
      const emptyIndex = newTeam.findIndex((slot) => slot.miscritId === null);
      if (emptyIndex !== -1) {
        newTeam[emptyIndex] = { miscritId };
      } else {
        // Replace first slot if no empty slots
        newTeam[0] = { miscritId };
      }
    }
    setCurrentTeam(newTeam);
  };

  const handleSlotClick = (index) => {
    setSelectedSlotIndex(selectedSlotIndex === index ? null : index);
  };

  const handleSlotClear = (index) => {
    const newTeam = [...currentTeam];
    newTeam[index] = { miscritId: null };
    setCurrentTeam(newTeam);
  };

  const handleClearTeam = () => {
    setCurrentTeam([
      { miscritId: null },
      { miscritId: null },
      { miscritId: null },
      { miscritId: null },
    ]);
    setSelectedSlotIndex(null);
  };

  const handleSaveTeam = () => {
    const teamName = prompt('Enter team name:', 'Team ' + (teamStore.teams.length + 1));
    if (!teamName) return;

    const newTeam = createNewTeam(teamName);
    newTeam.slots = [...currentTeam];

    const updatedStore = {
      ...teamStore,
      teams: [...teamStore.teams, newTeam],
      lastSelectedTeamId: newTeam.id,
    };
    setTeamStore(updatedStore);
    saveTeamStore(updatedStore);
  };

  const handleLoadTeam = (team) => {
    setCurrentTeam([...team.slots]);
    setSelectedSlotIndex(null);
    setShowTeamsModal(false);
  };

  const handleSaveToTeam = (teamId, slots) => {
    const updatedStore = {
      ...teamStore,
      teams: teamStore.teams.map((team) =>
        team.id === teamId
          ? { ...team, slots: [...slots], updatedAt: Date.now() }
          : team
      ),
    };
    setTeamStore(updatedStore);
    saveTeamStore(updatedStore);
    alert('Team updated!');
  };

  const handleDeleteTeam = (teamId) => {
    const updatedStore = {
      ...teamStore,
      teams: teamStore.teams.filter((team) => team.id !== teamId),
    };
    setTeamStore(updatedStore);
    saveTeamStore(updatedStore);
  };

  const handleRenameTeam = (teamId, newName) => {
    const updatedStore = {
      ...teamStore,
      teams: teamStore.teams.map((team) =>
        team.id === teamId ? { ...team, name: newName, updatedAt: Date.now() } : team
      ),
    };
    setTeamStore(updatedStore);
    saveTeamStore(updatedStore);
  };

  const handleAddTeam = (team) => {
    const updatedStore = {
      ...teamStore,
      teams: [...teamStore.teams, team],
    };
    setTeamStore(updatedStore);
    saveTeamStore(updatedStore);
  };

  return (
    <div className="team-planner-page">
      <div className="planner-container">
        <div className="planner-left">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        <div className="planner-middle">
          <MiscritGrid miscrits={filteredMiscrits} onSelectMiscrit={handleSelectMiscrit} />
        </div>

        <div className="planner-right">
          <TeamView
            currentTeam={currentTeam}
            onSlotClick={handleSlotClick}
            onSlotClear={handleSlotClear}
            onOpenTeamsModal={() => setShowTeamsModal(true)}
            onSaveTeam={handleSaveTeam}
            onClearTeam={handleClearTeam}
          />
        </div>
      </div>

      <TeamSlotsModal
        isOpen={showTeamsModal}
        teams={teamStore.teams}
        currentTeam={currentTeam}
        onClose={() => setShowTeamsModal(false)}
        onLoadTeam={handleLoadTeam}
        onSaveToTeam={handleSaveToTeam}
        onDeleteTeam={handleDeleteTeam}
        onRenameTeam={handleRenameTeam}
        onAddTeam={handleAddTeam}
      />
    </div>
  );
}
