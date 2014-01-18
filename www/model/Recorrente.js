Recorrente = function() {
    this.table = "recorrente";
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
        valor_fixo: 'int',
        sincronizado: 'int'
    };
};
Recorrente.prototype = new ModelDb();
Recorrente.buscaRecorrentes = function(filtro, onSuccess, onError) {
    ORM.select({
        select: 'r.*, b.descricao as BENEFICIARIO, c.descricao as CATEGORIA',
        table: 'recorrente r JOIN categoria c ON c.id = r.id_categoria JOIN beneficiario b ON b.id = r.id_beneficiario',
        where: filtro,
        order: "r.data"
    }, function(results) {
        onSuccess(results);
    }, function() {
        if (typeof onError !== 'undefined') {
            onError();
        }
    });

};
