import flyd from 'flyd'


flyd.mergeN = function(n, ...sn) {
  return flyd.curryN(n, function() {
    var s = flyd.immediate(
      flyd.combine(function(...args) {
        var [self, changed] = args.slice(sn.length)
        if (changed.length)
          self(changed[0]())
      }, sn)
    )
    
    flyd.endsOn(flyd.combine(function() {
      return true;
    }, sn.map(s => s.end)), s)
    return s
  })(...sn)
}

export default flyd