module.exports = (time12h) => {
  time12h = time12h.toLowerCase();
  const modifier = time12h.match(/[a-zA-Z]+/g)[0];
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
};
