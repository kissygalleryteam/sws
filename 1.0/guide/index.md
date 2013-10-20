## Sws (Super Waterfall Stream)

* 文档：[http://gallery.kissyui.com/sws/1.0/guide/index.html](http://gallery.kissyui.com/sws/1.0/guide/index.html)
* demo：[http://gallery.kissyui.com/sws/1.0/demo/index.html](http://gallery.kissyui.com/sws/1.0/demo/index.html)
* 版本：1.0

## 概述

程序由瀑布流思路扩展而来，对宽度成比例（`colWidth` 为最小列宽度，`space` 为间距，所有盒子宽度需满足 `width = n * (colWidth + space) - space`，`n >= 1`）的盒子进行自动布局，尽可能使其排列整齐，不失美观。对于部分无法避免的空白，提供自动补位（可选），补位块样式可通过css自定义。

当所有盒子宽度相同时，将以瀑布流的方式完美展现。

支持自适应容器宽度，支持动态增加元素。

## 预览

![Super Waterfall Stream](http://www.seejs.com/wp-content/uploads/2013/10/demo-preview.png)

* 图1，四种宽度，高度随机，自动填充空白区
* 图2，一种宽度，高度随机，无需填充空白区（普通瀑布流效果）
* 图3，三种宽度，高度固定，自动填充空白区

## 原理

![布局原理](http://www.seejs.com/wp-content/uploads/2013/10/principle.gif)

## 参数

| **名称** | **类型** | **功能** |
| container | id/class/node | 布局外部盒子 |
| swsers | class | 将被用于布局的块标识 |
| colWidth | Number | 最小列的列宽 |
| space | Number | 布局块之间的间距，默认为10 |
| offsetX | Number | 第一列距离容器左侧的边距，默认为10 |
| offsetY | Number | 第一行距离容器顶部的边距，默认为10 |
| enableFill | Boolean | 是否启用自动填充空白区 |
| fillColor | String | 当启用填充时，填充占位块的背景颜色 |

## 方法

* `reposition()`：重新设置所有布局块的位置，若启用自动填充，此方法也会填充更新布局后的空白区。

	```
	var timer = null;
    S.one(window).on("resize", function(){
        clearTimeout(timer);
        timer = setTimeout(function(){
            sws.reposition();
        }, 200);
    });
	```
* `addItems(items)`：向原有布局列表中添加元素，items为一个节点数组。

	```
	S.one("#J_AddFive").on("click", function(){
		// 创建并返回指定参数的节点数组
        var ais = addItem(node, colWidth, type, space, 5, rowHeight);
		// 将新元素添加到布局组件中
        sws.addItems(ais);
    });
	```
* `fillWithDiv()`：若初始化没有启用自动填充空白区，可调用该方法，主动触发填充。

	```
	sws.fillWidthDiv();
	```

## 思考

有人曾问我这个组件的应用场景，当然指的是瀑布流功能以外的简单扩展部分。我突然想到了一个问题：是有了应用场景才去寻找解决方案好呢，还是预先为可能出现的也许有前景的应用场景做一些工作好呢？我找不到答案，也许这个东西本来确实也没什么价值。但是，作为一个狂热的技术爱好者，我觉得过程中解决各种瓶颈、疑难杂症时的思考，应该才是最大的财富收获！

## changelog

### 20131020

* v1.0版本发布


