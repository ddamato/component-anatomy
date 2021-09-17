const { resolve } = require('path');
const pkg = require('../package.json');
const { expect } = require('chai');
const DOM = require('./dom');

describe('<component-anatomy/>', function () {

  let dom, anatomy;

  before(function () {
    dom = new DOM();
    require(resolve(pkg.browser));
  });

  after(function () {
    dom.destroy();
  });

  beforeEach(function () {
    anatomy = document.body.appendChild(document.createElement('component-anatomy'));
  });

  afterEach(function () {
    document.body.removeChild(anatomy);
  });

  it('should mount a component', function () {
    expect(anatomy.shadowRoot).to.exist;
  });

  it('should allow editing', function () {
    expect(anatomy.hasAttribute('edit')).to.be.false;
    anatomy.edit = true;
    expect(anatomy.hasAttribute('edit')).to.be.true;
  });

  it('should change placeholder', function () {
    expect(anatomy.placeholder).to.equal('placeholder');
    anatomy.setAttribute('placeholder', 'Testing change')
    expect(anatomy.placeholder).to.equal('Testing change');
  });

  it('should change orientation', function () {
    expect(anatomy.orientation).to.equal('horizontal');
    anatomy.setAttribute('orientation', 'vertical')
    expect(anatomy.orientation).to.equal('vertical');
  });

  it('should set definitions', function () {
    const def = 'W3sieCI6IjY0JSIsInkiOiI1MyUiLCJ0ZXJtIjoiQnV0dG9uIHRleHQifV0=';
    anatomy.setAttribute('definitions', def);
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(1);
    expect(anatomy.definitions).to.deep.include({ x:'64%', y:'53%', term:'Button text' });
  });

  it('should create definitions', function () {
    const def = 'W3sieCI6IjY0JSIsInkiOiI1MyUiLCJ0ZXJtIjoiQnV0dG9uIHRleHQifV0=';
    anatomy.create({ x:'64%', y:'53%', term:'Button text' });
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(1);
    expect(anatomy.getAttribute('definitions')).to.equal(def);
  });

  it('should update definitions by index', function () {
    const orig = 'W3sieCI6IjY0JSIsInkiOiI1MyUiLCJ0ZXJtIjoiQnV0dG9uIHRleHQifV0=';
    const updated = 'W3sieCI6IjY0JSIsInkiOiI1MyUiLCJ0ZXJtIjoiQnV0dG9uIGNvbnRlbnQifV0=';
    anatomy.setAttribute('definitions', orig);
    anatomy.update(0, { term: 'Button content' });
    expect(anatomy.definitions).to.deep.include({ x:'64%', y:'53%', term:'Button content' });
    expect(anatomy.getAttribute('definitions')).to.equal(updated);
  });

  it('should remove definitions by index', function () {
    const def = 'W3sieCI6IjY0JSIsInkiOiI1MyUiLCJ0ZXJtIjoiQnV0dG9uIHRleHQifV0=';
    anatomy.setAttribute('definitions', def);
    anatomy.remove(0);
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(0);
    expect(anatomy.hasAttribute('definitions')).to.be.false;
  });

  it('should clear definitions', function () {
    const def = 'W3sieCI6IjY0JSIsInkiOiI1MyUiLCJ0ZXJtIjoiQnV0dG9uIHRleHQifV0=';
    anatomy.setAttribute('definitions', def);
    anatomy.clear();
    expect(anatomy.definitions).to.be.an('array');
    expect(anatomy.definitions.length).to.equal(0);
    expect(anatomy.hasAttribute('definitions')).to.be.false;
  });

  it('should create links using markdown', function () {
    const term = 'Button text with [a link](#link) to a place';
    anatomy.create({ x:'64%', y:'53%', term });
    const item = anatomy.shadowRoot.querySelector('#list li');
    const link = anatomy.shadowRoot.querySelector('#list li a');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('#link');
    expect(link.textContent).to.equal('a link');
    expect(item.innerHTML).to.equal('Button text with <a href="#link">a link</a> to a place');
  });

  it('should create only link', function () {
    const term = '[a link](#link)';
    anatomy.create({ x:'64%', y:'53%', term });
    const item = anatomy.shadowRoot.querySelector('#list li');
    const link = anatomy.shadowRoot.querySelector('#list li a');
    expect(link).to.exist;
    expect(link.getAttribute('href')).to.equal('#link');
    expect(link.textContent).to.equal('a link');
    expect(item.innerHTML).to.equal('<a href="#link">a link</a>');
  });

  it('should not render html', function () {
    const term = 'Button text with <strong>bold</strong> wording';
    anatomy.create({ x:'64%', y:'53%', term });
    const item = anatomy.shadowRoot.querySelector('#list li');
    const bold = anatomy.shadowRoot.querySelector('#list li strong');
    expect(bold).to.not.exist;
    expect(item.innerHTML).to.equal('Button text with &lt;strong&gt;bold&lt;/strong&gt; wording');
  });
});

