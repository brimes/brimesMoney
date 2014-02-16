ContaHelper = {
    saldoTotalBanco: 0,
    saldoTotalCartao: 0,
    campoContas: function(element, idConta) {
        if (typeof idConta == 'undefined') {
            idConta = 0;
        }
        new Conta().findAll("status is not " + Conta.STATUS_DESATIVADA, function(oContas) {
            var strPanelContas = "<div class='panel panel-default'>";
            strPanelContas += "<div class='panel-heading'>Conta</div>";
            strPanelContas += '<ul class="list-group" id="linhasContas">';
            for (var i in oContas) {
                var oConta = oContas[i];
                var selecionado = (oConta.id == idConta);
                strPanelContas += ContaHelper.showLinhaContaLi(oConta, selecionado);
            }
            strPanelContas += '</ul></div>';
            $(element).html(strPanelContas);
            $(element).find('li').click(function() {
                var escondidos = $(this).hasClass('escondidos');
                $(this).parent().children('li').each(function() {
                    $(this).removeClass('selecionado');
                    if (escondidos) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
                $(this).toggleClass('escondidos')
                $(this).addClass('selecionado');
                $(this).show();
            });
        });
    },
    tiposContas: function() {
        return "<li class='list-group-item bg-info' id='labelContasBanco'>Contas de banco<span class='pull-right' id='saldoTotalBanco'>0,00</span></li>"
                + "<li class='list-group-item bg-info' id='labelContasCartao'>Cartão de crédito<span class='pull-right' id='saldoTotalCartao'>0,00</span></li>";
    },
    showLinhaConta: function(dadosConta) {
        var htmlRet = "";
        htmlRet += "<li class='list-group-item item-lg linhaConta' id_conta='" + dadosConta.id + "'>"
                + "   <span class='pull-left'><span class=\"glyphicon glyphicon-edit btnTable btnEditar\"></span></span>"
                + "   <span class='infoConta pull-left'>" 
                + "    " + dadosConta.descricao + "<br/>"
                + "    <span id='saldo_conta" + dadosConta.id + "'></span>" 
                + "   </span>"
                + " </li>";
        return htmlRet;
    },
    renderSaldo: function(oConta, elementArray) {
        var oThis = this;
        oConta.getSaldoFinalDoMes(function(saldo) {
            $('#' + elementArray + "" + oConta.id + "").html(UtilHelper.toValorDestaque(saldo));
            if (oConta.tipo == Conta.TIPO_DEBITO) {
                oThis.saldoTotalBanco += parseFloat(saldo);
                $('#saldoTotalBanco').html(UtilHelper.toValorDestaque(oThis.saldoTotalBanco));
            } else {
                oThis.saldoTotalCartao += parseFloat(saldo);
                $('#saldoTotalCartao').html(UtilHelper.toValorDestaque(oThis.saldoTotalCartao));
            }
        });
    },
    showLinhaContaLi: function(dadosConta, isSelected) {
        var htmlRet = "";
        var selected = "";
        if (typeof isSelected != 'undefined' && isSelected == true) {
            selected = "selecionado";
        }
        htmlRet += "<li class='list-group-item " + selected + "' id_conta='" + dadosConta.id + "'><span class='infoConta'>" + dadosConta.descricao + "<span class='pull-right'>" + UtilHelper.toValor(dadosConta.saldo) + "</span></span></li>";
        return htmlRet;
    },
    showLiTransacao: function(dadosTransacao) {
        var htmlRet = "";
        var dataExtenso = App.dataPorExtenso(dadosTransacao.DATA);
        var destaque = (dadosTransacao.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        var dadosParcela = "";
        if (parseInt(dadosTransacao.TOTAL_PARCELAS) > 1) {
            dadosParcela = " - " + dadosTransacao.PARCELA + "/" + dadosTransacao.TOTAL_PARCELAS;
        }
        htmlRet += "<li class='lista_transacao list-group-item'"
                + " id_transacao='" + dadosTransacao.ID + "'"
                + " tipo_transacao='" + dadosTransacao.TIPO + "'>"
                + "<span class='dataExtenso'>" + dataExtenso + "</span><span class='pull-right " + destaque + "'>"
                + UtilHelper.toValor(dadosTransacao.VALOR)
                + "</span><br/>" + dadosTransacao.BENEFICIARIO + dadosParcela + "</li>";
        return htmlRet;
    }
};

