ModelDb = function() {
    //Metodos globais
    this.isNewRecord = true;

    this.findAll = function(params, fnSuccess, fnError) {
        var oModel = this;
        var where = null;
        var order = null;
        var limit = null;
        if (typeof params == 'object') {
            if (typeof params.conditions != 'undefined') {
                where = params.conditions;
            }
            if (typeof params.order != 'undefined') {
                order = params.order;
            }
            if (typeof params.limit != 'undefined') {
                limit = params.limit;
            }
        } else {
           where = params;
        }
        
        ORM.select({
            select: "*",
            table: this.table,
            where: where,
            order: order,
            limit: limit
        }, function(rets) {
            var aResults = new Array();
            if (rets.length > 0) {
                for (i in rets) {
                    var oNewModel = {};
                    jQuery.extend(oNewModel, oModel);
                    oNewModel.isNewRecord = false;
                    oNewModel.carregaDados(rets[i]);
                    aResults.push(oNewModel);
                }
            }
            fnSuccess(aResults);
        }, function(error) {
            if (typeof fnError !== 'undefined') {
                fnError(error);
            } else {
                alert("Erro ao carregar dados da tabela " + oModel.table + " com a condicao " + where);
            }
        });
    };

    this.findById = function(id, fnCallBack, fnError) {
        if (typeof id === 'undefined') {
            return false;
        }
        var oModel = this;
        ORM.select({
            select: "*",
            table: this.table,
            where: "id = " + id
        }, function(rets) {
            if (rets.length > 0) {
                oModel.isNewRecord = false;
                oModel.carregaDados(rets[0]);
            }
            fnCallBack(oModel);
        }, function(error) {
            if (typeof fnError !== 'undefined') {
                fnError(error);
            } else {
                alert("Erro ao carregar dados da tabela " + oModel.table + " com o id " + id);
            }
        });
    }

    this.save = function(onSuccess, onError) {
        var oThis = this;
        oThis.sincronizado = 0;
        if (this.isNewRecord) {
            ORM.insert(this, function(model) {
                model.isNewRecord = false;
                onSuccess(model);
            }, onError);
        } else {
            ORM.update(this, onSuccess, onError);
        }
    };

    this.del = function(onSuccess, onError) {
        var oThis = this;
        if (this.isNewRecord) {
            onSuccess();
        } else {
            ORM.del(this, onSuccess, onError);
        }
    };

    this.deleteAll = function (condition, onSuccess, onError) {
        ORM.deleteAll(this.table, condition, onSuccess, onError);
    };
    
    this.updateAll = function (condition, onSuccess, onError) {
        ORM.updateAll(this, condition, onSuccess, onError);
    };
    
    this.belongsTo = function(relation, callBack) {
        eval("var dadosRelation = this.relations['" + relation + "'];");
        if ((typeof dadosRelation === 'undefined') || (dadosRelation.type !== 'BELONGS_TO')) {
            return false;
        }
        var oThis = this;
        eval("var oModel = this." + relation + ";");
        if (typeof oModel === 'undefined') {
            eval("oModel = new " + dadosRelation.class + "();");
            eval("oModel.findById(this." + dadosRelation.field + ", function (dadosModel) { "
             + " oThis." + relation + " = dadosModel;"
             + " callBack(oThis, dadosModel);"
             + "});");
        } else {
            callBack(this, oModel);
        }
    };
    
    this.hasMany = function(relation, callBack) {
        eval("var dadosRelation = this.relations['" + relation + "'];");
        if (dadosRelation.type !== 'HAS_MANY') {
            return false;
        }
        var oThis = this;
        eval("var oModel = this." + relation + ";");
        if (typeof oModel === 'undefined') {
            eval("oModel = new " + dadosRelation.class + "();");
            eval("oModel.findAll('" + dadosRelation.field + " = "  + oThis.id + "', function (dadosModel) { "
             + " oThis." + relation + " = dadosModel;"
             + " callBack(oThis, dadosModel);"
             + "});");
        } else {
            callBack(this, oModel);
        }
    };

    this.carregaDados = function(dadosReult, onSuccess) {
        this.onSuccess = onSuccess;
        this.isNewRecord = false;
        for (campo in dadosReult) {
            eval("this." + campo.toLowerCase() + " = dadosReult[campo]; ");
        }
    };

    this.importaJson = function(arrayDeDados, onSuccess, limpaAntes) {
        oModel = this;
        dbSQL.execFunction(function(tx) {
            if (limpaAntes === true) {
                tx.executeSql("DELETE FROM " + oModel.table.toUpperCase() + "");
            }
            for (var idServidor in arrayDeDados) {
                var valorCampo = "";
                var camposInsert = "";
                var valoresInsert = "";
                var dados = arrayDeDados[idServidor];
                for (var campo in dados) {
                    if ((campo == 'p_id') || (typeof oModel.columns[campo] !== 'undefined')) {
                        
                        if (oModel.columns[campo] === 'text') {
                            valorCampo = "'" + dados[campo] + "'";
                        } else {
                            valorCampo = dados[campo];
                        }

                        if (valorCampo === null) {
                            valorCampo = "null";
                        }

                        if (camposInsert !== "") {
                            camposInsert += ",";
                        }
                        if (valoresInsert !== "") {
                            valoresInsert += ",";
                        }
                        if (campo == 'p_id') {
                            camposInsert += 'id';
                        } else {
                            camposInsert += campo;
                        }
                        valoresInsert += valorCampo;
                    }
                }
                if (typeof oModel.columns['sincronizado'] !== 'undefined') {
                        if (camposInsert !== "") {
                            camposInsert += ",";
                        }
                        if (valoresInsert !== "") {
                            valoresInsert += ",";
                        }
                        camposInsert += 'sincronizado';
                        valoresInsert += '1';
                }
                var qryInsert = "INSERT OR REPLACE INTO " + oModel.table.toUpperCase() + " (" + camposInsert + ") VALUES (" + valoresInsert + ")";
                tx.executeSql(qryInsert, [], function() {

                }, function(tx, error) {
                    App.log(error.message, 'error');
                    App.debug(error);
                    alert('Erro ao inserir registro ' + qryInsert);
                });
            }
            onSuccess();
        }, function() {

        });
    };
    
    this.toJson = function () {
        var jResp = {};
        for (var campo in this.columns) {
            var nomeCampo = campo;
            if (campo == 'sincronizado') {
                nomeCampo = "";
            }
            
            if (campo == 'id') {
                nomeCampo = 'p_id';
            }
            
            if (nomeCampo != '')
                eval('jResp.' + nomeCampo + ' = this.' + campo + ';');
        }
        return jResp;
    };

    this.count = function(params, fnSuccess, fnError) {
        var oModel = this;
        var where = params;
        ORM.select({
            select: "count(*) as TOTAL",
            table: this.table,
            where: where
        }, function(rets) {
            var total = 0;
            if (rets.length > 0) {
                for (var i in rets) {
                    total = rets[i].TOTAL;
                }
            }
            fnSuccess(total);
        }, function(error) {
            if (typeof fnError !== 'undefined') {
                fnError(error);
            } else {
                alert("Erro ao carregar dados da tabela " + oModel.table + " com a condicao " + where);
            }
        });
    };
    
    this.atualizaSeq = function(fnSuccess, fnError) {
        var oModel = this;
        ORM.select({
            select: "max(id) as MAX",
            table: this.table
        }, function(rets) {
            var maxId = 0;
            if (rets.length > 0) {
                for (var i in rets) {
                    maxId = rets[i].MAX;
                }
            }
            var novoId = maxId + 1;
            App.setConfig('seq_' + oModel.table, novoId);
            fnSuccess(novoId);
        }, function(error) {
            if (typeof fnError !== 'undefined') {
                fnError(error);
            } else {
                alert("Erro ao atualizar sequencia. Tabela: " + oModel.table);
            }
        });
    };

};


