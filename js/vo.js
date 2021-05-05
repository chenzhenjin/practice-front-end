var person = []
function parent(num){
  // var num = function () {
  //   console.log('num')
  // }
  console.log('parent', num)
}

function children() { 
  console.log(age, dosomeing, person)
  var num = 5
  var age = 20
  // var dosomeing = 'dosomeing'
  function dosomeing() {
    console.log('dosomeing', age)
  }
  parent(num)
  dosomeing()
}

function createChild(name) {
  return function() {
    console.log('createChild', name)
  }
}

children()
console.log('end')

var child1 = createChild('chen')
const child2 = createChild('zhenjin')
let child3 = 'child3'
child1()
child2()

// child1 = null