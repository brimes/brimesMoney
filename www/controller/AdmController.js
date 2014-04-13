AdmController = function() {

    this.actionIndex = function(param) {
        var oThis = this;
        App.changeView('index', 'Administração', function() {
            if (App.getConfig('configuracao')) {
                var oConfig = JSON.parse(App.getConfig('configuracao'));
                $('#txtEmail').val(oConfig.email);
            }

            $('#btnMigrate').click(function() {
                dbSQL.migrate(function() {
                    var oTrn = new Transacao();
                    oTrn.status = Transacao.STATUS_ABERTO;
                    oTrn.updateAll('status is null', function() {
                        alert('migrate OK');
                    });

                });
            });
            $('#btnTeste').click(function() {
                new Conta().findAll('', function(aContas) {
                    for (var i in aContas) {
                        alert(aContas[i].id);
                        Transacao.atualizaSaldoAcumulado({
                            id_conta: aContas[i].id
                        });
                    }
                });
            });
            $('#btnSincronizar').click(function () {
                App.execSequenceNew(oThis);
                App.execSequenceAddFunction("teste1()");
                App.execSequenceAddFunction("teste2()");
                App.execSequenceStart();
            });
            $('#btnSalvarConfig').click(function() {
                var oConf = {};
                oConf.email = $('#txtEmail').val();
                App.setConfig('configuracao', JSON.stringify(oConf));
                alert('salvo ' + JSON.stringify(oConf));
            });
        });
    };
    
    this.teste1 = function () {
        alert('ok 1');
        App.execSequenceNext();
    };

    this.teste2 = function () {
        alert('ok 2');
        App.execSequenceNext();
    };

};