import React, { useContext, useEffect, useState } from 'react';
import { CompletedContext } from '../context/CompletedContext';
import { useAuth } from '../context/AuthContext';
import LessonCard from '../components/LessonCard/LessonsCard';
import './Lessons.css';

export default function Lessons() {
    const { completed = [], setCompleted } = useContext(CompletedContext);
    const { user } = useAuth();
    const [lessons, setLessons] = useState([]);
    const [filter, setFilter] = useState('All');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/lessons');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const lessonsList = await response.json();
                console.log('Fetched lessons:', lessonsList);
                setLessons(lessonsList);
                setError(null);
            } catch (error) {
                setError(error.message);
                console.error('Error fetching lessons:', error);
            }
        };
        fetchLessons();
    }, []);

    const filtered = lessons.filter((l) => filter === 'All' || l.level === filter);

    const toggleComplete = (id) => {
        if (!user) {
            alert('Будь ласка, увійдіть, щоб позначити урок як пройдений.');
            return;
        }
        const lessonId = String(id);
        const isCompleted = Array.isArray(completed) && completed.some(lesson => {
            const match = lesson.lessonId === lessonId;
            console.log('Checking lesson:', { lesson, lessonId, match });
            return match;
        });
        console.log('toggleComplete:', { lessonId, isCompleted, completed });
        const newCompleted = isCompleted
            ? completed.filter(lesson => lesson.lessonId !== lessonId)
            : [...completed, { lessonId, completedAt: new Date().toISOString() }];
        setCompleted({ lessonId, action: isCompleted ? 'remove' : 'add', optimistic: newCompleted });
    };

    if (error) {
        return <div className="lessons-page">Помилка: {error}</div>;
    }

    if (filtered.length === 0) {
        return <div className="lessons-page">Немає уроків для відображення</div>;
    }

    console.log('Lessons render:', { completed, lessons });

    return (
        <div className="lessons-page">
            <div className="filters">
                {['All', 'A1', 'A2', 'B1', 'B2'].map((lv) => (
                    <button
                        key={lv}
                        className={filter === lv ? 'active' : ''}
                        onClick={() => setFilter(lv)}
                    >
                        {lv}
                    </button>
                ))}
            </div>
            <div className="lessons-grid">
                {filtered.map((lesson) => {
                    const isCompleted = Array.isArray(completed) && completed.some(l => {
                        const match = l.lessonId === String(lesson.id);
                        console.log('Rendering lesson:', { lessonId: lesson.id, completedLesson: l, match });
                        return match;
                    });
                    return (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            completed={isCompleted}
                            onComplete={toggleComplete}
                            user={user}
                        />
                    );
                })}
            </div>
            <div className="completed-lessons">
                <h2>Пройдені уроки</h2>
                <ul>
                    {Array.isArray(completed) && completed.map((lesson) => (
                        <li key={lesson.lessonId}>
                            {lesson.lessonId} - Пройдено: {new Date(lesson.completedAt).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}