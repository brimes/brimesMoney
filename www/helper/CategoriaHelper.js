CategoriaHelper = {
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

