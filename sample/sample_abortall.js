"use strict";
import Pbars from "../progressbars.js";

let bars = [];
const steps = 100;
const names = ["Boh", "Foo", "Woo"];

const initialize = (config) => {
  for (let i = 0; i < 3; i++) {
    bars[i] = new Pbars(names[i], 0, steps);
  }
};

const updateBar = (bar) => {
  const timeout = Math.round(Math.random() * 100);
  setTimeout(() => {
    if (timeout % 69 === 0) {
      bar.abortAll();
    } else {
      bar.incrementBar(1);
    }
  }, timeout);
};

const run = () => {
  for (let i = 0; i < steps; i++) {
    bars.forEach((bar) => updateBar(bar));
  }
};

initialize();
run(bars);
