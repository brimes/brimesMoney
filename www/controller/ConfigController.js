ConfigController = function() {

    this.actionIndex = function(param) {
        var oThis = this;
        App.changeView('index', 'Configuração', function() {
            if (App.getConfig('configuracao')) {
                var oConfig = JSON.parse(App.getConfig('configuracao'));
                $('#txtEmail').val(oConfig.email);
                $('#txtHost').val(oConfig.host);
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
                        Transacao.atualizaSaldoAcumulado({
                            id_conta: aContas[i].id
                        }, function () {
                            alert('atualizado com sucesso.');
                        });
                    }
                });
            });
            $('#btnSincronizar').click(function() {
                var oConfig = JSON.parse(App.getConfig('configuracao'));
                oApi = new Api();
                oApi.email = oConfig.email;
                oApi.host = oConfig.host;
                oApi.sincroniza(function(jResponse) {
                    if (!jResponse.status) {
                        alert(jResponse.msg);
                        return true;
                    }
                    $('#msg').html(jResponse.msg);
                    console.log(jResponse);
                });
            });
            $('#btnSalvarConfig').click(function() {
                var oConf = {};
                oConf.email = $('#txtEmail').val();
                oConf.host = $('#txtHost').val();
                App.setConfig('configuracao', JSON.stringify(oConf));
                alert('salvo ' + JSON.stringify(oConf));
            });
        });
    };

};