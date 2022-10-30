import { Button, Card, TextField } from '@mui/material';
import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { Navigate, useNavigate } from 'react-router';
import { setUserFromSession } from '../../actions/userActions';
import { login, register } from '../../api';
import colors from '../../colors';
import Header from './Header';

const styles = createUseStyles({
  root: {
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.backgroundColor,
    overflowY: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: '10px',
    paddingTop: '5px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  error: {
    marginBottom: '8px',
    color: colors.error,
    fontSize: '16px',
  },
  inputContainer: {
    marginBottom: '5px',
  },
  submitButtonContainer: {
    float: 'right',
    margin: '5px',
  },
  registerButtonContainer: {
    float: 'left',
    margin: '5px',
  },
});

function Login(props) {
  const classes = styles();
  const { dispatch, user, loaded } = props;
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const attemptLogin = async () => {
    const response = await login(username, password);
    if (response.error) {
      setError(response.message);
      return;
    }
    setError('');
    dispatch(setUserFromSession());
  };

  const attemptRegister = async () => {
    const response = await register(username, password);
    if (response.error) {
      setError(response.message);
      return;
    }
    setError('');
    await dispatch(setUserFromSession());
    navigate('/user/preferences');
  };

  if (!loaded) {
    return (undefined);
  }

  return (
    <div className={classes.root}>
      <Header />
      {user.username
        ? <Navigate to="/" />
        : (
          <Card variant="outlined">
            <div className={classes.container}>
              <h3>Login</h3>
              {error && <div className={classes.error}>{error}</div>}
              <div className={classes.inputContainer}>
                <TextField value={username} onChange={(e) => setUsername(e.target.value)} label="Username" variant="outlined" />
              </div>
              <TextField value={password} onChange={(e) => setPassword(e.target.value)} type="password" label="Password" variant="outlined" />
            </div>
            <div className={classes.submitButtonContainer}>
              <Button variant="contained" color="primary" onClick={attemptLogin}>Login</Button>
            </div>
            <div className={classes.registerButtonContainer}>
              <Button variant="outlined" color="primary" onClick={attemptRegister}>Register</Button>
            </div>
          </Card>
        )}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    user: state.user.user,
    loaded: state.user.loaded,
  };
}

export default connect(mapStateToProps)(Login);
