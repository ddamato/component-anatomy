import styles from './styles.css';

class ComponentAnatomy extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style type="text/css">${styles}</style>
      <div id="component-anatomy">
        <figure id="area">
          <slot id="slot"></slot>
          <ol id="pins"></ol>
        </figure>
        <ol id="list"></ol>
      </div>
    `;

    ['area', 'pins', 'slot', 'list']
      .forEach((id) => Object.assign(this, { [`_$${id}`] :this.shadowRoot.getElementById(id) }));
  }

  static get observedAttributes() { 
    return [ 'definitions', 'edit' ]
  }

  connectedCallback() {
    this._$pins.addEventListener('click' , ({ offsetX, offsetY }) => {
      if (!this.edit) return;
      const { offsetWidth, offsetHeight } = this._$pins;
      const [x, y] = [ offsetX / offsetWidth, offsetY / offsetHeight ].map(v => Math.round(v * 100));
      this.definitions = [].concat(this.definitions, { x, y, term: 'example term' }).filter(Boolean);
    });

    this._$list.addEventListener('focusout', ({ target }) => {
      const index = this._getIndex(target);
      if (target.textContent.trim()) {
        this.update(index, { term: target.textContent });
      } else {
        this.remove(index);
      }
    })

    this._$list.addEventListener('mouseout', () => this._blur());
    this._$list.addEventListener('mouseover', (ev) => this._focus(ev));
    this._$list.addEventListener('focusin', (ev) => this._focus(ev));
  }

  _focus({ target }) {
    const index = this._getIndex(target);
    this._$pins.children[index] && this._$pins.children[index].setAttribute('aria-current', '');
  }

  _blur() {
    [...this._$pins.children].forEach((item) => item.removeAttribute('aria-current'));
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'definitions') this._render();
    if (attrName === 'edit') this._edit();
  }
  
  _render() {
    this.clear();
    this.definitions.forEach(this.create, this);
  }

  _edit() {
    [].concat(this._$list.children)
      .filter(Boolean)
      .forEach((item) => item.contentEditable = this.edit);
  }

  clear() {
    this._$pins.innerHTML = '';
    this._$list.innerHTML = '';
    return this;
  }

  create({ x, y, term }) {
    if (isNaN(x) || isNaN(y) || !term) return;
    this._createPin(`${x}%`, `${y}%`);
    this._createDescription(term);
    return this;
  }

  remove(index) {
    this.definitions = this.definitions.filter((def, i) => i !== index);
    return this;
  }

  update(index, payload) {
    this.definitions = this.definitions.map((def, i) => i === index ? Object.assign(def, payload) : def);
    return this;
  }

  _createPin(left, top) {
    const $pin = document.createElement('li');
    Object.assign($pin.style, { top, left });
    this._$pins.appendChild($pin);
  }

  _createDescription(term) {
    const $term = document.createElement('li');
    $term.textContent = term;
    $term.contentEditable = this.edit;
    this._$list.appendChild($term);
  }

  _getIndex(target) {
    return [...this._$list.children].indexOf(target);
  }

  get definitions() {
    try {
      return JSON.parse(this.getAttribute('definitions'));
    } catch (err) {
      return [];
    };
  }

  set definitions(value) {
    if (!value || !value.length) {
      return this.removeAttribute('definitions');
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
      this.setAttribute('definitions', value);
    }
  }

  get edit() {
    return this.hasAttribute('edit');
  }

  set edit(value) {
    if (value) {
      this.setAttribute('edit', '');
    } else {
      this.removeAttribute('edit');
    }
  }
}

window.customElements.define('component-anatomy', ComponentAnatomy);