const selfie = (that, labels=null) => {
  if (!labels) {
    labels = Object.getOwnPropertyNames(that.constructor.prototype)
      .filter(k => k !== 'constructor' && typeof(that[k]) === 'function')
  }
  if (!labels.length)
    return
  console.log(labels)

  return labels.reduce((that, l) => that[l] = that[l].bind(that, that), that)
}

export {selfie}