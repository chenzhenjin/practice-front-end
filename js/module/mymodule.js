var mymodule = (function () {
  var modules = {}
  //模块名 依赖文件名数组 模块代码函数
  function define(name, deps, cb) {
    //从依赖文件名找到依赖文件函数
    deps.forEach((dep, i) => {
      deps[i] = modules[dep]
    });
    //调整模块的文件
    modules[name] = cb.apply(cb, deps)
  }
  function get(name) {
    return modules[name]
  }
  return {
    get: get,
    define: define
  }
})()
//函数代码函数为闭包，因为定义时候需要替换执行依赖文件名为依赖文件代码函数
mymodule.define('addAb', [], function () {
  return function (a, b) {
    console.log('a+b', a + b)
    return a + b
  }
})
mymodule.define('addAbc', ['addAb'], function (addAb) {
  let a = 1
  let b = 3
  let c = 5
  return {
    toDo() {
      console.log('cb +c', addAb(a, b) + c)
    }
  }
})

let addAb = mymodule.get('addAb')
let addAbc = mymodule.get('addAbc')
addAbc.c = 5 
addAb(1,3)
addAbc.toDo()
