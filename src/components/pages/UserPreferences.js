import { Button, Card, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { Navigate } from 'react-router';
import { updatePreferences } from '../../actions/userActions';
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
  message: {
    marginBottom: '8px',
    color: colors.success,
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

function UserPreferences(props) {
  const classes = styles();
  const { user, loaded, dispatch } = props;

  const [model, setModel] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const setPreferences = async () => {
    setLoading(true);
    await dispatch(updatePreferences({ ...user, city, model }));
    setMessage('Succesfully updated user');
    setLoading(false);
  };

  useEffect(() => {
    setCity(user.city);
    setModel(user.model);
  }, [loaded]);

  if (!loaded) {
    return (undefined);
  }

  return (
    <div className={classes.root}>
      <Header />
      {!user.username
        ? <Navigate to="/login" />
        : (
          <Card variant="outlined">
            <div className={classes.container}>
              <h3>{user.username}'s Settings</h3>
              {message && <div className={classes.message}>{message}</div>}
              <div className={classes.inputContainer}>
                <TextField value={model} onChange={(e) => setModel(e.target.value)} label="Model" variant="outlined" />
              </div>
              <TextField value={city} onChange={(e) => setCity(e.target.value)} label="City" variant="outlined" />
            </div>
            <div className={classes.submitButtonContainer}>
              <Button disabled={loading} variant="contained" color="primary" onClick={setPreferences}>Save</Button>
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

export default connect(mapStateToProps)(UserPreferences);
