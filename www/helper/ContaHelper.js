ContaHelper = {
    saldoTotalBanco: 0,
    saldoTotalCartao: 0,
    campoContas: function(element, idConta, label) {
        if (typeof idConta == 'undefined') {
            idConta = 0;
        }
        if (typeof label == 'undefined') {
            label = 'Conta';
        }
        new Conta().findAll("status is not " + Conta.STATUS_DESATIVADA, function(oContas) {
            var strPanelContas = "<div class='panel panel-default'>";
            strPanelContas += "<div class='panel-heading'>" + label + "</div>";
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
        var descFinalPeriodo = "Final do mes";
        if (dadosConta.dia_vencimento) {
            var aData = App.getCurrentDate('yyyy-mm').split("-");
            var aDiaFecha = dadosConta.getDiaFechamento(aData[1], aData[0]).split("-");
            var dsMes = App.aMesesExtenso[parseInt(aDiaFecha[1]) - 1]+"";
            descFinalPeriodo = "Em " + aDiaFecha[2] + " de " + dsMes.substr(0, 3);
        } 
        var label = (dadosConta.tipo == Conta.TIPO_DEBITO) ? descFinalPeriodo : "Proxima fatura";
        htmlRet += "<li class='list-group-item item-lg linhaConta' id_conta='" + dadosConta.id + "'>"
                + "   <span class='pull-left'><span class=\"glyphicon glyphicon-edit btnTable btnEditar\"></span></span>"
                + "   <span class='infoConta pull-left'>"
                + "    " + dadosConta.descricao + "<br/>"
                + "   </span>"
                + "   <span class='pull-right'><span class='infoSmall'>" + label + "</span><br/> <span id='saldo_conta" + dadosConta.id + "'></span></span>"
                + "   <br/>"
                + "   <span><span class='infoSmall'>Total</span> <span id='saldo_conta_total" + dadosConta.id + "'></span></span>"
                + " </li>";
        return htmlRet;
    },
    renderSaldo: function(oConta, elementArray) {
        var oThis = this;
        oConta.getSaldoFinalDoMes(function(saldo) {
            if (oConta.tipo == Conta.TIPO_DEBITO) {
                var diaVenc = oConta.dia_vencimento || 31;
                Recorrente.getTotalPrevistoMes(oConta.id, function(totalPrevisto) {
                    Categoria.getSaldoDisponivel({
                        id_conta: oConta.id
                    }, function (saldoCategoria) {
                        saldoCategoria = saldoCategoria || 0;
                        if (saldoCategoria < 0) {
                            saldoCategoria = 0;
                        }
                        
                        var saldoFinal = (parseFloat(saldo) + parseFloat(totalPrevisto) - saldoCategoria);
                        $('#' + elementArray + "" + oConta.id + "").html(UtilHelper.toValorDestaque(saldoFinal));
                        $('#' + elementArray + "_total" + oConta.id + "").html(UtilHelper.toValorDestaque(saldo));
                        oThis.saldoTotalBanco += saldoFinal;
                        $('#saldoTotalBanco').html(UtilHelper.toValorDestaque(oThis.saldoTotalBanco));
                    });
                }, diaVenc);
            } else {
                $('#' + elementArray + "" + oConta.id + "").html(UtilHelper.toValorDestaque(saldo));
                $('#' + elementArray + "_total" + oConta.id + "").html(UtilHelper.toValorDestaque(saldo));
                oThis.saldoTotalCartao += saldo;
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
    showLiTransacao: function(dadosTransacao, exibeConta) {
        var htmlRet = "";
        var dataExtenso = App.dataPorExtenso(dadosTransacao.DATA);
        var destaque = (dadosTransacao.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        var dadosParcela = "";
        var classDestaque = "status_" + dadosTransacao.STATUS;
        var descConta = "";
        var classSync = (dadosTransacao.SINCRONIZADO == 1) ? "hide" : "red";
        if ((typeof exibeConta != 'undefined') && exibeConta) {
            descConta = dadosTransacao.CONTA + ': ';
        }
        if (dadosTransacao.DATA > App.getCurrentDate()) {
            classDestaque = 'transacao_futura';
        }
        if (parseInt(dadosTransacao.TOTAL_PARCELAS) > 1) {
            dadosParcela = " - " + dadosTransacao.PARCELA + "/" + dadosTransacao.TOTAL_PARCELAS;
        }
        htmlRet += "<li class='lista_transacao list-group-item " + classDestaque + "'"
                + " id_transacao='" + dadosTransacao.ID + "'"
                + " valor_transacao='" + dadosTransacao.VALOR + "'"
                + " tipo_transacao='" + dadosTransacao.TIPO + "'>"
                + "<table class='table-100'>"
                + "  <tr>"
                + "  <td class='icone_transacao' style='display:none'>"
                + "    <span class='glyphicon glyphicon-ok'></span>"
                + "  </td>"
                + "  <td class=''>"
                + "    <span class='glyphicon glyphicon-upload icon-small " + classSync + "'></span>"
                + "    <span class='dataExtenso'>" + descConta + dataExtenso + "</span>"
                + "    <span class='pull-right " + destaque + "'>" + UtilHelper.toValor(dadosTransacao.VALOR) + "</span><br/>"
                + "    <span class='desc_beneficiario'>" + dadosTransacao.BENEFICIARIO + dadosParcela + "</span>"
                + "    <span class='pull-right saldo_em_transacao'>" + UtilHelper.toValorDestaque(dadosTransacao.SALDO_ACUMULADO) + "</span>"
                + "  </td>"
                + "  </tr>"
                + "</table>"
                + "</li>";
        return htmlRet;
    }
};

