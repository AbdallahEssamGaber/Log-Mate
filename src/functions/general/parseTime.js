module.exports = (time12h) => {
  time12h = time12h.toLowerCase();
  const modifier = time12h.match(/[a-zA-Z]+/g);
  const time = time12h.replace(modifier, "");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "pm") {
    hours = parseInt(hours, 10) + 12;
  }
  const date = new Date();
  date.setHours(hours - 1, minutes);
  return date.toISOString();
  // time = time.toLowerCase();
  // let date = new Date();
  // const [time, modifier] = time.split(" ");
  // let [hours, minutes] = time.split(":");
  // if (hours === "12") {
  //   hours = "00";
  // }
  // if (modifier === "PM") {
  //   hours = parseInt(hours, 10) + 12;
  // }
  // return `${hours}:${minutes}`;
  // let date = new Date();
  // let [hours, minutes] = time.slice(0, -2).split(":").map(Number);
  // if (time.includes("pm") && hours !== 12) hours += 12;
  // else if (time.includes("am") && hours === 12) hours -= 12;
  // date.setHours(hours, minutes);
  // function pad(num) {
  //   return (num < 10 ? "0" : "") + num;
  // }
  // date =
  //   date.getFullYear() +
  //   "-" +
  //   pad(date.getMonth() + 1) +
  //   "-" +
  //   pad(date.getDate()) +
  //   "T" +
  //   pad(date.getHours()) +
  //   ":" +
  //   pad(date.getMinutes()) +
  //   ":" +
  //   pad(date.getSeconds()) +
  //   "Z";
  // return date;
};
