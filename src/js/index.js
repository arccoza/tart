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
var pillData = flyd.stream([{text:'Foreground', active:true}, {text:'Background'}, {text:'Wha?'}])
flyd.combine((pillData) => {
  pal.update({pillData})
}, [pillData])
pal.update({hidden: false, pillData, colours})
term.update({lineData: [{text:'a', style:null}, {text:'b', style:null}, {text:'c', style:null}]})

// mount to DOM
mount(document.body, main)

// schedule another update
setTimeout(() => {
  term.update({lineData: [{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}]})
  pal.update({hidden: false, pillData: pillData([...pillData(), {text:'Wha2?'}]), colours})
}, 5000)