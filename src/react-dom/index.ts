import type { VDOMProps, FiberProps, Element } from '../shared';

function createDom(fiber: FiberProps): Element {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

      const isProperty = (key: string) => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      if (name === 'style') {
        let styleObj = fiber.props[name];
        for (let attr in styleObj) {
           // @ts-ignore 
          (dom as HTMLElement).style[attr] = styleObj[attr];
        }
        return
      }
      // @ts-ignore
      dom[name] = fiber.props[name]
    })

  return dom
}

/**
 * 初始化第一个fiber节点
 * */ 
function render(vDom: VDOMProps , container: Element) {
  wipRoot = {
    dom: container,
    props: {
      children: [vDom],
    },
  } as FiberProps
  nextUnitOfWork = wipRoot
}

// 生成节点
function commitRoot() {
  commitWork(wipRoot!.child)
  // 生成结束后 初始化 wipRoot
  wipRoot = null
}

function commitWork(fiber: FiberProps | null | undefined) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent!.dom;
  // 更新dom节点
  domParent && domParent.appendChild(fiber.dom as Element)
  // 先遍历子工作格
  commitWork(fiber.child)
  // 再遍历兄弟工作格
  commitWork(fiber.sibling)
}


// 下一个工作节点
let nextUnitOfWork = null as FiberProps | null | undefined;
// work in progress root
let wipRoot = null as FiberProps | null | undefined;

function workLoop(deadline: any) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber: FiberProps): FiberProps | null | undefined {
  // 生成dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // if (fiber.parent?.dom) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 生成fiber
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      if (prevSibling) {
        (prevSibling as FiberProps).sibling = newFiber
      }
    }

    prevSibling = newFiber
    index++
  }
  // 如果有子节点工作格， 返回子工作格
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber

  while (nextFiber) {
    // 如果有兄弟节点  返回相邻兄弟工作格
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    // 如果没有 返回上一级
    nextFiber = nextFiber.parent as FiberProps;
  }

}


const ReactDOM = {
  render
}

export default ReactDOM;
