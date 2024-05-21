"use strict";
//dependency
import rl from "readline";

// /lib functions
import validateConfig from "./lib/validation.js";
import { nestedObjUpdate, round0 } from "./lib/utility.js";

/**
 * Class representing a console progress bar manager.
 * @class
 */
class Pbars {
  /**
   * Counter for generating unique IDs for progress bars.
   * @static
   * @type {number}
   */
  static idCounter = 0;

  /**
   * Array to store information about each progress bar.
   * @static
   * @type {Array}
   */
  static container = [];

  /**
   * Array container of messages/warnings/errors to be displayed when
   * @static
   * @type {Array}
   */
  static msgContainer = [];

  /**
   * @typedef {Object} StatusObject -
   * @property {boolean} titlePrint - Indicates whether title printing is enabled.
   * @property {boolean} closingPrint - Indicates whether closing printing is enabled.
   * @property {boolean} completed - Indicates whether a task is completed.
   */
  static status = {
    titlePrint: false,
    completed: false,
  };

  /**
   * Width of the terminal where the progress bars are displayed.
   * @static
   * @type {number}
   */
  static terminalWidth = process.stdout.columns;

  /**
   * Set default string and bar color
   */
  static cObj = {
    color: {
      bar: {
        default: 82, //#5fff00
        completed: 64, //#5f8700
        aborted: 178, //#d7af00
      },
      str: {
        default: 231, //#ffffff
        completed: 247, //#9e9e9e
        aborted: 214, //#ffaf00
      },
    },
    barShape: {
      filled: "━",
      blank: " ",
    },
    string: {
      title: "PROGRESS:\n",
      closing: "Completed all tasks.  Exiting program.",
    },
  };

  /**
   * Create a progress bar.
   * @constructor
   * @param {string} name - The name of the progress bar.
   * @param {number} start - The starting value of the chunk.
   * @param {number} end - The end value of the chunk.
   * @param {string} [comment] - Status comment displayed at the far right of the bar.
   * @param {object} [customConfig] - Object of config parameters e.g. string/bar color.
   * @throws {Error} Throws an error if the module is not running in a TTY.
   */
  constructor(name, start, end, comment = "", customConfig = Pbars.cObj) {
    if (!process.stdout.isTTY) {
      throw new Error("This module requires a TTY to function properly.");
    }

    //bar parameter id - Identifier in container
    this.id = ++Pbars.idCounter;

    //name of the bar, displayed left of the progress bar
    this.name = name;

    //starting value of the chunk.
    this.start = start;

    //End value of the chunk.
    this.end = end;

    //Current value of the chunk.  Progress reaches 100% when this.now = this.end
    this.now = start;

    //Status comment.  Displayd at the far right of the bar when there is sufficient space.
    this.comment = comment;

    //Progress in percentage.  this.value / this.end * 100
    this.percent = this._getPercenetage() || 0;

    //True when abort() is called and.  Changes color on the terminal.
    this.aborted = false;

    //Update configObj preset colors if customConfig is provided.
    this.config = {};

    if (validateConfig(customConfig)) {
      this.config = nestedObjUpdate(Pbars.cObj, customConfig);
    }
    this._updateContainer();
    this.render();
  }

  /**
   * Check if all progress bars are completed.
   * @returns {boolean} Returns true if all progress bars are at 100%.
   */
  _isCompleted = () => {
    if (Pbars.container.length > 0) {
      return Pbars.container.every(
        (entry) => entry.percent === 100 || entry.aborted === true
      );
    } else {
      return false;
    }
  };

  _getPercenetage = () => {
    return round0((this.now / this.end) * 100);
  };

  /**
   * Generate a progress bar string with a given length and percentage.
   * @param {number} barLength - The length of the progress bar.
   * @param {number} percent - The completion percentage.
   * @returns {string} Returns the generated progress bar string.
   */
  _drawBar = (barLength, percent) => {
    const percentPerBar = round0(100 / barLength);
    const coloredBar = round0(percent / percentPerBar);
    const emptyBar = barLength - coloredBar;

    return Array(coloredBar)
      .fill(this.config.barShape.filled)
      .concat(Array(emptyBar).fill(this.config.barShape.blank))
      .join("");
  };

