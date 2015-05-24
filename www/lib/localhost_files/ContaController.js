ContaController = function() {
    this.params = '';
    this.actionIndex = function(param) {
        var oThis = this;
        if (typeof param.filtro == "undefined") {
            var filtro = "";
        } else {
            var filtro = param.filtro;
        }
        App.changeView('index', 'Contas', function() {
            $('#btnNovaConta').click(function() {
                App.execute('conta/detalhesConta?id=0');
            });
            $('#btnTodasAsContas').click(function () {
                App.execute('conta/index?filtro=all');
            });
            oThis.carregaContas(filtro);
        });
    };

    this.actionDetalhesConta = function(params) {
        var oThis = this;
        var tituloPagina = 'Detalhes da conta';
        if (params.id == 0) {
            tituloPagina = 'Nova conta';
        }
        App.changeView('dados_conta', tituloPagina, function() {
            $(".btn_tipo").click(function() {
                $(".btn_tipo").removeClass("selecionado");
                $(this).addClass("selecionado");
                if ($(this).attr("tipo") == "1") {
                    $('#dadosCredito').show();
                } else {
                    $('#dadosCredito').hide();
                }
            });
            $('#idConta').val(params.id);
            if (params.id != 0) {
                oThis.carregaDetalhesConta(params.id);
            }
            $('#btnVoltar').click(function () {
                App.execute('conta/index');
            })
            $("#btnSalvar").click(function() {
                if (!Util.validaCamposObrigatorios()) {
                    return false;
                }
                if (typeof $(".tipo_conta > .selecionado").attr("tipo") == 'undefined') {
                    alert("Selecione um tipo de conta");
                    return false;
                }
                var tipoConta = $(".tipo_conta > .selecionado").attr("tipo");

                var oConta = new Conta();
                if ($('#idConta').val() != 0) {
                    oConta.id = $('#idConta').val();
                    oConta.isNewRecord = false;
                } else {
                    oConta.saldo = $('#saldoInicial').val();
                }
                oConta.descricao = $('#descricaoConta').val();
                oConta.saldo_inicial = $('#saldoInicial').val();
                oConta.status = $('#contaDesativada').is(':checked') ? Conta.STATUS_DESATIVADA : Conta.STATUS_ATIVA;
                oConta.tipo = tipoConta;
                oConta.dia_vencimento = $('#diaVencimento').val();
                if (tipoConta == Conta.TIPO_CREDITO) {
                    oConta.limite = $('#limiteCredito').val();
                }
                oConta.save(function() {
                    App.execute("conta/index");
                }, function() {
                    alert("Erro ao salvar conta.");
                });
            });
        });
    };

    this.carregaContas = function(filtro) {
        var oContas = new Conta();
        var where = "status is not " + Conta.STATUS_DESATIVADA + "";
        if (filtro == 'all') {
            where = "id>0"
        }
        oContas.findAll(where, function(oContas) {
            $('#listaContas').html(ContaHelper.tiposContas());
            ContaHelper.saldoTotalBanco = 0;
            ContaHelper.saldoTotalCartao = 0;
            for (var i in oContas) {
                var oConta = oContas[i];
                
                if (oConta.tipo == Conta.TIPO_DEBITO) {
                    var target = '#labelContasBanco';
                } else {
                    var target = '#labelContasCartao';
                }
                $(ContaHelper.showLinhaConta(oConta)).insertAfter(target);
                ContaHelper.renderSaldo(oConta, 'saldo_conta');
            }

            $('.linhaConta').click(function() {
                App.execute('transacao/index?idConta=' + $(this).attr('id_conta'));
            });
            $('.btnEditar').click(function() {
                App.execute('conta/detalhesConta?id=' + $(this).parent().parent().attr('id_conta'));
            });
        });
    };

    this.carregaDetalhesConta = function(idConta) {
        var oConta = new Conta();
        oConta.findById(idConta, function(oConta) {
            $('#descricaoConta').val(oConta.descricao);
            $('#saldoInicial').val(oConta.saldo_inicial);
            $('#diaVencimento').val(oConta.dia_vencimento);
            $('#limiteCredito').val(oConta.limite);
            if (oConta.status == Conta.STATUS_DESATIVADA) {
                $('#contaDesativada').attr('checked', 'checked');
            }
            $(".btn_tipo").each(function() {
                if ($(this).attr('tipo') == oConta.tipo) {
                    $(this).addClass("selecionado");
                }
            });
            if (oConta.tipo == Conta.TIPO_CREDITO) {
                $('#dadosCredito').show();
            } else {
                $('#dadosCredito').hide();
            }
        });
    };

};