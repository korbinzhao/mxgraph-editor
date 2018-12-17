import React from 'react';
import ReactDOM from 'react-dom';
import MyEditor from './my-editor';
import './index.less';

const App = () => (
  <div className="mxgraph-editor-container">
    <MyEditor />
  </div>
);


ReactDOM.render(<App />, document.getElementById('app'));
