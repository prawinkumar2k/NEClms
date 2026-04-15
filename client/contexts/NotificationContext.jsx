import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext(null);

let idCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to EduLearn LMS",
      message: "Your account has been set up successfully.",
      type: "info",
      read: false,
      time: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Exam Scheduled",
      message: "Data Structures exam is scheduled for tomorrow at 10:00 AM.",
      type: "warning",
      read: false,
      time: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const addNotification = useCallback((notification) => {
    idCounter++;
    setNotifications((prev) => [
      { id: idCounter, read: false, time: new Date().toISOString(), ...notification },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, remove }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

export default NotificationContext;
