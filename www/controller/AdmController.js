AdmController = function() {

    this.actionIndex = function(param) {
        App.changeView('index', 'Administração', function() {
            $('#btnMigrate').click(function () {
                dbSQL.migrate(function() {
                    alert('migrate OK');
                });
            });
            $('#btnTeste').click(function () {
                new Conta().findAll('', function (aContas) {
                    for (var i in aContas) {
                        alert(aContas[i].id);
                        Transacao.atualizaSaldoAcumulado({
                            id_conta: aContas[i].id
                        });
                    }
                });
            });
        });
    };

};