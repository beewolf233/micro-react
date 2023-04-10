
export type Element = HTMLElement | Text;
// 虚拟元素类型
export type VDOMProps = {
  /** 便签类型 */
  type: string;
  /** 属性 */
  props: {
    /** css属性 */ 
    style?: Record<string, string | number>;
    /** 内容 */ 
    nodeValue?: string | number;
    /** 子元素 */
    children: VDOMProps[];
  } & {
    [key: string]: any
  };
}
