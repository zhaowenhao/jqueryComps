/**
 * jquery pagination 组件
 *
 * @file jquery.pagination.js
 * @version 1.0.0
 * @license MIT
 * @author zhaowenhao
 *
 */
; (function ($) {
    function render(pageContainer, pages) {
        var html = pages.map(function (page) {
            if (page === 'prev') {
                return '<li class="pagination-list-item"><button class="pagination-prev">&lt;</button></li>';
            } else if (page === 'next') {
                return '<li class="pagination-list-item"><button class="pagination-next">&gt;</button></li>';
            } else if (page === '.') {
                return '<li class="pagination-list-item"><div>...</div></li>';
            } else if (/-active/.test(page)) {
                return '<li class="pagination-list-item active"><a>' + page.replace(/-active/, '') + '</a></li>';
            } else {
                return '<li class="pagination-list-item"><a>' + page + '</a></li>';
            }
        }).join('');
        $(pageContainer).html(html);
    }

    function getTotalPage(pageSize, total) {
        if (total % pageSize > 0) {
            return Math.floor(total / pageSize) + 1;
        }
        return total / pageSize;
    }

    function getPages(pageNo, totalPage) {
        pageNo = parseInt(pageNo);
        totalPage = parseInt(totalPage);
        if (pageNo > totalPage) {
            pageNo = totalPage;
        }
        var pages = [];
        if (pageNo > 1) {
            pages.push('prev');
        }

        var p = [pageNo - 2, pageNo - 1, pageNo, pageNo + 1, pageNo + 2];
        var s = [1, 2, 3, 4, 5];
        var t = [totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage];
        if (p[0] >= 4) {
            s = [1, '.'];
        }
        if (p[4] <= totalPage - 3) {
            t = ['.', totalPage];
        }

        pages = pages.concat(s).concat(p).concat(t);

        var tmp = 0;
        pages = pages.filter(function (page) {
            if (typeof page === 'number') {
                if (page < 1 || page > totalPage) {
                    return false;
                }
                if (page <= tmp) {
                    return false;
                }
                tmp = page;
            }
            return true;
        });

        if (pageNo < totalPage) {
            pages.push('next');
        }

        pages = pages.map(function (page) {
            if (page === pageNo) {
                return page + '-active';
            }
            return page + '';
        })

        return pages;
    }

    function initPage() {
        var arr = [
            '<div class="pagination clearfix">',
            '   <input type="hidden" class="pagination-size" value="15"/>',
            '   <div class="pagination-total">',
            '       <span></span>',
            '   </div>',
            '   <ul class="pagination-list clearfix">',
            '   </ul>',
            '   <div class="pagination-jumper">',
            '       <span>跳转至</span><input class="pagination-jumper-input" type="text" value=""/><span>页</span>',
            '       <button class="pagination-jumper-btn">GO</button>',
            '   </div>',
            '</div>',
        ];
        return arr.join('');
    }

    $.fn.extend({
        "pagination": function (options) {
            var pageNo = options.pageNo;
            var total = options.totalCount;
            var pageSize = options.pageSize;
            var onChange = options.onChange;
            if (+total <= +pageSize) {//只有一页时不显示分页
                return;
            }
            var hasInit = $(this).find('.pagination-list').length > 0;
            if (hasInit) {
                if (!total) {
                    total = +$(this).find('.pagination-total span').text();
                } else {
                    $(this).find('.pagination-total span').text(total);
                }
                if (!pageSize) {
                    pageSize = +$(this).find('.pagination-size').val();
                }
                render($(this).find('.pagination-list'), getPages(pageNo, getTotalPage(pageSize, total)));
                return;
            }
            onChange = onChange || function () { };
            pageSize = pageSize || 15;

            $(this).html(initPage());
            $(this).find('.pagination-total span').text(total);
            $(this).find('.pagination-size').val(pageSize);
            render($(this).find('.pagination-list'), getPages(pageNo, getTotalPage(pageSize, total)));

            $(this).on('click', '.pagination-list-item a', function () {
                if (!$(this).parent().hasClass('active')) {
                    var pageNo = $(this).text();
                    render($(this).parent().parent(), getPages(pageNo, getTotalPage(pageSize, total)));
                    onChange(+pageNo);
                }
            });
            $(this).on('click', '.pagination-list-item .pagination-prev', function () {
                var pageNo = $(this).parent().siblings('.active').children('a').text();
                --pageNo;
                render($(this).parent().parent(), getPages(pageNo, getTotalPage(pageSize, total)));
                onChange(pageNo);
            });
            $(this).on('click', '.pagination-list-item .pagination-next', function () {
                var pageNo = $(this).parent().siblings('.active').children('a').text();
                ++pageNo;
                render($(this).parent().parent(), getPages(pageNo, getTotalPage(pageSize, total)));
                onChange(pageNo);
            });
            $(this).on('click', '.pagination-jumper button', function () {
                var pageNo = $(this).siblings('.pagination-jumper-input').val();
                if (/^[1-9]\d*$/.test(pageNo)) {
                    var totalPage = getTotalPage(pageSize, total);
                    if (+pageNo > totalPage) {
                        pageNo = totalPage;
                        $(this).siblings('.pagination-jumper-input').val(pageNo);
                    }
                    render($(this).parent().siblings('.pagination-list'), getPages(pageNo, totalPage));
                    onChange(+pageNo);
                }
            });
            $(this).find('.pagination-jumper .pagination-jumper-input').keydown(function (e) {
                if (e.keyCode === 13) {
                    var pageNo = $(this).val();
                    if (/^[1-9]\d*$/.test(pageNo)) {
                        var totalPage = getTotalPage(pageSize, total);
                        if (+pageNo > totalPage) {
                            pageNo = totalPage;
                            $(this).val(pageNo);
                        }
                        render($(this).parent().siblings('.pagination-list'), getPages(pageNo, totalPage));
                        onChange(+pageNo);
                    }
                }
            })
        }
    });
})(jQuery);