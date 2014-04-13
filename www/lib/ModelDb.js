ModelDb = function() {
    //Metodos globais
    this.isNewRecord = true;

    this.findAll = function(params, fnSuccess, fnError) {
        var oModel = this;
        var where = null;
        var order = null;
        if (typeof params == 'object') {
            if (typeof params.conditions != 'undefined') {
                where = params.conditions;
            }
            if (typeof params.order != 'undefined') {
                order = params.order;
            }
        } else {
           where = params;
        }
        
        ORM.select({
            select: "*",
            table: this.table,
            where: where,
            order: order
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
            for (idServidor in arrayDeDados) {
                var valorCampo = "";
                var camposInsert = "";
                var valoresInsert = "";
                var dados = arrayDeDados[idServidor];
                for (campo in dados) {
                    if ((campo !== 'id') && (typeof oModel.columns[campo] !== 'undefined')) {
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
                        camposInsert += campo;
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
                var qryInsert = "INSERT OR REPLACE INTO " + oModel.table.toUpperCase() + " (id, " + camposInsert + ") VALUES ( " + idServidor + ", " + valoresInsert + ")";
                tx.executeSql(qryInsert, [], function() {

                }, function(tx, error) {
                    QuesterApp.log(error.message, 'error');
                    QuesterApp.debug(error);
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
            eval('jResp.' + campo + ' = this.' + campo + ';');
        }
        return jResp;
    };
};


