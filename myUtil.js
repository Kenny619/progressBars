const fs = require("fs");
let instance;

class Utilities {
  constructor() {}
  insteance = this;

  /**
   * Oneline throw new Error wrapper
   *
   * @param {error} err - Catched err val
   */

  throwNewErr = (err) => {
    throw new Error(err);
  };

  /**
   * Oneline return wrapper
   *
   * @param {any} val
   * @returns {any} returns val
   */

  return = (val) => {
    return val;
  };

  getObject = (arr, key, val) => arr.filter((obj) => obj[key] === val);
  /**
   * Searches key from an array of objects and return its values
   *
   * @param {object} objs - Object
   * @param {any} key - Key to be searched
   * @returns {Array} - Array of object values from searched key
   */
  pluck = (objs, key) => objs.map((obj) => obj[key]);

  round = (digits) => {
    return (decimal) =>
      Number(Math.round(decimal + "e" + digits) + "e-" + digits);
  };
}

const My = Object.freeze(new Utilities());

module.exports = My;
