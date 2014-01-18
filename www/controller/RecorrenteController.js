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
            oThis.carregarBeneficiarios($('#beneficiario').val());
            oThis.carregarCategorias($('#categoria').val());
            $('#beneficiario').keyup(function () {
                oThis.carregarBeneficiarios($('#beneficiario').val());
            });
            $('#categoria').keyup(function () {
                oThis.carregarCategorias($('#categoria').val());
            });
//            oThis.carregaDetalhesCategoria(params.id);
//            $('#idCategoria').val(params.id);
//            $('#btnVoltar').click(function () {
//                App.execute('categoria/index');
//            });
//            $('#btnSalvar').click(function () {
//                 if (!Util.validaCamposObrigatorios()) {
//                    return false;
//                }
//                var oCategoria = new Categoria();
//                if ($('#idCategoria').val() != 0) {
//                    oCategoria.id = $('#idCategoria').val();
//                    oCategoria.isNewRecord = false;
//                } 
//                oCategoria.descricao = $('#descricao').val();
//                if ($('#planejamento').val() != "") {
//                    oCategoria.planejado = $('#planejamento').val();
//                }
//                oCategoria.save(function () {
//                    App.execute("categoria/index");
//                }, function () {
//                   alert("Erro ao salvar categoria."); 
//                });
//           });
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
        });
    };

    this.carregaTransacoesRecorrentes = function() {
        var oThis = this;
        Recorrente.buscaRecorrentes("", function(oRecorrentes) {
            if (oRecorrentes.length == 0) {
                $('#listaRecorrentes').html("<li class='list-group-item'>Nenhuma transação recorrente.</li>");
                return true;
            }

            for (var i in oRecorrentes) {
                var oRecorrente = oRecorrentes[i];
                $('#listaRecorrentes').append(CategoriaHelper.showCategoriaTr(oRecorrente));
            }
            $('.linhaCategoria').click(function() {
                App.execute('categoria/detalhes?id=' + $(this).attr('id_categoria'))
            });
        });

    };

};