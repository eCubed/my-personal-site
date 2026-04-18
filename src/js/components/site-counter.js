class SiteCounter extends HTMLElement {

  #count
  #min
  #max

  static observedAttributes = ['count', 'min', 'max']

  constructor() {
    super()
    this.attachShadow({ mode: 'open'})
    this.#count = 0
    this.#min = 0
    this.#max = 10
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'count') {
      this.count = Number(newValue) ?? 0
    } else if (name === 'min') {
      this.min = Number(newValue) ?? 0
    } else if (name === 'max') {
      this.max = Number(newValue)
    }
  }

  set count(value) {    
    if (value < this.#min) {
      this.#count = this.#min
    } else if (value > this.#max) {
      this.#count = this.#max
    } else {
      this.#count = value
    }

    this.#updateDom()
    this.#dispatchCountChanged()
  }

  get count() {
    return this.#count
  }

  set min(value) {
    this.#min = Math.min(value, this.#max)
    this.#updateDom()
  }

  get min() {
    return this.#min()
  }

  set max(value) {
    this.#max = Math.max(value, this.#min)
    this.#updateDom()
  }

  get max() {
    return this.#max
  }

  #buildShadowDom() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          background-color: #cfcfcf;
          border-radius: 0.5em;
          display: inline-flex;
          flex-direction: row;
          gap: 0.5em;
        }
      </style>
      <div id="display-div"></div>
      <button type="button" id="increment-button">+</button>
      <button type="button" id="decrement-button">-</button>    
    `
  }

  #cacheDom() {
    this.$displayDiv = this.shadowRoot.getElementById('display-div')
    this.$incrementButton = this.shadowRoot.getElementById('increment-button')
    this.$decrementButton = this.shadowRoot.getElementById('decrement-button')
  }

  #attachEvents() {
    this.$incrementButton.addEventListener('click', this.increment)
    this.addEventListener('keydown', this.onKeyDown)
    this.$decrementButton.addEventListener('click', this.decrement)
    this.addEventListener('keydown', this.onKeyDown)
  }

  #updateDom() {
    
    this.$displayDiv.innerText = this.#count

    if (this.#count === this.#max) {
      this.$incrementButton.setAttribute('disabled','')
    } else {
      this.$incrementButton.removeAttribute('disabled')
    }

    if (this.#count === this.#min) {
      this.$decrementButton.setAttribute('disabled','')
    } else {
      this.$decrementButton.removeAttribute('disabled')
    }
  }

  connectedCallback() {
    this.#buildShadowDom()
    this.#cacheDom()
    this.#attachEvents()
    this.#updateDom()
  }

  disconnectedCallback() {
    this.$incrementButton.removeEventListener('click', this.increment)
    this.removeEventListener('keydown', this.onKeyDown)
    this.$decrementButton.removeEventListener('click', this.decrement)
    this.removeEventListener('keydown', this.onKeyDown)
  }

  increment = () => {
    this.#count = Math.min(this.#count + 1, this.#max)    
    this.#updateDom()
    this.#dispatchCountChanged()
  }

  decrement = () => {
    this.#count = Math.max(this.#count - 1, this.#min)
    this.#updateDom()
    this.#dispatchCountChanged()
  }

  #dispatchCountChanged() {    
    this.dispatchEvent(new CustomEvent('countChanged', {
      detail: this.#count,
      bubbles: true,
      composed: true
    }))
  }

  onKeyDown = (e) => {
    console.log('on key down site counter')
    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault()
        this.increment()
        break
      case 'ArrowLeft':
        e.preventDefault()
        this.decrement()
        break
    }
  }
}

customElements.define('site-counter', SiteCounter)

