const { addMinutes, format, roundToNearestMinutes } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");
module.exports = (n) => {
  const date = utcToZonedTime(new Date(), "Africa/Cairo");
  let newMins = addMinutes(date, n * 60);
  const thePushUp = format(
    roundToNearestMinutes(newMins, { nearestTo: 30 }),
    "p"
  );
  return thePushUp;
};
