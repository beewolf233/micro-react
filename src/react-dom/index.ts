import type { VDOMProps } from '../shared';

function render(vDom: VDOMProps , container:  HTMLElement | Text) {
  const dom =
    vDom.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(vDom.type)

  const isProperty = (key: string) => key !== "children"

  Object.keys(vDom.props)
    .filter(isProperty)
    .forEach(name => {
      // css属性
      if (name === 'style') {
        let styleObj = vDom.props[name];
        for (let attr in styleObj) {
           // @ts-ignore 
          (dom as HTMLElement).style[attr] = styleObj[attr];
        }
        return
      }
      // @ts-ignore
      dom[name] = vDom.props[name]
    })

  const children = vDom.props.children;

  children.forEach(child =>
    render(child, dom)
  )

  container.appendChild(dom)
}

const ReactDOM = {
  render
}

export default ReactDOM;