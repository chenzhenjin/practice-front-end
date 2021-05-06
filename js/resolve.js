/*
 * @Author: chenzhenjin
 * @Email: BrotherStudy@163.com
 * @Date: 2021-05-06 10:56:34
 * @LastEditTime: 2021-05-06 20:11:51
 * @Descripttion: resolve方法
 */
// 重点理解then(()=>promise).then() userPromise(resolve=>resolve()) 内部定义了userPromise.then => thenPromise._resolve更改原有的值执新的回调 串行 
// Promise.resolve(promise).then() promise.then() 确保调用then的变量是promise
// Promise.resolve().then() new Promise(resolve=>resolve()).then() 内部原理 
// 异步递归  执行new Promise同步 还是返回实例 resolve异步回调 每个方法都会自身的promise
function callback() {
  console.log("callback");
}
// let promise2 = new Promise(function (resolve, reject) {
//   console.log('Promise')
//   setTimeout(() => {
//     resolve(6);
//   });
// }).then(() => callback());
let promise1 = new Promise((resolve, reject) => {
  console.log("promise1");
  setTimeout(() => {
    resolve(); //微任务触发
  }); //宏任务触发
}).then(() => {
  console.log("promise1 then");
});
let promise2 = Promise.resolve().then(() => callback()); //等script宏任务完，就微任务触发执行then的onfullfiedfn**继续触发promise2.then**
promise2.then(() => { 
  //连续then情况下，默认Promise2.resolve().then，
  //但是前个then回调返回了promise，就会继续等待这个promise执行resolve实参给promise2的then回调形参
  console.log("promise2");
});
console.log("script end");
//宏任务记录 script 最先执行 追加微任务记录执行 Promise.resolve().then promise2.then 这里全部执行完，才执行下一个宏任务
//追加宏任务记录 setTimeout 微任务记录 new Promise.then

/**
 * 异步并发数限制
 * 1. new promise 一经创建，立即执行
 * 2. 使用 Promise.resolve().then 可以把任务加到微任务队列，防止立即执行迭代方法
 * 3. 微任务处理过程中，产生的新的微任务，会在同一事件循环内，追加到微任务队列里
 * 4. 使用 race 在某个任务完成时，继续添加任务，保持任务按照最大并发数进行执行
 * 5. 任务完成后，需要从 doingTasks 中移出
 */
// 注意 Promise.resolve()与Promise.resolve(promise)不同的返回
//Promise.resolve() 返回new Promise(resolve=>resolve()) Promise.resolve(promise)是直接返回promise
function limit(count, array, iterateFunc) {
  const tasks = [];
  const doingTasks = [];
  let i = 0;
  const enqueue = () => {
    /*scripctmacro [
        taskMicro: [
          Promise.resolve().then 微任务执行回调 setTimeout
          task.then 等setTimeout执行resolve触发then的回调
          Promise.resolve().then 微任务执行回调 enqueue
          Promise.resolve().then 微任务执行回调 setTimeout  
          task.then 等setTimeout执行resolve触发then的回调
          Promise.race(doingTasks) 封装的promise包裹Promise.resolve(promise).then((val)=>resolve(val)//racePromise)
          等任一用户promise执行resolve触发then的回调 race
          Promise.race(doingTasks).then 等race触发resolve触发then的回调 enqueue 异步递归
        ]
        limitMicro: [
          limit.then
        ]
    ] 
      */
    if (i === array.length) {
      return Promise.resolve();
    }
    const task = Promise.resolve().then(() => iterateFunc(array[i++]));
    // const task = iterateFunc(array[i++]);
    tasks.push(task);
    console.log('tasks', tasks)
    const doing = task.then(() => { //并不会马上执行，因为前个then回调返回了promise，
      //为其定义then回调，以便race接收userPromise执行resolve到触发自身的then回调
      console.log('doing', i)
      doingTasks.splice(doingTasks.indexOf(doing), 1)
    });
    doingTasks.push(doing);
    console.log('doingTasks', doingTasks)
    const res =
      doingTasks.length >= count ? Promise.race(doingTasks) : Promise.resolve();
    return res.then(enqueue);
  };
  //设计很巧妙，就是tasks的变化，会影响到Promise.all判断，这样保证用户定义then是所有的task执行完
  //执行到Promise.race跳出，再执行enqueue().then跳出到userpromise的setTimeout执行resolve race.then回调先执行进入enqueue所以又有task进去
  //类似于race，每个promise触发完resolve得到结果后，记录完成count++，
  //当count满足promise个数，执行自身定义promise的resolve(),触发用户定义的then回调
  return enqueue().then(() => {
    console.log('all')
    return Promise.all(tasks)
  });
}

// test
const timeout = (await) =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log('await', await);
      resolve(await);
    }, await)
  );
limit(2, [1000, 1000, 1000, 1000], timeout).then((res) => {
  console.log('limit', res);
});
