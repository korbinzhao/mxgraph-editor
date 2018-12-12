import React from 'react';
import { message, Layout } from 'antd';
import PropTypes from 'prop-types';

import Sidebar from '../src/sidebar';
import Toolbar from '../src/toolbar';
import Graph from '../src/graph';

import util from '../common/util';

import './editor.less';

const { Sider, Content } = Layout;

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nodeList: null,
    };

    this.graphContainerClickCount = 0;
  }

  componentWillMount() {
    const urlParams = util.parseQuery(window.location.hash);

    const templateId = urlParams.projectId;

    this.templateId = templateId;
  }

  componentDidMount() {
    this.mounted = true;

    const graph = new Graph({
      container: '.graph-content',
      clickFunc: this.clickFunc,
      doubleClickFunc: this.doubleClickFunc,
      autoSaveFunc: this.autoSaveFunc,
      cellCreatedFunc: this.cellCreatedFunc,
      deleteFunc: this.deleteFunc,
      valueChangeFunc: this.valueChangeFunc,
    });

    this.graph = graph;
  }

  componentWillUnmount() {
    this.mounted = false;

    // 组件销毁时，移除 graph 的全局事件
    this.graph.removeEventListeners();
  }


  /**
   * 双击事件回调
   */
  doubleClickFunc = () => {
    
  };

  cellCreatedFunc = (currentCell) => {
    const allCells = this.graph.getAllCells();

    let sameShapeNameCount = 0;
    const { shapeName } = currentCell;

    allCells
      && Object.keys(allCells).forEach((index) => {
        if (allCells[index].shapeName === shapeName) {
          sameShapeNameCount += 1;
        }
      });

    const labelName = currentCell.value;

    this.graph.renameCell(`${labelName}${sameShapeNameCount}`, currentCell);
  };

  deleteFunc = (cells) => {
    const cellsDeleted = [];
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
      setTimeout(() => { this.graph.renameCell(oldValue, cell); }, 500);
      message.warn('节点命名长度不能超过18');
    }
  };

  updateDiagramData = (data) => {
    console.log('updateDiagramData', data);
  }

  autoSaveFunc = (xml) => {
    this.updateDiagramData(xml);

    window.autosaveXml = xml;

    const oParser = new DOMParser (); // eslint-disable-line
    const oDOM = oParser.parseFromString(xml, 'application/xml');

    window.autoSaveXmlDom = oDOM;
  };

  clickFunc = (cell) => {
    console.log('click', cell);
  };

  render() {
    const { nodeList } = this.state;

    return (
      <div className="editor-container">
        <Layout>
          <Sider width="235" theme="light">
            <Sidebar key="sidebar" graph={this.graph} nodeList={nodeList} />
          </Sider>
          <Content>
            <div className="graph-inner-container">
              <Toolbar
                graph={this.graph}
                updateDiagramData={this.updateDiagramData}
                createVertexInDB={this.createVertexInDB}
                templateId={this.templateId}
              />
              <div className="graph-content" key="graphcontent" />
            </div>
          </Content>
        </Layout>
      </div>
    );
  }
}

Editor.propTypes = {
};

Editor.defaultProps = {
};

export default Editor;
