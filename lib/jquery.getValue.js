/**
 * jquery getValue工具插件，用获取radio、checkbox的value
 *
 * @file jquery.getValue.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {

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
        }
    });
})(jQuery);