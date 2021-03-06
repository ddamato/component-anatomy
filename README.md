# [`<component-anatomy/>`](https://ddamato.github.io/component-anatomy/)

[![npm version](https://img.shields.io/npm/v/component-anatomy.svg)](https://www.npmjs.com/package/component-anatomy)

A native web-component which can identify parts of a figure; expected to be used in documentation pages to name pieces of a component.

## Install

The project is distributed as an [`IIFE`](https://developer.mozilla.org/en-US/docs/Glossary/IIFE), so the easiest way is to just create a script tag pointing to the export hosted on [unpkg](https://unpkg.com/).

```html
<script src="unpkg.com/component-anatomy" defer></script>
```

However, you can also install the package and add the script through some build process.

```html
<script src="dist/component-anatomy.iife.js" defer></script>
```

## Usage

Once the script is loaded, you can add the new component to a page.

```html
<component-anatomy>
  <img src="https://picsum.photos/500/300"/>
</component-anatomy>
```

The content within the tag could be anything, even a DOM element like another component.

```html
<component-anatomy>
  <div style="padding: 2rem">
    <button type="button">Click me</button>
  </div>
</component-anatomy>
```

## Edit Mode

When adding a new component to the page, no indicators will appear. You'll need to update the component with the `edit` attribute in order to allow editing. When in edit mode, you can click parts of the figure to create dots (markers) and describe the feature in the numbered list that appears. The dots will not scale while in this mode.

```html
<component-anatomy edit>
  <img src="https://picsum.photos/500/300"/>
</component-anatomy>
```

Once you've completed editing, remove the `edit` attribute and copy the resulting HTML; specifically the data left in the `definitions` attribute. This describes your anatomy to be rendered the same way each time the component is loaded, assuming the content within the tags is the same.

```html
<component-anatomy definitions="W3sieCI6IjMzJSIsInkiOiI0MCUiLC...">
  <img src="https://picsum.photos/500/300">
</component-anatomy>
```

You can also hit the `Esc` key on your keyboard to exit out of edit mode. This will also copy the resulting HTML to your clipboard, assuming your browser supports `document.execCommand`. Otherwise, you'll just need to view the resulting source code.
## Additional Features

- The dots will scale down in size when the figure is hovered; reducing the visual obstruction they would cause at normal size.
- You can hover any numbered list item to highlight the corresponding marker. This also occurs in edit mode.
- If you clear the description entirely in edit mode, the marker will be removed.
- You can [create links using markdown syntax](https://www.markdownguide.org/basic-syntax/#links) in the list items. After losing focus, the text will transform into a link. If you attempt to re-edit the link, it'll be lost. No other special formatting is included.

## Manipulating Definitions

The `definitions` attribute value is an encoded JSON string. You can potentially update this yourself through JavaScript. For example, if you are storing the examples in a database or generating your own through some computed process. **Manipulating this way isn't advised** but it is possible.

```js
const anatomy = document.querySelector('component-anatomy');
anatomy.remove(2) // Removes the third item
anatomy.update(0, { term: 'Update the description' }); // Updates the text of the first item
```

Each definition is an object (`{ x, y, term }`). `x` and `y` are represented as the location of the marker in percentage to given the figure; including the `%` symbol as a string. The `term` is the description. You can add new definitions using the following approach.

```js
const anatomy = document.querySelector('component-anatomy');
anatomy.create({
  term: 'The description of the marker',
  x: '37%',
  y: '84%',
});
```

You may also clear all of the definitions with one command.

```js
const anatomy = document.querySelector('component-anatomy');
anatomy.clear(); // Clears all items
```

You can also adjust the `definitions` array directly with varying degrees of freedom.

```js
const anatomy = document.querySelector('component-anatomy');
anatomy.definitions = anatomy.definitions.concat({
  term: 'The description of the marker',
  x: '37%',
  y: '84%',
});
```

You must set a new array of `definitions` to re-render. Simply mutating the current array will not cause any changes to occur.

## Attributes

| Name | Description |
| ---- | ----------- |
| `definitions` | An encoded string that is represents the data for the anatomy to be rendered. Allow the component to generate this for you during [Edit Mode](#edit-mode). This can be set using a JavaScript property. (`anatomy.definitions = []`) |
| `edit` | When set, this allows the component to be edited. See [Edit Mode](#edit-mode) for details. This can be set using a JavaScript property (`anatomy.edit = true`). |
| `placeholder` | The content to display when a bullet is created. Defaults to "placeholder". This can be set using a JavaScript property (`anatomy.placeholder = 'My example'`) |
| `orientation` | Determines how to display the figure and the numbered descriptions. By default this is `horizontal` and can be set to `vertical`. This can be set using a JavaScript property (`anatomy.orientation = 'vertical'`)|

## Accessibility

Each marker is tabbable and `aria-describedby` an `id` that references the related item in the numbered list. When a numbered item is hovered, `aria-current` is applied to the marker.

[Edit Mode](#edit-mode) is less accessible; the descriptions aren't tabbable. This is due to the re-render that occurs on blur of the description and focus is lost.

## Customizing

Font styles are inherited from the components' ancestors. Changing the font attributes is as simple as changing them on the containing element or higher up. A `<ol/>` is used to display the list items; pay attention to the alignment of the numbers here. Monospaced fonts might look better as the list is aligned to the bullet, not to the left.

The text color for the numbered list items is also inherited. Marker colors can be changed using CSS Custom Properties:

| Property | Description |
| -------- | ----------- |
| `--component-anatomy--pin-bg` | Background of the marker |
| `--component-anatomy--pin-fg` | Foreground of the marker |
| `--component-anatomy--pin-hl` | Border that appears when list item is hovered |
| `--component-anatomy--link-fg` | Foreground of links in the list |