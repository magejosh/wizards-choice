import React, { useState, useEffect } from 'react';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  title: string;
  description: string;
  reward?: string;
  imageUrl?: string;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  title, 
  description, 
  reward, 
  imageUrl = '/images/default-placeholder.jpg',
  onClose,
  autoCloseDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Animate in and auto-close after delay
  useEffect(() => {
    // Start animation in
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Start auto-close countdown
    const closeTimeout = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);
    
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(closeTimeout);
    };
  }, [autoCloseDelay]);
  
  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete
    setTimeout(() => {
      onClose();
    }, 500);
  };
  
  return (
    <div 
      className={`achievement-notification ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div className="achievement-notification-content">
        <div className="achievement-notification-icon">
          <img src={imageUrl} alt="Achievement icon" />
        </div>
        <div className="achievement-notification-text">
          <div className="achievement-notification-header">
            <span className="achievement-label">Achievement Unlocked!</span>
            <h3 className="achievement-title">{title}</h3>
          </div>
          <p className="achievement-description">{description}</p>
          {reward && (
            <p className="achievement-reward">Reward: {reward}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 