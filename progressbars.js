const rl = require("readline");
const my = require("../lib/myUtil.js");
const round0 = my.round(0);

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
   * Flag indicating whether the title has been printed.
   * @static
   * @type {boolean}
   */
  static titlePrintedStatus = false;

  /**
   * Width of the terminal where the progress bars are displayed.
   * @static
   * @type {number}
   */
  static terminalWidth = process.stdout.columns;

  /**
   * Create a progress bar.
   * @constructor
   * @param {string} name - The name of the progress bar.
   * @param {number} start - The starting value of the chunk.
   * @param {number} end - The end value of the chunk.
   * @param {string} [comment=""] - Status comment displayed at the far right of the bar.
   * @throws {Error} Throws an error if the module is not running in a TTY.
   */
  constructor(name, start, end, comment = "") {
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
    this.percent = 0;

    //True when the tracked task is on pause.  Changes color on the terminal.
    this.paused = false; //Use

    this.updateContainer();
    this.render();
  }

  /**
   * Check if all progress bars are completed.
   * @returns {boolean} Returns true if all progress bars are at 100%.
   */
  isCompleted = () => {
    return Pbars.container.every(entry => entry.percent === 100);
  };

  /**
   * Generate a progress bar string with a given length and percentage.
   * @param {number} barLength - The length of the progress bar.
   * @param {number} percent - The completion percentage.
   * @returns {string} Returns the generated progress bar string.
   */
  getPercenetage = () => {
    return round0((this.now / this.end) * 100);
  };

  generateBar = (barLength, percent) => {
    const percentPerBar = round0(100 / barLength);
    const coloredBar = round0(percent / percentPerBar);
    const emptyBar = round0(barLength - coloredBar);
    return Array(coloredBar).fill("━").concat(Array(emptyBar).fill(" ")).join("");
  };

  /**
   * Update the static progress bar container array with the current progress bar information.
   */
  updateContainer = () => {
    let idExists = false;
    const barObj = {
      id: this.id,
      name: this.name,
      start: this.start,
      end: this.end,
      now: this.now,
      comment: this.comment,
      percent: this.getPercenetage(),
      paused: this.paused,
    };

    Pbars.container.forEach((obj, index) => {
      if (obj.id === this.id) {
        Pbars.container[index] = barObj;
        idExists = true;
      }
    });
    if (idExists === false) Pbars.container.push(barObj);
  };

  /**
   * Increment the progress of the current progress bar.
   * @param {number} value - The increment value.
   * @param {string} [comment=""] - The status comment for the progress bar.
   */
  increment = (value, comment = "") => {
    this.paused = false;
    this.now += value;
    this.comment = comment;

    this.updateContainer();
    this.render();

    if (this.isCompleted()) {
      process.stdout.write("\x1B[?25h"); //unhide cursor
    }
  };

  /**
   * Display a string in bold.
   * @param {String} string - input string
   * @returns {String} sring wrapped in a bold ANSI code.
   */

  /**
   * Add color to a string using ANSI color codes.
   * @param {string} string - The input string.
   * @param {number} ANSIcolorNumber - The ANSI color code.
   * @returns {string} Returns the input string wrapped in ANSI color code.
   * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit|ANSI color codes}
   */
  color = (string, ANSIcolorNumber) => {
    return `\x1b[38;5;${ANSIcolorNumber}m${string}\x1b[0m`;
  };

  /**
   * Compose the output string for the current progress bar.
   * @param {Object} barArgs - The arguments for the progress bar.
   * @returns {string} Returns the composed output string.
   */
  composeOutput = barArgs => {
    //Update the terminal width.
    Pbars.terminalWidth = process.stdout.columns;

    /** Magic numbers */
    const LENGTH_BAR10 = 12;
    const LENGTH_BAR20_COMMENT = 21;
    const LENGTH_TRAILING_DOTS = 3;
    const LENGTH_PERCENTAGE = 5;

    //Get the longest obj.name in the container and secure the space.
    const nameColWidth = Math.max(...Pbars.container.map(o => o.name.length));

    //Get the longest digits of end.
    const stepWidth = Math.max(...Pbars.container.map(o => String(o.end).length));

    //width required to output completed steps and total number of steps -> " (now/end)"
    //2 stepWidth for now and end plus 4 = parenthesis, slash, and trailing space.
    const chunkColWidth = stepWidth * 2 + 4;

    // PrintMargin is the minimum width required to print the shortest format "name xxx%"
    const printMargin = Pbars.terminalWidth - (nameColWidth + LENGTH_PERCENTAGE);

    /** ANSI color codes */
    const COLOR_STR_COMPLETED = 247;
    const COLOR_BAR_COMPLETED = 64;
    const COLOR_STR_PAUSED = 230;
    const COLOR_BAR_PAUSED = 220;

    /** default strings to be rendered
     * adding separating space at the end of each variables.
     */
    let name = String(barArgs.name + " ").padStart(nameColWidth, " ");
    let percentage = String(barArgs.percent).padStart(3, " ") + "% ";
    let chunks = `(${String(barArgs.now).padStart(stepWidth, "0")}/${String(barArgs.end).padStart(stepWidth, "0")}) `;
    let bar10 = this.color(this.generateBar(10, barArgs.percent), 82);
    let bar20 = this.color(this.generateBar(20, barArgs.percent), 82);

    /** Adjust comment length.  If the comment is longer than a printable space, slice it
     *  and add trailing "...""
     * */
    let comment = barArgs.comment;
    const comLength = printMargin - chunkColWidth - LENGTH_PERCENTAGE - LENGTH_BAR20_COMMENT;
    if (comment.length >= comLength) {
      comment = comment.slice(0, comLength - LENGTH_TRAILING_DOTS) + Array(LENGTH_TRAILING_DOTS).fill(".").join("");
    }

    /** coloring when the bar is paused */
    if (barArgs.paused) {
      name = this.color(name, COLOR_STR_PAUSED);
      percentage = this.color(percentage, COLOR_STR_PAUSED);
      chunks = this.color(chunks, COLOR_STR_PAUSED);
      bar10 = this.color(this.generateBar(10, barArgs.percent), COLOR_BAR_PAUSED);
      bar20 = this.color(this.generateBar(20, barArgs.percent), COLOR_BAR_PAUSED);
      comment = this.color(comment, COLOR_STR_PAUSED);
    }
    /** coloring when the bar is at 100% */
    if (barArgs.percent === 100) {
      name = this.color(name, COLOR_STR_COMPLETED);
      percentage = this.color(percentage, COLOR_STR_COMPLETED);
      chunks = this.color(chunks, COLOR_STR_COMPLETED);
      bar10 = this.color(this.generateBar(10, barArgs.percent), COLOR_BAR_COMPLETED);
      bar20 = this.color(this.generateBar(20, barArgs.percent), COLOR_BAR_COMPLETED);
      comment = this.color(comment, COLOR_STR_COMPLETED);
    }

    let output = "";
    /** Exit if the terminal width is 0 */
    if (printMargin < 0) {
      throw new Error("Terminal too small...");

      /** Print name and percentage.
       * format => "name xxx%""
       * */
    } else if (printMargin < chunkColWidth) {
      output = `${name}${percentage}%\n`;

      /** Print name, percentage, and chunks.
       * format => "name xxx% (now/end)"
       *  */
    } else if (printMargin < chunkColWidth + LENGTH_BAR10) {
      output = `${name}${percentage}${chunks}\n`;

      /** Print name, 10-length-bar, percentage, and chunks.
       * format => "name:bar(10) xxx% (now/end)"
       * 22 = bar(20), 4 = first letter of comment + ...
       */
    } else if (printMargin < chunkColWidth + LENGTH_BAR20_COMMENT) {
      output = `${name}${bar10} ${percentage}${chunks}\n`;

      /** name: bar(20) xxx% (now/end) comment... */
    } else {
      output = `${name}${bar20} ${percentage}${chunks}${comment}\n`;
    }

    return output;
  };

  /**
   * Render all progress bars to the console.
   */
  render = () => {
    /** Exit if there's nothing to print */
    if (Pbars.container.length === 0) return false;
    /** print tilte once */
    if (Pbars.titlePrintedStatus === false) {
      process.stdout.write("\x1B[?25l"); //hide cursor
      const progressBarTitle = "\nProgress:\n";
      process.stdout.write(progressBarTitle);
      Pbars.titlePrintedStatus = true;
    }

    /** Print out all the bars stored in Pbars.container */
    Pbars.container.forEach(barObj => {
      rl.clearLine(process.stdout, 0);
      let output = this.composeOutput(barObj);
      process.stdout.write(output);
    });

    /** move cursor back to the starting line of stdout */
    //    const NumPrintedLines = Pbars.container.length - 1;
    if (!this.isCompleted()) {
      rl.moveCursor(process.stdout, 0, 0 - Pbars.container.length);
    }
  };

  /**
   * Pause the current progress bar.  Changes the color of the bar.
   */
  pause = () => {
    // Change the paused status to true.  Indicates whether the progress bar is paused
    this.paused = true;
    this.render();
  };

  /**
   * Delete the current progress bar from the container.
   */
  delete = () => {
    Pbars.container.forEach((entry, index) => {
      if (entry.id === this.id) {
        Pbars.container.splice(index, 1);
      }
    });
  };
}

module.exports = Pbars;
