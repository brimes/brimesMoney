ContaController = function() {
    this.idConta = '';
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
                if (tipoConta == Conta.TIPO_CREDITO) {
                    oConta.dia_vencimento = $('#diaVencimento').val();
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

    this.actionTransacoes = function(params) {
        var oThis = this;
        this.idConta = params.idConta;
        App.changeView('transacoes', 'Transações', function() {
            App.addMenuExtra({
                idElement: 'btnMarkTransacao', 
                classBtn: 'glyphicon-ok'
            });
            App.addMenuExtra({
                idElement: 'btnFiltro', 
                classBtn: 'glyphicon-filter',
                tipo: 'menu',
                label: 'Filtro'
            });
            App.addMenuExtra({
                idElement: 'btnTodas', 
                classBtn: 'glyphicon-asterisk',
                tipo: 'menu',
                label: 'Mostrar todas'
            });
            
            $('#btnTodas').click(function () {
                App.toggleMenu();
                oThis.carregaTransacoes(oThis.idConta);
            });
            
            $('#btnMarkTransacao').click(function () {
                oThis.habilitaMarcarTransacoes();
            });
            oThis.carregaTransacoes(params.idConta, {
                status: "0, 1" 
            });
            oThis.atualizaSaldo(params.idConta);
        });

    };
    
    this.habilitaMarcarTransacoes = function (idConta) {
        var oThis = this;
        $('#barraFixa').html('Total selecionado: <span id="totalSelecionado"></span>');
        $('#transacoes').addClass('editar');
        $('#btnMarkTransacao').fadeOut();
        $('#btn_fixos').fadeOut(500, function () {
            App.addMenuExtra({
                idElement: 'btnMostrarPrincipais', 
                classBtn: 'glyphicon-chevron-left', 
                extraClass: 'btn_opcoes_tran'
            });
            App.addMenuExtra({
                idElement: 'btnMarcarComoAberto', 
                classBtn: 'glyphicon-unchecked', 
                extraClass: 'btn_opcoes_tran', 
                extraAttr: 'status="' + Transacao.STATUS_ABERTO + '"'
            });
            App.addMenuExtra({
                idElement: 'btnMarcarComoAnalise', 
                classBtn: 'glyphicon-edit', 
                extraClass: 'btn_opcoes_tran', 
                extraAttr: 'status="' + Transacao.STATUS_ANALISE + '"'
            });
            App.addMenuExtra({
                idElement: 'btnMarcarComoFechado', 
                classBtn: 'glyphicon-check', 
                extraClass: 'btn_opcoes_tran', 
                extraAttr: 'status="' + Transacao.STATUS_FECHADO + '"'
            });
            $('.btn_opcoes_tran').click(function () {
                if ($(this).attr('id') == 'btnMostrarPrincipais') {
                    oThis.voltarOpcoesGerais();
                } else {
                    var idsAtualizar = "";
                    $('.icone_transacao').each(function () {
                        if ($(this).is(':visible')) {
                            var idTrn = $(this).parent().parent().parent().parent().attr('id_transacao');
                            if (idsAtualizar != "")
                                idsAtualizar += ',';
                            idsAtualizar += idTrn;
                        }
                    });
                    if (idsAtualizar == '') {
                        alert('Nenhuma transação selecionada.'); 
                        return true;
                    }
                    var oTrans = new Transacao();
                    oTrans.status = $(this).attr('status');
                    oTrans.updateAll('id in (' + idsAtualizar + ')', function () {
                        App.toastMessage('Transacoes atualizadas.');
                        oThis.voltarOpcoesGerais();
                    });
                }
            });
        });
        
    };
    
    this.voltarOpcoesGerais = function () {
        $('#barraFixa').html('');
        $('.icone_transacao').hide();
        $('#transacoes').removeClass('editar');
        $('#btn_fixos').show();
        $('#btnMarkTransacao').show();
        $('.btn_opcoes_tran').remove();
        this.carregaTransacoes(this.idConta, {
            status: '0,1'
        });
    };

    this.atualizaSaldo = function(idConta) {
        var oConta = new Conta();
        oConta.findById(idConta, function(oConta) {
            $('#saldo').html(UtilHelper.toValor(oConta.saldo));
        });
    };

    this.carregaTransacoes = function(idConta, jParams) {
        if (typeof jParams == 'undefined') {
            jParams = {};
        }
        var filtro = 'id_conta = ' + idConta + ' ';
        if ((typeof jParams.status != 'undefined') && jParams.status != '') {
            filtro += "AND status in (" + jParams.status + ") ";
        }
        
        Transacao.buscaTransacoes(filtro, function(oTransacoes) {
            $('#transacoes').html('');
            for (var i in oTransacoes) {
                var oTransacao = oTransacoes[i];
                $('#transacoes').append(ContaHelper.showLiTransacao(oTransacao));
            }
            $('.lista_transacao').click(function() {
                if ($(this).parent().hasClass('editar')) {
                    var tipoTrn = $(this).attr('tipo_transacao');;
                    var valTransacao = parseFloat($(this).attr('valor_transacao'));
                    if (tipoTrn == Transacao.DEBITO) {
                        valTransacao = parseFloat(valTransacao) * -1;
                    }
                    var valorAtu = (typeof $('#totalSelecionado').attr('valor_trn') != 'undefined') ? 
                    $('#totalSelecionado').attr('valor_trn') : 0;
                    if ($(this).find('.icone_transacao').is(':visible')) {
                        valorAtu = parseFloat(valorAtu) - parseFloat(valTransacao);
                    } else {
                        valorAtu = parseFloat(valorAtu) + parseFloat(valTransacao);
                    }
                    $('#totalSelecionado').attr('valor_trn', valorAtu);
                    $('#totalSelecionado').html(UtilHelper.toValorDestaque(valorAtu));
                    $(this).find('.icone_transacao').toggle();
                } else {
                    App.execute('app/transacao?tipo=' + $(this).attr('tipo_transacao') + '&id=' + $(this).attr('id_transacao'));
                }
            });
            $(window).scrollTop($(document).height());
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
                App.execute('conta/transacoes?idConta=' + $(this).attr('id_conta'));
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