import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import SettingPage from './pages/SettingPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
                <Route path="/setting" element={<SettingPage />} />
            </Routes>
        </Router>
    );
}

export default App;
