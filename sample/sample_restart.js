"use strict";
import Pbars from "../progressbars.js";

let bars = [];
let configs = [
  {
    string: { title: "Round1:", closing: "Finished Round1, moving to Round2!" },
  },
  {
    string: { title: "Round2:", closing: "Finished Round2, moving to Round3!" },
  },
  {
    string: { title: "Round3:", closing: "All races completed!" },
  },
];
const steps = 10;
const names = ["Amuro", "Kamille", "Judau"];
const initialize = (config) => {
  for (let i = 0; i < 3; i++) {
    bars[i] = new Pbars(names[i], 0, steps, "", config);
  }
};

const updateBar = () => {
  return new Promise((resolve, reject) => {
    const timeout = Math.round(Math.random() * 200);
    setTimeout(() => {
      if (timeout % 69 === 0) {
        reject();
      } else {
        resolve();
      }
    }, timeout);
  });
};

const run = async (bars) => {
  for (let i = 0; i < steps; i++) {
    for (let bar of bars) {
      try {
        await updateBar();
        bar.incrementBar(1);
      } catch (err) {
        bar.abortBar(`Tripped! Retired this round.`);
      }
    }
  }
  return;
};

initialize(configs[0]);
await run(bars);
bars[0].reset();
initialize(configs[1]);
await run(bars);
bars[0].reset();
initialize(configs[2]);
await run(bars);
