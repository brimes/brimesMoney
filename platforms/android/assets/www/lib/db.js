var dbSQL = {
    init: function() {
        dbSQL.db = window.openDatabase(DATABASE_NAME, DATABASE_VERSION, DATABASE_DESCRIPTION, DATABASE_SIZE);
    },
    migrateNext: function() {
        dbSQL.contTabelaMigrate++;
        if (typeof dbSQL.arrayTabelasMigrate[(dbSQL.contTabelaMigrate - 1)] !== 'undefined') {
            var model = dbSQL.arrayTabelasMigrate[(dbSQL.contTabelaMigrate - 1)];
            ORM.migrate(model, function() {
                dbSQL.migrateNext();
            });
        } else {
            dbSQL.onSuccessMigrate();
        }
    }

};

dbSQL.db = null;
dbSQL.arrayTabelasMigrate = new Array();
dbSQL.contTabelaMigrate = 0;
dbSQL.onSuccessMigrate = null;


dbSQL.migrate = function(onSuccess) {
    for (i in configModels) {
        var obj = configModels[i];
        var nomeModel = obj.nome.capitalize();
        if (obj.db == true) {
            eval(" dbSQL.arrayTabelasMigrate.push(new " + nomeModel + "());");
        }
    }
    dbSQL.onSuccessMigrate = onSuccess;
    dbSQL.migrateNext();
};

dbSQL.limpaDados = function(onSuccess, cont) {
    if (typeof configModels[cont] == 'undefined') {
        onSuccess();
        return true;
    }
    var model = null;
    var obj = configModels[cont];
    console.log(obj);
    var nomeModel = obj.nome.capitalize();
    if (obj.db == true) {
        eval(" model = new " + nomeModel + "();");
        ORM.dropTable(model, function() {
            ORM.createTable(model, function() {
                dbSQL.limpaDados(onSuccess, (cont + 1));
            });
        });
    } else {
        dbSQL.limpaDados(onSuccess, (cont + 1));
    }
};

dbSQL.exec = function(query, onSucess, onError) {

    if (typeof onError === 'undefined') {
        onError = function(err) {
            QuesterApp.debug(err);
        };
    }

    if (typeof onSucess === 'undefined') {
        onSucess = function(resp) {
            QuesterApp.debug(resp);
        };
    }

    QuesterApp.debug("Chamando db transaction");
    if (dbSQL.db) {
        dbSQL.db.transaction(function(tx) {
            QuesterApp.debug("Executando query: " + query);
            tx.executeSql(query, [], function(tx, results) {
                QuesterApp.debug("Sucess Executando query: " + query);
                onSucess(results);
            }, onError);

        }, onError);
    } else {
        QuesterApp.debug("Banco de dados não iniciado.");
        onError();
    }
};

dbSQL.execFunction = function(functionSQL, onError) {

    if (typeof onError === 'undefined') {
        onError = function(err) {
            QuesterApp.debug(err);
        };
    }

    if (typeof onSucess === 'undefined') {
        onSucess = function(resp) {
            QuesterApp.debug(resp);
        };
    }

    QuesterApp.debug("Chamando db transaction");
    if (dbSQL.db) {
        dbSQL.db.transaction(function(tx) {
            functionSQL(tx);
        }, onError);
    } else {
        QuesterApp.debug("Banco de dados não iniciado.");
        onError();
    }
};

