import {el, list, mount} from 'redom'
import flyd from 'flyd'
import colours from './colour_data.json'
console.log(colours)


class Swatch {
  constructor(d) {
    this.el = el('li.swatch',
      this.colour = el('div.swatch__colour'),
      this.name = el('div.swatch__name'),
      this.value = el('div.swatch__value')
    )

    this.update(d)
  }

  update({colorId='7', name='Grey', hexString='#c0c0c0'}={}) {
    this.colour.style.backgroundColor = hexString
    this.name.textContent = name
    this.value.textContent = `${colorId} - ${hexString}`
  }
}

class Palette {
  constructor() {
    this.el = el('div.modal.modal--hidden',
      el('div.palette',
        el('header.palette__h',
          el('ul.pills', el('li.pill', 'Foreground'), el('li.pill', 'Background')),
        ),
        this.swatches = list('ul.palette__swatches', Swatch),
      )
    )

    this.el.addEventListener('click', ev => this.update({hidden:true}))
  }

  update({hidden=true, colours=undefined}={}) {
    if (hidden)
      this.el.classList.add('modal--hidden')
    else
      this.el.classList.remove('modal--hidden')
    
    if (colours)
      this.swatches.update(colours)
  }
}

class Part {
  constructor() {
    this.el = el('li.part.part--drag', {draggable: false})
    this._draggable()
  }

  _draggable() {
    var ixy = null
    var dxy = null
    this.el.addEventListener('mousedown', ev => {
      var mvh = null
      var uph  = null
      // ev.dataTransfer.setData('text/plain', '')
      // ev.target.style.opacity = 0.99
      ev.target.classList.add('part--dragging')
      // ev.dataTransfer.effectAllowed = 'move'
      ixy = [ev.clientX, ev.clientY]
      document.addEventListener('mousemove', mvh = ev => {
        ev.preventDefault()
        dxy = [ev.clientX - ixy[0], ev.clientY - ixy[1]]
        // console.log(dxy)
        this.el.style.transform = `translate(${dxy[0]}px, ${dxy[1]}px)`
      })

      document.addEventListener('mouseup', uph = ev => {
        this.el.classList.remove('part--dragging')
        this.el.style.transform = `none`
        if (mvh)
          document.removeEventListener('mousemove', mvh)
        document.removeEventListener('mousemove', uph)
      })
    })
  }

  update({text, style}) {
    // this.el.style = style
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

class Button {
  constructor() {
    this.el = el('div.button')

    this.el.addEventListener('mousedown', ev => {
      this.el.classList.add('button--pressed')
      ev.preventDefault()
    })
    this.el.addEventListener('mouseup', ev => this.el.classList.remove('button--pressed'))
  }

  update({text}) {
    this.el.textContent = text
  }
}

class Terminal {
  constructor() {
    this.el = el('section.term', [
      this.h = el('header.term__h', [el('span', '\ufaac'), el('span', 'term'), el('span', '')]),
      this.lineB = el(Line),
      this.f = el('footer.term__f', [
        this.lineA = el(Line),
        this.btns = el('div.term__tools', [
          this.btnAdd = el('div.button', ' Add part'), //\uf067
          // this.btnEdit = el('div.button.button--edit', '\uf8ea Edit'), //\uf8ea
        ]),
      ]),
    ])
  }

  update({lineData}) {
    this.lineA.update(lineData)
    this.lineB.update(lineData)
  }
}

const head = el('header.h', 'tart')
const foot = el('footer.f')
const pal = el(Palette)
// const cmdln = el(Line)
// const bAdd = el('div.button', 'Add component')
// const term = el('div.term', [cmdln, bAdd])
const term = el(Terminal)
const main = el('div.main', [pal, head, term, foot])

// update with data
pal.update({hidden: true, colours: colours})
term.update({lineData: [{text:'a', style:null}, {text:'b', style:null}, {text:'c', style:null}]})

// mount to DOM
mount(document.body, main)

// schedule another update
setTimeout(() => {
  term.update({lineData: [{text:'e', style:null}, {text:'f', style:null}, {text:'g ', style:null}]})
}, 1000)