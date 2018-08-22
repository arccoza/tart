import flyd from 'flyd'


flyd.mergeN = function(n, ...sn) {
  return flyd.curryN(n, function() {
    console.log('sn:: ', sn)
    var s = flyd.immediate(
      flyd.combine(function(...args) {
        console.log('args:: ', args)
        var [changed, self, ...sn] = args.reverse()
        if (changed[0]) {
          self(changed[0]())
        }
        // else if (s1.hasVal) {
        //   self(s1.val)
        // }
        // else if (s2.hasVal) {
        //   self(s2.val)
        // }
      }, sn)
    )
    
    flyd.endsOn(flyd.combine(function() {
      return true;
    }, sn.map(s => s.end)), s)
    return s
  })(...sn)
}

export default flyd