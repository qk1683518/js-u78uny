class Queue {
  constructor() {
    this.list = [];
    this.index = 0;
    this.isStop = false;
    this.isRunning = false;
    this.isParallel = false;
  }

  next = () => {
    if (this.isStop) {
      this.isRunning = false;
    }
    if (this.index >= this.list.length - 1) {
      this.isRunning = false;
      console.log('clear');
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
    const fn = this.del();
    if (fn) {
      fn(this.next);
    }
    this.isParallel = false;
  }

  stop() {
    console.log('stop', this.isParallel, !this.isRunning);
    if (this.isParallel || !this.isRunning) {
      return;
    }
    this.isStop = true;
  }

  retry() {
    if (this.isParallel || this.isRunning) {
      return;
    }
    this.isStop = false;
    this.run();
  }

  goOn() {
    console.log('goOn', this.isParallel, this.isRunning);
    if (this.isParallel || this.isRunning) {
      return;
    }
    this.isStop = false;
    this.next();
  }
}

class A extends Queue {
  constructor() {
    super();
  }

  quoteFN = (x) => {
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
    this.add(this.quoteFN(x));
    if (this.list.length && this.isRunning) {
      return;
    }
    this.parallelRun();
    // this.run();
    console.log('11', this.list.length, this.isRunning);
  }
}

const a = new A();
// a.addQueueAndRun(2);
// a.addQueueAndRun(3);
// a.addQueueAndRun(4);
// a.addQueueAndRun(5);
// a.addQueueAndRun(6);
// a.addQueueAndRun([2, 3, 4, 5, 6, 7]);

// a.stop();

// setTimeout(() => {
//   a.stop();
// }, 3000);

// setTimeout(() => {
//   a.goOn();
// }, 5000);

class Queue1 {
  constructor(request, maxNum = 1) {
    // this.list = [];
    // this.index = 0;
    this.maxNum = maxNum; // 最大并行数
    this.panddingList = [];
    this.request = request;
    // this.isStop = false;
    // this.isRunning = false;
    // this.isParallel = false;
  }

  add(...fn) {
    console.log(...fn);
    this.list.push(...fn);
  }

  del() {
    return this.list.shift();
  }

  clear() {
    this.index = 0;
    this.list.length = 0;
  }

  async runTask(list) {
    let paddingResolve;
    const paddingPromise = new Promise((r) => (paddingResolve = r));
    this.panddingList.push(paddingPromise);

    if (this.panddingList.length - 1 > 0) {
      console.log(this.panddingList.length, this.panddingList, 'xx');
      await this.panddingList[this.panddingList.length - 2];
    }
    let resolve;
    const promise = new Promise((r) => (resolve = r));
    // this.panddingList.push(promise);

    let i = 0;
    const ret = [];
    let maxNum = this.maxNum;
    if (maxNum > list.length) {
      maxNum = list.length;
    }

    const run = () => {
      if (i >= list.length) {
        return resolve();
      }

      const task = this.request(list[i++]).finally(() => {
        run();
      });
      ret.push(task);
    };

    while (i < maxNum) {
      run();
    }

    const finish = promise.then(() => Promise.all(ret));
    finish.finally(() => {
      console.log('finish', list);
      paddingResolve();
      this.panddingList.shift();
    });

    return finish;
  }
}

// end
class B extends Queue1 {
  constructor() {
    super(request, 4);
  }

  reorder(url) {
    return new Promise((r) => {
      const time = Math.random() * 1000;
      setTimeout(() => {
        r(url);
        console.log(url, 'reorder');
      }, time);
    });
  }

  binchReorder(parlist) {
    this.runTask(parlist).then((r) => {
      console.log(r);
    });
  }
}

const b = new B();
b.binchReorder([1, 2, 3, 4]);
b.binchReorder([5, 6, 7, 8]);
b.binchReorder([9, 10, 11, 12]);
b.binchReorder([13, 14, 15, 16]);

// 方法版
function multiRequest(urls, maxNum) {
  const ret = [];
  let i = 0;
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  const addTask = () => {
    if (i >= urls.length) {
      return resolve();
    }

    const task = request(urls[i++]).finally(() => {
      addTask();
    });
    ret.push(task);
  };

  while (i < maxNum) {
    addTask();
  }

  return promise.then(() => Promise.all(ret));
}

// 模拟请求
function request(url) {
  return new Promise((r) => {
    const time = Math.random() * 1000;
    setTimeout(() => {
      r(url, '22');
      console.log(url);
    }, 500);
  });
}

// multiRequest([1, 2, 3, 4], 1).then((r) => {
//   console.log(r, '2');
// });

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
