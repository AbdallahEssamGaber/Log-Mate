module.exports.addMins = (intMin) => {
  const numberOfMlSeconds = new Date().getTime();

  //if you wanna add hours parse min*60
  const addMlSeconds = intMin * 60 * 1000;
  let newDateObj = new Date(numberOfMlSeconds + addMlSeconds);
  newDateObj.setMinutes(0, 0);

  newDateObj = newDateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return newDateObj;
};

module.exports.subMins = (intMin) => {
  const numberOfMlSeconds = new Date().getTime();

  //if you wanna add hours parse min*60
  const addMlSeconds = intMin * 60 * 1000;
  let newDateObj = new Date(numberOfMlSeconds - addMlSeconds);
  newDateObj.setMinutes(0, 0);

  newDateObj = newDateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return newDateObj;
};
