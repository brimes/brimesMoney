Beneficiario = function() {
    this.table = "beneficiario";
    this.columns = {
        id: "integer primary key",
        descricao: "text",
        total_transacoes: 'int',
        ultima_transacao: 'text',
        id_ultima_categoria: 'int',
        sincronizado: 'int'
    };

    this.buscaPorRelevancia = function(filtro, onSuccess, onError) {
        ORM.select({
            select: "*",
            table: this.table,
            where: filtro,
            order: "total_transacoes desc",
            limit: 5
        }, function(results) {
            var dadosRetorno = new Array();
            for (i in results) {
                dadosRetorno.push(results[i]);
            }
            onSuccess(dadosRetorno);
        }, onError);

    };

};
Beneficiario.prototype = new ModelDb();

Beneficiario.getId = function(descricao, onSuccess) {
    if (!isNaN(descricao)) {
        onSuccess(descricao);
        return true;
    }
    
    ORM.select({
        select: "*",
        table: "beneficiario",
        where: "descricao = '" + descricao + "'",
    }, function(results) {
        var idBeneficiario = 0;
        for (var i in results) {
            idBeneficiario = results[i].ID;
        }
        if (idBeneficiario == 0) {
            var oBenefic = new Beneficiario();
            oBenefic.descricao = descricao;
            oBenefic.save(function(model) {
                onSuccess(model.id);
            });
        } else {
            onSuccess(idBeneficiario);
        }
    }, function() {
        alert('Erro ao buscar beneficiario');
    });
};

Beneficiario.acrescentaNumeroTransacoes = function(idBeneficiario, idCat, onSuccess) {
    if (typeof onSuccess == 'undefined') {
        onSuccess = function () {
            App.log('Salvo com sucesso...');
        }
    }
    var oBenef = new Beneficiario();
    oBenef.findById(idBeneficiario, function(oBenef) {
        if (oBenef.total_transacoes == null) {
            oBenef.total_transacoes = 0;
        }
        oBenef.total_transacoes = parseInt(oBenef.total_transacoes) + 1;
        oBenef.ultima_transacao = App.getCurrentDateTime();
        oBenef.id_ultima_categoria = idCat;
        oBenef.save(onSuccess);
    });
};

