import React, { useContext, useEffect, useState } from 'react';
import ProgressChart from '../components/ProgressChart/ProgressChart';
import { CompletedContext } from '../context/CompletedContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Progress.css';

export default function Progress() {
  const { completed } = useContext(CompletedContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    const fetchTotalLessons = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/total-lessons');
        const data = await response.json();
        setTotalLessons(data.total);
      } catch (error) {
        console.error('Error fetching total lessons:', error);
        setTotalLessons(0);
      }
    };
    fetchTotalLessons();
  }, []);

  if (!user) {
    return (
      <div className="progress-page">
        <h2>Мій прогрес</h2>
        <p>Щоб побачити ваш прогрес, будь ласка, увійдіть або зареєструйтесь.</p>
        <button onClick={() => navigate('/login')}>Увійти / Зареєструватися</button>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <h2>Мій прогрес</h2>
      <ProgressChart completed={completed.length} total={totalLessons} />
      <div className="stats">
        <p>Пройдено уроків: {completed.length} з {totalLessons}</p>
      </div>
    </div>
  );
}