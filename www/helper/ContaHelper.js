ContaHelper = {
    showLinhaConta: function(dadosConta) {
        var htmlRet = "";
        htmlRet += "<tr class='linhaConta' id_conta='" + dadosConta.id + "'>";
        htmlRet += "<td>" + dadosConta.descricao + "</td>";
        htmlRet += "<td>" + dadosConta.saldo + "</td>";
        htmlRet += "</tr>";
        return htmlRet;
    },
    showLinhaContaLi: function(dadosConta) {
        var htmlRet = "";
        htmlRet += "<li id_conta='" + dadosConta.id + "'><a href='#'>" + dadosConta.descricao + "</a></li>";
        return htmlRet;
    }
};

