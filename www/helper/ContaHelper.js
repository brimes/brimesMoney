ContaHelper = {
    showLinhaConta: function(dadosConta) {
        var htmlRet = "";
        htmlRet += "<tr class='linhaConta' id_conta='" + dadosConta.id + "'>";
        if (dadosConta.tipo == Conta.TIPO_CREDITO) {
            htmlRet += "<td class='credito'>C</td>";
        } else {
            htmlRet += "<td class='debito'>D</td>";
        }
        htmlRet += "<td>" + dadosConta.descricao + "</td>";
        htmlRet += "<td>" + dadosConta.saldo + "</td>";
        htmlRet += "<td><span class=\"glyphicon glyphicon-edit btnTable btnEditar\"></span></td>";
        htmlRet += "</tr>";
        return htmlRet;
    },
    showLinhaContaLi: function(dadosConta) {
        var htmlRet = "";
        htmlRet += "<li id_conta='" + dadosConta.id + "'><a href='#'>" + dadosConta.descricao + "<span class='pull-right'>" + dadosConta.saldo + "</span></a></li>";
        return htmlRet;
    }
};

