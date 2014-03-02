TransacaoController = function() {
    this.params = '';
    this.actionIndex = function(params) {
        var oThis = this;
        this.params = params;
        App.changeView('index', 'Transações', function() {
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
            params.status = "0, 1";
            
            $('#btnTodas').click(function () {
                App.toggleMenu();
                params.status = "";
                oThis.carregaTransacoes(oThis.params);
            });
            
            $('#btnMarkTransacao').click(function () {
                oThis.habilitaMarcarTransacoes();
            });
            oThis.carregaTransacoes(params);
            oThis.atualizaSaldo(params);
        });

    };
    
    this.habilitaMarcarTransacoes = function () {
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
        this.carregaTransacoes(this.params, {
            status: '0,1'
        });
    };

    this.atualizaSaldo = function(params) {
        if (typeof params.idConta != 'undefined') {
            var oConta = new Conta();
            oConta.findById(params.idConta, function(oConta) {
                $('#saldo').html(UtilHelper.toValor(oConta.saldo));
            });
        }
        if (typeof params.idCategoria != 'undefined') {
            Categoria.getSaldoDisponivel(params.idCategoria, function (saldo) {
                if (saldo != null) {
                    $('#saldo').html(UtilHelper.toValor(saldo));
                }
            });
        }
    };

    this.carregaTransacoes = function(params) {
        var filtro = 'valor <> 0';
        var exibeConta = false;
        if (typeof params.idCategoria != 'undefined') {
            exibeConta = true;
            filtro += ' AND t.id_categoria = ' + params.idCategoria + ' ';
            $('#labelTotal').html("Disponível");
            if (typeof params.descricaoCategoria != 'undefined') {
                $('#subTitulo').html(params.descricaoCategoria);
            }
        }
        if (typeof params.idConta != 'undefined') {
            filtro += ' AND t.id_conta = ' + params.idConta + ' ';
        }
        if ((typeof params.status != 'undefined') && params.status != '') {
            filtro += " AND t.status in (" + params.status + ") ";
        }
        
        Transacao.buscaTransacoes(filtro, function(oTransacoes) {
            $('#transacoes').html('');
            for (var i in oTransacoes) {
                var oTransacao = oTransacoes[i];
                $('#transacoes').append(ContaHelper.showLiTransacao(oTransacao, exibeConta));
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

};