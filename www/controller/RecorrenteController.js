RecorrenteController = function() {
    this.actionIndex = function(param) {
        var oThis = this;
        App.changeView('index', 'Transações Recorrentes', function() {
            var mes = App.getCurrentDate('yyyy-mm-01');
            if (param.mes) {
                mes = param.mes;
            }
            var aMes = mes.split("-");
            $('#btnMesAnterior').on('touchstart', function() {
                App.execute('recorrente/index?mes=' + App.decDate(mes, 1, 'month'));
            });
            $('#btnProximoMes').on('touchstart', function() {
                App.execute('recorrente/index?mes=' + App.incDate(mes, 1, 'month'));
            });
            $('#labelMes').html(App.aMesesExtenso[parseInt(aMes[1] * 1) - 1] + ' / ' + aMes[0]);
            $('#btnNovaTransacao').click(function() {
                App.execute('recorrente/detalhes?id=0');
            });
            oThis.carregaTransacoesRecorrentes(mes);
        });
    };

    this.actionDetalhes = function(params) {
        var oThis = this;
        App.changeView('view', 'Transação recorrente.', function() {
            $('#dataTransacao').datepicker({
                format: 'dd/mm/yyyy',
                autoclose: true,
                todayBtn: true,
                todayHighlight: true
            });
            $('#dataTransacao').attr("readonly", "readonly");
            ContaHelper.campoContas('#contas');
            App.toToggle('.btn_valor');
            App.toToggle('.btn_tipo', function(e) {
                if ($(e).attr('tipo') == Transacao.CREDITO) {
                    $('#beneficiario').attr('placeholder', 'Pagador');
                } else {
                    $('#beneficiario').attr('placeholder', 'Beneficiário');
                }
            });
            if (params.id == "0") {
                $('#btnApagar').hide();
                oThis.carregarBeneficiarios($('#beneficiario').val());
                oThis.carregarCategorias($('#categoria').val());
            } else {
                $('#btnApagar').show();
                oThis.carregaDetalhesRocorrente(params.id);
                $('#listaBeneficiarios').hide();
                $('#listaCategorias').hide();
            }
            $('#beneficiario').keyup(function() {
                oThis.carregarBeneficiarios($('#beneficiario').val());
            });
            $('#categoria').keyup(function() {
                oThis.carregarCategorias($('#categoria').val());
            });
            $('#idRecorrente').val(params.id);
            $('#btnVoltar').click(function() {
                App.execute('recorrente/index');
            });
            $('#btnApagar').click(function() {
                if (!confirm('Apagar a transação recorrente?')) {
                    return false;
                }
                var oRecorrente = new Recorrente();
                oRecorrente.findById($('#idRecorrente').val(), function (oRecorrente) {
                    oRecorrente.excluido = 1;
                    oRecorrente.save(function () {
                        App.execute('recorrente/index');
                    });
                });
            });
            $('#btnSalvar').click(function() {
                if (!Util.validaCamposObrigatorios()) {
                    return false;
                }
                
                if (!$('#contas').find('.selecionado').attr('id_conta')) {
                    alert('Selecione a conta');
                    return false;
                }

                Recorrente.adicionaAlteraRecorrente({
                    id: $('#idRecorrente').val(),
                    data: $('#dataTransacao').val(),
                    valor: $('#valorTransacao').val(),
                    baneficiario: $('#beneficiario').val().trim(),
                    categoria: $('#categoria').val().trim(),
                    tipo: (($('#tipo_transacao').find('.selecionado').attr('tipo') == Transacao.CREDITO) ? Transacao.CREDITO : Transacao.DEBITO),
                    total_parcelas: $('#totalPercelas').val(),
                    valor_fixo: $('#tipo_valor').find('.selecionado').attr('tipo'),
                    conta: $('#contas').find('.selecionado').attr('id_conta')
                }, function() {
                    App.execute('recorrente/index');
                });
            });
        });
    };

    this.carregarBeneficiarios = function(filtro) {
        var oThis = this;
        BeneficiarioHelper.carregaBeneficiarios('#listaBeneficiarios', filtro, function() {
            $('#listaBeneficiarios li').click(function() {
                var oCategoria = new Categoria();
                oCategoria.findById($(this).attr('id_ulima_categoria'), function(oCategoria) {
                    $('#categoria').val(oCategoria.descricao);
                    $("#listaCategorias").hide();
                });
                $('#beneficiario').val($(this).text());
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
            });

        });
    };

    // Funções privadas
    this.carregaDetalhesRocorrente = function(idRecorrente) {
        var oRecorrente = new Recorrente();
        oRecorrente.findById(idRecorrente, function(oRecorrente) {
            $('#dataTransacao').val(App.converteData(oRecorrente.data, 'yyyy-mm-dd', 'dd/mm/yyyy'));
            $('#valorTransacao').val(oRecorrente.valor);
            $('#tipo_valor').find('.btn_valor').each(function() {
                if ($(this).attr('tipo') == oRecorrente.valor_fixo) {
                    $(this).addClass('selecionado');
                }
            });
            $('#tipo_transacao').find('.btn_tipo').each(function() {
                if ($(this).attr('tipo') == oRecorrente.tipo) {
                    $(this).addClass('selecionado');
                }
            });
            if (oRecorrente.total_parcelas >= 1) {
                $('#totalPercelas').val(oRecorrente.total_parcelas);
            }
            $('#linhasContas').find('li').each(function() {
                if ($(this).attr('id_conta') == oRecorrente.id_conta) {
                    $(this).addClass('selecionado');
                }
            });
            var oBeneficiario = new Beneficiario();
            oBeneficiario.findById(oRecorrente.id_beneficiario, function(oBeneficiario) {
                $('#beneficiario').val(oBeneficiario.descricao);
            });
            var oCategoria = new Categoria();
            oCategoria.findById(oRecorrente.id_categoria, function() {
                $('#categoria').val(oCategoria.descricao);
            });
        });
    };

    this.carregaTransacoesRecorrentes = function(mes) {
        var oThis = this;
        var filtro = "r.excluido is not 1 ";
        if (typeof mes != 'undefined') {
            var mesFinal = mes.substr(0, 7) + "-31";
            filtro += "AND DATA <= '" + mesFinal + "' ";
        }
        Recorrente.buscaRecorrentes(filtro, function(oRecorrentes) {
            if (oRecorrentes.length == 0) {
                $('#listaRecorrentesDespesas').html("<li class='list-group-item'>Parabéns, nenhuma conta a pagar.</li>");
                $('#listaRecorrentesReceitas').html("<li class='list-group-item'>Que pena! Nada a receber esse mês</li>");
                return true;
            }
            var contReceitas = 0;
            var contDespesas = 0;

            for (var i in oRecorrentes) {
                var oRecorrente = oRecorrentes[i];
                if (oRecorrente.TIPO == Transacao.DEBITO) {
                    contDespesas++;
                    $('#listaRecorrentesDespesas').append(RecorrenteHelper.showLinhaRecorrenteLi(oRecorrente, mes));
                } else {
                    contReceitas++;
                    $('#listaRecorrentesReceitas').append(RecorrenteHelper.showLinhaRecorrenteLi(oRecorrente, mes));
                }
            }

            if (contReceitas == 0) {
                $('#listaRecorrentesReceitas').html("<li class='list-group-item'>Que pena! Nada a receber esse mês</li>");
            }

            if (contDespesas == 0) {
                $('#listaRecorrentesDespesas').html("<li class='list-group-item'>Parabéns, nenhuma conta a pagar.</li>");
            }

            $('.btn_editar_recorrente').click(function() {
                $(this).parent().next().toggleClass('editar');
            });

            $('.linha_recorrente').click(function() {
                if ($(this).hasClass('recorrente_futura')) {
                    alert("Atenção: Essa transação não pode pode ser regitrada. Registre a transação do mes anterior.");
                    return true;
                }
                if ($(this).parent().hasClass('editar')) {
                    App.execute('recorrente/detalhes?id=' + $(this).attr('id_recorrente'));
                    return true;
                }
                var data = $(this).find(".dataExtenso").attr('data-completa');
                var valor = $(this).find(".valor").attr('valor-db');
                var conta = $(this).find(".ds-conta").text();
                var beneficiario = $(this).find(".ds-beneficiario").text();
                var categoria = $(this).find(".ds-categoria").text();
                var id_recorrente = $(this).attr('id_recorrente');
                App.modal('_registra_recorrente', {
                    title: "TRN. Recorrente",
                    confirm: function() {
                        Recorrente.registraRecorrente({ 
                            idRecorrente: $('#idRecorrente').val(),
                            dataTransacao: $('#dataTransacao').val(),
                            valorTransacao: $('#valorTransacao').val()
                        }, function () {
                            App.modal('close');
                            App.execute('recorrente/index');
                        });
                    },
                    onLoad: function() {
                        $('#dataTransacao').datepicker({
                            format: 'dd/mm/yyyy',
                            autoclose: true,
                            todayBtn: true,
                            todayHighlight: true
                        });
                        $('#dataTransacao').attr("readonly", "readonly");
                        $("#dataTransacao").val(App.converteData(data, 'yyyy-mm-dd', 'dd/mm/yyyy'));
                        $("#valorTransacao").val(valor);
                        $('#lblBeneficiario').html(beneficiario);
                        $('#lblConta').html(conta);
                        $('#lblCategoria').html(categoria);
                        $('#idRecorrente').val(id_recorrente);
                        $('#btnDataAtual').unbind().click(function () {
                           $("#dataTransacao").val(App.getCurrentDate('dd/mm/yyyy')); 
                        });
                    }

                });
            });
        });
    };

};