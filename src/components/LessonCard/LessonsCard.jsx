import React from 'react';
import './LessonsCard.css';

export default function LessonCard({ lesson, completed = false, onComplete, user }) {
    console.log('LessonCard render:', { lessonId: lesson.id, completed });
    return (
        <div className={`lesson-card ${completed ? 'done' : ''}`}>
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
            <div className="video-container">
                <iframe src={lesson.video} title={lesson.title} allowFullScreen />
            </div>
            <button
                onClick={() => {
                    console.log('Button clicked:', { lessonId: lesson.id, completed });
                    onComplete(lesson.id);
                }}
                disabled={!user}
                className={completed ? 'completed' : ''}
            >
                {completed ? 'Скасувати позначку' : 'Відзначити як пройдений'}
            </button>
        </div>
    );
}