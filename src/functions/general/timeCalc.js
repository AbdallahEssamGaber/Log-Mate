const { addMinutes, format, roundToNearestMinutes } = require("date-fns");

module.exports = (n) => {
  const date = new Date();
  let newMins = addMinutes(date, n * 60);
  const thePushUp = format(
    roundToNearestMinutes(newMins, { nearestTo: 30 }),
    "p"
  );
  console.log(thePushUp);
  return thePushUp;
};
