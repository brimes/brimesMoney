CategoriaController = function () {
    this.actionIndex = function() {
        var oThis = this;
        App.changeView('index', 'Categorias', function () {
            $('#btnNovaCategoria').click(function () {
                App.execute('categoria/detalhes?id=0');
            });
            oThis.carregaCategorias();
        });
    };
    
    this.actionDetalhes = function (params) {
        var oThis = this;
        App.changeView('view', 'Detalhes', function () {
            oThis.carregaDetalhesCategoria(params.id);
            $('#idCategoria').val(params.id)
            $('#btnVoltar').click(function () {
                App.execute('categoria/index');
            });
            if (params.id == "0") {
                $('#btnApagar').hide();
            } else {
                $('#btnApagar').show();
            }
            new Conta().findAll("status is not " + Conta.STATUS_DESATIVADA, function (oContas) {
                for (var i in oContas) {
                    var oConta = oContas[i];
                    $('#listaDeContas').append("<li>" 
                            + "<a href='#' class='opcaoConta' id_conta='" + oConta.id + "'>" 
                            + oConta.descricao + "</a></li>");
                }
                $('#listaDeContas').append("<li class='divider'></li><li>" 
                        + "<a href='#' class='opcaoConta' id_conta='0'>Nenhuma conta</a></li>");
                $('.opcaoConta').click(function () {
                    $('#lblConta').html($(this).html());
                    $('#idConta').val($(this).attr('id_conta'));
                });
            });
            
            $('#btnApagar').click(function() {
                if (!confirm('Apagar a categoria?')) {
                    return false;
                }
                var oCategoria = new Categoria();
                oCategoria.findById($('#idCategoria').val(), function (oCategoria) {
                    oCategoria.del(function () {
                        App.execute('categoria/index');
                    });
                });
            });
            $('#btnSalvar').click(function () {
                 if (!Util.validaCamposObrigatorios()) {
                    return false;
                }
                var oCategoria = new Categoria();
                if ($('#idCategoria').val() != 0) {
                    oCategoria.id = $('#idCategoria').val();
                    oCategoria.isNewRecord = false;
                } 
                oCategoria.id_conta = $('#idConta').val();
                oCategoria.descricao = $('#descricao').val();
                if ($('#planejamento').val() != "") {
                    oCategoria.planejado = $('#planejamento').val();
                }
                oCategoria.save(function () {
                    App.execute("categoria/index");
                }, function () {
                   alert("Erro ao salvar categoria."); 
                });
           });
        });
    };
    
    // Funções privadas
    this.carregaDetalhesCategoria = function (idCategoria) {
        var oCategoria = new Categoria();
        oCategoria.findById(idCategoria, function (oCategoria) {
            $('#descricao').val(oCategoria.descricao);
            $('#planejamento').val(oCategoria.planejado);
            if (oCategoria.id_conta) {
                $('#idConta').val(oCategoria.id_conta);
                new Conta().findById(oCategoria.id_conta, function (oConta) {
                   $('#lblConta').html(oConta.descricao); 
                });
            } else {
                $('#lblConta').html("Nenhuma conta"); 
            }
        });
    };
    
    this.carregaCategorias = function () {
        var oThis = this;
        var oCategorias = new Categoria();
        oCategorias.findAll({
            order: "descricao" 
        }, function (oCategorias) {
            $('#tblCategorias').html("<tr><th></th><th>Categoria</th><th>Planejado</th><th>Disponível</th><tr>");
            for (var i in oCategorias) {
                var oCategoria = oCategorias[i];
                $('#tblCategorias').append(CategoriaHelper.showCategoriaTr(oCategoria));
                oThis.atualizaSaldoDaCategoria(oCategoria.id);
            }
            $('.linhaCategoria .btnEditar').click(function (e) {
                e.stopPropagation();
                App.execute('categoria/detalhes?id=' + $(this).parent().parent().attr('id_categoria')) 
            });
            $('.linhaCategoria').click(function (e) {
                e.stopPropagation();
                App.execute('transacao/index?idCategoria=' + $(this).attr('id_categoria') 
                        + '&descricaoCategoria=' + $(this).find('.descricaoCategoria').html()); 
            });
        });
        
    };
    
    this.atualizaSaldoDaCategoria = function (idCategoria) {
        Categoria.getSaldoDisponivel(idCategoria, function (saldo) {
            if (saldo != null) {
                $('#disponivel_' + idCategoria).html(UtilHelper.toValor(saldo));
            }
        });
    };
    
};