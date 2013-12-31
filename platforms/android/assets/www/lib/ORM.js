ORM = function() {

}

ORM.migrate = function(modelo, onSuccess) {
    var consulta = "SELECT * FROM " + modelo.table.toUpperCase();
    dbSQL.exec(consulta, function(results) {
        if (results.rows.length === 0) {
            ORM.dropTable(modelo);
            ORM.createTable(modelo);
            onSuccess();
        } else {
            var dadosTabela = new Array();
            var totalRegs = results.rows.length;
            for (var i = 0; i < totalRegs; i++) {
                var row = results.rows.item(i);
                dadosTabela.push(row);
            }
            dbSQL.execFunction(function (tx) {
                var table = modelo.table.toUpperCase();
                var tableTmp = modelo.table.toUpperCase() + "_temp"; 
                QuesterApp.debug("Renomeando tabela de " + table + " para " + tableTmp);
                tx.executeSql("ALTER TABLE " + table + " RENAME TO " + tableTmp);

                QuesterApp.debug("Criando tabela: " + table);
                var sql = "CREATE TABLE IF NOT EXISTS " + table + " ( ";
                for (var campo in modelo.columns) {
                    sql += campo.toUpperCase() + " " + modelo.columns[campo] + ",";
                }
                sql = sql.substr(0, sql.length - 1) + ")";
                tx.executeSql(sql);

                QuesterApp.debug("Adicionando dados na tabela " + table);
                for (var i in dadosTabela) {
                    var regitroTabela = dadosTabela[i];
                    var camposInsert = "";
                    var valoresInsert = "";
                    for (var campo in regitroTabela) {
                        if ((typeof modelo.columns[campo.toLowerCase()] != 'undefined') && (regitroTabela[campo] != null) && (regitroTabela[campo] != 'null')) {
                            if (camposInsert != "") {
                                camposInsert += ",";
                            }
                            if (valoresInsert != "") {
                                valoresInsert += ",";
                            }
                            camposInsert += campo;
                            if (modelo.columns[campo.toLowerCase()] == 'text') {
                                valoresInsert += "'" + regitroTabela[campo] + "'";
                            } else {
                                valoresInsert += regitroTabela[campo];
                            }
                            
                        }
                    }
                    var sqlInsert = "INSERT INTO " + table + "( " + camposInsert + " ) values (" + valoresInsert + ")";
                    tx.executeSql(sqlInsert);
                }
                tx.executeSql("DROP TABLE IF EXISTS " + tableTmp);
                onSuccess();
            });    
        }
    }, function () {
        ORM.dropTable(modelo);
        ORM.createTable(modelo);
        onSuccess();
    });
    
};

ORM.createTable = function(modelo, onSuccess) {
    QuesterApp.debug("Criar tabela: " + modelo.table);
    var sql = "CREATE TABLE IF NOT EXISTS " + modelo.table.toUpperCase() + " ( ";
    for (var campo in modelo.columns) {
        sql += campo.toUpperCase() + " " + modelo.columns[campo] + ",";
    }
    sql = sql.substr(0, sql.length - 1) + ")";
    dbSQL.exec(sql, onSuccess);
};

ORM.dropTable = function(modelo, onSuccess) {
    QuesterApp.debug("Dropar tabela: " + modelo.table);
    var sql = "DROP TABLE IF EXISTS " + modelo.table.toUpperCase();
    dbSQL.exec(sql, onSuccess);
};

ORM.select = function(objParams, onSucess, onError) {

    var sql = "SELECT " + objParams.select + " FROM " + objParams.table;
    if (objParams.where) {
        sql += " WHERE " + objParams.where;
    }
    if (objParams.group) {
        sql += " GROUP BY " + objParams.group;
    }

    if (objParams.order) {
        sql += " ORDER BY " + objParams.order;
    }

    if (objParams.limit) {
        sql += " LIMIT " + objParams.limit;
    }
    
    if (objParams.offset) {
        sql += " OFFSET " + objParams.offset;
    }

    dbSQL.exec(sql, function(results) {
        if (results.rows.length === 0) {
            onSucess([]);
        } else {
            var ObjRet = new Array();
            var totalRegs = results.rows.length;
            QuesterApp.log(results.rows);
            for (var i = 0; i < totalRegs; i++) {
                var row = results.rows.item(i);
                ObjRet.push(row);
            }
            onSucess(ObjRet);
        }
    }, onError);

};

ORM.insert = function(model, onSuccess, onError) {
    var campos = "";
    var valores = "";
    var vlCampo = "";
    if (typeof model.id === 'undefined') {
        var novoId = QuesterApp.getConfig('seq_' + model.table);        
        if (!novoId) {
            novoId = 1;
        } else {
            novoId = parseInt(novoId) + 1; 
        }
        QuesterApp.setConfig('seq_' + model.table, novoId);
        model.id = novoId;
    }
    for (var campo in model.columns) {
        if (campos !== "") {
            campos += ",";
        }
        campos += campo.toUpperCase();
    }
    for (var campo in model.columns) {
        eval("vlCampo = model." + campo + ";");
        if (valores !== "") {
            valores += ",";
        }
        if ((typeof vlCampo === 'undefined') || (vlCampo == null)) { 
           valores += 'null';
        } else {
            if (model.columns[campo] !== "text") {
                valores += vlCampo;
            } else {
                valores += "'" + vlCampo + "'";
            }
        }
        
    }
    var sql = "INSERT INTO " + model.table + " ( ";
    sql += campos;
    sql += ") VALUES ( ";
    sql += valores;
    sql += ")";
    dbSQL.exec(sql, function () {
        onSuccess(model);
    }, onError);
};

ORM.update = function(model, onSucess, onError) {
    var valores = "";
    var vlCampo = "";
    for (var campo in model.columns) {
        eval("vlCampo = model." + campo + ";");
        if (valores !== "") {
            valores += ",";
        }
        if ((typeof vlCampo === 'undefined') || (vlCampo == null)) { 
           vlCampo = 'null';
        } else {
            if (model.columns[campo] === "text") {
                vlCampo = "'" + vlCampo + "'";
            }
        }
        valores += campo.toUpperCase() + ' = ' + vlCampo;
        
    }
    var sql = "UPDATE " + model.table + " SET ";
    sql += valores;
    sql += " WHERE ID = " + model.id;
    dbSQL.exec(sql, function () {
        if (typeof onSucess != 'undefined') {
            onSucess(model);
        }
    }, onError);
};

ORM.del = function(model, onSucess, onError) {
    var sql = "DELETE FROM " + model.table + " WHERE id = " + model.id;
    dbSQL.exec(sql, onSucess, onError);
};

ORM.deleteAll = function(table, condition, onSucess, onError) {
    var sql = "DELETE FROM " + table + " WHERE " + condition;
    dbSQL.exec(sql, onSucess, onError);
};

ORM.updateAll = function(model, condition, onSucess, onError) {
    var valores = "";
    var vlCampo = "";
    for (var campo in model.columns) {
        eval("vlCampo = model." + campo + ";");
        if (typeof vlCampo !== 'undefined') { 
            if (valores !== "") {
                valores += ",";
            }
            if (model.columns[campo] === "text") {
                vlCampo = "'" + vlCampo + "'";
            }
            valores += campo.toUpperCase() + ' = ' + vlCampo;
        }
    }
    var sql = "UPDATE " + model.table + " SET ";
    sql += valores;
    sql += " WHERE " + condition;
    dbSQL.exec(sql, onSucess, onError);
};

