RecorrenteController = function () {
    this.actionIndex = function() {
        var oThis = this;
        App.changeView('index', 'Transações Recorrentes', function () {
            $('#btnNovaTransacao').click(function () {
                App.execute('recorrente/detalhes?id=0');
            });
            oThis.carregaTransacoesRecorrentes();
        });
    };
    
    this.actionDetalhes = function (params) {
        var oThis = this;
        App.changeView('view', 'Detalhes', function () {
            oThis.carregaDetalhesCategoria(params.id);
            $('#idCategoria').val(params.id);
            $('#btnVoltar').click(function () {
                App.execute('categoria/index');
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
        });
    };
    
    this.carregaTransacoesRecorrentes = function () {
        var oThis = this;
        Recorrente.buscaRecorrentes("", function (oRecorrentes) {
            if (oRecorrentes.length == 0) {
                $('#listaRecorrentes').html("<li class='list-group-item'>Nenhuma transação recorrente.</li>");
                return true;
            } 
            
            for (var i in oRecorrentes) {
                var oRecorrente = oRecorrentes[i];
                $('#listaRecorrentes').append(CategoriaHelper.showCategoriaTr(oRecorrente));
            }
            $('.linhaCategoria').click(function () {
               App.execute('categoria/detalhes?id=' + $(this).attr('id_categoria')) 
            });
        });
        
    };
    
};