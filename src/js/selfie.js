const selfie = (that, labels) => labels.reduce((that, l) => that[l] = that[l].bind(that, that), that)

export {selfie}