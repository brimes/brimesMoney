String.prototype.capitalize = function() {
    return this.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
        return p1 + p2.toUpperCase();
    });
};

var Util = {
    dirname: function(location) {
        return location.replace(/\\/g, '/').replace(/\/[^\/]*$/, "");
    }
};