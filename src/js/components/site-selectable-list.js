class SiteSelectableList extends HTMLElement {
  #selectedIndex
  #items
  #itemRenderer
  #baseElement
  
  constructor() {
    super()
    this.#selectedIndex = -1
    this.#items = []
    this.#itemRenderer = this.defaultItemRenderer // (item, index, isSelected) => Node

    this.#baseElement = document.createElement('div')
    this.#baseElement.className = 'selectable-list'

    // this.#baseElement.appendChild(baseElementStyle);

    this.#baseElement.addEventListener('click', (e) => {
      const itemElement = e.target.closest('.list-item')
      this.selectedItem = this.#items[itemElement.dataset.index]
  
    })
  }

  defaultItemRenderer(item, index, isSelected) {
    const renderedItem = document.createElement('div')
    renderedItem.innerText = `index: ${index}, isSelected: ${isSelected}, ${JSON.stringify(item)}`
    
    return renderedItem
  }

  renderItemHtml(item, index) {
    const itemRootElement = document.createElement('div')
    itemRootElement.className = 'list-item'
    itemRootElement.setAttribute('data-index', index)
    itemRootElement.appendChild(this.#itemRenderer(item, index, index === this.#selectedIndex))
    return itemRootElement
  }

  buildItemsHtml() {
    const itemElements = this.#items.map((item, index) => this.renderItemHtml(item, index))

    itemElements.forEach(itemElement => {
      this.#baseElement.appendChild(itemElement)
    })
  }

  set items(items) {
    this.#items = items
    
    this.emptyHtmlItems()
    this.buildItemsHtml()
  }

  get items() {
    return this.#items
  }

  set selectedItem(item) {
    const index = this.#items.indexOf(item)

    if (index > -1) {
      this.#selectedIndex = index

      // We'll go through the Item HTML elements to add/remove selected class whether the item is selected
      for (const itemElement of this.#baseElement.children) {        
        if (parseInt(itemElement.dataset.index, 10) === index) {
          console.log('index matched!')
          if (!itemElement.classList.contains('selected')) {
            itemElement.classList.add('selected')
          }
        } else { // selected index isn't the incoming item's index
          if (itemElement.classList.contains('selected'))
            itemElement.classList.remove('selected')
        }
      }

      this.dispatchEvent(new CustomEvent('item-selected', {
        detail: item,
        bubbles: true,
        composed: true
      }))
    }
  }

  get selectedItem() {
    if (this.#selectedIndex === -1)
      return null
    else
      return this.#items[this.#selectedIndex]
  }

  set itemRenderer(itemRenderer) {
    this.#itemRenderer = itemRenderer
    this.emptyHtmlItems()
    this.buildItemsHtml()
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  render() {
    
    const baseElementStyle = document.createElement('style')
    baseElementStyle.textContent = `

      div.selectable-list {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        padding: 0.5em;
        background-color: #cbcbcb;
      }

      div.list-item {
        padding: 0.5em;
        border: solid 1px #a3a3a3;
        background-color: #ececec;
        cursor: pointer;

        &.selected {
          background-color: yellow !important;
        }
      }
    `
    this.shadowRoot.appendChild(baseElementStyle)
    this.shadowRoot.appendChild(this.#baseElement)
  }

  emptyHtmlItems() {
    this.#baseElement.replaceChildren()
  }
}

customElements.define('site-selectable-list', SiteSelectableList)