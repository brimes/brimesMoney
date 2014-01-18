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

    this.actionNovaTransacao = function(param) {
        var oThis = this;
        var tituloPagina = '<span class=\"glyphicon glyphicon-circle-arrow-down red\"></span> Despesa';
        if (param.tipo == 'RECEITA') {
            tituloPagina = '<span class=\"glyphicon glyphicon-circle-arrow-up blue\"></span> Receita';
        } 
        App.changeView('index', tituloPagina, function() {
            $('#dataTransacao').val(App.converteData(App.getCurrentDate(), 'yyyy-mm-dd', 'dd/mm/yyyy'));
            $('#valorTransacao').focus();
            if (param.tipo == 'RECEITA') {
                $('#beneficiario').attr('placeholder', 'Pagador');
            }
            ContaHelper.campoContas('#contas');
            oThis.carregarBeneficiarios($('#beneficiario').val());
            oThis.carregarCategorias($('#categoria').val());
            $('#beneficiario').keyup(function () {
                oThis.carregarBeneficiarios($('#beneficiario').val());
            });
            $('#categoria').keyup(function () {
                oThis.carregarCategorias($('#categoria').val());
            });
            $('#btnSalvar').click(function(e) {
                e.stopPropagation();
                var podeSalvar = true;
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
                    data: $('#dataTransacao').val(),
                    valor: $('#valorTransacao').val(),
                    baneficiario: $('#beneficiario').val().trim(),
                    categoria: $('#categoria').val().trim(),
                    tipo: ((param.tipo == 'RECEITA') ? Transacao.CREDITO : Transacao.DEBITO),
                    conta: $('#contas').find('.selecionado').attr('id_conta')
                }, function () {
                   App.execute('conta/index'); 
                });
            });
        });
    };

    // Funções privadas - Utilizada somente nesse controller (pelo menos deveria)
    this.carregarBeneficiarios = function(filtro) {
        var oThis = this;
        BeneficiarioHelper.carregaBeneficiarios('#listaBeneficiarios', filtro, function () {
            $('#listaBeneficiarios li').click(function() {
                var oCategoria = new Categoria();
                oCategoria.findById($(this).attr('id_ulima_categoria'), function (oCategoria) {
                    $('#categoria').val(oCategoria.descricao);
                    $("#listaCategorias").hide();
                    oThis.atualizaDisponivelParaCategoria(oCategoria.id);
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
                oThis.atualizaDisponivelParaCategoria($(this).attr('id_categoria'));
            });
            
        });
    };
    
    this.atualizaDisponivelParaCategoria = function (idCategoria) {
        Categoria.getSaldoDisponivel(idCategoria, function (saldo) {
            if (saldo == null) {
                $('#msgDisponivelCategoria').hide();
            } else {
                $('#msgDisponivelCategoria').show();
                $('#diponivelNaCategoria').html(UtilHelper.toValor(saldo));
            }
        }); 
    };

};