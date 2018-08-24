import {el, list, mount} from 'redom'
import flyd from './flyd.js'
import colours from './colour_data.json'
import {Palette, Terminal} from './components.js'


const head = el('header.h', 'tart')
const foot = el('footer.f')
const pal = el(Palette)
// const cmdln = el(Line)
// const bAdd = el('div.button', 'Add component')
// const term = el('div.term', [cmdln, bAdd])
const term = el(Terminal)
// console.log(Object.getOwnPropertyNames(term.constructor.prototype))
const main = el('div.main', [pal, head, term, foot])

// update with data
var pills = flyd.stream([{text:'Foreground', active:true}, {text:'Background'}, {text:'Wha?'}])
flyd.combine((pills) => {
  pal.update({pills})
}, [pills])
pal.update({hidden: false, pills, colours})
term.update({lineData: [{text:'a', style:null}, {text:'b', style:null}, {text:'c', style:null}]})

// mount to DOM
mount(document.body, main)

// schedule another update
setTimeout(() => {
  term.update({lineData: [{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}]})
  pal.update({hidden: false, pills: pills([...pills(), {text:'Wha2?'}]), colours})
}, 5000)