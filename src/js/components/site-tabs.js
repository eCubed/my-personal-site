class SiteTabs extends HTMLElement {

  #selectedIndex
  #initialized
  #tabs
  #panels

  static observedAttributes = ['selected-index'];

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#selectedIndex = 0
    this.#initialized = false
    this.tabs = []
    this.panels = []
  }

  attributeChangeCallback(name, oldValue, newValue) {
    if (name === 'selected-index') {
      const parsed = Number(newValue)
      this.selectedIndex = Number.isInteger(parsed) ? parsed : 0
    }
  }

  connectedCallback() {
    if (!this.#initialized) {
      this.#renderShell()
      this.#cacheDom()
      this.#attachEvents()
      this.#initialized = true
    }
    
    this.#collectParts()
    this.#upgradeProperty('selected-index')
    this.#initializeSelection()
  }

  disconnectedCallback() {
    this.$tabSlot?.removeEventListener('slotchange', this._onSlotChange)
    this.$panelSlot?.removeEventListener('slotchange', this._onSlotChange)
    this.$tabList?.removeEventListener('click', this._onTabClick)
    this.$tabList?.removeEventListener('keydown', this._onKeyDown)
  }

  get selectedIndex() {
    return this.#selectedIndex
  }

  set selectedIndex(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) return;
    if (!this.#tabs || !this.#panels) {
      this.#selectedIndex = parsed;
      return;
    }

    const maxIndex = Math.max(0, this.#tabs.length - 1);
    const nextIndex = Math.min(Math.max(0, parsed), maxIndex);

    if (this.#selectedIndex === nextIndex) return;

    const previousIndex = this.#selectedIndex;
    this.#selectedIndex = nextIndex;

    this.#reflectSelectedIndex()
    this.#updateSelection(previousIndex, nextIndex);

    this.dispatchEvent(new CustomEvent('change', {
      detail: { selectedIndex: this.#selectedIndex },
      bubbles: true,
      composed: true
    }));

  }

  #renderShell() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }

        .tabs {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid #ccc;
          margin-bottom: 0.75rem;
        }

        ::slotted([slot="tab"]) {
          appearance: none;
          border: none;
          background: none;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font: inherit;
          border-bottom: 2px solid transparent;
        }

        ::slotted([slot="tab"][aria-selected="true"]) {
          border-bottom-color: currentColor;
          font-weight: 600;
        }

        ::slotted([slot="panel"]) {
          display: none;
        }

        ::slotted([slot="panel"][data-active="true"]) {
          display: block;
        }
      </style>

      <div class="tabs" aria-orientation="horizontal" role="tablist" part="tablist">
        <slot name="tab"></slot>
      </div>

      <div class="panels" part="panels">
        <slot name="panel"></slot>
      </div>
    `;
  }

  #cacheDom() {
    this.$tabList = this.shadowRoot.querySelector('.tabs');
    this.$tabSlot = this.shadowRoot.querySelector('slot[name="tab"]');
    this.$panelSlot = this.shadowRoot.querySelector('slot[name="panel"]');
  }

  #attachEvents() {
    this.$tabList.addEventListener('click', this._onTabClick)
    this.$tabSlot.addEventListener('slotchange', this._onSlotChange)
    this.$panelSlot.addEventListener('slotchange', this._onSlotChange)
    this.$tabList.addEventListener('keydown', this._onKeyDown)
  }

  #collectParts() {
    this.#tabs = this.$tabSlot.assignedElements({ flatten: true });
    this.#panels = this.$panelSlot.assignedElements({ flatten: true });

    this.#tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.id ||= `tab-${this._uid()}-${index}`;
      tab.dataset.index = String(index);
      tab.tabIndex = -1;
    });

    this.#panels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.id ||= `panel-${this._uid()}-${index}`;
      panel.setAttribute('aria-labelledby', this.#tabs[index]?.id || '');

      const relatedTab = this.#tabs[index];
      if (relatedTab) {
        panel.setAttribute('aria-labelledby', relatedTab.id);
        relatedTab.setAttribute('aria-controls', panel.id);
      }
    });
  }

  #upgradeProperty(propertyName) {
    if (Object.prototype.hasOwnProperty.call(this, propertyName)) {
      const value = this[propertyName];
      delete this[propertyName];
      this[propertyName] = value;
    }
  }

  #initializeSelection() {
    if (!this.#tabs.length || !this.#panels.length) return;

    const maxIndex = Math.min(this.#tabs.length, this.#panels.length) - 1;
    this.#selectedIndex = Math.min(Math.max(0, this.#selectedIndex), maxIndex);
    this.#reflectSelectedIndex(true);
    this.#updateSelection(-1, this.#selectedIndex);
  }

  #reflectSelectedIndex(skipIfSame = false) {
    const attrValue = String(this.#selectedIndex);
    if (skipIfSame && this.getAttribute('selected-index') === attrValue) return;
    if (this.getAttribute('selected-index') !== attrValue) {
      this.setAttribute('selected-index', attrValue);
    }
  }

  #updateSelection(previousIndex, nextIndex) {
    if (previousIndex >= 0) {
      const prevTab = this.#tabs[previousIndex];
      const prevPanel = this.#panels[previousIndex];

      if (prevTab) {
        prevTab.setAttribute('aria-selected', 'false');
        prevTab.tabIndex = -1;
      }

      if (prevPanel) {
        prevPanel.removeAttribute('data-active');
      }
    }

    const nextTab = this.#tabs[nextIndex];
    const nextPanel = this.#panels[nextIndex];

    if (nextTab) {
      nextTab.setAttribute('aria-selected', 'true');
      nextTab.tabIndex = 0;
      nextTab.focus();
    }

    if (nextPanel) {
      nextPanel.setAttribute('data-active', 'true');
    }
  }

  _uid() {
    if (!this.__uid) {
      this.__uid = Math.random().toString(36).slice(2, 10);
    }
    return this.__uid;
  }

  _onTabClick = (event) => {
    const clickedTab = event.target.closest('[slot="tab"]');
    if (!clickedTab) return;

    const index = Number(clickedTab.dataset.index);
    if (!Number.isInteger(index)) return;

    this.selectedIndex = index;
  }

  _onSlotChange = (event) => {
    this.#collectParts();
    this.#initializeSelection();
  }

  _onKeyDown = (event) => {
    const currentTab = event.target.closest('[slot="tab"]');
    if (!currentTab) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.selectNextTab();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.selectPreviousTab();
        break;

      case 'Home':
        event.preventDefault();
        this.selectFirstTab();
        break;

      case 'End':
        event.preventDefault();
        this.selectLastTab();
        break;
    }
  }

  selectNextTab() {
    const count = Math.min(this.#tabs?.length || 0, this.#panels?.length || 0);
    if (count === 0) return;

    const nextIndex = (this.#selectedIndex + 1) % count;
    this.selectedIndex = nextIndex;
  }

  selectPreviousTab() {
    const count = Math.min(this.#tabs?.length || 0, this.#panels?.length || 0);
    if (count === 0) return;

    const nextIndex = (this.#selectedIndex - 1 + count) % count;
    this.selectedIndex = nextIndex;
  }

  selectFirstTab() {
    const count = Math.min(this.#tabs?.length || 0, this.#panels?.length || 0);
    if (count === 0) return;

    this.selectedIndex = 0;
  }

  selectLastTab() {
    const count = Math.min(this.#tabs?.length || 0, this.#panels?.length || 0);
    if (count === 0) return;

    this.selectedIndex = count - 1;
  }

}

customElements.define('site-tabs', SiteTabs)