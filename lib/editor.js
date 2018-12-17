'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('../resources/index');

var _util = require('../common/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Graph = function () {
  function Graph(props) {
    _classCallCheck(this, Graph);

    this.init(props);
  }

  _createClass(Graph, [{
    key: 'init',
    value: function init(props) {
      var container = props.container,
          cellCreatedFunc = props.cellCreatedFunc,
          valueChangeFunc = props.valueChangeFunc;


      var containerEle = void 0;
      if (typeof container === 'string') {
        containerEle = document.querySelector(container);
      } else {
        containerEle = container;
      }

      var graph = new mxGraph(containerEle); // eslint-disable-line

      // Disables the built-in context menu
      mxEvent.disableContextMenu(containerEle); // eslint-disable-line
      mxVertexHandler.prototype.rotationEnabled = true; // eslint-disable-line

      this.containerEle = containerEle;

      this.initEditor(_extends({}, props, {
        graph: graph
      }));

      this.graph = graph;
      this.cellCreatedFunc = cellCreatedFunc;
      this.valueChangeFunc = valueChangeFunc;

      // test
      window.graph = graph;
      window.editorThis = this;
    }
  }, {
    key: 'initEditor',
    value: function initEditor(config) {
      // eslint-disable-line
      var graph = config.graph,
          clickFunc = config.clickFunc,
          doubleClickFunc = config.doubleClickFunc,
          autoSaveFunc = config.autoSaveFunc,
          hoverFunc = config.hoverFunc,
          deleteFunc = config.deleteFunc,
          valueChangeFunc = config.valueChangeFunc,
          changeFunc = config.changeFunc,
          IMAGE_SHAPES = config.IMAGE_SHAPES,
          CARD_SHAPES = config.CARD_SHAPES,
          SVG_SHAPES = config.SVG_SHAPES;


      graph.gridSize = 30;

      graph.setTooltips(true);

      // Disables the built-in context menu
      mxEvent.disableContextMenu(this.containerEle); // eslint-disable-line

      // Uncomment the following if you want the container
      // to fit the size of the graph
      // graph.setResizeContainer(true);

      _util2.default.initGraph({ graph: graph });

      _util2.default.initZoomConfig({ graph: graph });

      // 配置自定义图形
      _util2.default.configShapes({
        graph: graph,
        IMAGE_SHAPES: IMAGE_SHAPES,
        CARD_SHAPES: CARD_SHAPES,
        SVG_SHAPES: SVG_SHAPES
      });

      // // 配置undo、redo事件监听
      // util.undoListener({
      //   graph: graph,
      // });

      // // 复制监听
      // util.copyListener({
      //   graph: graph,
      // });

      // 删除监听
      _util2.default.deleteListener({
        graph: graph,
        callback: deleteFunc
      });

      // 连线处理器
      _util2.default.connectorHandler({
        graph: graph
      });

      // // 初始化 pop 菜单
      // util.initPopupMenu({
      //   graph: graph,
      // });

      // util.initVertexToolHandler({
      //   graph: graph
      // });

      _util2.default.handleDoubleClick({
        graph: graph,
        callback: doubleClickFunc
      });

      _util2.default.handleClick({
        graph: graph,
        callback: clickFunc
      });

      _util2.default.handleHover({
        graph: graph,
        callback: hoverFunc
      });

      _util2.default.handleChange({
        graph: graph,
        callback: changeFunc
      });

      // util.htmlLable ({graph});

      _util2.default.initAutoSave({
        graph: graph,
        callback: autoSaveFunc
      });

      _util2.default.vertexRenameListener({
        callback: valueChangeFunc
      });

      // util.renderGraphFromXml({
      //   graph: graph,
      // });

      // util.initAutoLayout ({
      //   graph: graph,
      // });

      // util.initCustomPort({
      //   graph: graph,
      // });

      var sidebarItems = document.querySelectorAll('.custom-sidebar-node');

      _util2.default.initSidebar({
        graph: graph,
        sidebarItems: sidebarItems,
        cellCreatedFunc: this.cellCreatedFunc
      });

      // util.parsePropsInSvg({graph});

      // Enables rubberband selection
      // new mxRubberband(graph); // eslint-disable-line
    }

    // 初始化侧边栏

  }, {
    key: 'initSidebar',
    value: function initSidebar(sidebarItems) {
      return _util2.default.initSidebar({
        graph: this.graph,
        sidebarItems: sidebarItems,
        cellCreatedFunc: this.cellCreatedFunc
      });
    }

    // 自定义锚点, 10x10px

  }, {
    key: 'initCustomPort',
    value: function initCustomPort(pic) {
      return _util2.default.initCustomPort({
        pic: pic,
        graph: this.graph
      });
    }

    /**
     * 缩放
     * type: in（放大）、out（缩小）、actual（还原）
     */

  }, {
    key: 'zoom',
    value: function zoom(type) {
      return _util2.default.zoom({
        type: type,
        graph: this.graph
      });
    }

    /**
     * 更新样式
     * @param {*} cell 节点
     * @param {*} key 新样式的 key
     * @param {*} value 新样式的 value
     */

  }, {
    key: 'updateStyle',
    value: function updateStyle(cell, key, value) {
      return _util2.default.updateStyle(this.graph, cell, key, value);
    }

    // 组合

  }, {
    key: 'groupCells',
    value: function groupCells(groupId, labelName) {
      var cellsGrouped = this.graph.getSelectionCells();

      var cell = this.graph.groupCells();
      cell.cellId = groupId;
      cell.value = labelName;
      cell.isGroupCell = true;

      cellsGrouped && cellsGrouped.forEach(function (item) {
        item.isGrouped = true;
      });

      // util.updateStyle(this.graph, cell, 'strokeColor', 'none');
      _util2.default.updateStyle(this.graph, cell, 'fillColor', 'none');
      _util2.default.updateStyle(this.graph, cell, 'dashed', 1);
      _util2.default.updateStyle(this.graph, cell, 'verticalLabelPosition', 'bottom');
      _util2.default.updateStyle(this.graph, cell, 'verticalAlign', 'top');

      return { groupCell: cell, cellsGrouped: cellsGrouped };
    }
  }, {
    key: 'handleUngroupCells',
    value: function handleUngroupCells(cells) {
      cells && cells.forEach(function (cell) {
        if (cell.isGroupCell) {
          cell.isGroupCell = false;
        }

        cell.children && cell.children.forEach(function (child) {
          child.isGrouped = false;
        });
      });

      return cells;
    }

    /**
     * 取消组合
     */

  }, {
    key: 'ungroupCells',
    value: function ungroupCells(cells) {
      var tempCells = cells || this.graph.getSelectionCells();

      var groupCells = [];

      tempCells && tempCells.forEach(function (cell) {
        if (cell.isGroupCell) {
          groupCells.push(cell);
        }

        cell.children && cell.children.forEach(function (child) {
          if (child.isGroupCell) {
            groupCells.push(child);
          }
        });

        var parent = cell.parent;


        if (parent && parent.isGroupCell) {
          groupCells.push(parent);
        }
      });

      this.handleUngroupCells(groupCells);

      return this.graph.ungroupCells(groupCells);
    }

    // 获取当前选中的所有 cell

  }, {
    key: 'getCellsSelected',
    value: function getCellsSelected() {
      return this.graph.getSelectionCells();
    }

    /**
     * 从 xml 渲染图表
     * @param {*} xml 字符串类型的 xml
     */

  }, {
    key: 'renderGraphFromXml',
    value: function renderGraphFromXml(xml) {
      return _util2.default.renderGraphFromXml({
        graph: this.graph,
        xml: xml
      });
    }

    /**
     * 获取当前 graph 的 xml
     */

  }, {
    key: 'getGraphXml',
    value: function getGraphXml() {
      var xml = _util2.default.getGraphXml({
        graph: this.graph
      });

      var xmlStr = new XMLSerializer().serializeToString(xml); // eslint-disable-line

      return xmlStr;
    }

    /**
     * 创建节点
     * @param {shapeLabel, x, y, width, height, shapeStyle} param0 shapeLabel, x, y, width, height, shapeStyle
     */

  }, {
    key: 'createVertex',
    value: function createVertex(shapeLabel, x, y, width, height, shapeStyle) {
      var graph = this.graph;


      var parent = graph.getDefaultParent();
      var cell = graph.insertVertex(parent, null, shapeLabel, x, y, width, height, shapeStyle);

      return cell;
    }

    /**
     * 插入连线
     * @param {*} v1 节点1
     * @param {*} v2 节点2
     */

  }, {
    key: 'insertEdge',
    value: function insertEdge(v1, v2) {
      var parent = this.graph.getDefaultParent();

      return this.graph.insertEdge(parent, null, '', v1, v2);
    }

    /**
     * 通过id获取cell
     * @param {*} id id
     */

  }, {
    key: 'getCellById',
    value: function getCellById(id) {
      var cells = this.graph.model.cells;


      var cell = void 0;

      cells && Object.keys(cells).forEach(function (key) {
        if (cells[key].id === id) {
          cell = cells[key];
        }
      });

      return cell;
    }

    /**
     * 获取当前画布所有 cell
     */

  }, {
    key: 'getAllCells',
    value: function getAllCells() {
      var cells = this.graph.model.cells;

      return cells;
    }
  }, {
    key: 'removeEventListeners',
    value: function removeEventListeners() {
      return _util2.default.removeEventListeners();
    }

    /**
     * 重命名一个 cell（修改 cell 的 labelName）
     * @param {*} newName 新名字
     * @param {*} cell 要修改的 cell
     */

  }, {
    key: 'renameCell',
    value: function renameCell(newName, cell) {
      return _util2.default.renameCell(newName, cell, this.graph);
    }

    /**
     * 重新渲染画布
     */

  }, {
    key: 'refresh',
    value: function refresh() {
      return this.graph.refresh();
    }

    /**
     * 清除当前选择
     */

  }, {
    key: 'clearSelection',
    value: function clearSelection() {
      return this.graph.clearSelection();
    }
  }, {
    key: 'startPanning',
    value: function startPanning() {
      return _util2.default.startPanning(this.graph);
    }
  }, {
    key: 'stopPanning',
    value: function stopPanning() {
      return _util2.default.stopPanning(this.graph);
    }
  }]);

  return Graph;
}();

exports.default = Graph;