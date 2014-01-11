Categoria = function() {
    this.table = "categoria";
    this.columns = {
        id: "integer primary key",
        descricao: "text",
        total_transacoes: 'int',
        ultima_transacao: 'text',
        planejado: 'float',
        sincronizado: 'int'
    };
    
    this.buscaPorRelevancia = function (filtro, onSuccess, onError) {
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
Categoria.prototype = new ModelDb();
Categoria.getId = function(descricao, onSuccess) {
    ORM.select({
        select: "*",
        table: "categoria",
        where: "descricao = '" + descricao + "'",
    }, function(results) {
        var idCat = 0;
        for (var i in results) {
            idCat = results[i].ID;
        }
        if (idCat == 0) {
            var oCat = new Categoria();
            oCat.descricao = descricao;
            oCat.save(function(model) {
                onSuccess(model.id);
            });
        } else {
            onSuccess(idCat);
        }
    }, function() {
        alert('Erro ao buscar categoria');
    });
};
Categoria.acrescentaNumeroTransacoes = function(idCategoria, onSuccess) {
    if (typeof onSuccess == 'undefined') {
        onSuccess = function () {
            App.log('Salvo com sucesso...');
        }
    }
    var oCat = new Categoria();
    oCat.findById(idCategoria, function (oCat) {
        if (oCat.total_transacoes == null) {
            oCat.total_transacoes = 0;
        }
        oCat.total_transacoes = parseInt(oCat.total_transacoes) + 1;
        oCat.ultima_transacao = App.getCurrentDateTime();
        oCat.save(onSuccess);
    });
};
Categoria.getSaldoDisponivel = function (idCategoria, callBack) {
    var oCategoria = new Categoria();
    oCategoria.findById(idCategoria, function (oCategoria) {
        callBack(oCategoria.planejado);
    });
};

