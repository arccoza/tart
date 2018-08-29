import {el, list, mount} from 'redom'
import flyd from './flyd.js'
import colours from './colour_data.json'
import {selfie} from './selfie.js'
import mergeAll from 'flyd/module/mergeall'


// Helper function to bind and unbind events to/from streams.
function streamEvents(yes, target, events, stream) {
  const mod = yes ? target.addEventListener : target.removeEventListener
  events.forEach(type => mod.call(target, type, stream))
}

function plugStreams(mode, s, fn, upStreams) {
  const plugs = s._plugs || (s._plugs = new Map())
  const m = mode == 'add' ? 0 : mode == 'rem' ? 1 : mode == 'diff' ? 2 : mode
  const nop = () => null
  const add = m == 0 || m == 2 ? s => (plugs.set(s, flyd.on(fn, s))) : nop
  const rem = m == 1 || m == 2 ? s => (plugs.get(s).end(), plugs.delete(s)) : nop

  if (m == 2) {
    let toAdd = upStreams.reduce((acc, s) => acc.set(s, s), new Map())
    plugs.forEach((v, k) => !toAdd.has(k) ? rem(k) : toAdd.delete(k))
    toAdd.forEach(s => add(s))
  }
  else
    upStreams.forEach(s => plugs.has(s) ? rem(s) : add(s))
}

class Button {
  constructor() {
    this.el = el('div.button')
    selfie(this)
    this.init()
  }

  init({el}) {
    el.addEventListener('mousedown', ev => {
      el.classList.add('button--pressed')
      ev.preventDefault()
    })
    el.addEventListener('mouseup', ev => el.classList.remove('button--pressed'))
  }

  update({el}, {text}) {
    el.textContent = text
  }
}

class Pill {
  constructor(props) {
    const self = this
    self.el = el('li.pill')
    self.action = flyd.stream().map(ev => (ev.idx = self._idx, ev))
    self.update(props)
  }

  onmount() {
    const self = this
    streamEvents(true, self.el, ['click'], self.action.deps[0])
  }

  onunmount() {
    const self = this
    streamEvents(false, self.el, ['click'], self.action.deps[0])
  }

  update({active=null, text=null}={}, i) {
    const self = this
    self._idx = i
    if (active)
      self.el.classList.add('pill--active')
    else
      self.el.classList.remove('pill--active')

    if (text != null)
      self.el.textContent = text
  }
}

class Pills {
  constructor(props={}) {
    const self = this
    self.el = el('ul.pills')
    self.list = list(self.el, Pill)
    self.action = flyd.stream()
    self.update(props)
  }

  update({pillData}) {
    if (pillData) {
      const self = this
      self.list.update(pillData())
      const acts = self.list.views.map(el => el.action)

      plugStreams('diff', self.action, ev => {
        if (!pillData()[ev.idx].active)
          self.action(ev), pillData(pillData().map((v, i) => (v.active = i == ev.idx, v)))
      }, acts)
    }
  }
}

class Swatch {
  constructor(d) {
    this.el = el('li.swatch',
      this.colour = el('div.swatch__colour'),
      this.name = el('div.swatch__name'),
      this.value = el('div.swatch__value')
    )

    this.update(d)
  }

  update({colorId='7', name='Grey', hexString='#c0c0c0'}={}, i, data) {
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
          // el('ul.pills', el('li.pill.pill--selected', 'Foreground'), el('li.pill', 'Background')),
          this.pills = el(Pills)
        ),
        this.swatches = list('ul.palette__swatches', Swatch),
      )
    )

    // this.el.addEventListener('click', ev => this.update({hidden:true}))
  }

  update({hidden=null, pillData=null, colourData=null}={}) {
    hidden = hidden != null ? hidden : this.hidden != null ? this.hidden : null
    this.hidden = hidden

    if (hidden === true)
      this.el.classList.add('modal--hidden')
    else if (hidden === false)
      this.el.classList.remove('modal--hidden')

    if (pillData != null)
      this.pills.update({pillData})
    
    if (colourData != null)
      this.swatches.update(colourData())
  }
}

class Part {
  constructor(props={}) {
    const self = this
    self.el = el('li.part.part--drag', {draggable: false})
    self.action = flyd.stream().map(ev => (ev.idx = self._idx, ev))
    self._draggable()
    self.update(props)
  }

  onmount() {
    const self = this
    streamEvents(true, self.el, ['click'], self.action.deps[0])
  }

  onunmount() {
    const self = this
    streamEvents(false, self.el, ['click'], self.action.deps[0])
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

  update({text, style}={}, i) {
    const self = this
    self._idx = i
    // self.el.style = style
    self.el.textContent = text
  }
}

class Line {
  constructor({cls}={cls:'ps1'}) {
    const self = this
    self.el = list(`ul.${cls}`, Part)
  }

  update({lineData}) {
    const self = this
    self.el.update(lineData())
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
          this.btnAdd = el(Button, ' Add part'), //\uf067
          // this.btnEdit = el('div.button.button--edit', '\uf8ea Edit'), //\uf8ea
        ]),
      ]),
    ])
  }

  update({lineData}) {
    this.lineA.update({lineData})
    this.lineB.update({lineData})
  }
}

export {Button, Pill, Pills, Swatch, Palette, Part, Line, Terminal}