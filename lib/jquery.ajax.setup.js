/**
 * jquery ajax setup
 *
 * @file jquery.ajax.setup.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
;(function ($) {
    //请求队列
    var requestQueue = [];
    //错误信息
    var ERR_MSG = {
        "400": "请求参数错误！",
        "403": "您没有权限！",
        "404": "数据不存在！",
        "409": "数据冲突，刷新后重试！",
        "500": "程序异常，请稍候重试！",
        "error": "程序异常，请稍候重试！"
    }
    //错误日志输出
    var errLog = (console && console.error) ? console.error.bind(console) : function() {}
    
    /**
     * 处理“加载中“的显示，延时出现（请求特别快时没有必要出现”加载中“）和消失
     */
    var errorIsShow = false;
    var loadingIdx = -1;
    var timeoutClose = null;
    var requestingList = [];

    function createLoading(url) {
        requestingList.push(url);
        var timeoutShow = null;
        if (loadingIdx < 0) {
            timeoutShow = setTimeout(function () {
                if (requestingList.length > 0 && loadingIdx < 0) {
                    loadingIdx = layer.load(2, {
                        shade: [0.1,'#333'] //0.1透明度的灰色背景
                    });
                }
            }, 200);
        }
        if (timeoutClose) {
            clearTimeout(timeoutClose);
            timeoutClose = null;
        }
        return function () {
            if (timeoutShow) {
                clearTimeout(timeoutShow);
                timeoutShow = null;
            }
            if (requestingList.indexOf(url) > -1) {
                requestingList.splice(requestingList.indexOf(url), 1);
            }
            if (requestingList.length === 0) {
                timeoutClose = setTimeout(function () {
                    if (requestingList.length === 0 && loadingIdx >= 0) {
                        layer.close(loadingIdx);
                        loadingIdx = -1;
                    }
                }, 200);
            }
        }
    }

    function isSameObj(o1, o2) {
        if (o1 == o2) {
            return true;
        }
        if (!o1 || !o2) {
            return false;
        }
        for (var key in o1) {
            if (o1.hasOwnProperty(key)) {
                var v1 = o1[key];
                var v2 = o2[key];
                if (v1 !== v2) {
                    if (/Array/i.test(Object.prototype.toString.call(v1))) {
                        if (/Array/i.test(Object.prototype.toString.call(v2))) {
                            if (v1.length !== v2.length) {
                                return false;
                            } else {
                                for (var i = 0; i < v1.length; i++) {
                                    if (v1[i] !== v2[i]) {
                                        return false;
                                    }
                                }
                            }
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * 查找对应的request的下标
     */
    function getRequestIndex(url, body, method) {
        var index = -1;
        requestQueue.some(function(req, idx) {
            if (req.url === url && isSameObj(req.body, body) && req.method === method) {
                index = idx;
                return true;
            }
            return false;
        })
        return index;
    }
    /**
     * 弹出对应的request，并返回该request
     */
    function popRequest(url, body, method) {
        var index = getRequestIndex(url, body, method);
        if (method === 'get') {
            return index > -1 ? requestQueue.splice(index, 1)[0] : null;
        } else {
            setTimeout(function() {
                //延迟300ms清除请求
                var idx = getRequestIndex(url, body, method);
                if (idx > -1) {
                    requestQueue.splice(idx, 1);
                }
            }, 300);
            return index > -1 ? requestQueue[index] : null;
        }
    }
    /**
     * 根据method和url等参数创建一个http
     */
    function createHttp(url, body, method, resolve, reject, noloading) {
        var index = getRequestIndex(url, body, method);
        if (index > -1) {
            var request = requestQueue[index];
            if (method === 'get') {
                //get请求合并
                request.handlers.push({
                    resolve: resolve,
                    reject: reject
                })
            } else {
                //其他请求直接reject
                if (reject) {
                    reject({
                        error: {
                            code: "REPEAT_REQUEST",
                            message: "重复请求"
                        }
                    })
                }
            }
        } else {
            requestQueue.push({
                url: url,
                body: body,
                method: method,
                noloading: noloading,
                handlers: [{
                    resolve: resolve,
                    reject: reject
                }]
            });
            doRequest(url, body, method, noloading);
        }
    }

    /**
     * 执行请求
    */
    function doRequest(url, body, method, noloading) {
        var closeLoading = function() { };
        if (!noloading) {
            closeLoading = createLoading(url);
        }
        var params;
        if (method === 'get') {
            params = $.extend({}, body, {['b' + new Date().getTime()] : 1});
        } else {
            params = JSON.stringify(body);
        }
        $.ajax({
            type: method,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            data: params,
            url: url,
            success: function(data){
                closeLoading();
                var request = popRequest(url, body, method);
                if (request && request.handlers) {
                    request.handlers.forEach(function(handler) {
                        handleResult(data, 200, handler.resolve, handler.reject);
                    })
                } else {
                    errLog('HTTP REQUEST ERROR:Can not find the request or handlers');
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                closeLoading();
                var request = popRequest(url, body, method);
                if (request && request.handlers) {
                    request.handlers.forEach(function(handler) {
                        handleResult(xhr.responseText, xhr.status, handler.resolve, handler.reject);
                    })
                } else {
                    errLog('HTTP REQUEST ERROR:Can not find the request or handlers');
                }
            }
        });
    }

    /**
     * 处理请求结果
     */
    function handleResult(data, status, resolve, reject) {
        if (status === 200) {
            resolve(data);
        } else if (status === 401) {
            showError('登录已失效，请刷新后重新登录');
        } else {
            var errObj = {
                status: status,
                response: data
            };
            if (reject) {
                reject(errObj);
            } else {
                var msg = ERR_MSG[status + ''] || ERR_MSG['error'];
                showError(msg);
            }
        }
    }

    function showError(message) {
        layer.alert(message);
    }

    $.each(['get', 'post', 'delete', 'put'], function(i, method) {
        $[method] = function(url) {
            var resolve, reject, params = {}, noloading;
            for(var i = 1; i < arguments.length; i++) {
                var arg = arguments[i];
                if (typeof arg === 'function') {
                    if (!resolve) {
                        resolve = arg;
                    } else {
                        reject = arg;
                    }
                } else if (typeof arg === 'object') {
                    params = arg;
                } else if (typeof arg === 'boolean') {
                    noloading = arg;
                }
            }
            resolve = resolve || function() {};
            createHttp(url, params, method, resolve, reject, noloading)
        }
    });
})(jQuery);

