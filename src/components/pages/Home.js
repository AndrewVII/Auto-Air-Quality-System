import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
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
});

function Home() {
  const classes = styles();

  const [city, setCity] = useState('');
  const [airQualityData, setAirQualityData] = useState([]);
  const [location, setLocation] = useState('');

  const getData = async () => {
    const data = await getAQHIFromGovernment(city);
    await login('test1', 'test2');

    const { features } = data;
    features.sort((a, b) => (Date.parse(a.properties.observation_datetime) - Date.parse(b.properties.observation_datetime)));

    const graphData = features.map(feature => {
      const date = new Date(feature.properties.observation_datetime);
      const dateFormatted = `${date.getMonth() + 1}-${date.getDate()}, ${date.getHours()}H`;
      return {
        date: dateFormatted,
        AQHI: feature.properties.aqhi,
      };
    });

    // graphData = graphData.slice(graphData.length - 10, graphData.length);

    setLocation(features[0].properties.location_name_en);
    setAirQualityData(graphData);
  };

  return (
    <div className={classes.root}>
      <div>
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
        <button type="submit" onClick={getData}>Get data for city</button>
      </div>
      <div>
        {location && <AirQualityInfo airQualityData={airQualityData} location={location} />}
      </div>
    </div>
  );
}

Home.propTypes = {
};

export default Home;
