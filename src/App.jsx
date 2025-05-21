import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompletedProvider } from './context/CompletedContext';
import Header from './components/header/Header';
import Home from './pages/Home';
import Lessons from './pages/Lessons';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Login from './pages/Login';
import Profile from './pages/UserProfile';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  console.log('PrivateRoute check:', { user: !!user, path: window.location.pathname });
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <CompletedProvider>
        <Router>
          <Header />
          <ToastContainer position="top-right" autoClose={3000} />
          <main className="main-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/practice" element={<Practice />} />
              <Route
                path="/progress"
                element={
                  <PrivateRoute>
                    <Progress />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/lessons" />} />
            </Routes>
          </main>
        </Router>
      </CompletedProvider>
    </AuthProvider>
  );
}

export default App;