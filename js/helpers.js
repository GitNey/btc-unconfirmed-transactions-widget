const Helpers = {
  hasDependencies: function () {
    if (!window.$) {
      throw Error('Missing required dependency: jQuery')
    }
    return true
  },
  addToArr(limit, arr, item) {
    let temp = arr.slice(0, arr.length)
    if (arr.length >= limit) {
      temp = arr.slice(1, arr.length)
    }
    temp.push(item)
    return temp
  }
}