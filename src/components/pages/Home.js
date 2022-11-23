import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { Navigate } from 'react-router';

import colors from '../../colors';
import { addLeadingZeroes } from '../../helpers';
import connectSocket from '../../socketConnector';
import AirQualityInfo from '../AirQualityInfo';
import Spinner from '../Spinner';
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
  error: {
    marginTop: '5px',
    color: colors.error,
    fontSize: '16px',
  },
});

function Home(props) {
  const classes = styles();

  const { user, loaded } = props;
  const { city, indoorData } = user;

  const [socketLoaded, setSocketLoaded] = useState(false);
  const [indoorAirQualityData, setIndoorAirQualityData] = useState([]);
  const [location, setLocation] = useState('');

  useEffect(() => {
    setIndoorAirQualityData(indoorData?.map(dataPoint => {
      const date = new Date(dataPoint.recordedAt);
      const timeFormatted = `${addLeadingZeroes(date.getHours(), 2)}:${addLeadingZeroes(date.getMinutes(), 2)}:${addLeadingZeroes(date.getSeconds(), 2)}`;
      return {
        time: timeFormatted,
        AQHI: dataPoint.value,
      };
    }));
    setLocation(city);
  }, [user]);

  if (!loaded) {
    return (
      <div className={classes.root}>
        <Header />
        <Spinner />
      </div>
    );
  }

  if (loaded && !socketLoaded) {
    connectSocket();
    setSocketLoaded(true);
  }

  return (
    <div className={classes.root}>
      <Header />
      {(!user.city || !user.model)
        ? <Navigate to="/user/preferences" />
        : (
          <div>
            <div>
              <AirQualityInfo airQualityData={user.outdoorData} location={location} />
              <br />
              <AirQualityInfo airQualityData={indoorAirQualityData} isModelData />
            </div>
          </div>
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

export default connect(mapStateToProps)(Home);
