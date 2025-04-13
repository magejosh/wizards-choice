// src/components/ui/StatusBar.tsx
'use client';

import React from 'react';
import { getStatusBarColors } from '../../styles/theme';

interface StatusBarProps {
  current: number;
  max: number;
  type: 'health' | 'mana' | 'experience';
  label?: string;
  showValues?: boolean;
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  current,
  max,
  type,
  label,
  showValues = true,
  className = '',
}) => {
  const colors = getStatusBarColors(type);
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={`status-bar status-bar--${type} ${className}`}>
      {label && <div className="status-bar__label">{label}</div>}

      <div
        className="status-bar__container"
        style={{
          backgroundColor: colors.background,
        }}
      >
        <div
          className="status-bar__fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors.fill,
          }}
        />
      </div>

      {showValues && (
        <div className="status-bar__values">
          {current}/{max}
        </div>
      )}
    </div>
  );
};

export default StatusBar;
