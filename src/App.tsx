import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './signIn/SignIn';

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/signin" />} />
                <Route path="/signin" element={<SignIn/>} />
            </Routes>
        </Router>
    );
}

export default App;