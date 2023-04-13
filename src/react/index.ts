import type { VDOMProps } from '../shared';

/**
 * @param type 便签类型
 * @param props 属性
 * @param children 孩子
 * */ 
export function createElement(type: VDOMProps['type'], props: VDOMProps, ...children: VDOMProps['props']['children']) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object"
          ? child
          : createTextElement(child)
      ),
    },
  }
}

function createTextElement(text: string | number): VDOMProps {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

const React = {
  createElement,
}

export default React;
