/**
 * Recursively updates a target object with values from a source object, overwriting default values with user-provided values.
 *
 * @param {Object} target - The target object to be updated.
 * @param {Object} source - The source object containing user-provided values.
 * @returns {Object} Returns the updated object.
 */
export function nestedObjUpdate(target, source) {
  // Temporary object to store the updated values.
  let updatedObject = {};

  // Iterate through each key in the target object.
  Object.keys(target).forEach(key => {
    // Check if the value at the current key is an object and if the source object has a corresponding key.
    if (typeof target[key] === "object" && source.hasOwnProperty(key)) {
      // Recursively update nested objects.
      updatedObject[key] = nestedObjUpdate(target[key], source[key]);
    } else {
      // If the source object is undefined or does not have the current key, use the default value from the target object.
      // Otherwise, use the value from the source object.
      updatedObject[key] = source === undefined || !source.hasOwnProperty(key) ? target[key] : source[key];
    }
  });

  // Return the updated object.
  return updatedObject;
}

/**
 * Rounds a floating-point number to the nearest integer.
 *
 * @param {number} float - The floating-point number to be rounded.
 * @returns {number} Returns the rounded integer.
 */
export function round0(float) {
  // Convert the floating-point number to a string representation in scientific notation
  // with 0 decimal places and then back to a number.
  // This effectively rounds the number to the nearest integer.
  return Number(Math.round(float + "e" + 0) + "e-" + 0);
}
