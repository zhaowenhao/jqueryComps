/**
 * jquery select 组件
 *
 * @file jquery.select.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {
    var assert = (console && console.assert) ? console.assert.bind(console) : function () { };

    /**
     * 检查参数是不是数组
     * @param {array} o
     */
    function isArray(o) {
        if (typeof o !== 'object' || o === null) {
            return false;
        }
        return /Array/i.test(Object.prototype.toString.call(o));
    }

    function generateUUID() {
        var uuid = '';
        for (var i = 0; i < 8; i++) {
            uuid += Math.floor(Math.random() * 16).toString(16);
        }
        return uuid;
    }

    function getRealText(text, value, opts) {
        if (value) {
            for (var i = 0; i < opts.length; i++) {
                var opt = opts[i];
                if (opt.value === value) {
                    return opt.title;
                }
            }
        }
        if (text) {
            return '<span class="select-tip">' + text + '</span>';
        }
        return '';
    }

    function getSelectInput(text, extra, value, name, width) {
        var selectStyle = '',
            textStyle = '',
            dataOpen = ' data-open="false" ';
        if (width) {
            selectStyle = ' style="width:176px;" '.replace('176', width);
            textStyle = ' style="width:132px;" '.replace('132', extra ? width - 76 : width - 44);
        }
        extra = extra || '';
        value = value || '';
        name = name || '';
        var selectInput = [
            '<div class="select"', selectStyle, dataOpen, '>',
            '   <input class="select-input" type="hidden" name="', name, '" value="', value, '"/>',
            '   <span class="select-text"', textStyle, '>', text, '</span>',
            '   <span class="select-extra">', extra, '</span>',
            '   <i class="select-arrow"></i>',
            '</div>'
        ];
        return selectInput.join('');
    }

    function getSelectOptions(opts, value, uuid, width) {
        var options = opts.map(function (opt) {
            var selected = '';
            if (value === opt.value) {
                selected = ' select-menu-item-selected ';
            }
            return '<li class="select-menu-item' + selected + '" data-value="' + opt.value + '">' + opt.title + '</li>';
        }).join('');
        var optionsStyle = '';
        if (width) {
            optionsStyle = ' style="width:176px;" '.replace('176', width);
        }
        var selectOptions = [
            '<div class="select-options" id="SELECT-OPTIONS-', uuid, '" ', optionsStyle, '>',
            '   <ul class="select-menu">', options, '</ul>',
            '</div>'
        ];
        return selectOptions.join('');
    }

    function showOptions(uuid, popContainer, opts, value, width) {
        if ($('#SELECT-OPTIONS-' + uuid)[0]) {
            $('#SELECT-OPTIONS-' + uuid).show();
            resetOptionScroll(uuid);
        } else {
            var options = getSelectOptions(opts, value, uuid, width);
            if (popContainer && $(popContainer)[0]) {
                $(popContainer).append(options);
            } else {
                $(document.body).append(options);
            }
            $('#SELECT-OPTIONS-' + uuid).show();
            setOptionListener(uuid);
            resetOptionScroll(uuid);
        }
    }

    function setOptionListener(uuid) {
        $('#SELECT-OPTIONS-' + uuid).on('mouseover', '.select-menu-item', function () {
            $(this).siblings('.select-menu-item-hover').removeClass('select-menu-item-hover');
            $(this).addClass('select-menu-item-hover');
        });
        $('#SELECT-OPTIONS-' + uuid).on('click', '.select-menu-item', function () {
            $(this).siblings('.select-menu-item-selected').removeClass('select-menu-item-selected');
            $(this).addClass('select-menu-item-selected');
            $('#SELECT-' + uuid + ' .select-text').html($(this).text());
            $('#SELECT-' + uuid + ' .select-input').val($(this).data('value'));
            $('#SELECT-' + uuid).trigger('change');
        });
    }

    function resetOptionScroll(uuid) {
        var options = $('#SELECT-OPTIONS-' + uuid),
            menu = options.find('.select-menu'),
            selected = options.find('.select-menu-item-selected');
        if (!selected[0]) {
            return;
        }

        var yo = options.offset().top,
            ho = options.innerHeight(),
            so = options.scrollTop(),
            hm = menu.innerHeight(),
            ys = selected.offset().top,
            hs = selected.innerHeight(),
            isInView = (ys > yo) && ((ys + hs) < (yo + ho)),
            delta = (ys - yo) + so;

        if (hm > ho && !isInView) {
            if (delta < 0) {
                delta = -delta;
            }
            options.scrollTop(delta);
        }
        options.find('.select-menu-item-hover').removeClass('select-menu-item-hover');
    }

    function setOptionsPosition(uuid, left, top, popContainer) {
        if (popContainer && $(popContainer)[0]) {
            var offset = $(popContainer).offset();
            var scrollTop = $(popContainer).scrollTop();
            $('#SELECT-OPTIONS-' + uuid).css({
                left: left - offset.left,
                top: top - offset.top + 36 + scrollTop
            });
        } else {
            $('#SELECT-OPTIONS-' + uuid).css({
                left: left,
                top: top + 36
            });
        }
    }

    function setGlobalListener(select, uuid) {
        function closeOptions(e) {
            if (!$.contains($('#SELECT-' + uuid)[0], e.target)) {
                $(select).data('open', false);
                $(select).removeClass('select-open');
                $('#SELECT-OPTIONS-' + uuid).hide();
            }
            document.removeEventListener('click', closeOptions, true);
            select = null;
            closeOptions = null;
        }
        document.addEventListener('click', closeOptions, true);
    }

    $.fn.extend({
        "select": function (options) {
            var value = options.value,
                name = options.name,
                text = options.text,
                extra = options.extra,
                width = options.width,
                opts = options.options,
                popContainer = options.popContainer;
            assert(isArray(opts), "select的options参数必须是一个数组");

            var realText = getRealText(text, value, opts);
            var selectInput = getSelectInput(realText, extra, value, name, width);
            var uuid = generateUUID();
            this.append(selectInput);
            this.find('.select').attr('id', 'SELECT-' + uuid);
            this.on('click', '.select', function (e) {
                if (!$(this).data('open')) {
                    var offset = $(this).offset();
                    $(this).addClass('select-open');
                    $(this).data('open', true);
                    showOptions(uuid, popContainer, opts, value, width);
                    setOptionsPosition(uuid, offset.left, offset.top, popContainer);
                    setGlobalListener($(this)[0], uuid);
                } else {
                    $(this).removeClass('select-open');
                    $(this).data('open', false);
                    $('#SELECT-OPTIONS-' + uuid).hide();
                }
            })
        }
    });
})(jQuery);