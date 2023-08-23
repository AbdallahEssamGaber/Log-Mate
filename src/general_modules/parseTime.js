module.exports = (time) => {
  time = time.toLowerCase();
  let date = new Date();
  let [hours, minutes] = time.slice(0, -2).split(":").map(Number);
  if (time.includes("pm") && hours !== 12) hours += 12;
  else if (time.includes("am") && hours === 12) hours -= 12;

  date.setHours(hours, minutes);

  function pad(num) {
    return (num < 10 ? "0" : "") + num;
  }

  date =
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    "Z";
  return date;
};
