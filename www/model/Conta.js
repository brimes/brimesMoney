Conta = function() {
    this.table = "conta";
    this.columns = {
        id: "integer primary key",
        descricao: "text",
        saldo: 'float',
        saldo_inicial: 'float',
        tipo: 'int',
        data_fechamento: 'text',
        dia_vencimento: 'integer',
        limite: 'float',
        status: 'int',
        ult_atualizacao: 'text',
        sincronizado: 'int'
    };
    this.getDiaFechamento = function (mes, ano) {
        var dataVencimento = this.dia_vencimento + "-" + mes + "-" + ano;
        alert(dataVencimento);
        return this.dia_vencimento;
    },
    this.getSaldoAtual = function(callBack, data) {
        if (typeof data == 'undefined') {
            data = App.getCurrentDate();
        }
        var oThis = this;
        ORM.select({
            select: '*',
            table: 'transacao',
            where: "id_conta = " + oThis.id + " AND data <= '" + data + "'"
        }, function(results) {
            var saldo = parseFloat(oThis.saldo_inicial);
            if (isNaN(saldo)) {
                saldo = 0;
            }
            for (var i in results) {
                var dadosTrn = results[i];
                if (!isNaN(dadosTrn.VALOR)) {
                    if (dadosTrn.TIPO == Transacao.CREDITO) {
                        saldo = parseFloat(saldo) + parseFloat(dadosTrn.VALOR);
                    } else {
                        saldo = parseFloat(saldo) - parseFloat(dadosTrn.VALOR);
                    }
                }
            }
            callBack(saldo);
        }, function() {
            callBack(0);
        });
    };
    this.getSaldoFinalDoMes = function(callBack) {
        var oThis = this;
        var mesAtual = App.getCurrentDate("yyyy-mm-") + "31";
        ORM.select({
            select: '*',
            table: 'transacao',
            where: "id_conta = " + oThis.id + " AND data <= '" + mesAtual + "'"
        }, function(results) {
            var saldo = parseFloat(oThis.saldo_inicial);
            if (isNaN(saldo)) {
                saldo = 0;
            }
            for (var i in results) {
                var dadosTrn = results[i];
                if (!isNaN(dadosTrn.VALOR)) {
                    if (dadosTrn.TIPO == Transacao.CREDITO) {
                        saldo = parseFloat(saldo) + parseFloat(dadosTrn.VALOR);
                    } else {
                        saldo = parseFloat(saldo) - parseFloat(dadosTrn.VALOR);
                    }
                }
            }
            callBack(saldo);
        }, function() {
            callBack(0);
        });
    };
};
Conta.prototype = new ModelDb();

// Tipo de conta
Conta.TIPO_DEBITO = 0;
Conta.TIPO_CREDITO = 1;

Conta.STATUS_ATIVA = 0;
Conta.STATUS_DESATIVADA = 1;

Conta.getTotaldeContas = function(onSuccess, onError) {
    ORM.select({
        select: 'count(*) as TOTALCONTAS',
        table: 'conta',
    }, function(results) {
        for (i in results) {
            onSuccess(results[i].TOTALCONTAS);
        }
    }, function() {
        if (typeof onError !== 'undefined') {
            onError();
        }
    });
};
Conta.atualizaSaldo = function(idConta, valor, operacao, callBack) {
    new Conta().findById(idConta, function(oConta) {
        oConta.getSaldoAtual(function (saldo) {
            oConta.saldo = saldo;
            oConta.save(function() {
                callBack();
            });
        });
    });
};
Conta.getId = function(descricao, onSuccess) {
    if (!isNaN(descricao)) {
        onSuccess(descricao);
        return true;
    }
    ORM.select({
        select: "*",
        table: "conta",
        where: "descricao = '" + descricao + "'",
    }, function(results) {
        var idConta = 0;
        for (var i in results) {
            idConta = results[i].ID;
        }
        if (idConta == 0) {
            var oConta = new Conta();
            oConta.descricao = descricao;
            oConta.save(function(model) {
                onSuccess(model.id);
            });
        } else {
            onSuccess(idConta);
        }
    }, function() {
        alert('Erro ao buscar conta');
    });
};

