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
                App.execute(App.getConfig('ultima_action'));
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
            oThis.carregarContas();
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
                    baneficiario: $('#beneficiario').val(),
                    categoria: $('#categoria').val(),
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
        var oBeneficiario = new Beneficiario();
        if (filtro != '') {
            filtro = "descricao like '%" + filtro + "%'";
        }
        oBeneficiario.buscaPorRelevancia(filtro, function(arrayBeneficiarios) {
            $('#listaBeneficiarios').html('');
            $('#listaBeneficiarios').show();
            for (var i in arrayBeneficiarios) {
                var oResult = arrayBeneficiarios[i];
                $('#listaBeneficiarios').append("<li><a href=\"#\" id_ulima_categoria='" + oResult.ID_ULTIMA_CATEGORIA + "'>" + oResult.DESCRICAO + "</a></li>")
            }
            $('#listaBeneficiarios a').click(function() {
                var oCategoria = new Categoria();
                oCategoria.findById($(this).attr('id_ulima_categoria'), function (oCategoria) {
                    $('#categoria').val(oCategoria.descricao);
                    $("#listaCategorias").hide();
                    oThis.atualizaDisponivelParaCategoria(oCategoria.id);
                });
                $('#beneficiario').val($(this).text());
                $(this).parent().parent().hide();
            });
        });
    };

    this.carregarCategorias = function(filtro) {
        var oThis = this;
        var oCategoria = new Categoria();
        if (filtro != '') {
            filtro = "descricao like '%" + filtro + "%'";
        }
        oCategoria.buscaPorRelevancia(filtro, function(arrayCategorias) {
            $('#listaCategorias').html('');
            $('#listaCategorias').show();
            for (var i in arrayCategorias) {
                var oResult = arrayCategorias[i];
                $('#listaCategorias').append("<li><a href=\"#\" id_categoria=\"" + oResult.ID + "\">" + oResult.DESCRICAO + "</a></li>")
            }
            $('#listaCategorias a').click(function() {
                $('#categoria').val($(this).text());
                $(this).parent().parent().hide();
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

    this.carregarContas = function() {
        var oContas = new Conta();
        oContas.findAll('id>0', function(oContas) {
            $('#contas').html("");
            for (var i in oContas) {
                var oConta = oContas[i];
                $('#contas').append(ContaHelper.showLinhaContaLi(oConta));
            }
            $('#contas').find('a').click(function() {
                $(this).parent().parent().children('li').each(function() {
                    $(this).removeClass('selecionado');
                });
                $(this).parent().addClass('selecionado');
            });
        });

    };

};