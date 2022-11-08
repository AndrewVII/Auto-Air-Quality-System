import React from 'react';
import PropTypes from 'prop-types';
import {
  CartesianGrid, Label, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis,
} from 'recharts';
import { createUseStyles } from 'react-jss';
import colors from '../colors';

const styles = createUseStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  graph: {
    height: '100%',
  },
  additionalInfoContainer: {
    marginTop: '20px',
  },
});

function AirQualityInfo({ airQualityData, location }) {
  const classes = styles();

  if (!airQualityData.length) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const curAQHILevel = airQualityData[airQualityData.length - 1].AQHI;

  return (
    <div className={classes.container}>
      <h1>
        {location ? `Today&apos;s AQHI of ${location}` : 'Indoor Air Quality Readings'}
      </h1>
      <div className={classes.graph}>
        <LineChart
          width={1000}
          height={400}
          data={airQualityData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="0 0" />
          <XAxis dataKey="time">
            <Label value="Time" offset={-2} position="bottom" />
          </XAxis>
          <YAxis type="number" dataKey="AQHI" domain={[0, 10]} tickCount={21}>
            <Label value="AQHI" offset={-2} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <ReferenceArea y1={0} y2={4} label="Low Risk" fill={colors.lowRisk} />
          <ReferenceArea y1={4} y2={7} label="Moderate Risk" fill={colors.moderateRisk} />
          <ReferenceArea y1={7} y2={10} label="High Risk" fill={colors.highRisk} />
          <Line type="monotone" dataKey="AQHI" stroke="#FFFFFF" />
        </LineChart>
      </div>
      <div className={classes.additionalInfoContainer}>
        Current AQHI (as of {airQualityData[airQualityData.length - 1].time}): {curAQHILevel}
      </div>
    </div>
  );
}

AirQualityInfo.propTypes = {
  location: PropTypes.string,
  airQualityData: PropTypes.array,
};

export default AirQualityInfo;
