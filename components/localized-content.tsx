"use client";

import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { useLocale, type LocaleContextValue } from "@/components/locale-provider";
import { withLocalePath } from "@/lib/locale-path";

const TEXT_ATTRIBUTES = ["title", "alt", "placeholder", "aria-label", "aria-description", "aria-valuetext"];
const UNTRANSLATED = new Set(["script", "style", "code", "pre"]);

function localizeNode(node: ReactNode, context: LocaleContextValue): ReactNode {
  if (typeof node === "string") return context.translate(node);
  if (Array.isArray(node)) return Children.map(node, (child) => localizeNode(child, context));
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const props = element.props;
  if (element.type === LocalizedContent) return element;
  if (props.translate === "no" || (typeof element.type === "string" && UNTRANSLATED.has(element.type))) return element;
  if (typeof element.type !== "string" && element.type !== Fragment) {
    // RSC 中组件类型可能是远端引用，不能靠函数 identity 判断已转换。
    // 不跨组件边界提前改字；让其 children 在真正渲染的位置只转换一次。
    return props.children === undefined ? element : cloneElement(element, {
      children: <LocalizedContent>{props.children as ReactNode}</LocalizedContent>,
    });
  }

  const translated: Record<string, unknown> = {};
  for (const attribute of TEXT_ATTRIBUTES) {
    if (typeof props[attribute] === "string") translated[attribute] = context.translate(props[attribute]);
  }
  if (typeof props.href === "string") translated.href = withLocalePath(props.href, context.locale);
  // value/defaultValue、标识符和代码保持原样；textarea 只翻译提示属性。
  if (props.children !== undefined && element.type !== "textarea" && !props.contentEditable) {
    translated.children = Children.map(props.children as ReactNode, (child) => localizeNode(child, context));
  }
  return cloneElement(element, translated);
}

/** 服务端预渲染与客户端更新使用同一转换；不在 hydration 后改写 DOM。 */
export function LocalizedContent({ children }: { children: ReactNode }) {
  const context = useLocale();
  // Children.map 也能解析 RSC 的 lazy/thenable 槽，不能只遍历普通数组。
  return Children.map(children, (child) => localizeNode(child, context));
}
