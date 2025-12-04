import React, { useState } from 'react';
import { allMiscrits } from '../../data/miscritsMeta';
import { getAvatarUrl } from '../../data/cdnHelper';
import '../../styles/TeamView.css';

export default function TeamView({
  currentTeam,
  onSlotClick,
  onSlotClear,
  onOpenTeamsModal,
  onSaveTeam,
  onClearTeam,
}) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (slotIndex) => {
    setImageErrors(prev => ({ ...prev, [slotIndex]: true }));
  };

  const getMiscritName = (miscritId) => {
    if (!miscritId) return '';
    const miscrit = allMiscrits.find(m => m.id === miscritId);
    return miscrit?.names?.[0] || 'Unknown';
  };

  const getMiscritRarity = (miscritId) => {
    if (!miscritId) return '';
    const miscrit = allMiscrits.find(m => m.id === miscritId);
    return miscrit?.rarity || '';
  };

  const getAvatarForSlot = (miscritId) => {
    if (!miscritId) return '';
    const miscrit = allMiscrits.find(m => m.id === miscritId);
    return miscrit?.names?.[0] ? getAvatarUrl(miscrit.names[0]) : '';
  };

  const renderSlot = (slot, index) => {
    const isFilled = slot.miscritId !== null;
    const avatarUrl = isFilled ? getAvatarForSlot(slot.miscritId) : '';
    const hasError = imageErrors[index];

    return (
      <div
        key={index}
        className={`team-slot ${isFilled ? 'filled' : 'empty'}`}
        onClick={() => onSlotClick(index)}
      >
        {isFilled ? (
          <>
            <div className="slot-icon">
              {avatarUrl && !hasError ? (
                <img
                  src={avatarUrl}
                  alt={getMiscritName(slot.miscritId)}
                  className="slot-avatar"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="slot-placeholder">{slot.miscritId}</div>
              )}
            </div>
            <div className="slot-info">
              <div className="slot-name">{getMiscritName(slot.miscritId)}</div>
              <div className="slot-rarity">{getMiscritRarity(slot.miscritId)}</div>
            </div>
            <button
              className="slot-remove"
              onClick={(e) => {
                e.stopPropagation();
                onSlotClear(index);
              }}
              title="Remove from team"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="slot-empty-icon">+</div>
        )}
      </div>
    );
  };

  return (
    <div className="team-view">
      <h3>Current Team</h3>
      <div className="team-slots">
        {currentTeam.map((slot, index) => renderSlot(slot, index))}
      </div>

      <div className="team-actions">
        <button className="action-btn primary" onClick={onSaveTeam}>
          Save Team
        </button>
        <button className="action-btn secondary" onClick={onOpenTeamsModal}>
          My Teams
        </button>
        <button className="action-btn danger" onClick={onClearTeam}>
          Clear Team
        </button>
      </div>
    </div>
  );
}
