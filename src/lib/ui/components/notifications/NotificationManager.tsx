import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AchievementNotification } from './AchievementNotification';
import { useGameStateStore } from '../../../game-state/gameStateStore';
import { Achievement } from '../../../types';
import styles from './NotificationManager.module.css';

// Types for notifications
interface AchievementNotificationData {
  id: string;
  type: 'achievement';
  achievementId: string;
  title: string;
  description: string;
  reward?: string;
  imageUrl?: string;
}

interface TitleUnlockNotificationData {
  id: string;
  type: 'title';
  titleId: string;
  title: string;
  description: string;
  bonus?: string;
  imageUrl?: string;
}

type NotificationData = AchievementNotificationData | TitleUnlockNotificationData;

// Context for the notification system
interface NotificationContextData {
  showAchievementNotification: (achievement: Achievement) => void;
  showTitleUnlockNotification: (title: { id: string; name: string; description: string; bonus?: string }) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  maxNotifications = 3 
}) => {
  const { gameState, setGameState } = useGameStateStore();
  const { notifications } = gameState;
  
  // Keep track of achievements that changed to unlocked
  useEffect(() => {
    const unlockedAchievements = notifications.filter(
      notification => 
        notification.type === 'achievement' &&
        notification.unlocked && 
        notification.unlockedDate && 
        // Check if it was unlocked in the last 5 seconds
        new Date().getTime() - new Date(notification.unlockedDate).getTime() < 5000
    );
    
    if (unlockedAchievements.length > 0) {
      // Show notifications for newly unlocked achievements
      unlockedAchievements.forEach(notification => {
        showAchievementNotification(notification as Achievement);
      });
    }
  }, [notifications]);
  
  const showAchievementNotification = (achievement: Achievement) => {
    const notificationId = `achievement-${achievement.id}-${Date.now()}`;
    const newNotification: AchievementNotificationData = {
      id: notificationId,
      type: 'achievement',
      achievementId: achievement.id,
      title: achievement.name,
      description: achievement.description,
      reward: achievement.reward
    };
    
    addNotification(newNotification);
  };
  
  const showTitleUnlockNotification = (title: { id: string; name: string; description: string; bonus?: string }) => {
    const notificationId = `title-${title.id}-${Date.now()}`;
    const newNotification: TitleUnlockNotificationData = {
      id: notificationId,
      type: 'title',
      titleId: title.id,
      title: `New Title: ${title.name}`,
      description: title.description,
      bonus: title.bonus
    };
    
    addNotification(newNotification);
  };
  
  const addNotification = (notification: NotificationData) => {
    setGameState(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification]
    }));
    
    // Auto-dismiss after 8 seconds (notification itself auto-closes after 5s)
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 8000);
  };
  
  const dismissNotification = (id: string) => {
    setGameState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notification => notification.id !== id)
    }));
  };
  
  return (
    <NotificationContext.Provider 
      value={{ 
        showAchievementNotification, 
        showTitleUnlockNotification, 
        dismissNotification 
      }}
    >
      {children}
      
      {/* Render active notifications */}
      <div className={styles.notificationContainer}>
        {notifications.map((notification, index) => {
          if (notification.type === 'achievement') {
            return (
              <div key={index} className={styles.notification}>
                <AchievementNotification
                  title={notification.title}
                  description={notification.description}
                  reward={notification.reward}
                  imageUrl={notification.imageUrl}
                  onClose={() => dismissNotification(notification.id)}
                  // Stagger the auto-close delays to avoid notifications closing simultaneously
                  autoCloseDelay={5000 + (index * 500)}
                />
              </div>
            );
          }
          // Add other notification types here as needed
          return null;
        })}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}; 