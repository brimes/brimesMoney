CategoriaController = function () {
    this.actionIndex = function() {
        var oThis = this;
        App.changeView('index', 'Categorias', function () {
            $('#btnNovaConta').click(function () {
                App.execute('conta/detalhesConta?id=0');
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
    
    this.carregaCategorias = function () {
        var oCategorias = new Categoria();
        oCategorias.findAll({
            order: "descricao" 
        }, function (oCategorias) {
            $('#tblCategorias').html("<tr><th>Categoria</th><th>Planejado</th><tr>");
            for (var i in oCategorias) {
                var oCategoria = oCategorias[i];
                $('#tblCategorias').append(CategoriaHelper.showCategoriaTr(oCategoria));
            }
            $('.linhaCategoria').click(function () {
               App.execute('categoria/detalhes?id=' + $(this).attr('id_categoria')) 
            });
        });
        
    };
    
};