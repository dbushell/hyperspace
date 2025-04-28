/**
 * Regular expression to match HTML comment
 */
export const comment = /<!--[\s\S]*?-->/;

/**
 * Regular expression to match HTML tag name
 */
export const tagName = /([a-zA-Z][\w:-]*)/;

/**
 * Regular expression to match HTML custom element tag name
 * {@link https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name}
 */
export const customName = /([a-z][\w]*-[\w]+)/;

/**
 * Regular expression to match HTML open tag
 */
export const openTag = new RegExp(`<${tagName.source}([^>]*)>`);

/**
 * Regular expression to match HTML close tag
 */
export const closeTag = new RegExp(`</${tagName.source}>`);

/**
 * Regular expression to match HTML self-closing tag
 */
export const selfCloseTag = new RegExp(`<${tagName.source}([^>]*)/>`);

/**
 * Regular expression to match any HTML tag
 * This allows </div/> which is technically incorrect
 */
export const anyTag = new RegExp(`</?${tagName.source}([^>]*)/?>`);

/**
 * Regular expression to match full tag with inner content
 * This is non-greedy and cannot handle nested tags of the same name
 */
export const fullTag = new RegExp(`(<${tagName.source}[^>]*>)(.*?)</\\2>`, "s");
