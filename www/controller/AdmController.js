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
            $('#btnSincronizar').click(function() {
                var oConfig = JSON.parse(App.getConfig('configuracao'));
                oApi = new Api();
                oApi.email = oConfig.email;
                oApi.sincroniza(function(jResponse) {
                    if (!jResponse.status) {
                        alert(jResponse.msg);
                        return true;
                    }
                    console.log(jResponse);
                });
            });
            $('#btnSalvarConfig').click(function() {
                var oConf = {};
                oConf.email = $('#txtEmail').val();
                App.setConfig('configuracao', JSON.stringify(oConf));
                alert('salvo ' + JSON.stringify(oConf));
            });
        });
    };

};