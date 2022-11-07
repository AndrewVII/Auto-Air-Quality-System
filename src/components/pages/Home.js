import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { Navigate } from 'react-router';
import { getAQHIFromGovernment } from '../../api';

import colors from '../../colors';
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
  const { city } = user;

  const [loading, setLoading] = useState(false);
  const [airQualityData, setAirQualityData] = useState([]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const getData = async () => {
    setError('');
    setLoading(true);

    const data = await getAQHIFromGovernment(city);
    const { features } = data;
    if (!features.length) {
      setLocation('Not available');
      setError(`${city} is not an available location.`);
      setLoading(false);
      return;
    }
    features.sort((a, b) => (Date.parse(a.properties.observation_datetime) - Date.parse(b.properties.observation_datetime)));

    const graphData = features.map(feature => {
      const date = new Date(feature.properties.observation_datetime);
      const dateFormatted = `${date.getMonth() + 1}-${date.getDate()}, ${date.getHours()}H`;
      return {
        date: dateFormatted,
        AQHI: feature.properties.aqhi,
      };
    });

    setLoading(false);
    setLocation(features[0].properties.location_name_en);
    setAirQualityData(graphData);
  };

  if (loading || !loaded) {
    return (
      <div className={classes.root}>
        <Header />
        <Spinner />
      </div>
    );
  }

  if (loaded && !loading && !location) {
    getData();
    connectSocket();
  }

  return (
    <div className={classes.root}>
      <Header />
      {(!user.city || !user.model)
        ? <Navigate to="/user/preferences" />
        : (
          <div>
            <div>
              {error === ''
                ? <AirQualityInfo airQualityData={airQualityData} location={location} />
                : <div className={classes.error}>{error}</div>}
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
