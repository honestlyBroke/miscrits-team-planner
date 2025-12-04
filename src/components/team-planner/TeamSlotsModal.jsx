import React, { useState } from 'react';
import { createNewTeam } from '../../data/teamStore';
import { allMiscrits } from '../../data/miscritsMeta';
import { getAvatarUrl } from '../../data/cdnHelper';
import '../../styles/TeamSlotsModal.css';

export default function TeamSlotsModal({
  isOpen,
  teams,
  currentTeam,
  onClose,
  onLoadTeam,
  onSaveToTeam,
  onDeleteTeam,
  onRenameTeam,
  onAddTeam,
}) {
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [page, setPage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const TEAMS_PER_PAGE = 3;

  if (!isOpen) return null;

  const handleRenameClick = (team) => {
    setEditingTeamId(team.id);
    setEditingName(team.name);
  };

  const handleRenameSave = (teamId) => {
    if (editingName.trim()) {
      onRenameTeam(teamId, editingName.trim());
    }
    setEditingTeamId(null);
  };

  const handleAddNewTeam = () => {
    const newTeam = createNewTeam();
    onAddTeam(newTeam);
    setPage(Math.floor(teams.length / TEAMS_PER_PAGE));
  };

  const handleImageError = (key) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const getMiscritName = (miscritId) => {
    if (!miscritId) return '';
    const miscrit = allMiscrits.find(m => m.id === miscritId);
    return miscrit?.names?.[0] || '?';
  };

  const getAvatarForSlot = (miscritId) => {
    if (!miscritId) return '';
    const miscrit = allMiscrits.find(m => m.id === miscritId);
    return miscrit?.names?.[0] ? getAvatarUrl(miscrit.names[0]) : '';
  };

  const startIdx = page * TEAMS_PER_PAGE;
  const endIdx = Math.min(startIdx + TEAMS_PER_PAGE, teams.length);
  const visibleTeams = teams.slice(startIdx, endIdx);
  const maxPages = Math.ceil(teams.length / TEAMS_PER_PAGE);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Team Slots</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {teams.length === 0 ? (
            <div className="empty-teams">
              <p>No teams saved yet</p>
              <button className="btn-add-slot" onClick={handleAddNewTeam}>
                Add Slots
              </button>
            </div>
          ) : (
            <>
              <div className="teams-list">
                {visibleTeams.map((team, displayIdx) => {
                  const actualIdx = startIdx + displayIdx;
                  return (
                    <div key={team.id} className="team-row">
                      <div className="team-label">
                        {editingTeamId === team.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSave(team.id);
                              if (e.key === 'Escape') setEditingTeamId(null);
                            }}
                            autoFocus
                            className="rename-input"
                          />
                        ) : (
                          <span>Team {actualIdx + 1}: {team.name}</span>
                        )}
                      </div>

                      <div className="team-slots">
                        {team.slots.map((slot, slotIndex) => {
                          const avatarUrl = slot.miscritId ? getAvatarForSlot(slot.miscritId) : '';
                          const errorKey = `${team.id}-${slotIndex}`;
                          const hasError = imageErrors[errorKey];

                          return (
                            <div key={slotIndex} className="small-slot">
                              {slot.miscritId && avatarUrl && !hasError ? (
                                <img
                                  src={avatarUrl}
                                  alt={getMiscritName(slot.miscritId)}
                                  className="small-slot-avatar"
                                  onError={() => handleImageError(errorKey)}
                                />
                              ) : (
                                <span className="small-slot-text">
                                  {slot.miscritId ? getMiscritName(slot.miscritId).slice(0, 2) : '—'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="team-controls">
                        {editingTeamId === team.id ? (
                          <>
                            <button
                              className="btn-save"
                              onClick={() => handleRenameSave(team.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={() => setEditingTeamId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-rename"
                              onClick={() => handleRenameClick(team)}
                            >
                              Rename
                            </button>
                            <button
                              className="btn-load"
                              onClick={() => {
                                onLoadTeam(team);
                                setPage(0);
                              }}
                            >
                              Load
                            </button>
                            <button
                              className="btn-save-current"
                              onClick={() => onSaveToTeam(team.id, currentTeam)}
                            >
                              Save
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => {
                                if (confirm('Delete this team?')) {
                                  onDeleteTeam(team.id);
                                  if (page >= Math.ceil((teams.length - 1) / TEAMS_PER_PAGE)) {
                                    setPage(Math.max(0, page - 1));
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {maxPages > 1 && (
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    ↑
                  </button>
                  <span className="page-info">
                    Page {page + 1} / {maxPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setPage(Math.min(maxPages - 1, page + 1))}
                    disabled={page >= maxPages - 1}
                  >
                    ↓
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-add-slot" onClick={handleAddNewTeam}>
            Add Slots
          </button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
