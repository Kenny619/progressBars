let cObj = {
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

let customObj = {
  barShape: {
    filled: "■",
    blank: "□",
  },
  color: {
    bar: {
      complete: 999,
    },
    str: {
      aborted: 9999,
      depth: {
        bottom: true,
      },
    },
  },
};

/*
obj = {
    barShape:obj,
    color:{
        bar:obj,
        str:obj,
        dep:{
            exm:1,
            bot:obj,
        }
    },
}

if bot.obj doesn't contain object, then update bot.obj
return new bot.obj
along with the new bot.obj, rewrite dep
return new dep
along with the new dep, rewrite color
obj.color = new color

key(bot) =  update obj
return dep = {exm, new bot}
return color = {bar, str, new dep};
obj[color] = returned color


*/

function objUpdate(target, source) {
  Object.entries(source).forEach(([k, v]) => {
    if (typeof v === "object") {
      objUpdate(target[k], source[k]);
    } else {
      if (target[k] !== source[k]) target[k] = source[k];
    }
  });
}

console.log(objUpdate(cObj, customObj));

// function objUpdate(target, source, keys=[]){
//     Object.entries(source).forEach(([k, v]) => {
//         if(typeof v === 'object'){
//             Object.entries(v).forEach(([kk, vv]) => {
//                 target[k][kk] = vv;
//             });
//         }else{
//             target[k] = source[k];
//         }
//     });
// }

return;
cObj = tmpObj;
console.log(cObj);
return;

const ary = [
  { id: 1, name: "first" },
  { id: 2, name: "2nd" },
  { id: 3, name: "3rd" },
];

const addAry = [
  { id: 5, name: "5th" },
  { id: 6, name: "6th" },
  { id: 7, name: "7th" },
];
const n = { id: 4, name: "4th" };
const i = ary.findIndex((v) => v.id === 4);
i < 0 ? ary.push(n) : (ary[i] = n);
console.log(ary);

_drawBar = (barLength, percent) => {
  const percentPerBar = _round0(100 / barLength);
  const coloredBar = _round0(percent / percentPerBar);
  const emptyBar = barLength - coloredBar;
  console.log(coloredBar, emptyBar);

  return Array(coloredBar).fill("■").concat(Array(emptyBar).fill("□")).join("");
};

_round0 = (float) => {
  return Number(Math.round(float + "e" + 0) + "e-" + 0);
};

const bar = _drawBar(27, 112);
console.log(bar);
