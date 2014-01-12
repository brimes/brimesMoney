Transacao = function() {
    this.table = "transacao";
    this.columns = {
        id: "integer primary key",
        data: "text",
        valor: 'float',
        id_beneficiario: 'int',
        id_categoria: 'int',
        parcela: 'int',
        id_conta: 'text',
        tipo: 'text',
        sincronizado: 'int'
    };
};
Transacao.prototype = new ModelDb();
Transacao.DEBITO = 'D';
Transacao.CREDITO = 'C';
Transacao.adicionaTransacao = function(jDados, onSuccess) {
    Beneficiario.getId(jDados.baneficiario, function(idBeneficiario) {
        Categoria.getId(jDados.categoria, function(idCategoria) {
            var oTransacao = new Transacao();
            var strData = App.converteData(jDados.data, 'dd/mm/yyyy', 'yyyy-mm-dd');
            oTransacao.data = strData;
            oTransacao.valor = jDados.valor;
            oTransacao.id_beneficiario = idBeneficiario;
            oTransacao.id_categoria = idCategoria;
            oTransacao.id_conta = jDados.conta;
            oTransacao.tipo = jDados.tipo;
            oTransacao.save(function() {
                Categoria.acrescentaNumeroTransacoes(idCategoria);
                Beneficiario.acrescentaNumeroTransacoes(idBeneficiario, idCategoria);
                Conta.atualizaSaldo(jDados.conta, jDados.valor, jDados.tipo, function() {
                    onSuccess();
                });
            });
        });
    });
};
Transacao.buscaTransacoes = function(filtro, onSuccess, onError) {
    ORM.select({
        select: 't.*, b.descricao as BENEFICIARIO, c.descricao as CATEGORIA',
        table: 'transacao t JOIN categoria c ON c.id = t.id_categoria JOIN beneficiario b ON b.id = t.id_beneficiario',
        where: filtro
    }, function(results) {
        onSuccess(results);
    }, function() {
        if (typeof onError !== 'undefined') {
            onError();
        }
    });

};
Transacao.getTotalGastoNoPeriodoParaCategoria = function (idCategoria, callBack) {
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

