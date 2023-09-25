module.exports.addMins = (intMin) => {
  let dateObj = [];
  const numberOfMlSeconds = new Date().getTime();

  //if you wanna add hours parse min*60
  const addMlSeconds = intMin * 60 * 1000;
  let newDateObj = new Date(numberOfMlSeconds + addMlSeconds);

  newDateObj.setMinutes(30, 0);
  dateObj.push(
    newDateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  newDateObj.setMinutes(0, 0);

  dateObj.push(
    newDateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  return dateObj;
};

module.exports.subMins = (intMin) => {
  let dateObj = [];
  const numberOfMlSeconds = new Date().getTime();

  //if you wanna add hours parse min*60
  const addMlSeconds = intMin * 60 * 1000;
  let newDateObj = new Date(numberOfMlSeconds - addMlSeconds);
  newDateObj.setMinutes(0, 0);

  dateObj.push(
    newDateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  newDateObj.setMinutes(30, 0);
  dateObj.push(
    newDateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  return dateObj;
};
