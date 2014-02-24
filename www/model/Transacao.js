Transacao = function() {
    this.table = "transacao";
    this.columns = {
        id: "integer primary key",
        data: "text",
        valor: 'float',
        id_beneficiario: 'int',
        id_categoria: 'int',
        parcela: 'int',
        total_parcelas: 'int',
        id_conta: 'text',
        tipo: 'text',
        transferencia: 'int', // 1 - Destino, 2 - Origem
        id_conta_transferencia: 'int',
        id_pagador: 'int',
        status: 'int',
        saldo_acumulado: 'float',
        sincronizado: 'int'
    };

    this.relations = {
        beneficiario: {type: "BELONGS_TO", class: "Beneficiario", field: "id_beneficiario"},
        categoria: {type: "BELONGS_TO", class: "Categoria", field: "id_categoria"},
    };

    this.salvaParcela = function(jDados, callBack, onError) {
        var oThis = this;
        this.save(function() {
            if (oThis.parcela == oThis.total_parcelas) {
                if (typeof jDados.noCache != 'undefined' && jDados.noCache == true) {
                    callBack();
                } else {
                    Categoria.acrescentaNumeroTransacoes(oThis.idCategoria);
                    Beneficiario.acrescentaNumeroTransacoes(oThis.idBeneficiario, oThis.idCategoria);
                    Conta.atualizaSaldo(jDados.conta, jDados.valor, jDados.tipo, function() {
                        callBack();
                    });
                }
            }
        }, onError);

    };

};
Transacao.prototype = new ModelDb();
Transacao.DEBITO = 'D';
Transacao.CREDITO = 'C';
Transacao.TRANSFERENCIA = 'T';

Transacao.STATUS_ABERTO = 0;
Transacao.STATUS_ANALISE = 1;
Transacao.STATUS_FECHADO = 2;

Transacao.TIPO_PARCELA_DIVIDIR = 1;
Transacao.TIPO_PARCELA_MULTIPLICAR = 0;

Transacao.TRANSF_DESTINO = 1;
Transacao.TRANSF_ORIGEM = 2;

