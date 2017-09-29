/**
 * jquery表单验证插件
 *
 * @file jquery.validate.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {

    function handleResult(fieldResult, options, e, formResult) {
        options.cleanError.call(this, options);
        if (fieldResult === 0) {
            if (formResult) {
                formResult.passed++;
            }
        } else {
            options.showError.call(this, options, fieldResult);
        }

        if (e.type === 'validate' && formResult) {
            formResult.count++;
            if (formResult.count === formResult.all) {
                if (formResult.passed === formResult.all) {
                    formResult.onSuccess();
                } else if (formResult.onError) {
                    formResult.onError();
                }
            }
        }
    }

    function validateField(e, formResult) {
        var options = e.data;
        if (options.mode === 1 || options.mode === 3) {
            var fieldResult = options.expression.call(this, options);
            handleResult.call(this, fieldResult, options, e, formResult);
        } else if (options.mode === 2) {
            var _this = this;
            options.expression.call(this, options, function (fieldResult) {
                handleResult.call(_this, fieldResult, options, e, formResult);
            });
        }
    }

    function cleanError(options) {
        $(this).data('error', '');
        $(this).removeClass(options.error_input_class).next('.' + options.error_message_class).remove();
    }

    function showError(options, fieldResult) {
        var errorEl = ['<div class="', options.error_message_class, '">', options['message' + fieldResult], '</div>'].join('');
        $(this).addClass(options.error_input_class).after(errorEl);
    }

    function expression(options) {
        return 0;
    }

    $.fn.extend({
        "validate": function (options) {
            options = $.extend({
                expression: expression,
                message1: "",
                error_input_class: "error",
                error_message_class: "valid-error",
                live: true,
                mode: 1,
                showError: showError,
                cleanError: cleanError
            }, options);

            if (typeof options.expression === 'string') {
                options.expression = new Function(options.expression);
            }

            if (options.live) {
                if (options.mode === 3) {
                    this.on('change', options, validateField);
                } else {
                    this.on('blur', options, validateField);
                }
            }
            this.on('focus', options, function (e) {
                var options = e.data;
                options.cleanError.call(this, options);
            });
            this.on('validate', options, validateField);
            this.attr('__validate', '');
        },
        "validated": function (onSuccess, onError) {
            var formResult = {
                all: this.find('[__validate]').length,
                count: 0,
                passed: 0,
                onSuccess: onSuccess,
                onError: onError
            }
            this.find('[__validate]').trigger('validate', formResult);
        }
    });
})(jQuery);