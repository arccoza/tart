import {el, list, mount} from 'redom'


class Part {
  constructor() {
    this.el = el('li.part')
  }

  update({text, style}) {
    this.el.style = style
    this.el.textContent = text
  }
}

class Line {
  constructor({cls}={cls:'ps1'}) {
    this.el = list(`ul.${cls}`, Part)
  }

  update(...d) {
    this.el.update(...d)
  }
}

const head = el('header.h', 'tart')
const foot = el('footer.f')
const cmdln = el(Line)
const bAdd = el('div.button', 'Add component')
const term = el('div.term', [cmdln, bAdd])
const main = el('div.main', [head, term, foot])

// update with data
cmdln.update([{text:'a', style:null}, {text:'b', style:null}, {text:'c', style:null}])

// mount to DOM
mount(document.body, main)

// schedule another update
setTimeout(() => {
  cmdln.update([{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}])
}, 1000)