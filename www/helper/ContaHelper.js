ContaHelper = {
    campoContas: function(element) {
        var oContas = new Conta();
        oContas.findAll('id>0', function(oContas) {
            var strPanelContas = "<div class='panel panel-default'>";
            strPanelContas += "<div class='panel-heading'>Conta</div>";
            strPanelContas += '<ul class="list-group" id="linhasContas">';
            for (var i in oContas) {
                var oConta = oContas[i];
                strPanelContas += ContaHelper.showLinhaContaLi(oConta);
            }
            strPanelContas += '</ul></div>';
            $(element).html(strPanelContas);
            $(element).find('li').click(function() {
                $(this).parent().children('li').each(function() {
                    $(this).removeClass('selecionado');
                });
                $(this).addClass('selecionado');
            });
        });
    },
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
        htmlRet += "<li class='list-group-item' id_conta='" + dadosConta.id + "'><span class='infoConta'>" + dadosConta.descricao + "<span class='pull-right'>" + UtilHelper.toValor(dadosConta.saldo) + "</span></span></li>";
        return htmlRet;
    },
    showLiTransacao: function(dadosTransacao) {
        var htmlRet = "";
        var dataExtenso = App.dataPorExtenso(dadosTransacao.DATA);
        var destaque = (dadosTransacao.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        htmlRet += "<li class='lista_transacao list-group-item' id_transacao='" + dadosTransacao.ID + "'><span class='dataExtenso'>" + dataExtenso + "</span><span class='pull-right " + destaque + "'>" + UtilHelper.toValor(dadosTransacao.VALOR) + "</span><br/>" + dadosTransacao.BENEFICIARIO + "</li>";
        return htmlRet;
    }
};

