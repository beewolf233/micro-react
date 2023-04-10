import React from './react';
import ReactDOM from './react-dom';

/** @jsxRuntime classic */
const element = (
  <div style={{background: 'salmon'}}>
    <h1>Hello World</h1>
    <h2 style={{textAlign: 'right' }}>from Didact</h2>
  </div>
);


const container = document.getElementById("root") as HTMLElement;
ReactDOM.render(element, container);
