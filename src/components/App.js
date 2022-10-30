import React from 'react';
import {
  Route, Routes, Navigate,
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} exact />
      <Route path="/login" element={<Login />} exact />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
