export class SiteCarousel extends HTMLElement {
  #nextButton
  #prevButton
  #slidesDiv
  #slot

  #currentIndex = 0
  #slotElements = []
  #isTransitioning = false

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  get currentIndex() {
    return this.#currentIndex
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .slides {
          position: relative;
          width: 200px;
          height: 150px;
          overflow: hidden;
        }

        ::slotted([slot="slide"]) {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translateX(100%);
          transition: transform 500ms ease-in-out, opacity 500ms ease-in-out;
        }

        ::slotted([slot="slide"][data-state="active"]) {
          opacity: 1;
          transform: translateX(0);
          z-index: 2;
        }

        ::slotted([slot="slide"][data-state="before"]) {
          opacity: 0;
          transform: translateX(-100%);
          z-index: 1;
        }

        ::slotted([slot="slide"][data-state="after"]) {
          opacity: 0;
          transform: translateX(100%);
          z-index: 1;
        }

        .nav {
          display: flex;
          flex-direction: row;
          gap: 0.5em;
          justify-content: center;
        }
      </style>

      <div id="slides" class="slides">
        <slot name="slide"></slot>
      </div>

      <div class="nav">
        <button type="button" id="prev">Prev</button>
        <button type="button" id="next">Next</button>
      </div>
    `

    this.#cacheUI()
    this.#attachEvents()
    this.#initializeSlotElements()
    this.#initializeLogic()
  }

  disconnectedCallback() {
    this.#nextButton?.removeEventListener('click', this.#goNext)
    this.#prevButton?.removeEventListener('click', this.#goPrev)
    this.#slidesDiv?.removeEventListener('click', this.#onSlidesDivClick)
    this.#slot?.removeEventListener('slotchange', this.#onSlotChange)
  }

  #cacheUI() {
    this.#nextButton = this.shadowRoot.getElementById('next')
    this.#prevButton = this.shadowRoot.getElementById('prev')
    this.#slidesDiv = this.shadowRoot.getElementById('slides')
    this.#slot = this.shadowRoot.querySelector('slot')
  }

  #attachEvents() {
    this.#nextButton.addEventListener('click', this.#goNext)
    this.#prevButton.addEventListener('click', this.#goPrev)
    this.#slidesDiv.addEventListener('click', this.#onSlidesDivClick)
    this.#slot.addEventListener('slotchange', this.#onSlotChange)
  }

  #initializeSlotElements() {
    this.#slotElements = this.#slot.assignedElements()

    this.#slotElements.forEach((slotElement, index) => {
      slotElement.setAttribute('data-index', index)
      slotElement.setAttribute('id', `slide-${index}`)
    })
  }

  #initializeLogic() {
    if (this.#slotElements.length === 0) {
      throw new Error('Carousel must have at least 1 item')
    }

    this.#slotElements.forEach((slide, index) => {
      if (index === 0) slide.setAttribute('data-state', 'active')
      else slide.setAttribute('data-state', 'after')
    })

    this.#currentIndex = 0
  }

  #normalizeStates() {
    this.#slotElements.forEach((slide, index) => {
      if (index === this.#currentIndex) {
        slide.setAttribute('data-state', 'active')
      } else if (index < this.#currentIndex) {
        slide.setAttribute('data-state', 'before')
      } else {
        slide.setAttribute('data-state', 'after')
      }
    })
  }

  #moveTo(newIndex, direction) {
    if (this.#isTransitioning || newIndex === this.#currentIndex) return

    this.#isTransitioning = true

    const currentSlide = this.#slotElements[this.#currentIndex]
    const nextSlide = this.#slotElements[newIndex]

    nextSlide.setAttribute('data-state', direction === 'next' ? 'after' : 'before')

    requestAnimationFrame(() => {
      currentSlide.setAttribute('data-state', direction === 'next' ? 'before' : 'after')
      nextSlide.setAttribute('data-state', 'active')

      const onDone = () => {
        this.#currentIndex = newIndex
        this.#normalizeStates()
        this.#isTransitioning = false
      }

      currentSlide.addEventListener('transitionend', onDone, { once: true })
    })
  }

  #goNext = () => {
    const newIndex = (this.#currentIndex + 1) % this.#slotElements.length
    this.#moveTo(newIndex, 'next')
  }

  #goPrev = () => {
    const newIndex = (this.#currentIndex - 1 + this.#slotElements.length) % this.#slotElements.length
    this.#moveTo(newIndex, 'prev')
  }

  #onSlidesDivClick = (e) => {
    const closestElement = e.target.closest('[slot="slide"]')
    if (!closestElement) return

    const index = parseInt(closestElement.getAttribute('data-index'), 10)
    if (Number.isNaN(index) || index === this.#currentIndex) return

    const direction = index > this.#currentIndex ? 'next' : 'prev'
    this.#moveTo(index, direction)
  }

  #onSlotChange = () => {
    this.#initializeSlotElements()

    if (this.#slotElements.length === 0) return

    if (this.#currentIndex >= this.#slotElements.length) {
      this.#currentIndex = this.#slotElements.length - 1
    }

    this.#normalizeStates()
  }
}

customElements.define('site-carousel', SiteCarousel)