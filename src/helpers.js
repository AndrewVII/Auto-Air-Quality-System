// eslint-disable-next-line import/prefer-default-export
export const addLeadingZeroes = (number, numOfLeadingZeroes) => {
  let outString = number.toString();
  while (outString.length < numOfLeadingZeroes) {
    outString = `0${outString}`;
  }
  return outString;
};
