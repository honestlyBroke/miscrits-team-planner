import React, { useState } from 'react';
import { allMiscrits } from '../../data/miscritsMeta';
import { getAvatarUrl } from '../../data/cdnHelper';
import '../../styles/MiscritGrid.css';

export default function MiscritGrid({ miscrits, onSelectMiscrit }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (miscritId) => {
    setImageErrors(prev => ({ ...prev, [miscritId]: true }));
  };

  const renderStatBars = (ratings) => {
    return (
      <div className="stat-bars">
        {['hp', 'spd', 'ea', 'pa', 'ed', 'pd'].map((stat) => (
          <div key={stat} className="stat-bar-item">
            <div className="stat-bars-container">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`stat-bar ${i < ratings[stat] ? 'filled' : 'empty'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getRarityClass = (rarity) => {
    return `rarity-${rarity.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const getElementImagePath = (element) => {
    if (!element) return './assets/types/Physical.webp';
    // Try exact match first, then try with capital first letter
    const elementPath = `./assets/types/${element}.webp`;
    return elementPath;
  };

  return (
    <div className="miscrit-grid">
      {miscrits.length === 0 ? (
        <div className="grid-empty">No Miscrits match your filters</div>
      ) : (
        miscrits.map((miscrit) => {
          const fullData = allMiscrits.find(m => m.id === miscrit.id);
          const firstName = fullData?.names?.[0];
          const avatarUrl = firstName ? getAvatarUrl(firstName) : '';
          const hasError = imageErrors[miscrit.id];

          return (
            <div
              key={miscrit.id}
              className="miscrit-card"
              onClick={() => onSelectMiscrit(miscrit.id)}
            >
              <div className="card-header">
                <div className="card-name">{miscrit.firstName}</div>
                <div className="card-element">
                  <img 
                    src={getElementImagePath(fullData?.element)}
                    alt={fullData?.element}
                    className="element-icon"
                    title={fullData?.element}
                  />
                </div>
              </div>

              <div className="card-icon">
                <div className={`card-rarity-triangle rarity-${miscrit.rarity?.toLowerCase().replace(/\s+/g, '-')}`}></div>
                {avatarUrl && !hasError ? (
                  <img 
                    src={avatarUrl}
                    alt={miscrit.firstName}
                    className="avatar-image"
                    onError={() => handleImageError(miscrit.id)}
                  />
                ) : (
                  <div className="placeholder-icon">{miscrit.element?.[0] || '?'}</div>
                )}
              </div>

              {renderStatBars(miscrit.statRatings)}

              <div className="card-tags">
                {Array.from(miscrit.tags)
                  .slice(0, 3)
                  .map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tag.replace(/_/g, ' ')}
                    </span>
                  ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
