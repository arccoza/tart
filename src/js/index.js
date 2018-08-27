import {el, list, mount} from 'redom'
import flyd from './flyd.js'
import colours from './colour_data.json'
import {Palette, Terminal} from './components.js'


const head = el('header.h', 'tart')
const foot = el('footer.f')
const pal = el(Palette)
const term = el(Terminal)
const main = el('div.main', [pal, head, term, foot])

// update with data
var lineData = flyd.stream([{text:'a', style:null, wanted: ['click']}, {text:'b', style:null}, {text:'c', style:null}])
var pillData = flyd.stream([{text:'Foreground', active:true}, {text:'Background'}, {text:'Wha?'}])
var colourData = flyd.stream(colours)

// lineData.redom = term, pillData.redom = pal, colourData.redom = pal
flyd.on(v => console.log(v), pal.pills.action)
lineData.map(v => term.update({lineData}))
pillData.map(v => pal.update({hidden:true, pillData}))
colourData.map(v => pal.update({colourData}))

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
//   lineData([{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}])
//   // pal.update({hidden: false, pillData: pillData([...pillData(), {text:'Wha2?'}]), colourData})
//   pillData([...pillData(), {text:'Wha2?'}])
// }, 5000)