/**
 * jquery dropdown 组件
 *
 * @file jquery.dropdown.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {
    var assert = (console && console.assert) ? console.assert.bind(console) : function () { };

    var showTimeout = null,
        hideTimeout = null,
        lastUUID = '';

    function generateUUID() {
        var uuid = '';
        for (var i = 0; i < 8; i++) {
            uuid += Math.floor(Math.random() * 16).toString(16);
        }
        return uuid;
    }

    function getTooltip(uuid, options) {
        var btns = options.btns || [];
        var items = btns.map(function (btnText, btnIdx) {
            return '<div class="dropdown-item" data-dropdown-idx="' + btnIdx + '">' + btnText + '</div>';
        })
        var popContent = [
            '<div class="dropdown" id="TOOLTIP-', uuid, '">',
            '   ', items.join(''),
            '</div>'
        ];
        return popContent.join('');
    }

    function setTooltipListener(uuid, options) {
        var callback = options.callback || function () { };
        $('#TOOLTIP-' + uuid + ',#' + uuid).on('mouseover', function () {
            clearAllTimeouts();
            if (lastUUID && lastUUID !== uuid) {
                $('#TOOLTIP-' + lastUUID).hide();
            }
            showTimeout = setTimeout(function () {
                setTooltipPosition(uuid, options);
                $('#TOOLTIP-' + uuid).show();
                lastUUID = uuid;
                showTimeout = null;
            }, 200);
        });
        $('#TOOLTIP-' + uuid + ',#' + uuid).on('mouseout', function () {
            clearAllTimeouts();
            hideTimeout = setTimeout(function () {
                $('#TOOLTIP-' + uuid).hide();
                hideTimeout = null;
            }, 200);
        })
        $('#TOOLTIP-' + uuid).on('click', '.dropdown-item', function (e) {
            callback(+$(this).data('dropdown-idx'), $(this).html(), $(this));
            clearAllTimeouts();
            $(this).parent().hide();
        });
    }

    function clearAllTimeouts() {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
        if (showTimeout) {
            clearTimeout(showTimeout);
            showTimeout = null;
        }
    }

    function setTooltipPosition(uuid, options) {
        var text = $('#' + uuid);
        var offset = text.offset();
        var tx = offset.left;
        var ty = offset.top;
        var th = text.innerHeight();
        var tooltip = $('#TOOLTIP-' + uuid);
        var leftOffset = options.leftOffset || 0;
        var topOffset = options.topOffset || 0;
        var popContainer = options.popContainer || '';
        var cssObj;
        if (popContainer && $(popContainer)[0]) {
            var pOffset = $(popContainer).offset();
            var pScrollTop = $(popContainer).scrollTop();
            var pHeight = $(popContainer).height();
            cssObj = {
                left: tx - pOffset.left + leftOffset,
                top: ty - pOffset.top + pScrollTop + pHeight + topOffset
            }
        } else {
            cssObj = {
                left: tx + leftOffset,
                top: ty + th + topOffset
            }
        }
        if (options.width) {
            cssObj.width = options.width;
        }
        tooltip.css(cssObj);
    }

    $.fn.extend({
        "dropdown": function (callback) {
            assert(typeof callback === 'function', "tooltip组件的参数是一个函数");
            this.each(function () {
                var uuid = 'TOOLTIPTEXT-' + generateUUID();
                if ($(this).attr('id')) {
                    uuid = $(this).attr('id');
                } else {
                    $(this).attr('id', uuid);
                }
                var options = callback.call(this, uuid);
                var html = getTooltip(uuid, options);
                if (options.popContainer && $(options.popContainer)[0]) {
                    $(options.popContainer).append(html);
                } else {
                    $(document.body).append(html);
                }
                $('#TOOLTIP-' + uuid).hide();
                setTooltipListener(uuid, options);
            });
        }
    });
})(jQuery);