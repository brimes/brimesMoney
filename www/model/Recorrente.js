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
        excluido: 'int',
        sincronizado: 'int'
    };
};
Recorrente.prototype = new ModelDb();

Recorrente.buscaRecorrentes = function(filtro, onSuccess, onError) {
    ORM.select({
        select: 'r.*, b.descricao as BENEFICIARIO, c.descricao as CATEGORIA, co.descricao as CONTA',
        table: 'recorrente r '
                + ' JOIN categoria c ON c.id = r.id_categoria '
                + ' LEFT JOIN conta co ON co.id = r.id_conta '
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

Recorrente.proximaRecorrente = function (oRecorrente, onSuccess) {
    var parcela = oRecorrente.parcela ? oRecorrente.parcela : 1;
    if (oRecorrente.total_parcelas > 0) {
        if (parcela == oRecorrente.total_parcelas) {
            oRecorrente.excluido = 1;
        } else {
            oRecorrente.parcela = parseInt(parcela) + 1;
            oRecorrente.data = App.incDate(oRecorrente.data, 1, 'month');
        }
    } else {
        oRecorrente.data = App.incDate(oRecorrente.data, 1, 'month');
    }
    oRecorrente.save(function () {
        onSuccess();
    });
    
};

Recorrente.registraRecorrente = function(jDados, onSuccess, onError) {
    var oRecorrente = new Recorrente();
    if (typeof jDados.idRecorrente == 'undefined') {
        if (typeof onError != 'undefined') {
            onError("Id não informado.");
        }
        return false;
    }
    
    oRecorrente.findById(jDados.idRecorrente, function(oRecorrente) {
        if (jDados.idConta == 0) {
            Recorrente.proximaRecorrente(oRecorrente, onSuccess);
            return true;
        } 
        Transacao.adicionaTransacao({
            data: jDados.dataTransacao,
            valor: jDados.valorTransacao,
            baneficiario: oRecorrente.id_beneficiario,
            categoria: oRecorrente.id_categoria,
            tipo: oRecorrente.tipo,
            conta: jDados.idConta
        }, function() {
            Recorrente.proximaRecorrente(oRecorrente, onSuccess);
        });
    });
};

Recorrente.getTotalPrevistoMes = function (idConta, onSuccess, diaVenc) {
    var mesAtual = App.getCurrentDate("yyyy-mm-") + diaVenc;
    ORM.select({
        select: '*',
        table: 'recorrente r ',
        where: "id_conta = " + idConta + " AND data <= '" + mesAtual + "' AND excluido is not 1",
    }, function(results) {
        var total = 0;
        for (var i in results) {
            if (results[i].TIPO == Transacao.CREDITO) {
                total += results[i].VALOR;
            } else {
                total -= results[i].VALOR;
            }
        }
        onSuccess(total);
    }, function() {
        if (typeof onError !== 'undefined') {
            onError();
        }
    });
};

