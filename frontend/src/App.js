import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import SettingPage from './pages/SettingPage';
import FindTripPage from './pages/FindTripPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PassengerSelectionPage from './pages/PassengerSelectionPage';
import SelectRoomPage from './pages/SelectRoomPage';
import AddPackagePage from './pages/AddPackagePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/resetpassword" element={<ResetPasswordPage />} />
                <Route path="/setting" element={<SettingPage />} />
                <Route path="/findtrip" element={<FindTripPage />} />
                <Route path="/passenger-selection" element={<PassengerSelectionPage />} />
                <Route path="/select-room" element={<SelectRoomPage />} />
                <Route path="/add-package" element={<AddPackagePage />} />
                
            </Routes>
        </Router>
    );
}

export default App;
