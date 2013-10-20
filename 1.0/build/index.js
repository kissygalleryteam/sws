/*
combined files : 

gallery/sws/1.0/index

*/
/**
 * @fileoverview 超级瀑布流(Super Waterfall Stream)
 * @author Letao<mailzwj@126.com>
 * @module sws
 **/
KISSY.add('gallery/sws/1.0/index',function (S, Node,Base) {
    var $ = Node.all;
    /**
     * 超级瀑布流(Super Waterfall Stream)
     * @class Sws
     * @constructor
     * @extends Base
     */
    function Sws(cfg) {
        var self = this;
        if (!(this instanceof Sws)) {
            return new Sws(cfg);
        }
        //调用父类构造函数
        Sws.superclass.constructor.call(self, cfg);
        self.config = cfg;
        self.set("container", S.one(cfg.container));
        self.set("swsers", self.get("container").all(cfg.swsers));
        self.set("colWidth", cfg.colWidth || 100);
        self.set("space", cfg.space || 10);
        self.set("offset", {x: (cfg.offsetX || 10), y: (cfg.offsetY || 10)});
        self.set("enableFill", cfg.enableFill);
        self.set("fillColor", cfg.fillColor);
        self.set("blankArea", []);
        self.init();
    }
    S.extend(Sws, Base, /** @lends Sws.prototype*/{
        init: function() {
            var self = this;
            var cont = self.get("container");
            if (cont.css("position") === "static") {
                cont.css("position", "relative");
            }

            self.reposition();
        },
        reposition: function() {
            var self = this;
            var cols = self.getCols();
            var colArr = self.initColArray();
            var swsers = self.get("swsers");
            var len = swsers.length;
            var cont = self.get("container");
            var contWidth = cont.width();
            var colWidth = self.get("colWidth");
            var space = self.get("space");
            var offset = self.get("offset");
            var ba = self.get("blankArea");
            ba.splice(0, ba.length);
            swsers.each(function(s, i){
                var width = s.width();
                var height = s.height();
                var blen = ba.length;
                var iFlag = false;
                if (blen > 0) {
                    iFlag = self.insertBlankArea(s);
                }
                if (!iFlag) {
                    var colArr = self.get("colArr");
                    var min = self.getMinCol(colArr);
                    var colCross = (width + space) / (colWidth + space);
                    var ost = 1;
                    while (min * (colWidth + space) + width + offset.x > contWidth) {
                        min = self.getMinCol(colArr, ost++);
                    }
                    var col = min;
                    if (self.hasCross(min, colCross)) {
                        col = self.getMaxCol(colArr, min, colCross);
                    }
                    var left = min * (colWidth + space) + offset.x;
                    var top = colArr[col].height;
                    s.css({left: left, top: top});
                    self.addBlankArea(min, colCross, top);
                    for (var c = min, ls = min + colCross; c < ls; c++) {
                        colArr[c].height = top + height + space;
                    }
                }
            });

            if (self.get("enableFill")) {
                self.fillWithDiv();
            }
            self.setContainerHeight();
        },
        getRandomColor: function() {
            var ffffff = 16777215;
            var color = Math.round(Math.random() * ffffff);
            color = color.toString(16);
            return "#" + ("00000" + color).slice(-6);
        },
        addItems: function(items) {
            var self = this;
            var cont = self.get("container");
            var items = S.clone(items);
            var colWidth = self.get("colWidth");
            var contWidth = cont.width();
            var space = self.get("space");
            var offset = self.get("offset");
            var ba = self.get("blankArea");
            S.each(items, function(node, i){
                node = S.one(node);
                cont.append(node);
                var width = node.width();
                var height = node.height();
                var blen = ba.length;
                var iFlag = false;
                if (blen > 0) {
                    iFlag = self.insertBlankArea(node);
                }
                if (!iFlag) {
                    var colArr = self.get("colArr");
                    var min = self.getMinCol(colArr);
                    var colCross = (width + space) / (colWidth + space);
                    var ost = 1;
                    while (min * (colWidth + space) + width + offset.x > contWidth) {
                        min = self.getMinCol(colArr, ost++);
                    }
                    var col = min;
                    if (self.hasCross(min, colCross)) {
                        col = self.getMaxCol(colArr, min, colCross);
                    }
                    var left = min * (colWidth + space) + offset.x;
                    var top = colArr[col].height;
                    node.css({left: left, top: top});
                    self.addBlankArea(min, colCross, top);
                    for (var c = min, ls = min + colCross; c < ls; c++) {
                        colArr[c].height = top + height + space;
                    }
                }
            });
            if (self.get("enableFill")) {
                self.fillWithDiv();
            }
            self.setContainerHeight();
            self.set("swsers", cont.all(self.config.swsers));

        },
        setContainerHeight: function() {
            var self = this;
            var colArr = self.get("colArr");
            var cont = self.get("container");
            var maxHeight = self.getMaxHeight(colArr);
            cont.css("height", maxHeight);
        },
        getMaxHeight: function(arr) {
            var self = this;
            var max = arr[0].height, mlen = arr.length;
            for (var m = 0; m < mlen; m++) {
                if (max < arr[m].height) {
                    max = arr[m].height;
                }
            }
            return max;
        },
        addBlankArea: function(from, step, limit) {
            var self = this;
            var ba = self.get("blankArea");
            var colWidth = self.get("colWidth");
            var space = self.get("space");
            var colArr = self.get("colArr");
            var offset = self.get("offset");
            for (var j = 0, k = from; j < step; j++) {
                var col = j + k;
                if (colArr[col].height < limit) {
                    var width = colWidth;
                    while ((j + 1 < step) && colArr[j + k].height === colArr[j + k + 1].height) {
                        width += colWidth + space;
                        j++;
                    }
                    j = j > 0 ? j-- : j;
                    ba.push({
                        left: col * (colWidth + space) + offset.x,
                        top: colArr[col].height,
                        width: width,
                        height: limit - colArr[col].height - space
                    });
                }
            }
        },
        getMaxCol: function(arr, min, cr) {
            var self = this;
            var colArr = S.clone(arr);
            var mc = min, max = colArr[mc].height;
            for (var y = min, yl = min + cr; y < yl; y++) {
                if (max < colArr[y].height) {
                    mc = y;
                    max = colArr[mc].height;
                }
            }
            return mc;
        },
        fillWithDiv: function() {
            var self = this;
            var color = self.get("fillColor");
            var filler = S.one("<div class=\"J_Filler\" style=\"position: absolute;\">");
            var ba = self.get("blankArea");
            var cont = self.get("container");
            var fills = cont.all(".J_Filler");
            fills.each(function(f, n){
                f.remove();
            });
            S.each(ba, function(b, a){
                if (b.height > 10) {
                    var fn = filler.clone();
                    cont.append(fn);
                    fn.css({
                        left: b.left,
                        top: b.top,
                        width: b.width,
                        height: b.height,
                        backgroundColor: (color || self.getRandomColor())
                    });
                }
            });
        },
        insertBlankArea: function(node) {
            var self = this;
            var ba = self.get("blankArea");
            var blen = ba.length;
            var nWidth = node.width();
            var nHeight = node.height();
            var space = self.get("space");
            var baArr = S.clone(ba);
            var nFlag = false;
            for (var b = 0; b < blen; b++) {
                if (baArr[b].width >= nWidth && baArr[b].height >= nHeight) {
                    node.css({left: baArr[b].left, top: baArr[b].top});
                    var lWidth = baArr[b].width - nWidth - space;
                    if (lWidth !== 0) {
                        ba.push({
                            left: baArr[b].left + nWidth + space,
                            top: baArr[b].top,
                            width: lWidth,
                            height: baArr[b].height
                        });
                    }
                    baArr[b].top += nHeight + space;
                    baArr[b].width = nWidth;
                    baArr[b].height -= (nHeight + space);
                    if (baArr[b].height !== 0) {
                        ba.splice(b, 1, baArr[b]);
                    } else {
                        ba.splice(b, 1);
                    }
                    nFlag = true;
                    break;
                }
            }
            return nFlag;
        },
        hasCross: function(min, cross) {
            var self = this;
            var colArr = self.get("colArr");
            var clen = colArr.length;
            var flag = false;
            for (var x = min, last = min + cross; x < last; x++) {
                if (x >= clen) {
                    flag = true;
                    break;
                } else if (colArr[x].height > colArr[min].height) {
                    flag = true;
                    break;
                } else {
                    flag = false;
                }
            }
            return flag;
        },
        getMinCol: function(arr, offset) {
            var self = this;
            var offset = offset || 0;
            var ixs = S.clone(arr);
            // arr.sort(function(a, b){
            //     return a.height - b.height;
            // });
            var clen = ixs.length, temp = null;
            for(var x = 0; x < clen; x++){
                for(var j = 0; j < clen - 1; j++){
                    if(ixs[j].height > ixs[j + 1].height){
                        temp = ixs[j];
                        ixs[j] = ixs[j + 1];
                        ixs[j + 1] = temp;
                    }
                }
            }
            // S.log(ixs);
            return ixs[offset].index;
        },
        initColArray: function() {
            var self = this;
            var cols = self.get("cols");
            var offset = self.get("offset");
            var colArr = [];
            for (var i = 0; i < cols; i++) {
                colArr.push({height: offset.y, index: i});
            }
            self.set("colArr", colArr);
            return colArr;
        },
        getCols: function() {
            var self = this;
            var cont = self.get("container");
            var contWidth = cont.width();
            var cols = 0;
            var colWidth = self.get("colWidth");
            var space = self.get("space");
            // console.log(contWidth, ",", colWidth + space);
            cols = Math.floor((contWidth + space) / (colWidth + space));
            self.set("cols", cols);
            return cols;
        }
    }, {ATTRS : /** @lends Sws*/{

    }});
    return Sws;
}, {requires:['node', 'base']});




