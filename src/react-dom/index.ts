import type { VDOMProps, FiberProps, Element } from '../shared';

type FiberBlock =  FiberProps | null | undefined;

function createDom(fiber: FiberProps): Element {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string)

  updateDom(dom, {} as FiberProps['props'], fiber.props)

  return dom
}

const isEvent = (key: string) => key.startsWith("on")
const isProperty = (key: string) =>
  key !== "children" && !isEvent(key)
const isNew = (prev: FiberProps['props'], next: FiberProps['props']) => (key: string) =>
  prev[key] !== next[key]
const isGone = (prev: FiberProps['props'], next: FiberProps['props']) => (key: string)  => !(key in next)

function updateDom(dom: Element, prevProps: FiberProps['props'], nextProps: FiberProps['props']) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
       // @ts-ignore
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      if (name === 'style') {
        let styleObj = nextProps[name] || {};
        for (let attr in styleObj) {
           // @ts-ignore 
          (dom as HTMLElement).style[attr] = styleObj[attr];
        }
        return
      }
      // @ts-ignore
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
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
    alternate: currentRoot,
  } as FiberProps
  nextUnitOfWork = wipRoot
  deletions = []
}


// 生成节点
function commitRoot() {
  // 先删除相应要删除的节点
  deletions.forEach(commitWork)
  commitWork(wipRoot!.child)
  // 生成结束后 更新最新fiber树
  currentRoot = wipRoot
  // 生成结束后 初始化 wipRoot
  wipRoot = null
}

function commitWork(fiber: FiberBlock) {
  if (!fiber) {
    return
  }
  // const domParent = fiber.parent!.dom;
  let domParentFiber = fiber.parent
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent
  }
  const domParent = domParentFiber.dom
  
  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    // 新建dom节点
    domParent!.appendChild(fiber.dom as Element)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    // 更新dom节点
    updateDom(
      fiber.dom,
      fiber.alternate!.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    // 删除dom节点
    commitDeletion(fiber, domParent)
    // domParent!.removeChild(fiber.dom as Element)
  }
  // 先遍历子工作格
  commitWork(fiber.child)
  // 再遍历兄弟工作格
  commitWork(fiber.sibling)
}


function commitDeletion(fiber: FiberProps, domParent: Element) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child as FiberProps, domParent)
  }
}

// 下一个工作节点
let nextUnitOfWork = null as FiberBlock;
// work in progress root 正在工作的fiber树
let wipRoot = null as FiberBlock;
// 当前fiber树
let currentRoot = null as FiberBlock;
// 要删除的节点
let deletions = [] as FiberProps[]

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
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
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

// 正在执行的fiber
let wipFiber = null as FiberBlock;
let hookIndex = null as number | null;

function updateFunctionComponent(fiber: FiberProps) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [(fiber.type as Function)(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber: FiberProps) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // 生成fiber
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements)
}

// hooks
export function useState<T>(initial: T) {
  // 检查是否有旧的hooks
  const oldHook =
    wipFiber!.alternate &&
    wipFiber!.alternate.hooks &&
    wipFiber!.alternate.hooks[hookIndex as number]
  // 如果有旧的，就复制到新的，如果没有初始化
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []

  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = (action: Function) => {
    // @ts-ignore
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot!.dom,
      props: currentRoot!.props,
      alternate: currentRoot!,
    } as FiberProps
    nextUnitOfWork = wipRoot
    deletions = []
  }
  // @ts-ignore
  wipFiber!.hooks.push(hook)
  hookIndex = hookIndex as number + 1;
  return [hook.state, setState]
}

/** 
 * 相同层级 children 遍历 
 * diff算法就发生在 调和阶段
 * */ 
function reconcileChildren(wipFiber: FiberProps, elements: FiberProps[]) {
  let index = 0
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null;
  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null as FiberProps | null

    const sameType =
      oldFiber &&
      element &&
      element.type === oldFiber.type
    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: wipFiber,
        alternate: oldFiber!,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber as FiberProps
    } else if (element) {
      // 如果有兄弟节点  返回相邻兄弟工作格
      if (prevSibling) {
        (prevSibling as FiberProps).sibling = newFiber as FiberProps
      }
    }
    prevSibling = newFiber
    index++
  }
}



const ReactDOM = {
  render
}

export default ReactDOM;
