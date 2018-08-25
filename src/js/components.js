import {el, list, mount} from 'redom'
import flyd from './flyd.js'
import colours from './colour_data.json'
import {selfie} from './selfie.js'
import {Kefir as K} from 'kefir'


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
    self.onClick = flyd.stream()
    self.onActivate = self.onClick.map(ev => (ev.preventDefault(), self._idx), self.onClick)
    self.el.addEventListener('click', self.onClick)
    self.action = K.fromEvents(self.el, 'click', ev => ({kind: 'click', value: self._idx}))
    self.update(props)
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
  constructor() {
    const self = this
    self.el = el('ul.pills')
    self.list = list(self.el, Pill)
    self.onActivate = flyd.stream()
    self._pool = []
    self.action = K.pool()
    // flyd.on(ev => console.log('on:: ', ev), self.onActivate)
  }

  update({pillData}) {
    const self = this, pd = pillData()
    self.list.update(pd)
    const acts = self.list.views.map(el => el.onActivate)
    const ms = flyd.mergeN(acts.length, ...acts)

    if (self._onActivate)
      self._onActivate.deps.forEach(s => s.end()), self._onActivate.end(true)
    self._onActivate = flyd.on(i => {
      if (!pd[i].active)
        self.onActivate(i), pillData(pd.map((v, j) => (v.active = j == i, v)))
    }, ms)

    // const kacts = self.list.views.map(el => el.action)
    // kacts.forEach(s => self.action.plug(s))

    // console.log(self._pool)
    console.log(self.action._curSources)
    self._pool.forEach(s => self.action.unplug(s))
    self._pool = self.list.views.map(el => el.action)
    self._pool.forEach(s => self.action.plug(s))
    console.log(self.action._curSources)

    // self.list.views.reduce((acc, el) => acc.set(el.action, el.action), self._pool)
    // self.
    
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
          // el('ul.pills', el('li.pill.pill--selected', 'Foreground'), el('li.pill', 'Background')),
          this.pills = el(Pills)
        ),
        this.swatches = list('ul.palette__swatches', Swatch),
      )
    )

    // this.el.addEventListener('click', ev => this.update({hidden:true}))
  }

  update({hidden=null, pillData=null, colours=null}={}) {
    hidden = hidden != null ? hidden : this.hidden != null ? this.hidden : false
    this.hidden = hidden

    if (hidden === true)
      this.el.classList.add('modal--hidden')
    else if (hidden === false)
      this.el.classList.remove('modal--hidden')

    if (pillData != null)
      this.pills.update({pillData})
    
    if (colours != null)
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
    
    selfie(this)
  }

  update({el}, ...d) {
    el.update(...d)
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
    this.lineA.update(lineData)
    this.lineB.update(lineData)
  }
}

export {Button, Pill, Pills, Swatch, Palette, Part, Line, Terminal}