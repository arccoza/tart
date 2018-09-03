import {el, list, mount} from 'redom'
import flyd from './flyd.js'
import ffilter from 'flyd/module/filter'
import colours from './colour_data.json'
import {Palette, Terminal} from './components.js'
import Freezer from 'freezer-js'


const fromFreezer = (fz, ev) => {
  const s = flyd.stream()
  fz.on(ev, (a, b) => s([a, b]))
  return s
}

// Data
const ds = new Freezer({
  lineData: [],
  pillData: [],
  colourData: [],
})

//Data streams
var lineData = fromFreezer(ds, 'update').map(([a, b]) => a.lineData == b.lineData ? undefined : a.lineData)
  .pipe(ffilter(v => v !== undefined))
var pillData = fromFreezer(ds, 'update').map(([a, b]) => a.pillData == b.pillData ? undefined : a.pillData)
  .pipe(ffilter(v => v !== undefined))
var colourData = fromFreezer(ds, 'update').map(([a, b]) => a.colourData == b.colourData ? undefined : a.colourData)
  .pipe(ffilter(v => v !== undefined))


var state = ds.get()
state = state.set('lineData', [{text:'a', style:null}, {text:'b', style:null}, {text:'c', style:null}])
state = state.set('pillData', [{text:'Foreground', active:true}, {text:'Background'}, {text:'Wha?'}])
state = state.set('colourData', colours)



const head = el('header.h', 'tart')
const foot = el('footer.f')
const pal = el(Palette, {pillData: {}})
const term = el(Terminal)
const main = el('div.main', [pal, head, term, foot])

// update with data

// flyd.on(v => console.log(v), pillData)
flyd.immediate(
  flyd.combine((...args) => {
    var [l, p, c, me, ch] = args
    // console.log(l(), p(), c())
    term.update({lineData: l()})
    pal.update({pillData: p(), colourData: c()})
  }, [lineData, pillData.map(val => ({tag:'PAL_FGBG', val})), colourData.map(val => ({tag:'PAL_CLRS', val}))])
)


// lineData.redom = term, pillData.redom = pal, colourData.redom = pal
flyd.on(v => console.log(v), pal.action)
pal.update({hidden:false})
// lineData.map(v => term.update({lineData}))
// pillData.map(v => pal.update({hidden:false, pillData:v}))
// // pal.update({hidden:false, pillData})
// colourData.map(v => pal.update({colourData}))

// flyd.on(act => pillData(act.pch(act, pillData())), pal.pills.action)

// flyd.combine((lineData, pillData, colourData, me, ch) => {
//   console.log(ch.map(s => s.redom))
//   term.update({lineData})
//   pal.update({pillData, colourData})
//   // console.dir(pillData())
// }, [lineData, pillData, colourData])

// pal.update({hidden: false, pillData, colours})
// term.update({lineData})

// mount to DOM
mount(document.body, main)

// schedule another update
// setTimeout(() => {
//   // term.update({lineData: [{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}]})
//   // lineData([{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}])
//   // pal.update({hidden: false, pillData: pillData([...pillData(), {text:'Wha2?'}]), colourData})
//   // pillData([...pillData(), {text:'Wha2?'}])
//   // pillData([...pillData().filter((v, i) => i != 1)])

//   state = state.set('pillData', [{text:'Foreground', active:true}, {text:'Background'}, {text:'Wha?'}])

// }, 5000)