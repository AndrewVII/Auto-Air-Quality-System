import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Route, Routes, Navigate,
} from 'react-router-dom';
import { setUserFromSession } from '../actions/userActions';
import Home from './pages/Home';
import Login from './pages/Login';
import UserPreferences from './pages/UserPreferences';

function App(props) {
  const { dispatch } = props;

  useEffect(() => {
    dispatch(setUserFromSession());
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} exact />
      <Route path="/login" element={<Login />} exact />
      <Route path="/user/preferences" element={<UserPreferences />} exact />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(App);
