(function() {
    YAHOO.lang.CONST = {
        // Events - first-cap only for easy distinction
        BeforeDestroy:       'beforeDestroy',
        BeforeInit:          'beforeInit',
        Click:               'click',
        Destroy:             'destroy',
        Init:                'init',
        BeforeRender:        'beforeRender',
        Render:              'render',

        // Other strings
        CHILDREN:            'children',
        CHILD_NODES:         'childNodes',
        DIV:                 'div',
        ELEMENT:             'element',
        ID:                  'id',
        NODE:                'node',
        PARENT_NODE:         'parentNode',
        PREFIX:              'yui-',
        TAG_NAME:            'tagName',
        WIDTH:               'width'
    };

    var C = YAHOO.lang.CONST;

    YAHOO.lang.CONST.CLASSES = {
        HIDDEN: C.PREFIX + "hidden",
        DISABLED: C.PREFIX + "disabled"
    };
})();