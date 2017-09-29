/**
 * jquery tooltip 组件
 *
 * @file jquery.tooltip.js
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

    function getTooltip(uuid, text, placement) {
        var selectOptions = [
            '<div class="tooltip" id="TOOLTIP-', uuid, '">',
            '   <span class="tooltip-text">', text, '</span>',
            '   <i class="tooltip-arrow"></i>',
            '</div>'
        ];
        return selectOptions.join('');
    }

    function setTooltipListener(uuid, options) {
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
            }, 500);
        });
        $('#TOOLTIP-' + uuid + ',#' + uuid).on('mouseout', function () {
            clearAllTimeouts();
            hideTimeout = setTimeout(function () {
                $('#TOOLTIP-' + uuid).hide();
                hideTimeout = null;
            }, 500);
        })
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
        var cssObj = {
            left: tx + leftOffset,
            top: ty + th + 16 + topOffset
        };
        if (options.width) {
            cssObj.width = options.width;
        }
        tooltip.css(cssObj);
    }

    $.fn.extend({
        "tooltip": function (callback) {
            assert(typeof callback === 'function', "tooltip组件的参数是一个函数");
            this.each(function () {
                var options = callback.call(this);
                var text = options.text || '',
                    placement = options.placement || 'left',
                    uuid = 'TOOLTIPTEXT-' + generateUUID();
                if ($(this).attr('id')) {
                    uuid = $(this).attr('id');
                } else {
                    $(this).attr('id', uuid);
                }
                var html = getTooltip(uuid, text, placement);
                $(document.body).append(html);
                $('#TOOLTIP-' + uuid).hide();
                setTooltipListener(uuid, options);
            });
        }
    });
})(jQuery);