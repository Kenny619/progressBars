/*
Default config object structure and values.
  cfg = {
    color: {
      bar: {
        default: 82,
        complete: 64,
        aborted: 220,
      },
      str: {
        default: 231,
        completed: 247,
        aborted: 230,
      },
    },
    barShape: {
      filled: "━",
      blank: " ",
    },
    string: {
      title: "PROGRESS:\n",
      exit: "Completed all tasks.  Exiting program.",
    },
  };
*/

/**
 * Validates the input configuration object against a default data structure.
 *
 * @param {Object} cfg - The configuration object to validate.
 * @throws {Error} Throws an error if the configuration does not match the expected structure or values.
 * @returns {boolean} Returns true if the configuration is valid.
 */
const validateConfig = cfg => {
  /**
   * Recursively validates the configuration object.
   *
   * @param {Object} obj - The object to validate.
   * @throws {Error} Throws an error if the object does not match the expected structure or values.
   */
  const validateObject = obj => {
    //Return false if obj was not passed
    if (!obj) return false;

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === "object") {
        validateObject(obj[key]);
      } else {
        const colorKey = ["default", "aborted", "completed"];
        const shapeKey = ["filled", "blank"];

        if (colorKey.some(entry => key === entry)) {
          // Validates that 'colors' values in the config object are integers between 0 and 255.
          if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(obj[key])) {
            throw new Error(`'colors' values in config object must be integers between 0 and 255.`);
          }
        } else if (shapeKey.some(entry => key === entry)) {
          // Validates that 'barShape' values in the config object are 1 character long.
          if (!/^.$/.test(obj[key])) {
            throw new Error(`'barShape' values in config object must be 1 character long.`);
          }
        }
      }
    });
  };

  validateObject(cfg);
  return true;
};

export default validateConfig;
