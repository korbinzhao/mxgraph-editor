import React from 'react';
import { message, Layout } from 'antd';

import Sidebar from './sidebar';
import Toolbar from './toolbar';
import Editor from '../src/editor';

import IMAGE_SHAPES from './shape-config/image-shape';
import CARD_SHAPES from './shape-config/card-shape';
import SVG_SHAPES from './shape-config/svg-shape.xml';

import './my-editor.less';

const { Sider, Content } = Layout;

class MyEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.graphContainerClickCount = 0;
  }

  componentDidMount() {
    this.mounted = true;

    const editor = new Editor({
      container: '.graph-content',
      clickFunc: this.clickFunc,
      doubleClickFunc: this.doubleClickFunc,
      autoSaveFunc: this.autoSaveFunc,
      cellCreatedFunc: this.cellCreatedFunc,
      deleteFunc: this.deleteFunc,
      valueChangeFunc: this.valueChangeFunc,
      IMAGE_SHAPES,
      CARD_SHAPES,
      SVG_SHAPES
    });

    this.editor = editor;

    const xml = window.localStorage.getItem('autosaveXml');

    this.editor.renderGraphFromXml(xml);
  }

  componentWillUnmount() {
    this.mounted = false;

    // 组件销毁时，移除 graph 的全局事件
    this.editor.removeEventListeners();
  }


  /**
   * 双击事件回调
   */
  doubleClickFunc = (cell) => {
    console.log('double click', cell);
  };

  cellCreatedFunc = (currentCell) => {
    const allCells = this.editor.getAllCells();

    let sameShapeNameCount = 0;
    const { shapeName } = currentCell;

    allCells
      && Object.keys(allCells).forEach((index) => {
        if (allCells[index].shapeName === shapeName) {
          sameShapeNameCount += 1;
        }
      });

    const labelName = currentCell.value;

    this.editor.renameCell(`${labelName}${sameShapeNameCount}`, currentCell);
  };

  deleteFunc = (cells) => {
    console.log('已删除 cells: ', cells);
  };

  /**
   * cell 的 value 发生变化的回调函数
   * @param {*} cell 当前cell
   * @param {*} newValue 新值
   */
  valueChangeFunc = (cell, newValue) => {
    const nodeId = cell.nodeCode;

    newValue = newValue.replace(/\r|\n/g, '');  

    const oldValue = cell.value;
    // 命名长度不能超过 18
    if (newValue && newValue.length <= 18) {
      this.renameDictName(nodeId, newValue);
    } else if (newValue && newValue.length > 18) {
      setTimeout(() => { this.editor.renameCell(oldValue, cell); }, 500);
      message.warn('节点命名长度不能超过18');
    }
  };

  autoSaveFunc = (xml) => {
    window.autosaveXml = xml;

    const oParser = new DOMParser (); // eslint-disable-line
    const oDOM = oParser.parseFromString(xml, 'application/xml');

    window.autoSaveXmlDom = oDOM;

    window.localStorage.setItem('autosaveXml', xml);
  };

  clickFunc = (cell) => {
    console.log('click', cell);
  };

  render() {
    return (
      <div className="editor-container">
        <Layout>
          <Sider width="235" theme="light">
            <Sidebar key="sidebar" graph={this.editor} />
          </Sider>
          <Content>
            <div className="graph-inner-container">
              <Toolbar
                graph={this.editor}
                updateDiagramData={this.updateDiagramData}
              />
              <div className="graph-content" key="graphcontent" />
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}

export default MyEditor;