  /**
   * Update the static progress bar container array with the current progress bar information.
   */
  _updateContainer = () => {
    //Exit process if the bar instance is already completed.

    const props = Object.entries(this).filter(
      ([k, v]) => typeof v !== "function"
    );
    const obj = Object.fromEntries(props);

    obj.percent = this._getPercenetage();

    const i = Pbars.container.findIndex((entry) => entry.id === this.id);
    i < 0 ? Pbars.container.push(obj) : (Pbars.container[i] = obj);
  };

  /**
   * Increment the progress of the current progress bar.
   * @param {number} value - The increment value.
   * @param {string} [comment=""] - The status comment for the progress bar.
   */
  incrementBar = (value, comment = "") => {
    //Exit if incrementBar was called on completed or aborted bar
    if (
      this.percent === 100 ||
      this.aborted === true ||
      Pbars.status.completed
    ) {
      return;
    }

    this.now += value;
    this.comment = comment;
    this._updateContainer();
    this.render();
  };

  /**
   * Changes the color of the bar to aborted status and blocks all future update to the bar.
   * @param {string} [comment=""] - The status comment for the progress bar.
   */
  abortBar = (comment = "") => {
    //Exit if incrementBar was called on completed or aborted bar
    if (
      this.percent === 100 ||
      this.aborted === true ||
      Pbars.status.completed
    ) {
      return;
    }
    this.aborted = true;
    this.comment = comment;
    this._updateContainer();
    this.render();
  };

  /**
   * Delete the current progress bar from the container.
   */
  deleteBar = () => {
    if (Pbars.status.completed) {
      return;
    }
    const i = Pbars.findIndex((entry) => entry.id === this.id);
    Pbars.container.splice(i, 1);
  };

  /**
   * Add color to a string using ANSI color codes.
   * @param {string} string - The input string.
   * @param {number} ANSIcolorNumber - The ANSI color code.
   * @returns {string} Returns the input string wrapped in ANSI color code.
   * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit 8bit ANSI COLOR codes}
   */
  _color = (string, ANSIcolorNumber) => {
    return `\x1b[38;5;${ANSIcolorNumber}m${string}\x1b[0m`;
  };

  /**
   * Compose the output string for the current progress bar.
   * @param {Object} barArgs - The arguments for the progress bar.
   * @returns {string} Returns the composed output string.
   */
  _composeOutput = (barArgs) => {
    //Update the terminal width.
    Pbars.terminalWidth = process.stdout.columns;

    /** Magic numbers */
    const LENGTH_BAR10 = 11; //10 for the bar and 1 trailing space
    const LENGTH_BAR20 = 21; //20 for the bvar and 1 trailing space
    const LENGTH_TRAILING_DOTS = 3; //"..."
    const LENGTH_PERCENTAGE = 5; // 4 for "000%" and 1 for trailing space.

    //Get the longest obj.name in the container and secure the space.
    const nameColWidth = Math.max(...Pbars.container.map((o) => o.name.length));

    //Get the longest digits of end.
    const stepWidth = Math.max(
      ...Pbars.container.map((o) => String(o.end).length)
    );

    //width required to output completed steps and total number of steps -> " (now/end)"
    //2 stepWidth for now and end plus 4 = parenthesis, slash, and trailing space.
    const chunkColWidth = stepWidth * 2 + 4;

    // PrintMargin is the minimum width required to print the shortest format "name xxx%"
    const printMargin =
      Pbars.terminalWidth - (nameColWidth + LENGTH_PERCENTAGE);

    /** default strings to be rendered
     * adding separating space at the end of each variables.
     */
    let name = barArgs.name.padStart(nameColWidth, " ") + " ";

    let percentage = String(barArgs.percent).padStart(3, " ") + "% ";
    let chunks = `(${String(barArgs.now).padStart(stepWidth, "0")}/${String(
      barArgs.end
    ).padStart(stepWidth, "0")}) `;

    let bar10 = this._drawBar(10, barArgs.percent);
    let bar20 = this._drawBar(20, barArgs.percent);

    //Adjust comment length.  If the comment is longer than a printable space, slice it and add trailing "..."
    let comm = barArgs.comment;
    const comLength =
      printMargin - chunkColWidth - LENGTH_PERCENTAGE - LENGTH_BAR20;
    if (comm.length >= comLength) {
      comm =
        comm.slice(0, comLength - LENGTH_TRAILING_DOTS) +
        Array(LENGTH_TRAILING_DOTS).fill(".").join("");
    }

    //Apply this.config color values to strings and bar based on the status i.e. completed/aborted/default = others
    const strPart = [name, percentage, chunks, comm];
    const barPart = [bar10, bar20];
    const status =
      barArgs.percent === 100
        ? "completed"
        : barArgs.aborted
        ? "aborted"
        : "default";
    strPart.forEach(
      (entry, index) =>
        (strPart[index] = this._color(entry, barArgs.config.color.str[status]))
    );
    barPart.forEach(
      (entry, index) =>
        (barPart[index] = this._color(entry, barArgs.config.color.bar[status]))
    );

    [name, percentage, chunks, comm] = strPart;
    [bar10, bar20] = barPart;

    let output = "";
    /** Exit if the terminal width is 0 */
    if (printMargin < 0) {
      throw new Error("Terminal too small...");

      //Print name and percentage. format => "name xxx%"
    } else if (printMargin < chunkColWidth) {
      output = `${name}${percentage}%\n`;

      //Print name, percentage, and chunks.  format => "name xxx% (now/end)"
    } else if (printMargin < chunkColWidth + LENGTH_BAR10) {
      output = `${name}${percentage}${chunks}\n`;

      //Print name, 10-length-bar, percentage, and chunks. format => "name:bar(10) xxx% (now/end)"
    } else if (printMargin < chunkColWidth + LENGTH_BAR20) {
      output = `${name}${bar10} ${percentage}${chunks}\n`;

      //Print all components.  format => "name: bar(20) xxx% (now/end) comment..."
    } else {
      output = `${name}${bar20} ${percentage}${chunks}${comm}\n`;
    }

    return output;
  };

