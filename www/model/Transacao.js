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
        sincronizado: 'int'
    };
};
Transacao.prototype = new ModelDb();
