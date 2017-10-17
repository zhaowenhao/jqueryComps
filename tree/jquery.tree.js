/**
 * jquery tree 组件
 *
 * @file jquery.tree.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {

    function htmlEncode(value) {
        if (value) {
            return $('<div />').text(value).html();
        } else {
            return '';
        }
    }

    function getNode(config) {
        var nodeClasses = ['tree-node', config.nodeSkin];
        if (config.open) {
            nodeClasses.push('tree-node-expand');
        }
        if (!config.checkEnable) {
            nodeClasses.push('tree-node-no-check');
        }
        if (!config.showIcon) {
            nodeClasses.push('tree-node-no-icon');
        }
        if (!config.editEnable) {
            nodeClasses.push('tree-node-no-oper');
        }
        if (!config.hasChild) {
            nodeClasses.push('tree-node-no-child');
        }
        if (config.active) {
            nodeClasses.push('tree-node-active');
        }
        var arr = [
            '<div class="', nodeClasses.join(' '), '" data-node=\'', JSON.stringify(config), '\'>',
            '   <i class="tree-expand-icon"></i>',
            '   <label class="checkbox">',
            '       <input type="checkbox" checked/>',
            '       <span class="checkbox-icon"></span>',
            '   </label>',
            '   <i class="tree-node-icon"></i>',
            '   <span class="tree-node-title">', config.name, '</span>',
            '   <i class="tree-node-oper-icon"></i>',
            '</div>'
        ]
        return arr.join('');
    }

    function configNode(node, options) {
        return $.extend({}, node, {
            name: htmlEncode(node[options.nameKey]),
            open: node.open || false,
            checkEnable: options.checkEnable || false,
            showIcon: options.showIcon || false,
            editEnable: typeof node.editEnable === 'boolean' ? node.editEnable : (options.editEnable || false),
            hasChild: (node[options.childrenKey] || []).length > 0,
            nodeSkin: node.nodeSkin || '',
            [options.childrenKey]: (node[options.childrenKey] || []).length
        });
    }

    //有副作用，会修改原nodes数据的open和active
    function setSelected(options) {
        var nodes = options.nodes || [];
        var selectedNode = options.selectedNode;
        if (selectedNode) {
            var selectedNodeId = selectedNode[options.idKey];
            if (options.rootNode && options.rootNode[options.idKey] === selectedNodeId) {
                options.rootNode.active = true;
            } else {
                function setActive(node, selectedNodeId) {
                    if (node[options.idKey] === selectedNodeId) {
                        node.active = true;
                        return true;
                    }
                    return (node[options.childrenKey] || []).some(function (child) {
                        if (setActive(child, selectedNodeId)) {
                            node.open = true;
                            return true;
                        }
                        return false;
                    });
                }
                nodes.some(function (node) {
                    if (setActive(node, selectedNodeId)) {
                        node.open = true;
                        return true;
                    }
                    return false;
                })
            }
        }
    }

    function renderTree(node, deepth, options) {
        var arr;
        if (node) {
            node.deepth = deepth;
        }
        if (deepth === 0) {
            var rootNode,
                children,
                treeClasses = ['tree-root', options.treeSkin],
                childrenClasses = ['tree-children'];
            if (node) {
                var nd = $.extend({ [options.childrenKey]: options.nodes }, node);
                rootNode = getNode(configNode(nd, options));
                if (!node.open) {
                    childrenClasses.push('tree-hide');
                }
            } else {
                rootNode = '<div class="tree-node tree-node-expand tree-hide"></div>';
            }
            children = options.nodes.map(function (node) {
                return renderTree(node, deepth + 1, options);
            });

            arr = [
                '<div class="', treeClasses.join(' '), '">',
                '   ', rootNode,
                '   <div class="', childrenClasses.join(' '), '">', children.join(''), '</div>',
                '</div>'
            ];
            return arr.join('');
        }
        if (deepth > 0) {
            var children = (node[options.childrenKey] || []).map(function (node) {
                return renderTree(node, deepth + 1, options);
            });
            var childrenClasses = ['tree-children', node.open ? '' : 'tree-hide'];

            arr = [
                '<div class="tree-level', deepth, '">',
                '   ', getNode(configNode(node, options)),
                '   <div class="', childrenClasses.join(' '), '">', children.join(''), '</div>',
                '</div>'
            ]
            return arr.join('');
        }
    }

    function addListener(tree, options) {
        $(tree).on('click', '.tree-node', function (e) {
            var node = this;
            var $target = $(e.target);
            if ($target.hasClass('tree-expand-icon')) {
                if ($(node).hasClass('tree-node-expand')) {
                    $(node).next().animate({ height: 'toggle' }, function () {
                        $(this).addClass('tree-hide');
                        options.onNodeExpand($(node), $(tree), false);
                    });
                    $(node).removeClass('tree-node-expand');
                } else {
                    $(node).next().animate({ height: 'toggle' }, function () {
                        $(this).removeClass('tree-hide');
                        options.onNodeExpand($(node), $(tree), true);
                    });
                    $(node).addClass('tree-node-expand');
                }
            } else if ($target.hasClass('checkbox') || $target.parent().hasClass('checkbox')) {

            } else {
                options.onNodeClick($(node), $(tree));
                $(tree).find('.tree-node-active').removeClass('tree-node-active');
                $(node).addClass('tree-node-active');
            }
        });
        if (options.checkEnable) {
            $(tree).on('change', '.tree-node .checkbox input', function (e) {
                options.onNodeCheck($(this).parent().parent(), $(tree), $(this).is(':checked'));
                bubbleCheck(this);
                sinkCheck(this);
            });
        }
    }

    /**
     * 向上关联check
     * @param {element} checkElem
     */
    function bubbleCheck(checkElem) {
        var isChecked = $(checkElem).is(':checked');
        var node = $(checkElem).parent().parent();
        while (!node.parent().hasClass('tree-root')) {
            var parentNode = node.parent().parent().prev();
            if (isChecked) {
                var isAllChecked = !node.parent().parent().children().children('.tree-node').find('.checkbox input:not(:checked)').length;
                parentNode.find('.checkbox input').prop('checked', isAllChecked);
            } else {
                parentNode.find('.checkbox input').prop('checked', false);
            }
            node = parentNode;
        }
    }

    /**
     * 向下关联check
     * @param {element} checkElem
     */
    function sinkCheck(checkElem) {
        var isChecked = $(checkElem).is(':checked');
        var node = $(checkElem).parent().parent();
        node.next().find('.tree-node .checkbox input').prop('checked', isChecked);
    }

    $.fn.extend({
        "tree": function (options) {
            var defaultOptions = {
                treeSkin: '',
                nodes: [],
                rootNode: null,
                selectedNode: null,
                nameKey: 'name',
                childrenKey: 'children',
                idKey: 'id',
                checkEnable: false,
                editEnable: false,
                showIcon: true,
                onLoad: function () { },
                onNodeExpand: function () { },
                onNodeClick: function () { },
                onNodeCheck: function () { }
            };
            options = $.extend(defaultOptions, options);

            setSelected(options);
            this.html(renderTree(options.rootNode, 0, options));
            addListener(this.find('.tree-root'), options);
            options.onLoad(this.find('.tree-root'), options);
        }
    });
})(jQuery);