  /**
   * Render all progress bars to the console.
   */
  render = () => {
    //if (this._isCompleted()) return;

    // Exit if there's nothing to print
    if (Pbars.container.length === 0) return;

    /** print tilte once */
    if (Pbars.status.titlePrint === false) {
      /** Add trailing linechange if there's none */
      if (!/\n|\r|\r\n$/.test(this.config.string.title)) {
        this.config.string.title += "\n";
      }

      process.stdout.write("\x1B[?25l"); //hide cursor
      process.stdout.write("\n" + this.config.string.title);
      Pbars.status.titlePrint = true;
    }

    /** Print out all the bars stored in Pbars.container */
    Pbars.container.forEach((entry) => {
      rl.clearLine(process.stdout, 0);
      let output = this._composeOutput(entry);
      process.stdout.write(output);
    });

    if (this._isCompleted()) {
      this._exitBar();
    } else {
      /** move cursor back to the starting line of stdout */
      //    const NumPrintedLines = Pbars.container.length - 1;
      rl.moveCursor(process.stdout, 0, 0 - Pbars.container.length);
    }
  };

  _exitBar = () => {
    //Output exit message.
    process.stdout.write(`\n${this.config.string.closing}\n\n`);
    //unhide cursor
    process.stdout.write("\x1B[?25h");

    Pbars.status.closingPrint = true;
    Pbars.status.completed = true;
    return;
  };

  reset = () => {
    if (!Pbars.status.completed) {
      throw new Error(`Exisitng instances are still running.`);
    }
    Pbars.container = [];
    Pbars.status.titlePrint = false;
    Pbars.status.completed = false;
  };

  getBar = () => {
    const properties = Object.entries(this).filter(
      ([k, v]) => typeof v !== "function"
    );
    return Object.fromEntries(properties);
  };

  abortAll = () => {
    if (Pbars.status.completed) {
      return;
    }

    rl.moveCursor(process.stdout, 0, Pbars.container.length);
    //Output exit message.
    process.stdout.write(`\nAborting the progress bar\n\n`);
    //unhide cursor
    process.stdout.write("\x1B[?25h");

    Pbars.status.closingPrint = true;
    Pbars.status.completed = true;
  };
}

export default Pbars;
