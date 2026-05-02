export class SiteTicker extends HTMLElement {
  #messages = [];
  #speed = 100; // in pixels per second
  #backgroundColor = '#333';
  #animationHandle = null;
  #previousTimestamp = null;
  #_isAnimating = false;
    
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set messages(value){
    this.#messages = value;
    this.render();
  }

  get messages() {
    return this.#messages;
  }

  get isAnimating() {
    return this.#_isAnimating;
  }

  set speed(value) {
    this.#speed = value;
  }

  set backgroundColor(value) {
    this.#backgroundColor = value;
    this.style.backgroundColor = value; // Update the background color of the host element
  }

  connectedCallback(){
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
       :host {
         position: relative;
         display: block;
         overflow: hidden;
         white-space: nowrap;
        }

        .message-strip {
          color: #fff;
          position: absolute;
          box-sizing: border-box;
          padding-left: 1rem;
          padding-right: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
      </style>
      ${this.#messages.map(message => `<span class="message-strip">${message}</span>`)}
    `
    this.cacheMessageStrips()
    this.fixInitialPositions()
    this.fixHeight()
  }

  fixHeight() {
    this.style.height = `${this.messageStrips[0].offsetHeight}px`;  
  }

  fixInitialPositions() {
    let currentLeft = 0; // Start from the right edge of the ticker
    this.messageStrips.forEach(strip => {
      strip.style.left = `${currentLeft}px`;
      currentLeft += strip.offsetWidth; // Move the next strip to the right of the current one
    });
  }

  cacheMessageStrips() {
    this.messageStrips = this.shadowRoot.querySelectorAll('.message-strip');
  }

  disconnectedCallback() {
    // Clean up any resources or event listeners if necessary
    this.stopAnimation();
    
  }

  startAnimation() {
    this.#previousTimestamp = document.timeline.currentTime;
    this.#animationHandle = requestAnimationFrame(this.animate);
    this.#_isAnimating = true;
  }

  animate = (timestamp) => {
    /*
      Calculate the elapsed time since the last frame and update the position of the message strips accordingly.
      At 60 hz, we want to update the position every 16.67ms (1000ms / 60). The speed can be used to determine how much to move the strips per frame.
    */
    const elapsed = timestamp - this.#previousTimestamp;
    this.#previousTimestamp = timestamp;
    const distanceToMove = (this.#speed * elapsed) / 1000; // Convert speed from pixels per second to pixels per frame

    for(let i = 0; i < this.messageStrips.length; i++) {
      const strip = this.messageStrips[i];
      const currentLeft = parseFloat(strip.style.left) || 0;
      const newLeft = currentLeft - distanceToMove;
      strip.style.left = `${newLeft}px`;
      const { right: newRight } = strip.getBoundingClientRect();
      
      if (newRight < 0) {
        
        // If the first message strip has completely scrolled out of view, move it to the end of the ticker
        const lastStrip = this.messageStrips[this.messageStrips.length - 1];
        const lastStripRight = parseFloat(lastStrip.style.left) + lastStrip.offsetWidth;
        strip.style.left = `${lastStripRight}px`;
        this.shadowRoot.appendChild(strip); // Move the strip to the end of the ticker
        this.cacheMessageStrips(); // Update the cached message strips after reordering
        break; // Exit the loop to avoid issues with the live NodeList after reordering
      }
    }
    if (this.#_isAnimating) {
      this.#animationHandle = requestAnimationFrame(this.animate.bind(this));
    }
  }

  stopAnimation() {
    cancelAnimationFrame(this.#animationHandle);
    this.#animationHandle = null;
    this.#_isAnimating = false;
  }
}

customElements.define('site-ticker', SiteTicker);