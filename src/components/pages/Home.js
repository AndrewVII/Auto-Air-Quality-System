import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { connect } from 'react-redux';
import { Navigate } from 'react-router';
import { getAQHIFromGovernment, login } from '../../api';

import colors from '../../colors';
import AirQualityInfo from '../AirQualityInfo';

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

  const [city, setCity] = useState('');
  const [airQualityData, setAirQualityData] = useState([]);
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const getData = async () => {
    const data = await getAQHIFromGovernment(city);
    const { features } = data;
    if (!features.length) {
      setError(`${city} is not an available location.`);
      return;
    }
    setError('');
    features.sort((a, b) => (Date.parse(a.properties.observation_datetime) - Date.parse(b.properties.observation_datetime)));

    const graphData = features.map(feature => {
      const date = new Date(feature.properties.observation_datetime);
      const dateFormatted = `${date.getMonth() + 1}-${date.getDate()}, ${date.getHours()}H`;
      return {
        date: dateFormatted,
        AQHI: feature.properties.aqhi,
      };
    });

    setLocation(features[0].properties.location_name_en);
    setAirQualityData(graphData);
  };

  if (!loaded) {
    return (<></>);
  }

  return (
    <div className={classes.root}>
      {(!user.city || !user.model)
      ? <Navigate to="/user/preferences" />
      : <div>
        <div>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          <button type="submit" onClick={getData}>Get data for city</button>
        </div>
        <div>
          {error && <div className={classes.error}>{error}</div>}
          {location && !error && <AirQualityInfo airQualityData={airQualityData} location={location} />}
        </div>
      </div>}
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
