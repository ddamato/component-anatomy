const { JSDOM } = require('jsdom');

module.exports = class DOM {
  constructor(html) {
    const dom = new JSDOM(html || '<html><head></head><body></body></html>');
    global.window = dom.window;
    global.document = global.window.document;
  }

  destroy(clearRequireCache) {
    const clearCache = typeof clearRequireCache === 'undefined' || clearRequireCache;
    typeof global.window === 'function' && global.window.close();

    delete global.document;
    delete global.window;

    if (!clearCache) return;

    Object.keys(require.cache).forEach((key) => {
      ~key.indexOf('require') && delete require.cache[key];
    });
  }
}
