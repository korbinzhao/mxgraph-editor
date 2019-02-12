import DEFAULT_CARD_SHAPES from '../config/card-shape';
import DEFAULT_IMAGE_SHAPES from '../config/image-shape';

import STENCILS from '../config/stencils/index';
import GENERAL_SHAPES from '../config/general-shape';
import './basic-shapes-generator';

export default {
  /**
   * init graph
   * @param {graph} config 
   */
  initGraph(config) {
    const { graph } = config;

    // // Enables HTML labels
    // graph.setHtmlLabels(true);

    // Enables panning with left mouse button
    // graph.panningHandler.useLeftButtonForPanning = true;
    // graph.panningHandler.ignoreCell = true;
    // graph.container.style.cursor = 'move';
    graph.setPanning(true);

    // // Uncomment the following if you want the container
    // // to fit the size of the graph
    // graph.setResizeContainer(true);

    graph.collapsedImage = '';
    graph.expandedImage = '';

    graph.gridSize = 10;

    // Enables rubberband selection
    new mxRubberband (graph); //eslint-disable-line
  },

  configShapes(config) {
    const {
      graph, IMAGE_SHAPES, CARD_SHAPES, SVG_SHAPES 
    } = config;

    const { stylesheet } = graph;
    const vertexStyle = stylesheet.getDefaultVertexStyle();
    vertexStyle[mxConstants.STYLE_STROKECOLOR] = '#B9BECC'; //eslint-disable-line
    vertexStyle[mxConstants.STYLE_FILLCOLOR] = '#ffffff'; //eslint-disable-line
    vertexStyle[mxConstants.STYLE_FONTCOLOR] = '#333'; //eslint-disable-line
    const edgeStyle = stylesheet.getDefaultEdgeStyle();
    edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#B9BECC'; //eslint-disable-line
    edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 1; //eslint-disable-line
    edgeStyle[mxConstants.STYLE_FONTCOLOR] = '#333'; //eslint-disable-line

    const cardShapes = CARD_SHAPES || DEFAULT_CARD_SHAPES;
    const imageShapes = IMAGE_SHAPES || DEFAULT_IMAGE_SHAPES;
    const svgShapes = { custom: SVG_SHAPES, ...STENCILS };

    this.imageShapes = imageShapes;

    graph.setDropEnabled(true);

    const imageStyle = {};
    imageStyle[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE; //eslint-disable-line
    imageStyle[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter; //eslint-disable-line
    // style[mxConstants.STYLE_IMAGE] = cardShapes[name];
    imageStyle[mxConstants.STYLE_FONTCOLOR] = '#333'; //eslint-disable-line
    graph.getStylesheet().putCellStyle('image', imageStyle);

    cardShapes
      && cardShapes.forEach((shape) => {
        const style = mxUtils.clone (imageStyle); //eslint-disable-line
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL; //eslint-disable-line
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER; //eslint-disable-line
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP; //eslint-disable-line
        style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER; //eslint-disable-line
        style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP; //eslint-disable-line
        style[mxConstants.STYLE_IMAGE] = shape.logo; //eslint-disable-line
        style[mxConstants.STYLE_IMAGE_WIDTH] = '30'; //eslint-disable-line
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '30'; //eslint-disable-line
        style[mxConstants.STYLE_SPACING_TOP] = '46'; //eslint-disable-line
        style[mxConstants.STYLE_SPACING] = '8'; //eslint-disable-line
        style[mxConstants.STYLE_ROUNDED] = 1; //eslint-disable-line
        style[mxConstants.STYLE_ARCSIZE] = 10; //eslint-disable-line
        style[mxConstants.STYLE_STROKECOLOR] = '#ffffff'; //eslint-disable-line
        style[mxConstants.STYLE_FILLCOLOR] = '#ffffff'; //eslint-disable-line
        graph.getStylesheet().putCellStyle(shape.key, style);
      });

    svgShapes
      && Object.keys(svgShapes).forEach((name) => {
        const parser = new DOMParser (); //eslint-disable-line
        const xmlDoc = parser.parseFromString(svgShapes[name], 'text/xml'); // important to use "text/xml"
        const root = xmlDoc.firstChild;
        let shape = root.firstChild;

        while (shape != null) {
          if (shape.nodeType === mxConstants.NODETYPE_ELEMENT) {  //eslint-disable-line
            //eslint-disable-line
            mxStencilRegistry.addStencil(  //eslint-disable-line
              shape.getAttribute('name'),
              new mxStencil(shape)  //eslint-disable-line
            ); //eslint-disable-line
          }

          shape = shape.nextSibling;
        }
      });
  },

  initSidebar(config) {
    const { graph, sidebarItems, cellCreatedFunc } = config;

    sidebarItems
      && sidebarItems.forEach((item) => {
        const width = item.getAttribute('data-shape-width');
        const height = item.getAttribute('data-shape-height');
        const shapeType = item.getAttribute('data-shape-type');
        const shapeName = item.getAttribute('data-shape-name');
        const shapeLabel = item.getAttribute('data-shape-label');
        const shapeContent = item.getAttribute('data-shape-content');
        let isEdge = false;

        let shapeStyle = shapeName;

        if (shapeType === 'svg') {
          shapeStyle = `shape=${shapeName}`;
        } else if (shapeType === 'general') {
          if (GENERAL_SHAPES[shapeName].type === 'edge') {
            isEdge = true;
          }
          shapeStyle = GENERAL_SHAPES[shapeName].style;
        } else if (shapeType === 'image') {
          const shape = this.findItemFromArray(this.imageShapes, {
            key: shapeName,
          });

          const img = shape.logo;

          shapeStyle = `shape=image;html=1;verticalLabelPosition=bottom;fontColor:#fff;verticalAlign=top;imageAspect=0;image=${img}`;
        } else if (shapeType === 'card') {
          shapeStyle = `${shapeName}`;
        }

        this.createDragableItem({
          id: `cell${Date.now()}`,
          node: item,
          width,
          height,
          shapeName,
          shapeLabel,
          shapeContent,
          graph,
          isEdge,
          shapeStyle,
          cellCreatedFunc,
        });
      });
  },

  createDragableItem(config) {
    const {
      graph,
      node,
      shapeName,
      shapeStyle,
      shapeLabel,
      // shapeContent,
      id,
      isEdge,
      cellCreatedFunc,
    } = config;

    let { width, height } = config;

    width = width * 1 || 130;
    height = height * 1 || 90;

    // Returns the graph under the mouse
    const graphF = (evt) => {
      const x = mxEvent.getClientX (evt); //eslint-disable-line
      const y = mxEvent.getClientY (evt); //eslint-disable-line
      const elt = document.elementFromPoint(x, y);

      if (mxUtils.isAncestorNode(graph.container, elt)) {  //eslint-disable-line
        //eslint-disable-line
        return graph;
      }

      return null;
    };

    // Inserts a cell at the given location
    const funct = (graph2, evt, target, x, y) => {
      try {
        // is a edge
        if (isEdge) {
          const cell = new mxCell(  //eslint-disable-line
            '',
            new mxGeometry(0, 0, width, height),  //eslint-disable-line
            shapeStyle
          ); //eslint-disable-line
          cell.geometry.setTerminalPoint (new mxPoint (0, height), true); //eslint-disable-line
          cell.geometry.setTerminalPoint (new mxPoint (width, 0), false); //eslint-disable-line
          // cell.geometry.points = [new mxPoint(width/2, height/2), new mxPoint(0, 0)];
          cell.geometry.relative = true;
          cell.edge = true;
          cell.shapeName = shapeName;
          cell.id = id;

          const cells = graph.importCells([cell], x, y, target);

          if (cells != null && cells.length > 0) {
            graph.scrollCellToVisible(cells[0]);
            graph.setSelectionCells(cells);
          }

          cellCreatedFunc && cellCreatedFunc(cell);
        } else {
          const parent = graph.getDefaultParent();

          if (parent) {
            const cell = graph.insertVertex(
              parent,
              id,
              shapeLabel,
              x,
              y,
              width,
              height,
              shapeStyle
            );
            cell.shapeName = shapeName;

            cellCreatedFunc && cellCreatedFunc(cell);
          } else {
            console.log('graph.getDefaultParent() 为 null');
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    // Disables built-in DnD in IE (this is needed for cross-frame DnD, see below)
    if (mxClient.IS_IE) {  //eslint-disable-line
      //eslint-disable-line
      mxEvent.addListener(node, 'dragstart', (evt) => {  //eslint-disable-line
        //eslint-disable-line
        evt.returnValue = false;
      });
    }

    // Creates the element that is being for the actual preview.
    const dragElt = document.createElement('div');
    dragElt.style.border = 'dashed black 1px';
    dragElt.style.width = `${width}px`;
    dragElt.style.height = `${height}px`;

    // Drag source is configured to use dragElt for preview and as drag icon
    // if scalePreview (last) argument is true. Dx and dy are null to force
    // the use of the defaults. Note that dx and dy are only used for the
    // drag icon but not for the preview.
    const ds = mxUtils.makeDraggable(  //eslint-disable-line
      //eslint-disable-line
      node,
      graphF,
      funct,
      dragElt,
      null,
      null,
      graph.autoscroll,
      true
    );

    // Redirects feature to global switch. Note that this feature should only be used
    // if the the x and y arguments are used in funct to insert the cell.
    ds.isGuidesEnabled = () => graph.graphHandler.guidesEnabled;

    // Restores original drag icon while outside of graph
    ds.createDragElement = mxDragSource.prototype.createDragElement; //eslint-disable-line
  },

  undoListener(config) {
    const { graph, callback } = config;

    // Undo/redo
    const undoManager = new mxUndoManager (); //eslint-disable-line

    graph.undoManager = undoManager;

    const listener = (sender, evt) => {
      undoManager.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getModel ().addListener (mxEvent.UNDO, listener); //eslint-disable-line
    graph.getView ().addListener (mxEvent.UNDO, listener); //eslint-disable-line

    this.undoListenerFunc2 = this.undoListenerFunc.bind(this, undoManager, callback);

    document.body.addEventListener('keydown', this.undoListenerFunc2);
  },

  undoListenerFunc(undoManager, callback, e) {
    if (e.target !== e.currentTarget) {
      return false;
    }

    const evtobj = window.event ? window.event : e;

    if (evtobj.keyCode === 90 && (evtobj.ctrlKey || evtobj.metaKey)) {
      undoManager.undo();

      const { history: histories } = undoManager;

      callback && callback(histories);
      
      // undoManager.redo();
    }
  },

  copyListener(config) {
    const { graph, callback } = config;

    this.copyListenerFunc2 = this.copyListenerFunc.bind(this, graph, callback);
    document.body.addEventListener('keydown', this.copyListenerFunc2);
  },

  copyListenerFunc(graph, callback, e) {
    if (e.target !== e.currentTarget) {
      return false;
    }

    const evtobj = window.event ? window.event : e;
    // command + c / ctrl + c
    if (evtobj.keyCode === 67 && (evtobj.ctrlKey || evtobj.metaKey)) {
      mxClipboard.copy (graph); //eslint-disable-line
    } else if (evtobj.keyCode === 86 && (evtobj.ctrlKey || evtobj.metaKey)) { // command + v / ctrl + v
      // cells 复制元素的集合   
      const cells = mxClipboard.paste(graph); // eslint-disable-line

      callback && callback(cells);
    }
  },

  deleteListener(config) {
    const { graph, callback } = config;

    const { removeCells } = graph;
    graph.removeCells = function (cells) {
      const result = removeCells.apply(this, [cells]);
      callback && callback(cells);
      return result;
    };

    this.deleteListenerFunc2 = this.deleteListenerFunc.bind(this, graph);

    document.body.addEventListener('keydown', this.deleteListenerFunc2);
  },

  deleteListenerFunc(graph, e) {
    if (
      !(e.target === e.currentTarget || graph.container.contains(e.target))
    ) {
      return false;
    }

    const { editingCell } = graph.cellEditor;

    const evtobj = window.event ? window.event : e;
    if (evtobj.keyCode === 46 || evtobj.keyCode === 8) {
      // 没有cell当前在编辑状态时才可删除
      if (!editingCell) {
        const cellsSelected = graph.getSelectionCells();
        // cellsSelected && cellsSelected.length && graph.removeCells(cellsSelected);

        const cellsSelectable = [];
        cellsSelected
          && cellsSelected.forEach((cell) => {
            if (!cell.disabled) {
              cellsSelectable.push(cell);
            }
          });

        cellsSelectable
          && cellsSelectable.length
          && graph.removeCells(cellsSelectable);
      }
    }
  },

  connectorHandler(config) {
    const { graph } = config;

    graph.setConnectable(true);
    mxGraphHandler.prototype.guidesEnabled = true; //eslint-disable-line

    // Disables automatic handling of ports. This disables the reset of the
    // respective style in mxGraph.cellConnected. Note that this feature may
    // be useful if floating and fixed connections are combined.
    graph.setPortsEnabled(false);

    // Disables floating connections (only connections via ports allowed)
    graph.connectionHandler.isConnectableCell = function (cell) {  //eslint-disable-line
      //eslint-disable-line
      return false;
    };

    // edge animation
    // const selectCells = mxConnectionHandler.prototype.selectCells;

    // graph.connectionHandler.selectCells = function (edge, target) {
    //   var state = this.graph.view.getState(edge);

    //   state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
    //   state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '6');
    //   state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'lightGray');
    //   state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');

    //   return selectCells.apply(this, arguments);
    // }

    mxEdgeHandler.prototype.isConnectableCell = function (cell) {  //eslint-disable-line
      //eslint-disable-line
      return graph.connectionHandler.isConnectableCell(cell);
    };

    // Overridden to define per-shape connection points
    mxGraph.prototype.getAllConnectionConstraints = function (  //eslint-disable-line
      terminal,
      source  //eslint-disable-line
    ) {
      //eslint-disable-line
      // if (terminal && terminal.shape && terminal.shape.constraints) {
      //   return terminal.shape.constraints;
      // }

      // return null;

      const { cell } = terminal;
      const { pointType } = cell;

      if (cell.disabled) {
        return [];
      }

      let points = [];

      switch (pointType) {
        case 'top':
          points = [
            new mxConnectionConstraint (new mxPoint (0.5, 0), true), //eslint-disable-line
          ];
          break;
        case 'left':
          points = [
            new mxConnectionConstraint (new mxPoint (0, 0.5), true), //eslint-disable-line
          ];
          break;
        case 'right':
          points = [
            new mxConnectionConstraint (new mxPoint (1, 0.5), true), //eslint-disable-line
          ];
          break;
        case 'bottom':
          points = [
            new mxConnectionConstraint (new mxPoint (0.5, 1), true), //eslint-disable-line
          ];
          break;
        case 'none':
          points = [];
          break;
        default:
          points = [
            new mxConnectionConstraint (new mxPoint (0.25, 0), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0.5, 0), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0.75, 0), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0, 0.25), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0, 0.5), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0, 0.75), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (1, 0.25), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (1, 0.5), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (1, 0.75), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0.25, 1), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0.5, 1), true), //eslint-disable-line
            new mxConnectionConstraint (new mxPoint (0.75, 1), true), //eslint-disable-line
          ];
          break;
      }

      return points;
    };

    // Defines the default constraints for all shapes
    mxShape.prototype.constraints = [  //eslint-disable-line
      //eslint-disable-line
      // new mxConnectionConstraint(new mxPoint(0.25, 0), true),
      new mxConnectionConstraint (new mxPoint (0.5, 0), true), //eslint-disable-line
      // new mxConnectionConstraint(new mxPoint(0.75, 0), true),
      // new mxConnectionConstraint(new mxPoint(0, 0.25), true),
      new mxConnectionConstraint (new mxPoint (0, 0.5), true), //eslint-disable-line
      // new mxConnectionConstraint(new mxPoint(0, 0.75), true),
      // new mxConnectionConstraint(new mxPoint(1, 0.25), true),
      new mxConnectionConstraint (new mxPoint (1, 0.5), true), //eslint-disable-line
      // new mxConnectionConstraint(new mxPoint(1, 0.75), true),
      // new mxConnectionConstraint(new mxPoint(0.25, 1), true),
      new mxConnectionConstraint (new mxPoint (0.5, 1), true), //eslint-disable-line
      // new mxConnectionConstraint(new mxPoint(0.75, 1), true)
    ];

    // Edges have no connection points
    mxPolyline.prototype.constraints = null; //eslint-disable-line

    // Enables connect preview for the default edge style
    graph.connectionHandler.createEdgeState = () => {
      const edge = graph.createEdge(null, null, null, null, null);

      return new mxCellState (graph.view, edge, graph.getCellStyle (edge)); //eslint-disable-line
    };

    // Changes the default style for edges "in-place" and assigns
    // an alternate edge style which is applied in mxGraph.flip
    // when the user double clicks on the adjustment control point
    // of the edge. The ElbowConnector edge style switches to TopToBottom
    // if the horizontal style is true.
    const style = graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_ROUNDED] = true; //eslint-disable-line
    // style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector; // 备选：orthogonalEdgeStyle
    style[mxConstants.STYLE_EDGE] = 'orthogonalEdgeStyle'; //eslint-disable-line
    // style[mxConstants.STYLE_STROKEWIDTH] = 1;

    // graph.alternateEdgeStyle = 'elbow=vertical';

    // Snaps to fixed points
    mxConstraintHandler.prototype.intersects = function (  //eslint-disable-line
      icon,
      point,
      source,
      existingEdge
    ) {
      //eslint-disable-line
      return !source || existingEdge || mxUtils.intersects (icon.bounds, point); //eslint-disable-line
    };
  },

  //  初始化 popmenu
  initPopupMenu(config) {
    const { graph } = config;

    // Installs a popupmenu handler using local function (see below).
    graph.popupMenuHandler.factoryMethod = (menu, cell, evt) =>
      createPopupMenu (graph, menu, cell, evt); //eslint-disable-line

    // Function to create the entries in the popupmenu
    function createPopupMenu(graph, menu, cell, evt) {  //eslint-disable-line
      //eslint-disable-line
      if (cell != null) {
        menu.addItem(
          'Cell Item',
          'https://img.alicdn.com/tfs/TB1xSANXXzqK1RjSZFvXXcB7VXa-22-22.png',
          () => {
            mxUtils.alert ('MenuItem1'); //eslint-disable-line
          }
        );
      } else {
        menu.addItem(
          'No-Cell Item',
          'https://img.alicdn.com/tfs/TB1CFkNXmzqK1RjSZPxXXc4tVXa-22-22.png',
          () => {
            mxUtils.alert ('MenuItem2'); //eslint-disable-line
          }
        );
      }
      menu.addSeparator();
      menu.addItem(
        'MenuItem3',
        'https://img.alicdn.com/tfs/TB1CFkNXmzqK1RjSZPxXXc4tVXa-22-22.png',
        () => {
          mxUtils.alert (`MenuItem3: ${graph.getSelectionCount ()} selected`); //eslint-disable-line
        }
      );
    }
  },

  // init VertexToolHandler
  initVertexToolHandler(config) {
    const { graph } = config;

    // Defines a subclass for mxVertexHandler that adds a set of clickable
    // icons to every selected vertex.
    function mxVertexToolHandler(state) {  //eslint-disable-line
      //eslint-disable-line
      mxVertexHandler.apply (this, arguments); //eslint-disable-line
    }

    mxVertexToolHandler.prototype = new mxVertexHandler (); //eslint-disable-line
    mxVertexToolHandler.prototype.constructor = mxVertexToolHandler;

    mxVertexToolHandler.prototype.domNode = null;

    mxVertexToolHandler.prototype.init = () => {
      mxVertexHandler.prototype.init.apply (this, arguments); //eslint-disable-line

      // In this example we force the use of DIVs for images in IE. This
      // handles transparency in PNG images properly in IE and fixes the
      // problem that IE routes all mouse events for a gesture via the
      // initial IMG node, which means the target vertices
      this.domNode = document.createElement('div');
      this.domNode.style.position = 'absolute';
      this.domNode.style.whiteSpace = 'nowrap';

      // Workaround for event redirection via image tag in quirks and IE8
      function createImage(src) {
        if (mxClient.IS_IE && !mxClient.IS_SVG) {  //eslint-disable-line
          //eslint-disable-line
          const img = document.createElement('div');
          img.style.backgroundImage = `url(${src})`;
          img.style.backgroundPosition = 'center';
          img.style.backgroundRepeat = 'no-repeat';
          img.style.display = mxClient.IS_QUIRKS ? 'inline' : 'inline-block'; //eslint-disable-line

          return img;
        }
        return mxUtils.createImage (src); //eslint-disable-line
      }

      // Delete
      let img = createImage(
        'https://img.alicdn.com/tfs/TB1Z.ETXbvpK1RjSZPiXXbmwXXa-22-22.png'
      ); //eslint-disable-line
      img.setAttribute('title', 'Delete');
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(  //eslint-disable-line
        img, //eslint-disable-line
        mxUtils.bind(this, (evt) => {  //eslint-disable-line
          //eslint-disable-line
          // Disables dragging the image
          mxEvent.consume (evt); //eslint-disable-line
        })
      );
      mxEvent.addListener(  //eslint-disable-line
        img,
        'click', //eslint-disable-line
        mxUtils.bind(this, function (evt) {  //eslint-disable-line
          //eslint-disable-line
          this.graph.removeCells([this.state.cell]);
          mxEvent.consume (evt); //eslint-disable-line
        })
      );
      this.domNode.appendChild(img);

      // // Size
      // var img = createImage('https://img.alicdn.com/tfs/TB1aucUXhTpK1RjSZR0XXbEwXXa-22-22.png');
      // img.setAttribute('title', 'Resize');
      // img.style.cursor = 'se-resize';
      // img.style.width = '16px';
      // img.style.height = '16px';
      // mxEvent.addGestureListeners(img,
      //   mxUtils.bind(this, function (evt) {
      //     this.start(mxEvent.getClientX(evt), mxEvent.getClientY(evt), 7);
      //     this.graph.isMouseDown = true;
      //     this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
      //     mxEvent.consume(evt);
      //   })
      // );
      // this.domNode.appendChild(img);

      // Move
      img = createImage(
        'https://img.alicdn.com/tfs/TB1inERXmrqK1RjSZK9XXXyypXa-22-22.png'
      ); //eslint-disable-line
      img.setAttribute('title', 'Move');
      img.style.cursor = 'move';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(  //eslint-disable-line
        img, //eslint-disable-line
        mxUtils.bind(this, function (evt) {  //eslint-disable-line
          //eslint-disable-line
          this.graph.graphHandler.start(
            this.state.cell,
            mxEvent.getClientX(evt),  //eslint-disable-line
            mxEvent.getClientY(evt)  //eslint-disable-line
          ); //eslint-disable-line
          this.graph.graphHandler.cellWasClicked = true;
          this.graph.isMouseDown = true;
          this.graph.isMouseTrigger = mxEvent.isMouseEvent (evt); //eslint-disable-line
          mxEvent.consume (evt); //eslint-disable-line
        })
      );
      this.domNode.appendChild(img);

      // Connect
      img = createImage(
        'https://img.alicdn.com/tfs/TB1xDQSXgHqK1RjSZFkXXX.WFXa-22-22.png'
      ); //eslint-disable-line
      img.setAttribute('title', 'Connect');
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      mxEvent.addGestureListeners(  //eslint-disable-line
        img, //eslint-disable-line
        mxUtils.bind(this, function (evt) {  //eslint-disable-line
          //eslint-disable-line
          const pt = mxUtils.convertPoint(  //eslint-disable-line
            this.graph.container, //eslint-disable-line
            mxEvent.getClientX(evt),  //eslint-disable-line
            mxEvent.getClientY(evt)  //eslint-disable-line
          ); //eslint-disable-line
          this.graph.connectionHandler.start(this.state, pt.x, pt.y);
          this.graph.isMouseDown = true;
          this.graph.isMouseTrigger = mxEvent.isMouseEvent (evt); //eslint-disable-line
          mxEvent.consume (evt); //eslint-disable-line
        })
      );
      this.domNode.appendChild(img);

      this.graph.container.appendChild(this.domNode);
      this.redrawTools();
    };

    mxVertexToolHandler.prototype.redraw = () => {
      mxVertexHandler.prototype.redraw.apply (this); //eslint-disable-line
      this.redrawTools();
    };

    mxVertexToolHandler.prototype.redrawTools = () => {
      if (this.state != null && this.domNode != null) {
        const dy = mxClient.IS_VML && document.compatMode === 'CSS1Compat'  //eslint-disable-line
          ? 20
          : 4; //eslint-disable-line
        this.domNode.style.left = `${this.state.x + this.state.width - 56}px`;
        this.domNode.style.top = `${this.state.y - dy - 26}px`;
      }
    };

    mxVertexToolHandler.prototype.destroy = function (sender, me) {  //eslint-disable-line
      //eslint-disable-line
      mxVertexHandler.prototype.destroy.apply (this, arguments); //eslint-disable-line

      if (this.domNode != null) {
        this.domNode.parentNode.removeChild(this.domNode);
        this.domNode = null;
      }
    };

    graph.connectionHandler.createTarget = true;

    graph.createHandler = (state) => {
      if (state != null && this.model.isVertex(state.cell)) {
        return new mxVertexToolHandler (state); //eslint-disable-line
      }

      return mxGraph.prototype.createHandler.apply (this, arguments); //eslint-disable-line
    };
  },

  handleDoubleClick(config) {
    const { graph, callback } = config;

    // Installs a handler for double click events in the graph
    // that shows an alert box
    graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {  //eslint-disable-line
      //eslint-disable-line
      const cell = evt.getProperty('cell');

      callback && callback(cell);

      // evt.consume();
    });
  },

  handleClick(config) {
    const { graph, callback } = config;

    graph.addListener(mxEvent.CLICK, (sender, evt) => {  //eslint-disable-line
      //eslint-disable-line
      const cell = evt.getProperty('cell');

      callback && callback(cell, evt);

      // // 如果没有点中 cell，清空 cell 选择
      // if (!cell) {
      //   sender.selectionModel.clear();
      // }

      // evt.consume();
    });

    // graph.addListener(mxEvent.MOVE_CELLS, (sender, evt) => {
    //   const cell = evt.getProperty('cell');

    //   console.log('move', evt, sender);

    //   // callback && callback(cell);

    //   // // 如果没有点中 cell，清空 cell 选择
    //   // if (!cell) {
    //   //   sender.selectionModel.clear();
    //   // }

    //   // evt.consume();
    // });
  },

  handleChange(config) {
    const { graph, callback } = config;

    graph.getSelectionModel().addListener(mxEvent.CHANGE, (sender, evt) => {  //eslint-disable-line
      //eslint-disable-line
      // console.log('change', sender, evt);

      callback && callback();
    });
  },

  handleHover(config) {
    const { graph, callback } = config;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage(  //eslint-disable-line
      'images/connector.gif',
      16,
      16
    ); //eslint-disable-line

    // Defines a new class for all icons
    function mxIconSet(state) {
      this.images = [];
      const {
        graph, //eslint-disable-line
      } = state.view;

      // // pen
      // var img = mxUtils.createImage('https://img.alicdn.com/tfs/TB1lOfwbPTpK1RjSZKPXXa3UpXa-22-22.png');
      // img.setAttribute('title', 'Duplicate');
      // img.style.position = 'absolute';
      // img.style.cursor = 'pointer';
      // img.style.width = '16px';
      // img.style.height = '16px';
      // img.style.left = (state.x + state.width) + 'px';
      // img.style.top = (state.y + 10) + 'px';

      // mxEvent.addGestureListeners(img,
      //   mxUtils.bind(this, function (evt) {
      //     var s = graph.gridSize;
      //     // graph.setSelectionCells(graph.moveCells([state.cell], s, s, true));

      //     // graph.model.setValue(state.cell, 'newlabel222');

      //     // 开启 label 可编辑状态
      //     graph.startEditingAtCell(state.cell);

      //     // 自动聚焦到 label 编辑文本
      //     state.shape.node.focus();

      //     mxEvent.consume(evt);
      //     this.destroy();
      //   })
      // );

      // state.view.graph.container.appendChild(img);
      // this.images.push(img);

      // Delete
      const img = mxUtils.createImage(  //eslint-disable-line
        'https://img.alicdn.com/tfs/TB1nt90dgHqK1RjSZFkXXX.WFXa-32-32.png'
      ); //eslint-disable-line
      img.setAttribute('title', 'Delete');
      img.style.position = 'absolute';
      img.style.cursor = 'pointer';
      img.style.width = '16px';
      img.style.height = '16px';
      img.style.left = `${state.x + state.width}px`;
      img.style.top = `${state.y - 16}px`;

      mxEvent.addGestureListeners(  //eslint-disable-line
        img, //eslint-disable-line
        mxUtils.bind(this, (evt) => {  //eslint-disable-line
          //eslint-disable-line
          // Disables dragging the image
          mxEvent.consume (evt); //eslint-disable-line
        })
      );

      mxEvent.addListener(  //eslint-disable-line
        img,
        'click', //eslint-disable-line
        mxUtils.bind(this, function (evt) {  //eslint-disable-line
          //eslint-disable-line
          graph.removeCells([state.cell]);
          mxEvent.consume (evt); //eslint-disable-line
          this.destroy();
        })
      );

      state.view.graph.container.appendChild(img);
      this.images.push(img);
    }

    mxIconSet.prototype.destroy = function () {
      if (this.images != null) {
        for (let i = 0; i < this.images.length; i += 1) {
          const img = this.images[i];
          img.parentNode.removeChild(img);
        }
      }

      this.images = null;
    };

    // Defines the tolerance before removing the icons
    const iconTolerance = 20;

    // Shows icons if the mouse is over a cell
    graph.addMouseListener({
      currentState: null,
      currentIconSet: null,
      mouseDown(sender, me) {
        // Hides icons on mouse down
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove(sender, me) {
        let tmp;

        if (
          this.currentState != null
          && (me.getState() === this.currentState || me.getState() == null)
        ) {
          const tol = iconTolerance;
          tmp = new mxRectangle(  //eslint-disable-line
            me.getGraphX () - tol, //eslint-disable-line
            me.getGraphY() - tol,
            2 * tol,
            2 * tol
          );

          if (mxUtils.intersects(tmp, this.currentState)) {  //eslint-disable-line
            //eslint-disable-line
            return;
          }
        }

        tmp = graph.view.getState(me.getCell());

        // Ignores everything but vertices
        if (
          graph.isMouseDown
          || (tmp != null && !graph.getModel().isVertex(tmp.cell))
        ) {
          tmp = null;
        }

        if (tmp !== this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }

          this.currentState = tmp;

          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState);
          }
        }
      },
      mouseUp (sender, me) {}, //eslint-disable-line
      dragEnter(evt, state) {
        const { cell } = state;
        const { disabled } = cell;

        if (this.currentIconSet === null && !disabled) {
          this.currentIconSet = new mxIconSet (state); //eslint-disable-line
        }

        callback && callback(evt, state);
      },
      dragLeave(evt, state) {  //eslint-disable-line
        //eslint-disable-line
        if (this.currentIconSet != null) {
          this.currentIconSet.destroy();
          this.currentIconSet = null;
        }
      },
    });
  },

  htmlLable(config) {
    const { graph } = config;

    // Enables HTML labels
    graph.setHtmlLabels(true);

    // Creates a user object that stores the state
    const doc = mxUtils.createXmlDocument (); //eslint-disable-line
    const obj = doc.createElement('UserObject');
    obj.setAttribute('label', 'Hello, World!');
    obj.setAttribute('checked', 'false');
  },

  initAutoSave(config) {
    const { graph, callback } = config;

    const mgr = new mxAutoSaveManager (graph); //eslint-disable-line
    mgr.autoSaveDelay = 0; // 自动保存延迟时间设为0
    mgr.save = () => {
      const xml = this.getGraphXml({
        graph,
      });

      const formatedNode = this.formatXmlNode(xml);

      if (!formatedNode) {
        return false;
      }

      const xmlStr = new XMLSerializer ().serializeToString (formatedNode); //eslint-disable-line

      graph.xmlStr = xmlStr;

      callback && callback(xmlStr);
    };
  },

  // check the xmlnode format to avoid error
  formatXmlNode(xmlNode) {
    const rootEle = xmlNode && xmlNode.firstElementChild;
    
    let hasRoot = false;
    if (rootEle && rootEle.tagName === 'root') {
      hasRoot = true;
    }

    let hasIdO = false;
    if (rootEle && rootEle.firstElementChild && rootEle.firstElementChild.id === '0') {
      hasIdO = true;
    }

    if (!(hasRoot && hasIdO)) {
      console.warn('xmlNode must have root node');
      return false;
    }

    const elements = rootEle.children;

    const idsArr = [];

    elements && Array.from(elements).forEach((element) => {
      const cellId = element && element.getAttribute('id');

      if (idsArr.indexOf(cellId) === -1) {
        idsArr.push(cellId);
      } else {
        console.warn('cell id is duplicated, delete the needless one', element);
        rootEle.removeChild(element);
      }

      if (element && element.getAttribute('vertex') === '1' && element.getAttribute('edge') === '1') {
        console.warn('cell\'s property vertex and edge cannot both be 1, set property edge to 0', element);
        element.setAttribute('edge', 0);
      }
    });

    return xmlNode;
  },

  /**
   * Returns the XML node that represents the current diagram.
   */
  getGraphXml(config) {
    let { ignoreSelection } = config;
    const { graph } = config;

    ignoreSelection = ignoreSelection != null ? ignoreSelection : true;
    let node = null;

    if (ignoreSelection) {
      const enc = new mxCodec (mxUtils.createXmlDocument ()); //eslint-disable-line
      node = enc.encode(graph.getModel());
    } else {
      node = graph.encodeCells(
        mxUtils.sortCells(  //eslint-disable-line
          graph.model.getTopmostCells(
            //eslint-disable-line
            graph.getSelectionCells()
          )
        )
      );
    }

    if (graph.view.translate.x !== 0 || graph.view.translate.y !== 0) {
      node.setAttribute('dx', Math.round(graph.view.translate.x * 100) / 100);
      node.setAttribute('dy', Math.round(graph.view.translate.y * 100) / 100);
    }

    node.setAttribute('grid', graph.isGridEnabled() ? '1' : '0');
    node.setAttribute('gridSize', graph.gridSize);
    node.setAttribute('guides', graph.graphHandler.guidesEnabled ? '1' : '0');
    node.setAttribute(
      'tooltips',
      graph.tooltipHandler.isEnabled() ? '1' : '0'
    );
    node.setAttribute(
      'connect',
      graph.connectionHandler.isEnabled() ? '1' : '0'
    );
    node.setAttribute('arrows', graph.connectionArrowsEnabled ? '1' : '0');
    node.setAttribute('fold', graph.foldingEnabled ? '1' : '0');
    node.setAttribute('page', graph.pageVisible ? '1' : '0');
    node.setAttribute('pageScale', graph.pageScale);
    node.setAttribute('pageWidth', graph.pageFormat.width);
    node.setAttribute('pageHeight', graph.pageFormat.height);

    if (graph.background != null) {
      node.setAttribute('background', graph.background);
    }

    return node;
  },

  // 从 xml 渲染 graph
  renderGraphFromXml(config) {
    const { graph, xml } = config;

    // const xml = window.localStorage.getItem('graph-xml');
    const xmlDocument = mxUtils.parseXml (xml); //eslint-disable-line

    if (
      xmlDocument.documentElement != null
      && xmlDocument.documentElement.nodeName === 'mxGraphModel'
    ) {
      const decoder = new mxCodec (xmlDocument); //eslint-disable-line
      const node = xmlDocument.documentElement;

      const formatedNode = this.formatXmlNode(node);

      if (!formatedNode) {
        return false;
      }

      decoder.decode(formatedNode, graph.getModel());
    }
  },

  // 自定义锚点
  initCustomPort(config) {
    const { pic } = config;
    // Replaces the port image
    mxConstraintHandler.prototype.pointImage = new mxImage (pic, 10, 10); //eslint-disable-line
  },

  /**
   * 初始化缩放配置
   */
  initZoomConfig(config) {
    const { graph } = config;
    graph.keepSelectionVisibleOnZoom = true;
    graph.centerZoom = true;
  },

  // 缩放
  zoom(config) {
    const { graph, type } = config;

    switch (type) {
      case 'in':
        graph.zoomIn();
        break;
      case 'out':
        graph.zoomOut();
        break;
      case 'actual':
        graph.zoomActual();
        break;
      default:
        break;
    }

    const cellsSelected = graph.getSelectionCells();
    graph.scrollCellToVisible(cellsSelected, true);
    graph.refresh();
  },

  updateStyle(graph, cell, key, value) {
    const model = graph.getModel();

    model.beginUpdate();

    let newStyle = model.getStyle(cell);

    newStyle = mxUtils.setStyle (newStyle, key, value); //eslint-disable-line

    model.setStyle(cell, newStyle);

    model.endUpdate();
  },

  /**
   * 节点重命名监听器
   */
  vertexRenameListener({ callback }) {
    mxCell.prototype.valueChangedCallback = callback; //eslint-disable-line

    // 若没重写过 valueChanged 方法则重写
    if (!mxCell.prototype.hasRewriteValueChanged) {  //eslint-disable-line
      //eslint-disable-line
      mxCell.prototype.hasRewriteValueChanged = true; //eslint-disable-line

      const {valueChanged} = mxCell.prototype; //eslint-disable-line
      mxCell.prototype.valueChanged = function (newValue) {  //eslint-disable-line
        //eslint-disable-line
        const {valueChangedCallback} = mxCell.prototype; //eslint-disable-line

        valueChangedCallback && valueChangedCallback(this, newValue);
        valueChanged.apply(this, [newValue]);
      };
    }
  },

  /**
   * 重命名一个cell
   * @param {*} newName 新名字（labelName）
   * @param {*} cell cell
   * @param {*} graph cell 归属的 graph
   */
  renameCell(newName, cell, graph) {
    cell.value = newName;
    graph.refresh(); // 重新渲染graph
  },

  /**
   * remove event listeners
   */
  removeEventListeners() {
    document.body.removeEventListener('keydown', this.undoListenerFunc2);
    document.body.removeEventListener('keydown', this.copyListenerFunc2);
    document.body.removeEventListener('keydown', this.deleteListenerFunc2);
  },

  startPanning(graph) {
    // graph.setPanning(true);
    // Enables panning with left mouse button
    graph.panningHandler.useLeftButtonForPanning = true;
    graph.panningHandler.ignoreCell = true;
    graph.container.style.cursor = 'move';
  },

  stopPanning(graph) {
    graph.panningHandler.useLeftButtonForPanning = false;
    graph.panningHandler.ignoreCell = false;
    graph.container.style.cursor = 'auto';
  },

  findItemFromArray(arr, query) {
    const key = Object.keys(query)[0];
    const value = query[key];

    let result;

    arr && arr.forEach((item) => {
      if (item && item[key] === value) {
        result = item;
      }
    });

    return result;
  }

};
