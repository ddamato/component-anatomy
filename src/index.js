import html from './template.html';
import css from './styles.css';
class ComponentAnatomy extends HTMLElement {

  /** Lifecycle methods */

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style type="text/css">${css}</style>${html}`;

    this._$pins = this.shadowRoot.getElementById('pins');
    this._$list = this.shadowRoot.getElementById('list');
  }

  static get observedAttributes() { 
    return [ 'definitions', 'edit' ]
  }

  attributeChangedCallback(attrName) {
    if (attrName === 'definitions') this._render();
    if (attrName === 'edit') this._edit();
  }

  connectedCallback() {
    this._$pins.addEventListener('click' , ev => this._click(ev));
  }

  /** Public methods */

  create({ x, y, term }, index) {
    if (!x || !y || !term) return;
    this._createPin({ left: x, top: y }, index);
    this._createDescription(term, index);
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

  /** Private methods */

  _attributes(item) {
    if (this.edit) {
      item.setAttribute('contentEditable', '');
    } else {
      item.removeAttribute('contentEditable');
    }
    item.setAttribute('tabIndex', Number(this.edit) - 1);
  }

  _blur(index) {
    this._$pins.children[index].removeAttribute('aria-current');
  }

  _clear() {
    this._$pins.innerHTML = '';
    this._$list.innerHTML = '';
    return this;
  }

  _click({ offsetX, offsetY }) {
    if (!this.edit) return;
    const { offsetWidth, offsetHeight } = this._$pins;
    const [x, y] = [ offsetX / offsetWidth, offsetY / offsetHeight ].map(v => `${Math.round(v * 100)}%`);
    this.definitions = [].concat(this.definitions, { x, y, term: 'example term' }).filter(Boolean);
  }

  _commit({ target }) {
    const index = this._index(target);
    if (!index) return;
    if (target.textContent.trim()) {
      this.update(index, { term: target.textContent });
    } else {
      this.remove(index);
    }
  }

  _createPin(style, index) {
    const $pin = document.createElement('li');
    Object.assign($pin.style, style);
    $pin.setAttribute('aria-describedby', `item-${index}`);
    $pin.tabIndex = 0;
    this._$pins.appendChild($pin);
  }

  _createDescription(term, index) {
    const $term = document.createElement('li');
    $term.textContent = term;
    this._attributes($term);
    $term.id = `item-${index}`;

    $term.addEventListener('mouseenter', () => this._focus(index));
    $term.addEventListener('mouseleave', () => this._blur(index));
    $term.addEventListener('focus', () => this._focus(index));
    $term.addEventListener('blur', () => this._blur(index));

    this._$list.appendChild($term);
  }

  _edit() {
    [...this._$list.children].forEach(this._attributes, this);
  }

  _focus(index) {
    this._$pins.children[index].setAttribute('aria-current', '');
  }

  _index(target) {
    if (target === this._$list) return;
    return [...this._$list.children].indexOf(target);
  }
  
  _render() {
    this._clear();
    this.definitions.forEach(this.create, this);
  }

  /** Getters/Setters */

  get definitions() {
    try {
      return JSON.parse(window.atob(this.getAttribute('definitions')));
    } catch (err) {
      return [];
    };
  }

  set definitions(value) {
    if (!value || !value.length) {
      this.removeAttribute('definitions');
    }

    if (typeof value === 'object') {
      this.setAttribute('definitions', window.btoa(JSON.stringify(value)));
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