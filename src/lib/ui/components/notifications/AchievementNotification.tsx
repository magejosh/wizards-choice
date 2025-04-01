import React, { useState, useEffect } from 'react';
import styles from './AchievementNotification.module.css';

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
      className={`${styles.achievementNotification} ${isVisible ? styles.visible : ''} ${isClosing ? styles.closing : ''}`}
      onClick={handleClose}
    >
      <div className={styles.achievementNotificationContent}>
        <div className={styles.achievementNotificationIcon}>
          <img src={imageUrl} alt="Achievement icon" />
        </div>
        <div className={styles.achievementNotificationText}>
          <div className={styles.achievementNotificationHeader}>
            <span className={styles.achievementLabel}>Achievement Unlocked!</span>
            <h3 className={styles.achievementTitle}>{title}</h3>
          </div>
          <p className={styles.achievementDescription}>{description}</p>
          {reward && (
            <p className={styles.achievementReward}>Reward: {reward}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 