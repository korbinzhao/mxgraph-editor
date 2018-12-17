# mxgraph-editor
A mxGraph editor.

# development
```
npm install

npm start
```

# demo

```
  import Editor from 'mxgraph-editor';

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
```

# api

|属性|	说明|	类型|	默认值|
|---|---|---|---|
|SVG_SHAPES|SVG形状配置|Array|[]|
|CARD_SHAPES|卡片形状配置|Array|[]|
|IMAGE_SHAPES|图片形状配置|Array|[]|
|container|画布容器选择器|selector|
|clickFunc|单击事件回调函数|function(cell)|
|doubleClickFunc|双击事件回调函数|function(cell)||
|autoSaveFunc|自动保存回调函数|function(xml)|
|cellCreatedFunc|节点创建回调函数|function(cell)||
|deleteFunc|节点删除回调函数|function(e)||
|valueChangeFunc|节点 value 变更回调函数|function(value)||
|initSidebar|初始化侧边栏|function(elements)||
|initCustomPort|自定义锚点, 10x10px|function((picture))||
|zoom|缩放|function(type)，入参：in（放大）、out（缩小）、actual（还原）||
|updateStyle|更新样式|function(cell, key, value)，入参：cell 节点，key 新样式的 key，value 新样式的 value||
|groupCells|组合|function(groupId, labelName)，入参：groupId 分组id，name 标签名称||
|ungroupCells|取消分组|function(cells)|
|getCellsSelected|获取当前选中的所有cell|function()||
|getGraphXml|获取当前 graph 的 xml|function()||
|createVertex|创建节点|function(shapeLabel, x, y, width, height, shapeStyle)|
|insertEdge|插入连线|function(vertex1, vertex2)||
|getCellById|通过id获取cell|function(id)||
|getAllCells|获取当前画布所有 cell|function()|
|refresh|重新渲染画布|function()||
|clearSelection|清除当前选择|function()||
|startPanning|开始平移画布|function()||
|stopPanning|停止平移画布|function()||


