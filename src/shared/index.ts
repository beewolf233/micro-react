export type Element = HTMLElement | Text;
// 虚拟元素类型
export type VDOMProps = {
  /** 便签类型 */
  type: string | Function;
  /** 属性 */
  props: {
    /** css属性 */ 
    style?: React.CSSProperties;
    /** 内容 */ 
    nodeValue?: string | number;
    /** 子元素 */
    children: VDOMProps[];
  } & {
    [key: string]: any
  };
}

// 单个工作格类型
export type FiberProps = VDOMProps & {
  /** 真实dom节点*/
  dom: Element | null;
  /** 父节点工作格 */
  parent?: FiberProps;
  /** 子节点工作格 父节点下第一个子节点 */
  child?: FiberProps;
  /** 相邻工作格 相邻的下一个兄弟节点 */
  sibling?: FiberProps;
  /** 属性 */
  props: Omit<VDOMProps, 'children'> & {
    children: FiberProps[]
  },
  /** 前工作格流 用于对比 相当于 前一个fiber 进行diff比较 */
  alternate: FiberProps | null;
  /** 副作用 标签 */
  effectTag: 'UPDATE' | 'PLACEMENT' | 'DELETION';
  /** hooks */
  hooks?:  {
    state: any;
    queue: Function[]
  }[]
}
