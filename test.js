const ary = [100, false, 100, 100, 100, 100];

const r = ary.every((entry) => entry === 100 || entry === false);
console.log(r);
