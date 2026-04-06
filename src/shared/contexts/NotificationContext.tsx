import { authenticatedApi } from '@services/api';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  date: string;
  type: string;
  isNew: boolean;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (n: AppNotification) => void;
  markAllAsRead: () => void;
  initializeNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children, initialData }: {
  children: ReactNode;
  initialData?: AppNotification[];
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  
  const unreadCount = notifications.filter(n => n.isNew).length;

  const addNotification = useCallback((n: AppNotification) => {
    setNotifications(prev => {
      if (prev.some(item => item.id === n.id)) return prev;
      return [n, ...prev];
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, []);

  const initializeNotifications = useCallback(async  () => {
    setIsLoading(true);
    try {
      const response = await authenticatedApi.get(`notifications/latest`);
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newOnes = response.result.data.filter(n => !existingIds.has(n.id));
        return [...newOnes, ...prev];
      });
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, addNotification, markAllAsRead, initializeNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};