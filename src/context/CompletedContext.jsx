import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const CompletedContext = createContext();

export function CompletedProvider({ children }) {
    const { user } = useAuth();
    const [completed, setCompleted] = useState([]);

    useEffect(() => {
        if (user) {
            const fetchCompletedLessons = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/lessons-progress?userId=${user.uid}`,
                        { cache: 'no-store' }
                    );
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('Fetched completed lessons:', data);
                    setCompleted(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Error fetching completed lessons:', error);
                    setCompleted([]);
                }
            };
            fetchCompletedLessons();
        } else {
            setCompleted([]);
        }
    }, [user]);

    const updateCompletedLessons = async ({ lessonId, action, optimistic }) => {
        if (!user) {
            console.log('No user authenticated, update skipped');
            return;
        }
        try {
            setCompleted(optimistic);
            console.log('Updating completed lesson:', { lessonId, action });
            const response = await fetch('http://localhost:5000/api/lessons-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.uid, lessonId: String(lessonId), action }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setCompleted(Array.isArray(data.completedLessons) ? data.completedLessons : []);
            console.log('Successfully updated completed lessons:', data.completedLessons);
        } catch (error) {
            console.error('Error updating completed lessons:', error);
            setCompleted(completed);
        }
    };

    return (
        <CompletedContext.Provider value={{ completed, setCompleted: updateCompletedLessons }}>
            {children}
        </CompletedContext.Provider>
    );
}