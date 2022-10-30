import { Button, Card, TextField } from '@mui/material';
import React, {  useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { Navigate } from 'react-router';
import colors from '../../colors';

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
})

const UserPreferences = (props) => {
  const classes = styles();
  const { user } = props.user;

  const [model, setModel] = useState(user.model || '');
  const [city, setCity] = useState(user.city || '');
  const [error, setError] = useState('');

  const setPreferences = async () => {
    console.log(modelNumber, city);
  }
  
  return (
    <div className={classes.root}>
      {!user.username 
      ? <Navigate to="/login" />
      : <Card variant="outlined">
        <div className={classes.container}>
          <h3>{user.username}'s preferences</h3>
          {error && <div className={classes.error}>{error}</div>}
          <div className={classes.inputContainer}>
            <TextField value={model} onChange={(e) => setModel(e.target.value)} type="number" label="Model Number" variant="outlined" />
          </div>
          <TextField value={city} onChange={(e) => setCity(e.target.value)} label="City" variant="outlined" />
        </div>
        <div className={classes.submitButtonContainer}>
          <Button variant="contained" color="primary" onClick={setPreferences}>Save</Button>
        </div>
      </Card>}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(UserPreferences);
