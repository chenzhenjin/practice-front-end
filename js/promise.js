//函数懒执行 setTimeout模拟微任务
var pending = "pending";
var fullfilled = "fullfilled";
var rejected = "rejected";

function myPromise(execute) {
  var that = this;
  that.status = pending;
  that.onfullfillArray = [];
  that.onrejectArray = [];
  function resolve(value) {
    if (that.status === pending) {
      setTimeout(function () {
        that.status = fullfilled;
        that.value = value;
        that.onfullfillArray.forEach(function (fn) {
          fn(value);
        });
      });
    }
  }
  function reject(reason) {
    setTimeout(function () {
      if (that.status === pending) {
        that.status = rejected;
        that.reason = reason;
        that.onrejectArray.forEach(function (fn) {
          fn(reason);
        });
      }
    });
  }
  try {
    execute(resolve, reject);
  } catch (err) {
    reject(err);
  }
}

myPromise.prototype.then = function (onfullfillfn, onrejectfn) {
  var that = this;
  var promise;
  onfullfillfn =
    typeof onfullfillfn === "function"
      ? onfullfillfn
      : function (value) {
          return value;
        };
  onrejectfn =
    typeof onrejectfn === "function"
      ? onrejectfn
      : function (reason) {
          throw reason;
        };
  if (that.status === fullfilled) {
    promise = new myPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          let x = onfullfillfn(that.value);
          resolve(x);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
  if (that.status === rejected) {
    promise = new myPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          let x = onrejectfn(that.reason);
          reject(x);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
  if (that.status === pending) {
    promise = new myPromise(function (resolve, reject) {
      that.onfullfillArray.push(function () {
        try {
          let x = onfullfillfn(that.value);
          if (x instanceof myPromise) {
            //处理then返回promise处理，继续对pending状态进行then，因为返回promise，再异步开启
            console.log("instanceof");
            if (x.status === pending) {
              //根据userpromise状态为等待，新增then方法设置回调函数
              //转移userpromise resolve执行userpromise then回调后到
              //接收userpromise resolve的值，传递到thenpromise._resolve,更新thenpromise状态、值和执行用户定义then回调
              //_resolve为了解决thenpromise已经resolve，要再次执行then回调
              x.then((value) => {
                promise._resolve(value);
              });
            }
          } else {
            resolve(x); //x为promise 相当于 resolve(new promise())
          }
          // console.log('then pending', x)
          // resolvePromise(promise, x, resolve, reject)
        } catch (err) {
          reject(err);
        }
      });
      that.onrejectArray.push(function () {
        try {
          let x = onrejectfn(that.reason);
          reject(x);
          onrejectfn(that.reason);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
  return promise;
};

myPromise.prototype._resolve = function (value) {
  if (this.status !== pending) return;
  setTimeout(() => {
    this.status = fullfilled;
    this.value = value;
    this.onfullfillArray.forEach((cb) => cb(this.value));
  }, 0);
};

myPromise.resolve = function(value) {
  if (value instanceof Promise) return value
  return new Promise(resolve=>resolve(value))
 }

 myPromise.race = function(promiseList) {
  return new Promise((resolve,reject)=>{
   if (promiseList.length===0) return resolve()
   promiseList.forEach(promise=>{
    Promise.resolve(promise)
     .then(value=>resolve(value),reason=>reject(reason))
   })
  })
 }

 myPromise.all = function(promiseList) {
  return new Promise((resolve,reject)=>{
   if (promiseList.length===0) return resolve([])
   let result=[],count=0

   promiseList.forEach((promise,index)=>{
    Promise.resolve(promise).then(value=>{
     result[index]=value
     if (++count===promiseList.length) resolve(result)
    },reason=>reject(reason))
   })
  })
 }
// function resolvePromise(promise, x, resolve, reject) {
//   if (typeof x === 'function') {
//     var then = x.then
//     then.call(x, function (y) {
//       if (called) { return }
//       called = true
//       resolvePromise(promise, y, resolve, reject)
//     }, function (reason) {
//       if (called) return
//       called = true
//       rejected(reason)
//     })
//   } else {
//     console.log('resolvePromise', x)
//     resolve(x)
//   }
// }
// 实例化执行callback 进入异步宏任务跳出。继续执行then，收集onfullfiedfn，等待宏任务完成触发执行onfullfiedfn
var test = new myPromise(function (resolve, reject) {
  setTimeout(function () {
    resolve(10);
  }, 500);
})
  .then(function (res) {
    console.log("res1", res);
    return new myPromise(function (resolve, reject) {
      setTimeout(function () {
        resolve(5);
      }, 500);
    });
  }) //因为返回的promise的状态为pendding，这个then还是会等待返回的promise的resolve触发
  .then(function (res) {
    console.log("res2", res);
  });
