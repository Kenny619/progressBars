"use strict";
import Pbars from "../progressbars.js";

const colorNames = [
  "red",
  "oragen",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
];
const colorDefault = [9, 214, 11, 10, 21, 12, 13];
const colorCompleted = [88, 100, 106, 2, 103, 98, 90];
const customTemplate = {
  color: {
    bar: {
      aborted: 251,
    },
  },
  string: {
    title: "Rainbow colored progress bars:\n",
    closing: "The colors!",
  },
};

let rainbows = [];
const steps = 10;
const initialize = () => {
  for (let i = 0; i < 7; i++) {
    let custom = customTemplate;
    custom.color.bar.default = colorDefault[i];
    custom.color.bar.completed = colorCompleted[i];
    custom.color.bar.aborted = colorCompleted[i];
    rainbows[i] = new Pbars(colorNames[i], 0, steps, "", custom);
  }
};

const updateBar = (bar) => {
  const timeout = Math.round(Math.random() * 4000);
  setTimeout(() => {
    if (timeout % 69 === 0) {
      bar.abortBar(`Aborted!  What are the odds! ${timeout}`);
    } else {
      bar.incrementBar(1);
    }
  }, timeout);
};

const run = (rainbows) => {
  for (let i = 0; i < steps; i++) {
    rainbows.forEach((bar) => {
      updateBar(bar);
    });
  }
};

initialize();
run(rainbows);
