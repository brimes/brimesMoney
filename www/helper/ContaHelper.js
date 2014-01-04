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
        htmlRet += "<td><span class='pull-right'>" + UtilHelper.toValor(dadosConta.saldo) + "</span></td>";
        htmlRet += "<td><span class=\"glyphicon glyphicon-edit btnTable btnEditar\"></span></td>";
        htmlRet += "</tr>";
        return htmlRet;
    },
    showLinhaContaLi: function(dadosConta) {
        var htmlRet = "";
        htmlRet += "<li id_conta='" + dadosConta.id + "'><a href='#'>" + dadosConta.descricao + "<span class='pull-right'>" + UtilHelper.toValor(dadosConta.saldo) + "</span></a></li>";
        return htmlRet;
    },
    showLiTransacao: function(dadosTransacao) {
        var htmlRet = "";
        var aData = dadosTransacao.DATA + "";
        aData = aData.split('-');
        var dataResumida = aData[2] + '/' + aData[1];
        var destaque = (dadosTransacao.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        console.log(aData);
        htmlRet += "<li class='lista_transacao' id_transacao='" + dadosTransacao.ID + "'>" + dataResumida + "<span class='pull-right " + destaque + "'>" + UtilHelper.toValor(dadosTransacao.VALOR) + "</span><br/>" + dadosTransacao.BENEFICIARIO + "</li>";
        return htmlRet;
    }
};

