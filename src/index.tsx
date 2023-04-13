import React from './react';
import ReactDOM, { useState } from './react-dom';

/** @jsxRuntime classic */
function Counter() {
  const [state, setState] = useState<number>(1);
  return (
    <h1 onClick={() => setState((c: number) => c + 1)}>
      Count: {state}
    </h1>
  )
}
const element = (
  <div>
    container
    <Counter />
  </div>
)

const container = document.getElementById("root") as HTMLElement;
ReactDOM.render(element, container);
