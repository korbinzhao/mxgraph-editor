import '../resources/index';
import util from '../common/util';

export default class Graph {
  constructor(props) {
    this.init(props);
  }

  init(props) {
    const {
      container,
      cellCreatedFunc,
      valueChangeFunc,
    } = props;


    let containerEle;
    if (typeof container === 'string') {
      containerEle = document.querySelector(container);
    } else {
      containerEle = container;
    }

    const mxgraph = new mxGraph(containerEle); // eslint-disable-line

    // Disables the built-in context menu
    mxEvent.disableContextMenu(containerEle); // eslint-disable-line
    mxVertexHandler.prototype.rotationEnabled = true; // eslint-disable-line

    this.containerEle = containerEle;

    this.initEditor({
      ...props,
      mxgraph,
    });

    this.mxgraph = mxgraph;
    this.cellCreatedFunc = cellCreatedFunc;
    this.valueChangeFunc = valueChangeFunc;

    // test
    window.mxgraph = mxgraph;
    window.editorThis = this;
  }

  initEditor(config) { // eslint-disable-line
    const {
      mxgraph,
      clickFunc,
      doubleClickFunc,
      autoSaveFunc,
      hoverFunc,
      deleteFunc,
      valueChangeFunc,
      changeFunc,
    } = config;

    mxgraph.gridSize = 30;

    mxgraph.setTooltips(true);

    // Disables the built-in context menu
    mxEvent.disableContextMenu(this.containerEle); // eslint-disable-line

    // Uncomment the following if you want the container
    // to fit the size of the graph
    // mxgraph.setResizeContainer(true);

    util.initGraph({ graph: mxgraph });

    util.initZoomConfig({ graph: mxgraph });

    // 配置自定义图形
    util.configShapes({
      graph: mxgraph,
    });

    // // 配置undo、redo事件监听
    // util.undoListener({
    //   graph: mxgraph,
    // });

    // // 复制监听
    // util.copyListener({
    //   graph: mxgraph,
    // });

    // 删除监听
    util.deleteListener({
      graph: mxgraph,
      callback: deleteFunc,
    });

    // 连线处理器
    util.connectorHandler({
      graph: mxgraph,
    });

    // // 初始化 pop 菜单
    // util.initPopupMenu({
    //   graph: mxgraph,
    // });

    // util.initVertexToolHandler({
    //   graph: mxgraph
    // });

    util.handleDoubleClick({
      graph: mxgraph,
      callback: doubleClickFunc,
    });

    util.handleClick({
      graph: mxgraph,
      callback: clickFunc,
    });

    util.handleHover({
      graph: mxgraph,
      callback: hoverFunc,
    });

    util.handleChange({
      graph: mxgraph,
      callback: changeFunc,
    });

    // util.htmlLable ({mxgraph});

    util.initAutoSave({
      graph: mxgraph,
      callback: autoSaveFunc,
    });

    util.vertexRenameListener({
      callback: valueChangeFunc,
    });

    // util.renderGraphFromXml({
    //   graph: mxgraph,
    // });

    // util.initAutoLayout ({
    //   graph: mxgraph,
    // });

    // util.initCustomPort({
    //   graph: mxgraph,
    // });

    const sidebarItems = document.querySelectorAll('.custom-sidebar-node');

    util.initSidebar({
      graph: mxgraph,
      sidebarItems,
      cellCreatedFunc: this.cellCreatedFunc,
    });

    // util.parsePropsInSvg({mxgraph});

    // Enables rubberband selection
    // new mxRubberband(mxgraph); // eslint-disable-line
  }

  // 初始化侧边栏
  initSidebar(sidebarItems) {
    return util.initSidebar({
      graph: this.mxgraph,
      sidebarItems,
      cellCreatedFunc: this.cellCreatedFunc,
    });
  }

  // 自定义锚点, 10x10px
  initCustomPort(pic) {
    return util.initCustomPort({
      pic,
      graph: this.mxgraph,
    });
  }

  /**
   * 缩放
   * type: in（放大）、out（缩小）、actual（还原）
   */
  zoom(type) {
    return util.zoom({
      type,
      graph: this.mxgraph,
    });
  }


  /**
   * 更新样式
   * @param {*} cell 节点
   * @param {*} key 新样式的 key
   * @param {*} value 新样式的 value
   */
  updateStyle(cell, key, value) {
    return util.updateStyle(this.mxgraph, cell, key, value);
  }

