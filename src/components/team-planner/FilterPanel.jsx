import React from 'react';
import { miscritsMeta } from '../../data/miscritsMeta';
import '../../styles/TeamPlannerFilter.css';

// Extract all unique rarities from the data
const allRarities = Array.from(new Set(miscritsMeta.map(m => m.rarity))).sort();

// Extract all unique elements from the data
const allElements = Array.from(new Set(miscritsMeta.map(m => m.element))).sort();

// Debuff tags that should appear on the left
const debuffTags = [
  'poison',
  'chaos',
  'stat_down',
  'hp_steal',
  'switch_curse',
  'antiheal',
  'accuracy_down',
  'bleed',
  'dot',
  'confuse',
  'sleep',
  'paralyze',
];

// Buff tags that should appear on the right
const buffTags = [
  'stat_up',
  'stat_steal',
  'block',
  'ethereal',
  'hp_heal',
  'hot',
  'accuracy_up',
  'negate',
];

const STAT_KEYS = ['hp', 'spd', 'ea', 'pa', 'ed', 'pd'];
const STAT_LABELS = {
  hp: 'HP',
  spd: 'SPD',
  ea: 'EA',
  pa: 'PA',
  ed: 'ED',
  pd: 'PD',
};

export default function FilterPanel({ filters, onChange }) {
  const handleNameChange = (e) => {
    const newFilters = { ...filters, name: e.target.value };
    onChange(newFilters);
  };

  const handleRarityToggle = (rarity) => {
    const newRarities = new Set(filters.rarities);
    if (newRarities.has(rarity)) {
      newRarities.delete(rarity);
    } else {
      newRarities.add(rarity);
    }
    onChange({ ...filters, rarities: newRarities });
  };

  const handleElementToggle = (element) => {
    const newElements = new Set(filters.elements);
    if (newElements.has(element)) {
      newElements.delete(element);
    } else {
      newElements.add(element);
    }
    onChange({ ...filters, elements: newElements });
  };

  const handleStatBoxToggle = (key, value) => {
    const newStats = { ...filters.stats };
    const currentMinRating = newStats[key];
    
    // If clicking the same value, toggle it off (set to undefined)
    // Otherwise, set it as the new minimum rating
    if (currentMinRating === value) {
      newStats[key] = undefined;
    } else {
      newStats[key] = value;
    }

    onChange({ ...filters, stats: newStats });
  };

  const handleBuffTagToggle = (tag) => {
    const newTags = new Set(filters.buffTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    onChange({ ...filters, buffTags: newTags });
  };

  const handleDebuffTagToggle = (tag) => {
    const newTags = new Set(filters.debuffTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    onChange({ ...filters, debuffTags: newTags });
  };

  const handleClearAllFilters = () => {
    onChange({
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
    });
  };

  const renderStatRow = (key) => {
    const minRating = filters.stats[key];
    // Map spd to sp for the icon filename
    const iconKey = key === 'spd' ? 'sp' : key;

    return (
      <div key={key} className="filter-stat-row">
        <img 
          src={`./assets/other/${iconKey}.png`} 
          alt={key}
          className="stat-icon"
          title={STAT_LABELS[key]}
        />
        <div className="stat-boxes">
          {[1, 2, 3, 4, 5].map((value) => {
            // Show filled boxes from 1 to minRating (inclusive)
            const isFilled = minRating !== undefined && value <= minRating;
            return (
              <button
                key={value}
                type="button"
                className={`stat-box ${isFilled ? 'stat-box--selected' : ''}`}
                onClick={() => handleStatBoxToggle(key, value)}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="filter-panel">
      {/* Search Box */}
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search Miscrits"
          value={filters.name}
          onChange={handleNameChange}
          className="filter-search"
        />
      </div>

      {/* Rarity Filter */}
      <div className="filter-section">
        <h4>Rarity</h4>
        <div className="rarity-buttons">
          {allRarities.map((rarity) => (
            <button
              key={rarity}
              className={`rarity-btn ${filters.rarities.has(rarity) ? 'active' : ''}`}
              onClick={() => handleRarityToggle(rarity)}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Element Filter */}
      <div className="filter-section">
        <h4>Element</h4>
        <div className="element-buttons">
          <button
            className={`element-btn ${filters.elements.size === 0 ? 'active' : ''}`}
            onClick={() => onChange({ ...filters, elements: new Set() })}
            title="All Elements"
          >
            <img src="./assets/types/All-types.webp" alt="All" />
          </button>
          {allElements.map((element) => (
            <button
              key={element}
              className={`element-btn ${filters.elements.has(element) ? 'active' : ''}`}
              onClick={() => handleElementToggle(element)}
              title={element}
            >
              <img src={`./assets/types/${element}.webp`} alt={element} />
            </button>
          ))}
        </div>
      </div>

      {/* Stat Filters */}
      <div className="filter-section">
        <h4>Stats</h4>
        {STAT_KEYS.map((key) => renderStatRow(key))}
      </div>

      {/* Buffs & Debuffs */}
      <div className="filter-section buffs-debuffs">
        <div className="buff-column">
          <h4>Buffs</h4>
          <div className="tag-list">
            {buffTags.map((tag) => (
              <label key={tag} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={filters.buffTags.has(tag)}
                  onChange={() => handleBuffTagToggle(tag)}
                />
                <span>{tag.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="debuff-column">
          <h4>Debuffs</h4>
          <div className="tag-list">
            {debuffTags.map((tag) => (
              <label key={tag} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={filters.debuffTags.has(tag)}
                  onChange={() => handleDebuffTagToggle(tag)}
                />
                <span>{tag.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Clear All Button */}
      <div className="filter-section">
        <button
          type="button"
          onClick={handleClearAllFilters}
          className="clear-all-btn"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
