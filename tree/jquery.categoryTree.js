/**
 * jquery 目录树组件，是业务组件，依赖jquery tree及jquery dropdown组件，使用该组件时请先引入依赖的组件及样式
 *
 * @file jquery.categoryTree.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {
    var assert = (console && console.assert) ? console.assert.bind(console) : function () { };

    function htmlEncode(value) {
        if (value) {
            return $('<div />').text(value).html();
        } else {
            return '';
        }
    }

    function generateNode(config) {
        var nodeClasses = ['tree-node', 'tree-node-no-child'];
        if (!config.checkEnable) {
            nodeClasses.push('tree-node-no-check');
        }
        if (!config.showIcon) {
            nodeClasses.push('tree-node-no-icon');
        }
        var arr = [
            '<div class="', nodeClasses.join(' '), '" data-node="">',
            '   <i class="tree-expand-icon"></i>',
            '   <label class="checkbox">',
            '       <input type="checkbox" checked/>',
            '       <span class="checkbox-icon"></span>',
            '   </label>',
            '   <i class="tree-node-icon"></i>',
            '   <input class="tree-node-edit" value=""/>',
            '   <i class="tree-node-oper-icon"></i>',
            '</div>'
        ]
        return arr.join('');
    }

    function addChild(node, options) {
        var newNode = generateNode(options);
        var deepth = node.data('node').deepth;
        var level = [
            '<div class="tree-level', deepth + 1, '">',
            '   ', newNode,
            '</div>'
        ].join('');
        node.addClass('tree-node-expand').removeClass('tree-node-no-child');
        if (node.next('.tree-children').hasClass('tree-hide')) {
            node.next('.tree-children').append(level).animate({ height: 'toggle' }, function () {
                $(this).removeClass('tree-hide');
                $(this).find('.tree-node-edit').focus();
            });
        } else {
            node.next('.tree-children').append(level).find('.tree-node-edit').focus();
        }
    }

    function rename(node, options) {
        var title = $(node).find('.tree-node-title');
        var value = title.html();
        title.after('<input class="tree-node-edit" value="' + value + '"/>');
        title.next().focus();
        title.remove();
    }

    function moveUp(node, options) {
        options.onNodeMoveUp(node);
    }

    function moveDown(node, options) {
        options.onNodeMoveDown(node);
    }

    function remove(node, options) {
        options.onNodeRemove(node);
    }

    $.fn.extend({
        "categoryTree": function (options) {
            assert(typeof this.tree === 'function', '没有引入jquery tree组件');
            assert(typeof this.dropdown === 'function', '没有引入jquery dropdown组件');

            options = $.extend({
                treeSkin: 'category-tree',
                editEnable: true,
                onNodeEdit: function () { },
                onNodeAdd: function () { },
                onNodeMoveUp: function () { },
                onNodeMoveDown: function () { },
                onNodeRemove: function () { },
                onLoad: function (tree, options) {
                    $(tree).on('dblclick', '.tree-node .tree-node-title', function (e) {
                        var value = $(this).html();
                        $(this).after('<input class="tree-node-edit" data-old="' + value + '" value="' + value + '"/>');
                        $(this).next().focus();
                        $(this).remove();
                    });
                    $(tree).on('blur', '.tree-node .tree-node-edit', function (e) {
                        var value = $(this).val();
                        var oldValue = $(this).data('old');
                        var node = $(this).parent();
                        if (oldValue) {
                            if (value !== oldValue) {
                                options.onNodeEdit(node, value, oldValue);
                            }
                            $(this).after('<span class="tree-node-title">' + htmlEncode(value) + '</span>');
                            $(this).remove();
                        } else {
                            if (value) {
                                options.onNodeAdd(node, value);
                            } else {
                                if (node.parent().parent().children().length === 1) {
                                    node.parent().parent().prev().addClass('tree-node-no-child').removeClass('tree-node-expand');
                                    node.parent().parent().addClass('tree-hide').hide();
                                }
                                node.parent().remove();
                            }
                        }
                    });
                    $(tree).find('.tree-node-oper-icon').dropdown(function (uuid) {
                        var node = $(this).parent();
                        var hasPrev = node.parent().prev().length > 0;
                        var hasNext = node.parent().next().length > 0;
                        return {
                            leftOffset: -80,
                            topOffset: -8,
                            popContainer: node,
                            btns: ['新建子类目', '重命名', '上移', '下移', '删除'],
                            callback: function (btnIdx, btnText) {
                                console.log(node, btnIdx, btnText, node.parent().next());
                                switch (btnText) {
                                    case '新建子类目':
                                        addChild(node, options);
                                        break;
                                    case '重命名':
                                        rename(node, options);
                                        break;
                                    case '上移':
                                        moveUp(node, options);
                                        break;
                                    case '下移':
                                        moveDown(node, options);
                                        break;
                                    case '删除':
                                        remove(node, options);
                                        break;
                                }
                            }
                        }
                    });
                }
            }, options);
            this.tree(options);
        }
    });
})(jQuery);