  // 组合
  groupCells(groupId, labelName) {
    const cellsGrouped = this.mxgraph.getSelectionCells();

    const cell = this.mxgraph.groupCells();
    cell.cellId = groupId;
    cell.value = labelName;
    cell.isGroupCell = true;

    cellsGrouped && cellsGrouped.forEach((item) => {
      item.isGrouped = true;
    });

    // util.updateStyle(this.mxgraph, cell, 'strokeColor', 'none');
    util.updateStyle(this.mxgraph, cell, 'fillColor', 'none');
    util.updateStyle(this.mxgraph, cell, 'dashed', 1);
    util.updateStyle(this.mxgraph, cell, 'verticalLabelPosition', 'bottom');
    util.updateStyle(this.mxgraph, cell, 'verticalAlign', 'top');

    return { groupCell: cell, cellsGrouped };
  }

  handleUngroupCells(cells) {
    cells && cells.forEach((cell) => {
      if (cell.isGroupCell) {
        cell.isGroupCell = false;
      }

      cell.children && cell.children.forEach((child) => {
        child.isGrouped = false;
      });
    });

    return cells;
  }

  /**
   * 取消组合
   */
  ungroupCells(cells) {
    const tempCells = cells || this.mxgraph.getSelectionCells();

    const groupCells = [];

    tempCells && tempCells.forEach((cell) => {
      if (cell.isGroupCell) {
        groupCells.push(cell);
      }

      cell.children && cell.children.forEach((child) => {
        if (child.isGroupCell) {
          groupCells.push(child);
        }
      });

      const { parent } = cell;

      if (parent && parent.isGroupCell) {
        groupCells.push(parent);
      }
    });

    this.handleUngroupCells(groupCells);

    return this.mxgraph.ungroupCells(groupCells);
  }

  // 获取当前选中的所有 cell
  getCellsSelected() {
    return this.mxgraph.getSelectionCells();
  }

  /**
   * 从 xml 渲染图表
   * @param {*} xml 字符串类型的 xml
   */
  renderGraphFromXml(xml) {
    return util.renderGraphFromXml({
      graph: this.mxgraph,
      xml,
    });
  }

  /**
   * 获取当前 graph 的 xml
   */
  getGraphXml() {
    const xml = util.getGraphXml({
      graph: this.mxgraph,
    });

    const xmlStr = new XMLSerializer().serializeToString(xml); // eslint-disable-line

    return xmlStr;
  }

  /**
   * 创建节点
   * @param {shapeLabel, x, y, width, height, shapeStyle} param0 shapeLabel, x, y, width, height, shapeStyle
   */
  createVertex(shapeLabel, x, y, width, height, shapeStyle) {
    const { graph } = this;

    const parent = graph.getDefaultParent();
    const cell = graph.insertVertex(parent, null, shapeLabel, x, y, width, height, shapeStyle);

    return cell;
  }

  /**
   * 插入连线
   * @param {*} v1 节点1
   * @param {*} v2 节点2
   */
  insertEdge(v1, v2) {
    const parent = this.mxgraph.getDefaultParent();

    return this.mxgraph.insertEdge(parent, null, '', v1, v2);
  }

  /**
   * 通过id获取cell
   * @param {*} id id
   */
  getCellById(id) {
    const { cells } = this.mxgraph.model;

    let cell;

    cells && Object.keys(cells).forEach((key) => {
      if (cells[key].id === id) {
        cell = cells[key];
      }
    });

    return cell;
  }

  /**
   * 获取当前画布所有 cell
   */
  getAllCells() {
    const { cells } = this.mxgraph.model;
    return cells;
  }


  removeEventListeners() {
    return util.removeEventListeners();
  }

  /**
   * 重命名一个 cell（修改 cell 的 labelName）
   * @param {*} newName 新名字
   * @param {*} cell 要修改的 cell
   */
  renameCell(newName, cell) {
    return util.renameCell(newName, cell, this.mxgraph);
  }

  /**
   * 重新渲染画布
   */
  refresh() {
    return this.mxgraph.refresh();
  }

  /**
   * 清除当前选择
   */
  clearSelection() {
    return this.mxgraph.clearSelection();
  }

  startPanning() {
    return util.startPanning(this.mxgraph);
  }

  stopPanning() {
    return util.stopPanning(this.mxgraph);
  }
}
