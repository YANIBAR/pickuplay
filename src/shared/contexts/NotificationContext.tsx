import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  isNew: boolean;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children, initialData }: {
  children: ReactNode;
  initialData: AppNotification[];
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialData);

  const unreadCount = notifications.filter(n => n.isNew).length;

  const addNotification = useCallback((n: AppNotification) => {
    setNotifications(prev => [n, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};