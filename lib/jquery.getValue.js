/**
 * jquery getValue工具插件，用获取radio、checkbox、form等的值
 *
 * @file jquery.getValue.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {
    function getFormValue($dom, except) {
        var inputs;
        var result = {};
        if (except) {
            inputs = $dom.find('input').not(except);
        } else {
            inputs = $dom.find('input');
        }
        inputs.each(function () {
            var type = $(this).prop('type');
            var name = $(this).prop('name');
            var value = $(this).val();
            if ('radio' === type) {
                if ($(this).is(':checked')) {
                    result[name] = value;
                }
            } else if ('checkbox' === type) {
                if ($(this).is(':checked')) {
                    if (result[name]) {
                        result[name].push(value);
                    } else {
                        result[name] = [value];
                    }
                }
            } else {
                result[name] = value;
            }
        });
        return result;
    }

    $.fn.extend({
        "getValue": function (options) {
            var type = options.type;
            //获取radio的选中值
            if (type === 'radio') {
                return this.find('input:checked').val();
            }
            //获取checkbox的选中值，返回一个数组
            if (type === 'checkbox') {
                var value = [];
                this.find('input:checked').each(function () {
                    value.push($(this).val());
                });
                return value;
            }
            //获取select的选中值
            if (type === 'select') {
                return this.find('.select-input').val();
            }
            //获取表单的值，返回json对象
            if (type === 'form') {
                return getFormValue(this, options.except);
            }
        }
    });
})(jQuery);