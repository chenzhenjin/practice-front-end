var pending = 'pending'
var fullfilled = 'fullfilled'
var rejected = 'rejected'

function myPromise(execute) {
  var that = this
  that.status = pending
  that.onfullfillArray = []
  that.onrejectArray = []
  function resolve(value) {
    if (that.status === pending) {
      setTimeout(function () {
        that.status = fullfilled
        that.value = value
        that.onfullfillArray.forEach(function (fn) {
          fn(value)
        })
      })
    }
  }
  function reject(reason) {
    setTimeout(function () {
      if (that.status === pending) {
        that.status = rejected
        that.reason = reason
        that.onrejectArray.forEach(function (fn) {
          fn(reason)
        })
      }
    })
  }
  try {
    execute(resolve, reject)
  } catch (err) {
    reject(err)
  }
}

myPromise.prototype.then = function (onfullfillfn, onrejectfn) {
  var that = this
  var promise
  onfullfillfn = typeof onfullfillfn === 'function' ? onfullfillfn : function (value) { return value }
  onrejectfn = typeof onrejectfn === 'function' ? onrejectfn : function (reason) { throw reason }
  if (that.status === fullfilled) {
    promise = new myPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          onfullfillfn(that.value)
        } catch (err) {
          reject(err)
        }
      })
    })
  }
  if (that.status === rejected) {
    promise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          onrejectfn(that.reason)
        } catch (err) {
          reject(err)
        }
      })
    })
  }
  if (that.status === pending) {
    promise = new Promise(function (resolve, reject) {
      setTimeout(function () {
        that.onfullfillArray.push(function () {
          try {
            let x = onfullfillfn(that.value)
            resolve(x)
            // console.log('then pending', x)
            // resolvePromise(promise, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
        that.onrejectArray.push(function () {
          try {
            onrejectfn(that.reason)
          } catch (err) {
            reject(err)
          }
        })
      })
    })
  }
  return promise
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

var test = new myPromise(function (resolve, reject) {
  setTimeout(function () {
    resolve(10)
  }, 500)
}).then(function (res) {
  console.log('res1', res)
  return new myPromise(function (resolve, reject) {
    setTimeout(function () {
      resolve(5)
    }, 500)
  })
}).then(function (res) {
  console.log('res2', res)
})