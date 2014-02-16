AppController = function() {
    this.actionIndex = function() {
        if (App.getConfig("versao_atual") != App.getVersao()) {
            dbSQL.migrate(function() {
                alert('migrate OK');
                App.setConfig("versao_atual", App.getVersao());
                App.execute('app/index');
            });
        }

        Conta.getTotaldeContas(function(totalContas) {
            if (totalContas > 0) {
                if (App.getConfig('ultima_action') == "") {
                    App.execute("conta/index");
                } else {
                    App.execute(App.getConfig('ultima_action'));
                }
            } else {
                App.execute('conta/detalhesConta?id=0');
            }
        });
    };

    this.actionTransacao = function(param) {
        var oThis = this;
        var tituloPagina = '<span class=\"glyphicon glyphicon-circle-arrow-down red\"></span> Despesa';
        if (param.tipo == Transacao.CREDITO) {
            tituloPagina = '<span class=\"glyphicon glyphicon-circle-arrow-up blue\"></span> Receita';
        }
        App.changeView('index', tituloPagina, function() {
            $('#dataTransacao, #dataPagamento').datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                todayBtn: true,
                todayHighlight: true
            });
            $('#dataTransacao, #dataPagamento').attr("readonly", "readonly");
            if (typeof param.id == 'undefined' || param.id == "0") {
                $('#dataTransacao').val(App.converteData(App.getCurrentDate(), 'yyyy-mm-dd', 'dd/mm/yyyy'));
                oThis.carregarBeneficiarios($('#beneficiario').val());
                oThis.carregarCategorias($('#categoria').val());
                ContaHelper.campoContas('#contas');
                $('#idTransacao').val("0");
                $('#btnApagar').hide();
                $('.opcoes_despesa').show();
                $('#btnShowAvancadas').click(function () {
                    $(this).slideUp();
                    $('#panelAvancadas').slideDown();
                    App.toToggle('.btn_tipo_parcela');
                    App.toToggle('.btn_tipo_pagamento', function (e) {
                        if ($(e).attr('tipo') == "0") {
                            $('#dadosTerceiros').show();
                        } else {
                            $('#dadosTerceiros').hide();
                        }
                    });
                });
            } else {
                $('.opcoes_despesa').hide();
                $('#idTransacao').val(param.id);
                $('#btnApagar').show();
                oThis.carregaDadosTransacao(param.id);
            }
            if (param.tipo == Transacao.CREDITO) {
                $('.opcoes_despesa').hide();
            } else {
                $('.opcoes_despesa').show();
            }
            $('#valorTransacao').focus();
            if (param.tipo == Transacao.CREDITO) {
                $('#beneficiario').attr('placeholder', 'Pagador');
            }
            $('#beneficiario').keyup(function() {
                oThis.carregarBeneficiarios($('#beneficiario').val());
            });
            $('#pagador').keyup(function() {
                oThis.carregarPagadores($('#pagador').val());
            });
            $('#categoria').keyup(function() {
                oThis.carregarCategorias($('#categoria').val());
            });
            $('#btnApagar').click(function(e) {
                if (confirm('Deseja apagar a transação')) {
                    new Transacao().findById($('#idTransacao').val(), function(oTransacao) {
                        var idConta = oTransacao.id_conta;
                        var valor = oTransacao.valor;
                        var tipo = oTransacao.tipo;
                        oTransacao.del(function() {
                            Conta.atualizaSaldo(idConta, valor, tipo, function() {
                                App.execute('conta/index');
                            });
                        });

                    });
                }
            });
            $('#btnSalvar').click(function(e) {
                e.stopPropagation();
                var podeSalvar = true;
                var tipoParcela = $('#tipo_parcelas').find('.selecionado').attr('tipo');
                if (!Util.validaCamposObrigatorios()) {
                    return false;
                }
                if (typeof $('#contas').find('.selecionado').attr('id_conta') == 'undefined') {
                    alert('Selecione a conta.');
                    podeSalvar = false;
                }
                if (!podeSalvar) {
                    return true;
                }
                $(this).attr("disabled", "disabled");
                Transacao.adicionaTransacao({
                    id: $('#idTransacao').val(),
                    data: $('#dataTransacao').val(),
                    valor: $('#valorTransacao').val(),
                    baneficiario: $('#beneficiario').val().trim(),
                    categoria: $('#categoria').val().trim(),
                    tipo: param.tipo,
                    conta: $('#contas').find('.selecionado').attr('id_conta'),
                    nrParcelas: $('#totalPercelas').val(),
                    tipoParcelamento: tipoParcela
                }, function() {
                    App.execute('conta/index');
                });
            });
        });
    };

    // Funções privadas - Utilizada somente nesse controller (pelo menos deveria)
    this.carregarBeneficiarios = function(filtro) {
        var oThis = this;
        BeneficiarioHelper.carregaBeneficiarios('#listaBeneficiarios', filtro, function() {
            $('#listaBeneficiarios li').click(function() {
                var oCategoria = new Categoria();
                oCategoria.findById($(this).attr('id_ulima_categoria'), function(oCategoria) {
                    $('#categoria').val(oCategoria.descricao);
                    $("#listaCategorias").hide();
                    oThis.atualizaDisponivelParaCategoria(oCategoria.id);
                });
                $('#beneficiario').val($(this).text());
                $(this).parent().hide();
            });
        });
    };
    
    this.carregarPagadores = function(filtro) {
        BeneficiarioHelper.carregaBeneficiarios('#listaPagadores', filtro, function() {
            $('#listaPagadores li').click(function() {
                $('#pagador').val($(this).text());
                $(this).parent().hide();
            });
        });
    };


    this.carregarCategorias = function(filtro) {
        var oThis = this;
        CategoriaHelper.carregaCategorias('#listaCategorias', filtro, function() {
            $('#listaCategorias li').click(function() {
                $('#categoria').val($(this).text());
                $(this).parent().hide();
                oThis.atualizaDisponivelParaCategoria($(this).attr('id_categoria'));
            });

        });
    };

    this.atualizaDisponivelParaCategoria = function(idCategoria) {
        Categoria.getSaldoDisponivel(idCategoria, function(saldo) {
            if (saldo == null) {
                $('#msgDisponivelCategoria').hide();
            } else {
                $('#msgDisponivelCategoria').show();
                $('#diponivelNaCategoria').html(UtilHelper.toValor(saldo));
            }
        });
    };

    this.carregaDadosTransacao = function(idTransacao) {
        new Transacao().findById(idTransacao, function(oTransacao) {
            $('#dataTransacao').val(App.converteData(oTransacao.data, 'yyyy-mm-dd', 'dd/mm/yyyy'));
            $('#valorTransacao').val(oTransacao.valor);

            oTransacao.belongsTo('beneficiario', function(oTransacao, oBeneficiario) {
                $('#beneficiario').val(oBeneficiario.descricao);
            });

            oTransacao.belongsTo('categoria', function(oTransacao, oCategoria) {
                $('#categoria').val(oCategoria.descricao);
            });
            ContaHelper.campoContas('#contas', oTransacao.id_conta);
        });
    };
};