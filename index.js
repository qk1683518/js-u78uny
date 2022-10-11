class Queue {
  constructor() {
    this.list = [];
    this.index = 0;
    this.isStop = false;
    this.isRunning = false;
    this.isParallel = false;
  }

  next = () => {
    if (this.index >= this.list.length - 1) {
      this.isRunning = false;
      this.clear();
      return;
    }
    if (this.index >= this.list.length - 1 || this.isStop || this.isParallel) {
      return;
    }
    const cur = this.list[++this.index];
    cur(this.next);
    // cur().then(() => next());
  };

  add(...fn) {
    this.list.push(...fn);
  }

  del() {
    return this.list.shift();
  }

  clear() {
    this.index = 0;
    this.list.length = 0;
  }

  run(...args) {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    const cur = this.list[this.index];
    typeof cur === 'function' && cur(this.next);
    // typeof cur === "function" && cur().then(() => next());
  }

  parallelRun() {
    this.isParallel = true;
    console.log(this.list);
    for (const fn of this.list) {
      fn(this.next);
      // fn().then(() => next());
    }
  }

  stop() {
    this.isStop = true;
  }

  retry() {
    this.isStop = false;
    this.run();
  }

  goOn() {
    this.isStop = false;
    this.next();
  }
}

class A extends Queue {
  constructor() {
    super();
  }

  async = (x) => {
    return async (next) => {
      await this.reorder(x);
      next();
    };
  };

  reorder(x) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(x, this);
        resolve();
      }, 1000);
    });
  }

  addQueueAndRun(x) {
    this.add(this.async(x));
    if (this.list.length && this.isRunning) {
      return;
    }
    // this.parallelRun();
    this.run();
    console.log('11', this.list.length, this.isRunning);
  }
}

const a = new A();
a.addQueueAndRun(2);
a.addQueueAndRun(3);
a.addQueueAndRun(4);

// const async = (x) => {
//   return (next) => {
//     setTimeout(() => {
//       console.log(x);
//       next();
//     }, 1000);
//   };
// };

// const q = new Queue();
// const funs = '123456'.split('').map((x) => async(x));
// q.add(...funs);
// // q.parallelRun();
// q.run();

// const queue = () => {
//   const list = [];
//   let index = 0;
//   let isStop = false;
//   let isRunning = false;
//   let isParallel = false;

//   const next = async () => {
//     if (index >= list.length - 1) {
//       isRunning = false;
//       return;
//     }
//     if (isStop || isParallel) {
//       return;
//     }
//     const cur = list[++index];
//     cur(next);
//     // cur().then(() => next());
//   };

//   const add = (...fn) => {
//     list.push(...fn);
//   };

//   const run = (...args) => {
//     if (isRunning) {
//       return;
//     }
//     isRunning = true;
//     const cur = list[index];
//     typeof cur === 'function' && cur(next);
//     // typeof cur === "function" && cur().then(() => next());
//   };

//   const parallelRun = () => {
//     isParallel = true;
//     for (const fn of list) {
//       fn(next);
//       // fn().then(() => next());
//     }
//   };

//   const stop = () => {
//     isStop = true;
//   };

//   const retry = () => {
//     isStop = false;
//     run();
//   };

//   const goOn = () => {
//     isStop = false;
//     next();
//   };

//   return {
//     add,
//     run,
//     stop,
//     retry,
//     goOn,
//     parallelRun,
//   };
// };
