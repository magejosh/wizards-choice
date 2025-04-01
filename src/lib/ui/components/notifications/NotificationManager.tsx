import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AchievementNotification } from './AchievementNotification';
import { useGameStateStore } from '../../../game-state/gameStateStore';
import { Achievement } from '../../../types';
import { GameNotification } from '../../../types/game-types';
import styles from './NotificationManager.module.css';

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
  const { gameState, updateGameState } = useGameStateStore();
  const [activeNotifications, setActiveNotifications] = useState<GameNotification[]>([]);
  
  // Keep track of achievements that changed to unlocked
  useEffect(() => {
    if (!gameState?.notifications) return;

    const unlockedNotifications = gameState.notifications.filter(
      notification => 
        notification.type === 'achievement' &&
        notification.unlocked && 
        notification.unlockedDate && 
        // Check if it was unlocked in the last 5 seconds
        new Date().getTime() - new Date(notification.unlockedDate).getTime() < 5000
    );
    
    if (unlockedNotifications.length > 0) {
      // Show notifications for newly unlocked achievements
      unlockedNotifications.forEach(notification => {
        if (notification.type === 'achievement') {
          showAchievementNotification({
            id: notification.id,
            name: notification.title,
            description: notification.description,
            reward: {
              type: 'gold',
              value: notification.reward ? parseInt(notification.reward) : 0
            },
            currentProgress: 100,
            requiredProgress: 100,
            progress: 100,
            unlocked: true,
            unlockedDate: notification.unlockedDate ? new Date(notification.unlockedDate) : new Date()
          });
        }
      });
    }
  }, [gameState?.notifications]);
  
  const showAchievementNotification = (achievement: Achievement) => {
    const notificationId = `achievement-${achievement.id}-${Date.now()}`;
    const newNotification: GameNotification = {
      id: notificationId,
      type: 'achievement',
      title: achievement.name,
      description: achievement.description,
      reward: achievement.reward?.value?.toString()
    };
    
    addNotification(newNotification);
  };
  
  const showTitleUnlockNotification = (title: { id: string; name: string; description: string; bonus?: string }) => {
    const notificationId = `title-${title.id}-${Date.now()}`;
    const newNotification: GameNotification = {
      id: notificationId,
      type: 'title',
      title: `New Title: ${title.name}`,
      description: title.description,
      reward: title.bonus
    };
    
    addNotification(newNotification);
  };
  
  const addNotification = (notification: GameNotification) => {
    setActiveNotifications(prev => {
      const newNotifications = [...prev, notification];
      // Keep only the most recent notifications up to maxNotifications
      return newNotifications.slice(-maxNotifications);
    });
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 8000);
  };
  
  const dismissNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(notification => notification.id !== id));
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
        {activeNotifications.map((notification, index) => {
          if (notification.type === 'achievement') {
            return (
              <div key={notification.id} className={styles.notification}>
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