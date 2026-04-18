export class SiteChip extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'active', 'disabled'];
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        button {
          font: inherit;
          padding: 0.4rem 0.8rem;
          border: 1px solid;
          border-radius: 999px;
          background: var(--chip-bg, white);
          color: var(--chip-color, black);
          border-color: var(--chip-border-color, #999);
          cursor: pointer;
        }

        :host([active]) button {
          font-weight: 600;
          border-color: black;
        }

        :host([disabled]) button {
          opacity: 0.55;
          cursor: not-allowed;
        }

        button:focus-visible {
          outline: 2px solid black;
          outline-offset: 2px;
        }
      </style>

      <button type="button" part="button"></button>
    `;

    this.$button = this.shadowRoot.querySelector('button');

    this.$button.addEventListener('click', () => {
      if (this.disabled) {
        return;
      }

      this.active = !this.active;

      this.dispatchEvent(new CustomEvent('chip-toggle', {
        bubbles: true,
        composed: true,
        detail: {
          active: this.active
        }
      }));
    });
  }

  connectedCallback() {
    this._upgradeProperty('label');
    this._upgradeProperty('active');
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  get label() {
    return this.getAttribute('label') ?? 'Chip';
  }

  set label(value) {
    if (value == null) {
      this.removeAttribute('label');
      return;
    }

    this.setAttribute('label', String(value));
  }

  get active() {
    return this.hasAttribute('active');
  }

  set active(value) {
    if (value) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }


  _upgradeProperty(propertyName) {
    if (Object.prototype.hasOwnProperty.call(this, propertyName)) {
      const value = this[propertyName];
      delete this[propertyName];
      this[propertyName] = value;
    }
  }

  _render() {
    this.$button.textContent = this.label;
    this.$button.setAttribute('aria-pressed', String(this.active));
  }
}

customElements.define('site-chip', SiteChip);