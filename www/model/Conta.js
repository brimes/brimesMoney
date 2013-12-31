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

// Tipo de conta
Conta.TIPO_DEBITO = 0;
Conta.TIPO_CREDITO = 1;

Conta.prototype = new ModelDb();
