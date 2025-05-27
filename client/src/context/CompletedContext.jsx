import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export const CompletedContext = createContext();

export const CompletedProvider = ({ children }) => {
  const { user } = useAuth();
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const fetchCompletedLessons = async () => {
      if (!user) {
        console.log('No user, resetting completed lessons');
        setCompleted([]);
        return;
      }
      try {
        console.log('Fetching completed lessons for user:', user.uid);
        const response = await fetch(`https://lab5host.onrender.com/api/lessons-progress?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched completed lessons:', data);
        setCompleted(data);
      } catch (error) {
        console.error('Error fetching completed lessons:', error);
        setCompleted([]);
      }
    };
    fetchCompletedLessons();
  }, [user]);

  const updateCompleted = async ({ lessonId, action, optimistic }) => {
    if (!user) {
      console.log('No user, cannot update completed lessons');
      return;
    }
    console.log('Updating completed lessons:', { lessonId, action, optimistic });
    setCompleted(optimistic);
    try {
      const response = await fetch('https://lab5host.onrender.com/api/lessons-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, lessonId: String(lessonId), action })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Updated completed lessons:', data.completedLessons);
      setCompleted(data.completedLessons);
    } catch (error) {
      console.error('Error updating completed lessons:', error);
      setCompleted([]);
    }
  };

  return (
    <CompletedContext.Provider value={{ completed, setCompleted: updateCompleted }}>
      {children}
    </CompletedContext.Provider>
  );
};