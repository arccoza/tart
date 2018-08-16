import {el, list, mount} from 'redom'


class Li {
  constructor () {
    this.el = el('li')
  }
  
  update (i) {
    this.el.textContent = `Item ${i}`
  }
}

const ul = list('ul', Li)

// update with data
ul.update([1, 2, 3])

// mount to DOM
mount(document.body, ul)

// schedule another update
setTimeout(() => {
  ul.update([2, 3, 4, 5])
}, 1000)