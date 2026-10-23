import type { ChineseConverter } from "./chinese-converter";

const EXCLUDED = 'script, style, noscript, code, pre, [contenteditable]:not([contenteditable="false"]), [translate="no"]';
const ATTRIBUTES = ["title", "alt", "placeholder", "aria-label", "aria-description", "aria-valuetext"];
type Original = { source: string; converted: string };

// 只写文字节点与展示属性，不替换 React 管理的节点，也不改 URL、表单值或 JSON-LD。
export function convertChineseDocument(root: HTMLElement, convert: ChineseConverter) {
  const texts = new WeakMap<Text, Original>();
  const attributes = new WeakMap<Element, Map<string, Original>>();

  function updateText(node: Text) {
    const current = node.data;
    const previous = texts.get(node);
    if (previous?.converted === current) return;
    const converted = convert(current);
    texts.set(node, { source: current, converted });
    if (converted !== current) node.data = converted;
  }

  function updateAttribute(element: Element, name: string) {
    const current = element.getAttribute(name);
    if (current === null) {
      attributes.get(element)?.delete(name);
      return;
    }
    let originals = attributes.get(element);
    if (originals?.get(name)?.converted === current) return;
    if (!originals) { originals = new Map(); attributes.set(element, originals); }
    const converted = convert(current);
    originals.set(name, { source: current, converted });
    if (converted !== current) element.setAttribute(name, converted);
  }

  function isExcluded(node: Node) {
    const element = node instanceof Element ? node : node.parentElement;
    return Boolean(element?.closest(EXCLUDED) || (node instanceof Text && element?.closest("textarea")));
  }

  function visit(node: Node, restore = false) {
    if (node instanceof Text) {
      if (!restore) updateText(node);
      else {
        const original = texts.get(node);
        // React 若已写入新内容，不用旧快照覆盖它。
        if (original && node.data === original.converted) node.data = original.source;
      }
    } else if (node instanceof Element) {
      if (!restore) ATTRIBUTES.forEach((name) => updateAttribute(node, name));
      else attributes.get(node)?.forEach((original, name) => {
        if (node.getAttribute(name) === original.converted) node.setAttribute(name, original.source);
      });
    }
  }

  function walk(node: Node, restore = false) {
    if (isExcluded(node)) return;
    visit(node, restore);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (child) => (child instanceof Element && child.matches(EXCLUDED)) || (child instanceof Text && child.parentElement?.closest("textarea"))
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    while (walker.nextNode()) visit(walker.currentNode, restore);
  }

  const observer = new MutationObserver((mutations) => {
    // 断开后再转换，防止我们自己的文字变更形成观察循环。
    observer.disconnect();
    for (const mutation of mutations) {
      if (!root.contains(mutation.target) || isExcluded(mutation.target)) continue;
      if (mutation.type === "characterData") visit(mutation.target);
      else if (mutation.type === "attributes" && mutation.target instanceof Element && mutation.attributeName) {
        updateAttribute(mutation.target, mutation.attributeName);
      } else mutation.addedNodes.forEach((node) => walk(node));
    }
    observe();
  });

  function observe() {
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
  }

  walk(root);
  observe();
  return () => {
    observer.disconnect();
    // 切回时恢复原文，不能反向转换，以免人名、异体字和原始引文被改写。
    walk(root, true);
  };
}
