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
        select: 'r.*, b.descricao as BENEFICIARIO, c.descricao as CATEGORIA, co.descricao as CONTA',
        table: 'recorrente r ' 
                + ' JOIN categoria c ON c.id = r.id_categoria ' 
                + ' JOIN conta co ON co.id = r.id_conta ' 
                + ' JOIN beneficiario b ON b.id = r.id_beneficiario',
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
Recorrente.adicionaAlteraRecorrente = function(jDados, onSuccess) {
    Beneficiario.getId(jDados.baneficiario, function(idBeneficiario) {
        Categoria.getId(jDados.categoria, function(idCategoria) {
            var oRecorrente = new Recorrente();
            var strData = App.converteData(jDados.data, 'dd/mm/yyyy', 'yyyy-mm-dd');
            if (jDados.id != 0) {
                oRecorrente.id = jDados.id;
                oRecorrente.isNewRecord = false;
            }
            oRecorrente.data = strData;
            oRecorrente.valor = jDados.valor;
            oRecorrente.id_beneficiario = idBeneficiario;
            oRecorrente.id_categoria = idCategoria;
            oRecorrente.id_conta = jDados.conta;
            oRecorrente.tipo = jDados.tipo;
            oRecorrente.total_parcelas = (jDados.total_parcelas == "") ? "0" : jDados.total_parcelas;
            oRecorrente.valor_fixo = jDados.valor_fixo;
            oRecorrente.save(function() {
                onSuccess();
            });
        });
    });
};
