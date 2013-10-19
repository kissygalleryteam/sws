/**
 * @fileoverview 超级瀑布流(Super Waterfall Stream)
 * @author Letao<mailzwj@126.com>
 * @module sws
 **/
KISSY.add(function (S, Node,Base) {
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
        self.set("container", S.one(cfg.container));
        self.set("swsers", cfg.swsers);
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
            var cols = self.get("cols");
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
                    while (self.hasCross(min, colCross) || min * (colWidth + space) + width + offset.x > contWidth) {
                        min = self.getMinCol(colArr, ost++);
                    }
                    var left = min * (colWidth + space) + offset.x;
                    var top = colArr[min].height;
                    s.css({left: left, top: top});
                    for (var c = min, ls = min + colCross; c < ls;/* c++*/) {
                        if (colArr[c].height !== top) {
                            var width = colWidth;
                            var n = 0;
                            while(c + n < ls && colArr[c + n].height === colArr[c].height) {
                                width = (n + 1) * (colWidth + space) - space;
                                if (n >= ls) {
                                    colArr[n].height = top;
                                }
                                n++;
                            }
                            ba.push({
                                index: c,
                                left: c * (colWidth + space) + offset.x,
                                top: colArr[c].height,
                                width: width,
                                height: top - colArr[c].height - space
                            });
                            var an = n > 0 ? n - 1 : 0;
                            while(an >= 0) {
                                colArr[c + an].height = top + height + space;
                                an--;
                            }
                            c += n;
                        } else {
                            colArr[c].height = top + height + space;
                            c++;
                        }
                    }
                }
            });

            if (self.get("enableFill")) {
                self.fillWithDiv();
            }
        },
        getRandomColor: function() {
            var ffffff = 16777215;
            var color = Math.round(Math.random() * ffffff);
            color = color.toString(16);
            return "#" + ("00000" + color).slice(-6);
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
                    fn.css({
                        left: b.left,
                        top: b.top,
                        width: b.width,
                        height: b.height,
                        backgroundColor: (color || self.getRandomColor()),
                        borderRadius: "4px"
                    });
                    cont.append(fn);
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
                    // baArr[b].width -= nWidth;
                    var lWidth = baArr[b].width - nWidth - space;
                    if (lWidth !== 0) {
                        ba.push({left: baArr[b].left + nWidth + space, top: baArr[b].top, width: lWidth, height: baArr[b].height});
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



