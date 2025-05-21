import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useTimer from '../../utils/useTimer';
import './Header.css';

function Header() {
  const time = useTimer();
  const { user } = useAuth();

  const handleNavClick = (path) => {
    console.log('Navigating to:', path, { user: !!user });
  };

  return (
    <header className="header">
      <NavLink to="/" className="logo" end onClick={() => handleNavClick('/')}>
        LanguageClub
      </NavLink>

      <nav className="nav">
        <NavLink to="/" end onClick={() => handleNavClick('/')}>Головна</NavLink>
        <NavLink to="/lessons" onClick={() => handleNavClick('/lessons')}>Уроки</NavLink>
        <NavLink to="/practice" onClick={() => handleNavClick('/practice')}>Практика</NavLink>
        <NavLink to="/progress" onClick={() => handleNavClick('/progress')}>Прогрес</NavLink>
      </nav>

      <div className="right-section">
        <div className="timer">{time}</div>
      </div>
      {user ? (
        <NavLink to="/profile" className="profile-icon" title="Мій кабінет" onClick={() => handleNavClick('/profile')}>
          👤
        </NavLink>
      ) : (
        <NavLink to="/login" className="profile-icon" title="Увійти" onClick={() => handleNavClick('/login')}>
          🔐
        </NavLink>
      )}
    </header>
  );
}

export default Header;