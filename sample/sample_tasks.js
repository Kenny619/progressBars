const Pbars = require("../progressbars");
const steps = 10;

const newConfig = {
  STR_TITLE: "Task progress:",
  STR_EXIT: "All tasks completed! Exiting program.",
};
const pb1 = new Pbars(
  "task1",
  0,
  steps,
  "Initializing Progress Bar",
  newConfig
);
const pb2 = new Pbars(
  "task2",
  0,
  steps,
  "Initializing Progress Bar",
  newConfig
);

const fnTasks1 = Array(steps)
  .fill(0)
  .map((v, index) => {
    return () => {
      const timeout = index * 100;
      setTimeout(() => {
        pb1.incrementBar(1, `Step #${index + 1} completed!`);
      }, timeout);
    };
  });

const fnTasks2 = Array(steps)
  .fill(0)
  .map((v, index) => {
    return () => {
      const timeout = index * 200;
      setTimeout(() => {
        if (index === 7) {
          pb2.abortBar("Task failed...  Aborting program.");
        } else {
          pb2.incrementBar(1, `Step #${index + 1} completed!`);
        }
      }, timeout);
    };
  });

for (n = 0; n < fnTasks1.length; n++) {
  fnTasks1[n]();
  fnTasks2[n]();
}
