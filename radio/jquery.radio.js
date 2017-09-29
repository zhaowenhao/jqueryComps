/**
 * jquery radio 组件
 *
 * @file jquery.radio.js
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


    $.fn.extend({
        "radioGroup": function (options) {
            var opts = options.options;
            var name = options.name;
            var value = options.value;
            assert(isArray(opts), "radio组件的options参数必须是一个数组");

            this.addClass('radio-group');
            for (var i = 0; i < opts.length; i++) {
                var opt = opts[i];
                var checked = value === opt.value ? 'checked' : '';
                var label = [
                    '<label class="radio">',
                    '    <input type="radio" name="', name, '" value="', opt.value, '" ', checked, '>',
                    '    <span class="radio-icon">', opt.title, '</span>',
                    '</label>'
                ].join('');
                this.append(label);
            }
        }
    });
})(jQuery);