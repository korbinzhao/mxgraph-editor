import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './editor';
import './index.less';

const App = () => (
  <div className="mxgraph-editor-container">
    <Editor />
  </div>
);


ReactDOM.render(<App />, document.getElementById('app'));
