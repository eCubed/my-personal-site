class UiOverlay extends HTMLElement {

  #backgroundColor

  static get observedAttributes() {
    return ['visible', 'duration', 'position'];
  }

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'visible') {
      this.setAttribute('aria-hidden', this.visible ? 'false' : 'true');
    }

    if (name === 'duration') {
      this.#syncDuration();
    }

    this.#render()
    console.log('attribute change callback of overlay')
  }

  connectedCallback() {
    this.setAttribute('aria-hidden', 'true');
    this.#syncDuration()

    this.#render()
  }

  get visible() {
    return this.hasAttribute('visible');
  }

  set visible(value) {
    if (Boolean(value)) {
      this.setAttribute('visible', '');
    } else {
      this.removeAttribute('visible');
    }
  }

  get duration() {
    const value = Number(this.getAttribute('duration'));
    return Number.isFinite(value) && value >= 0 ? value : 500;
  }

  set duration(value) {
    const ms = Number(value);
    if (!Number.isFinite(ms) || ms < 0) {
      this.removeAttribute('duration');
      return;
    }

    this.setAttribute('duration', String(ms));
  }

  get backgroundColor() {
    return this.#backgroundColor
  }

  set backgroundColor(value) {
    this.#backgroundColor = value
    this.#syncBackgroundColor()
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          border-radius: inherit;
          overflow: hidden;

          --ui-overlay-duration: 500ms;
          --ui-overlay-background: rgba(128, 128, 128, 0.35);
          --ui-overlay-offset: 0.5rem;

          transition: opacity var(--ui-overlay-duration) ease-in-out;
        }

        :host([visible]) {
          opacity: 1;
          pointer-events: auto;
        }

        .scrim {
          position: absolute;
          inset: 0;
          background: var(--ui-overlay-background);
        }

        .content {
          position: absolute;
          z-index: 1;
          pointer-events: auto;
          
        }

        :host([position="center"]) .content {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        :host([position="top-left"]) .content {
          top: var(--ui-overlay-offset);
          left: var(--ui-overlay-offset);
        }

        :host([position="top"]) .content {
          top: var(--ui-overlay-offset);
          left: 50%;
          transform: translateX(-50%);
        }

        :host([position="top-right"]) .content {
          top: var(--ui-overlay-offset);
          right: var(--ui-overlay-offset);
        }

        :host([position="right"]) .content {
          top: 50%;
          right: var(--ui-overlay-offset);
          transform: translateY(-50%);
        }

        :host([position="bottom-right"]) .content {
          right: var(--ui-overlay-offset);
          bottom: var(--ui-overlay-offset);
        }

        :host([position="bottom"]) .content {
          left: 50%;
          bottom: var(--ui-overlay-offset);
          transform: translateX(-50%);
        }

        :host([position="bottom-left"]) .content {
          left: var(--ui-overlay-offset);
          bottom: var(--ui-overlay-offset);
        }

        :host([position="left"]) .content {
          top: 50%;
          left: var(--ui-overlay-offset);
          transform: translateY(-50%);
        }

      </style>

      <div class="scrim" part="scrim"></div>
      <div class="content" part="content">
        <slot name="content"></slot>
      </div>
    `;
  }

  async show() {
    this.#syncDuration();

    // force style/layout flush so first show animates reliably
    this.getBoundingClientRect();

    this.visible = true;
    await this.#waitForOpacityTransition();
  }

  async hide() {
    if (!this.isConnected) return;

    this.#syncDuration();
    this.visible = false;
    await this.#waitForOpacityTransition();
  }

  #syncDuration() {
    this.style.setProperty('--ui-overlay-duration', `${this.duration}ms`);
  }

  #syncBackgroundColor() {
    this.style.setProperty('--ui-overlay-background', this.backgroundColor)
  }

  #waitForOpacityTransition() {
    return new Promise((resolve) => {
      const computed = getComputedStyle(this);
      const durationSeconds = parseFloat(computed.transitionDuration) || 0;
      const delaySeconds = parseFloat(computed.transitionDelay) || 0;
      const totalMs = (durationSeconds + delaySeconds) * 1000;

      if (totalMs === 0) {
        resolve();
        return;
      }

      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        this.removeEventListener('transitionend', onTransitionEnd);
        clearTimeout(fallbackId);
        resolve();
      };

      const onTransitionEnd = (event) => {
        if (event.target === this && event.propertyName === 'opacity') {
          finish();
        }
      };

      const fallbackId = setTimeout(finish, totalMs + 50);
      this.addEventListener('transitionend', onTransitionEnd);
    });
  }

  setContent(content) {
    const existing = this.querySelector('[slot="content"]');
    if (existing) {
      existing.remove();
    }

    if (!content) return;

    if (!(content instanceof Element)) {
      throw new Error('Overlay content must be a DOM element.');
    }

    content.slot = 'content';
    this.appendChild(content);
  }
}

customElements.define('ui-overlay', UiOverlay);