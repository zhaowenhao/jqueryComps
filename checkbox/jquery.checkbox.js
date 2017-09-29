/**
 * jquery checkbox 组件
 * 该组件仅自动帮你生成了checkbox的dom元素，你也可以不使用该组件，直接自己写dom元素，所有的重要的东西都在样式文件里
 * 单独写dom的结构如下：
            <label class="checkbox">
                <input type="checkbox" name="fruit" value="apple" checked/>
                <span class="checkbox-icon">Apple</span>
            </label>
 *
 * @file jquery.checkbox.js
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
        /**
         * 参数的是一个函数，这个函数内部的this指向当前的dom元素，
         * 插件会根据这个函数的返回值做参数创建checkbox
         */
        "checkbox": function (callback) {
            assert(typeof callback === 'function', "checkbox组件的参数是一个函数");
            this.each(function () {
                var options = callback.call(this);
                var name = options.name;
                var value = options.value;
                var isChecked = options.checked;
                var checked = isChecked ? 'checked' : '';
                var label = [
                    '<label class="checkbox">',
                    '    <input type="checkbox" name="', name, '" value="', value, '" ', checked, '>',
                    '    <span class="checkbox-icon"></span>',
                    '</label>'
                ].join('');
                $(this).append(label);
            });
        },
        /**
         * 生成一个checkbox group
         */
        "checkboxGroup": function (options) {
            var opts = options.options;
            var name = options.name;
            var value = options.value || [];
            assert(isArray(opts), "checkboxGroup组件的options参数必须是一个数组");

            this.addClass('checkbox-group');
            for (var i = 0; i < opts.length; i++) {
                var opt = opts[i];
                var checked = value.indexOf(opt.value) > -1 ? 'checked' : '';
                var label = [
                    '<label class="checkbox">',
                    '    <input type="checkbox" name="', name, '" value="', opt.value, '" ', checked, '>',
                    '    <span class="checkbox-icon">', opt.title, '</span>',
                    '</label>'
                ].join('');
                this.append(label);
            }
        }
    });
})(jQuery);