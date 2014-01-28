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
        sincronizado: 'int'
    };
    this.getSaldoFinalDoMes = function(callBack) {
        var oThis = this;
        ORM.select({
            select: '*',
            table: 'transacao',
            where: 'id_conta = ' + oThis.id + ''
        }, function(results) {
            var saldo = parseFloat(oThis.saldo_inicial);
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
    var oConta = new Conta();
    oConta.findById(idConta, function(oConta) {
        if (oConta.saldo == null) {
            oConta.saldo = 0;
        }
        if (operacao == 'C') {
            oConta.saldo = (parseFloat(oConta.saldo) + parseFloat(valor));
        } else {
            oConta.saldo -= valor;
        }
        oConta.save(function() {
            callBack();
        });
    });
};

// Tipo de conta
Conta.TIPO_DEBITO = 0;
Conta.TIPO_CREDITO = 1;

Conta.prototype = new ModelDb();
