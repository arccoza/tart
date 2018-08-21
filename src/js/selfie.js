const selfie = (that, labels=null) => {
  if (!labels) {
    labels = Object.getOwnPropertyNames(that.constructor.prototype)
      .filter(k => k !== 'constructor' && typeof(that[k]) === 'function')
  }
  if (!labels.length)
    return

  return labels.reduce((that, l) => {
    var fn = that[l]
    return that[l] = function(...args) { return fn.call(that, that, ...args) }
  }, that)
}

export {selfie}