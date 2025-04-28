# Documentation

Hypermore API is under development and subject to change.

## Usage

```javascript
import { Hypermore } from "@dbushell/hypermore";

const hypermore = new Hypermore();

hypermore.render(`<h1>{{heading}}</h1>`, {
  heading: "Hello, World!",
});
```

## Variables

HTML text nodes are parsed for variables between `{{` and `}}`.

```html
<h1>{{ heading }}</h1>
```

## Expressions

JavaScript expressions are also executed.

```html
<h1>{{ heading.toUpperCase() }}</h1>
```

## Custom Elements

Custom element templates can be registered and reused as components.

```html
<my-header>
  <h1>{{heading}}</h1>
</my-header>
```

For example:

```javascript
hypermore.setTemplate("my-header", `<h1>{{heading}}</h1>`);
hypermore.render(`<my-header heading="Hello, World!" />`);
```

## Slots

Custom element templates can have named slots and a default slot.

```html
<my-header>
  <ssr-slot name="heading">
    <h1>{{heading}}</h1>
  </ssr-slot>
  <ssr-slot />
</my-header>
```

For example:

```javascript
hypermore.setTemplate(
  "my-header",
  `<ssr-slot name="heading"><h1>{{heading}}</h1></ssr-slot><ssr-slot />`,
);
hypermore.render(`
<my-header heading="Hello, World!">
  <ssr-fragment slot="heading">
    <h2>{{heading}}</h2>
  </ssr-fragment>
  <p>Default slot content.</p>
</my-header>
`);
```

## Portals

Fragments can be rendered into unique named portals from anywhere.

```html
<ssr-portal name="head" />
<p>After heading content.</p>
<ssr-fragment portal="head">
  <h1>Hello, World!</p>
</ssr-fragment>
```

For example:

```javascript
hypermore.render(`
<ssr-portal name="head" />
<p>After heading content.</p>
<ssr-fragment portal="head">
  <h1>Hello, World!</p>
</ssr-fragment>
`);
```

## For Loops

```html
<ssr-for index="i" item="article" of="posts">
  <h1 id="post-{{ i }}">{{ article.title }}</h1>
</ssr-for>
```

## If Conditions

```html
<ssr-if condition="number === 1">
  <p>One</p>
<ssr-elseif condition="number === 2">
  <p>Two</p>
<ssr-else>
  <p>Three</p>
</ssr-if>
```

## Element

Render a dynamic element.

```html
<ssr-element tag="h{{level}}">Hello, World!</ssr-element>
```

For example:

```javascript
hypermore.render(
  `<ssr-element tag="h{{level}}">Heading</ssr-element>`,
  { level: 1 },
);
```

## HTML

Render without escaping variable HTML entities.

```html
<ssr-html>{{code}}</ssr-html>
```

For example:

```javascript
hypermore.render(`<ssr-html>{{code}}</ssr-html>`, {
  code: `<h1>Hello, World!</h1>`,
});
```

## Cache

Render once and reuse across multiple renders.

```html
<ssr-cache name="date">{{ Date.now() }}</ssr-cache>
```

For example:

```javascript
hypermore.render(`<ssr-cache name="date">{{ Date.now() }}</ssr-cache>`);
hypermore.render(`<ssr-cache name="date" />`);
```
