CategoriaHelper = {
    carregaCategorias: function(element, filtro, onSuccess) {
        var oCategoria = new Categoria();
        if (filtro != '') {
            filtro = "descricao like '%" + filtro + "%'";
        }
        oCategoria.buscaPorRelevancia(filtro, function(arrayCategorias) {
            $(element).html('');
            $(element).show();
            for (var i in arrayCategorias) {
                var oResult = arrayCategorias[i];
                $(element).append("<li class='list-group-item' id_categoria=\"" + oResult.ID + "\">" + oResult.DESCRICAO + "</li>")
            }
            if (typeof onSuccess != 'undefined') {
                onSuccess();
            }
            
        });
    },
    showCategoriaTr: function(dadosCategoria) {
        var htmlRet = "";
        htmlRet += "<tr class='linhaCategoria' id_categoria='" + dadosCategoria.id + "'>";
        htmlRet += "<td>" + dadosCategoria.descricao + "</td>";
        htmlRet += "<td><span class='pull-right'>" + UtilHelper.toValor(dadosCategoria.planejado) + "</span></td>";
        htmlRet += "<td><span class='pull-right' id='disponivel_" + dadosCategoria.id + "'></span></td>";
        htmlRet += "</tr>";
        return htmlRet;
    },
};

