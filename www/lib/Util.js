String.prototype.capitalize = function() {
    return this.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
        return p1 + p2.toUpperCase();
    });
};

var Util = {
    dirname: function(location) {
        return location.replace(/\\/g, '/').replace(/\/[^\/]*$/, "");
    },
    validaCamposObrigatorios: function() {
        var validado = true;
        $(".obrigatorio").each(function() {
            if (!$(this).is(":visible")) {
                return true;
            }
            if ($(this).val() == "") {
                alert('O campo ' + $(this).attr('placeholder') + ' é obrigatório.')
                $(this).focus();
                validado = false;
                return false;
            }
        });
        return validado;
    }

};