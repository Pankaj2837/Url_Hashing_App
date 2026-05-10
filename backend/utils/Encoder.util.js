const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const encode = (num) => {
  let str = "";
  while (num > 0) {
    str = chars[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str || "0";
};

module.exports = { encode };
