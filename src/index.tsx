import React from './react';
import ReactDOM from './react-dom';

type AppProps = {
  name: string;
}
/** @jsxRuntime classic */
function App(props: AppProps) {
  return (
    <div style={{background: 'salmon'}}>
      <h1>Hi {props.name}</h1>
      <h2 style={{textAlign: 'right' }}>from Didact</h2>
  </div>
  )
}
/** @jsxRuntime classic */
const element = <App name="world" />

const container = document.getElementById("root") as HTMLElement;
ReactDOM.render(element, container);
