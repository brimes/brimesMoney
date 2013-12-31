ContaController = function () {
    this.actionIndex = function() {
        var oThis = this;
        App.changeView('index', 'Contas', function () {
            $('#btnNovaConta').click(function () {
                App.execute('conta/detalhesConta?id=0');
            });
            oThis.carregaContas();
        });
    };
    
    this.actionDetalhesConta = function (params) {
        var oThis = this;
        var tituloPagina = 'Detalhes da conta';
        if (params.id == 0) {
            tituloPagina = 'Nova conta';
        }
        App.changeView('dados_conta', tituloPagina, function () {
            $(".btn_tipo").click(function () {
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
            $("#btnSalvar").click(function () {
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
                oConta.tipo = tipoConta;
                if (tipoConta == Conta.TIPO_CREDITO) {
                    oConta.dia_vencimento = $('#diaVencimento').val();
                    oConta.limite = $('#limiteCredito').val();
                }
                oConta.save(function () {
                    App.execute("conta/index");
                }, function () {
                   alert("Erro ao salvar conta."); 
                });
            });
        });
    };
    
    this.carregaContas = function (onSuccess) {
        var oContas = new Conta();
        oContas.findAll('id>0', function (oContas) {
            $('#listaContas').html("<tr><th>Conta</th><th>Saldo</th><tr>");
            for (var i in oContas) {
                var oConta = oContas[i];
                $('#listaContas').append(ContaHelper.showLinhaConta(oConta));
            }
            $('.linhaConta').click(function () {
               App.execute('conta/detalhesConta?id=' + $(this).attr('id_conta'));
            });
        });
    };
    
    this.carregaDetalhesConta = function (idConta) {
        var oConta = new Conta();
        oConta.findById(idConta, function (oConta) {
            $('#descricaoConta').val(oConta.descricao);
            $('#saldoInicial').val(oConta.saldo);
            $('#diaVencimento').val(oConta.dia_vencimento);
            $('#limiteCredito').val(oConta.limite);
            $(".btn_tipo").each(function () {
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