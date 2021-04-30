let binaryTreePaths = function (root) {
  let res = []
  if (!root) {
    return res
  }

  if (!root.left && !root.right) {
    return [`${root.val}`]
  }

  let leftPaths = binaryTreePaths(root.left)
  let rightPaths = binaryTreePaths(root.right)

  leftPaths.forEach((leftPath) => {
    res.push(`${root.val}->${leftPath}`)
  })
  rightPaths.forEach((rightPath) => {
    res.push(`${root.val}->${rightPath}`)
  })

  return res
}
let root = {
  val: '1',
  left: {
    val: '2',
    left: null,
    right: {
      val: '5',
      left: null,
      right: null
    }
  },
  right: {
    val: '3',
    left: null,
    right: null
  }
}
console.log(binaryTreePaths(root))