Transacao._addTransacao = function(jDados, onSuccess, onError) {
    var dadosParcelas = new Array();
    if (typeof jDados.nrParcelas != 'undefined' && parseInt(jDados.nrParcelas) > 1) {
        for (var i = 1; i <= parseInt(jDados.nrParcelas); i++) {
            if (jDados.tipoParcelamento == Transacao.TIPO_PARCELA_MULTIPLICAR) {
                var valorPagar = jDados.valor;
            } else {
                var valorPagar = parseFloat(parseFloat(jDados.valor) / parseFloat(jDados.nrParcelas)).toFixed(2);
            }
            dadosParcelas.push({
                valor: valorPagar,
                parcela: i,
                total: jDados.nrParcelas
            });
        }
    } else {
        dadosParcelas.push({
            valor: jDados.valor,
            parcela: 1,
            total: 1
        });
    }
    for (var i in dadosParcelas) {
        var oTransacao = new Transacao();
        if (jDados.id > 0) {
            oTransacao.id = jDados.id;
            oTransacao.isNewRecord = false;
        }

        var dadosParcela = dadosParcelas[i];
        var dataParcela = App.incDate(jDados.data, parseInt(i), 'month');

        oTransacao.data = dataParcela;

        oTransacao.valor = dadosParcela.valor;
        oTransacao.parcela = dadosParcela.parcela;
        oTransacao.total_parcelas = dadosParcela.total;

        oTransacao.id_beneficiario = jDados.idBeneficiario;
        oTransacao.id_categoria = jDados.idCategoria;
        oTransacao.id_conta = jDados.conta;
        oTransacao.tipo = jDados.tipo;
        oTransacao.status = Transacao.STATUS_ABERTO;
        if (typeof jDados.transferencia != 'undefined') {
            oTransacao.transferencia = jDados.transferencia;
            oTransacao.id_conta_transferencia = jDados.id_conta_transferencia;
        }
        oTransacao.salvaParcela(jDados, function () {
            Transacao.atualizaSaldoAcumulado({
                id_conta: jDados.conta,
                depoisDe: jDados.data
            });
            onSuccess();
        }, onError);
    }

};
Transacao.adicionaTransacao = function(jDados, onSuccess, onError) {
    Beneficiario.getId(jDados.baneficiario, function(idBeneficiario) {
        Categoria.getId(jDados.categoria, function(idCategoria) {
            jDados.idBeneficiario = idBeneficiario;
            jDados.idCategoria = idCategoria;
            Transacao._addTransacao(jDados, onSuccess, onError);
        });
    });
};
Transacao.buscaTransacoes = function(filtro, onSuccess, onError) {
    ORM.select({
        select: 't.*, b.descricao as BENEFICIARIO, c.descricao as CATEGORIA',
        table: 'transacao t LEFT JOIN categoria c ON c.id = t.id_categoria LEFT JOIN beneficiario b ON b.id = t.id_beneficiario',
        where: filtro,
        order: "t.data, t.id"
    }, function(results) {
        onSuccess(results);
    }, function() {
        if (typeof onError !== 'undefined') {
            onError();
        }
    });

};
Transacao.getTotalGastoNoPeriodoParaCategoria = function(idCategoria, callBack) {
    var dataAtual = App.getCurrentDate()
    var dataAtualInicio = dataAtual.substr(0, 7) + "-01";
    var dataAtualFim = dataAtual.substr(0, 7) + "-31";
    ORM.select({
        select: 't.*',
        table: 'transacao t',
        where: "id_categoria = " + idCategoria + " AND (data >= '" + dataAtualInicio + "' AND data <= '" + dataAtualFim + "')"
    }, function(results) {
        var valorTotal = 0;
        for (var i in results) {
            var res = results[i];
            valorTotal += parseFloat(res.VALOR);
        }
        callBack(valorTotal);
    }, function() {
        callBack(0);
    });

};
Transacao.efetuaTransferencia = function(jDados, onSuccess, onError) {
    Beneficiario.getId(jDados.baneficiario, function(idBeneficiario) {
        jDados.idBeneficiario = idBeneficiario;
        jDados.idCategoria = 0;
        jDados.transferencia = Transacao.TRANSF_ORIGEM;
        jDados.id_conta_transferencia = jDados.conta_destino;
        jDados.conta = jDados.conta_origem;
        jDados.tipo = Transacao.DEBITO;
        Transacao._addTransacao(jDados, function () {
            jDados.transferencia = Transacao.TRANSF_DESTINO;
            jDados.id_conta_transferencia = jDados.conta_origem;
            jDados.conta = jDados.conta_destino;
            jDados.tipo = Transacao.CREDITO;
            Transacao._addTransacao(jDados, function () {
                onSuccess();
            }, onError);
        }, onError);
    });

};
Transacao.atualizaSaldoAcumulado = function(jDados, callBack) {
    if (typeof jDados.id_conta == 'undefined') {
        return false;
    }
    var dataInicio = "0000-00-00";
    if (typeof jDados.depoisDe != 'undefined') {
        dataInicio = App.decDate(jDados.depoisDe, 1, 'day');
    }
    new Conta().findById(jDados.id_conta, function (oConta) {
        oConta.getSaldoAtual(function (saldo) {
            var saldoAcumulado = parseFloat(saldo);
            Transacao.buscaTransacoes('id_conta = ' + jDados.id_conta + " AND data > '" + dataInicio + "'", function (aDadosTrn) {
                for (var i in aDadosTrn) {
                    var oDadosTrn = aDadosTrn[i]
                    var oTransacao = new Transacao();
                    oTransacao.carregaDados(oDadosTrn);
                    if (oTransacao.tipo == Transacao.CREDITO) {
                        saldoAcumulado += parseFloat(oTransacao.valor);
                    } else {
                        saldoAcumulado -= parseFloat(oTransacao.valor);
                    }
                    oTransacao.saldo_acumulado = saldoAcumulado;
                    oTransacao.save(function () {});
                }
                if (typeof callBack != 'undefined') {
                    callBack();
                }
            });
        }, dataInicio);
        
    });
    
    
};