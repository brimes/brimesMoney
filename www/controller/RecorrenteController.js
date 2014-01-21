RecorrenteController = function() {
    this.actionIndex = function() {
        var oThis = this;
        App.changeView('index', 'Transações Recorrentes', function() {
            $('#btnNovaTransacao').click(function() {
                App.execute('recorrente/detalhes?id=0');
            });
            oThis.carregaTransacoesRecorrentes();
        });
    };

    this.actionDetalhes = function(params) {
        var oThis = this;
        App.changeView('view', 'Transação recorrente.', function() {
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
                oThis.carregarBeneficiarios($('#beneficiario').val());
                oThis.carregarCategorias($('#categoria').val());
            } else {
                oThis.carregaDetalhesRocorrente(params.id);
                $('#listaBeneficiarios').hide();
                $('#listaCategorias').hide();
            }
            $('#beneficiario').keyup(function () {
                oThis.carregarBeneficiarios($('#beneficiario').val());
            });
            $('#categoria').keyup(function () {
                oThis.carregarCategorias($('#categoria').val());
            });
            $('#idRecorrente').val(params.id);
            $('#btnVoltar').click(function () {
                App.execute('recorrente/index');
            });
            $('#btnSalvar').click(function () {
                 if (!Util.validaCamposObrigatorios()) {
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
                }, function () {
                   App.execute('recorrente/index'); 
                });
           });
        });
    };
    
    this.carregarBeneficiarios = function(filtro) {
        var oThis = this;
        BeneficiarioHelper.carregaBeneficiarios('#listaBeneficiarios', filtro, function () {
            $('#listaBeneficiarios li').click(function() {
                var oCategoria = new Categoria();
                oCategoria.findById($(this).attr('id_ulima_categoria'), function (oCategoria) {
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
        CategoriaHelper.carregaCategorias('#listaCategorias', filtro, function () {
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
            $('#tipo_valor').find('.btn_valor').each(function () {
               if ($(this).attr('tipo') == oRecorrente.valor_fixo) {
                   $(this).addClass('selecionado');
               } 
            });
            $('#tipo_transacao').find('.btn_tipo').each(function () {
               if ($(this).attr('tipo') == oRecorrente.tipo) {
                   $(this).addClass('selecionado');
               } 
            });
            if (oRecorrente.total_parcelas >= 1) {
                $('#totalPercelas').val(oRecorrente.total_parcelas);
            }
            $('#linhasContas').find('li').each(function () {
               if ($(this).attr('id_conta') == oRecorrente.id_conta) {
                   $(this).addClass('selecionado');
               } 
            });
            var oBeneficiario = new Beneficiario();
            oBeneficiario.findById(oRecorrente.id_beneficiario, function (oBeneficiario) {
                $('#beneficiario').val(oBeneficiario.descricao);
            });
            var oCategoria = new Categoria();
            oCategoria.findById(oRecorrente.id_categoria, function () {
               $('#categoria').val(oCategoria.descricao); 
            });
        });
    };

    this.carregaTransacoesRecorrentes = function() {
        var oThis = this;
        Recorrente.buscaRecorrentes("", function(oRecorrentes) {
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
                    $('#listaRecorrentesDespesas').append(RecorrenteHelper.showLinhaRecorrenteLi(oRecorrente));
                } else {
                    contReceitas++;
                    $('#listaRecorrentesReceitas').append(RecorrenteHelper.showLinhaRecorrenteLi(oRecorrente));
                }
            }
            
            if (contReceitas == 0) {
                $('#listaRecorrentesReceitas').html("<li class='list-group-item'>Que pena! Nada a receber esse mês</li>");
            }
            
            if (contDespesas == 0) {
                $('#listaRecorrentesDespesas').html("<li class='list-group-item'>Parabéns, nenhuma conta a pagar.</li>");
            }
            
            $('.btn_editar_recorrente').click(function () {
                $(this).parent().next().toggleClass('editar');
            });
            
            $('.linha_recorrente').click(function() {
                if ($(this).parent().hasClass('editar')) {
                    App.execute('recorrente/detalhes?id=' + $(this).attr('id_recorrente'));
                }
            });
        });
    };
    
};