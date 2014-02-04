ImportacaoController = function() {
    this.aLinhas = "";
    this.contLinha = 0;

    this.actionIndex = function(param) {
        var oThis = this;
        App.changeView('index', 'Importando arquivos', function() {
            alert(App.getCurrentDate());
            App.enviaRequisicao('http://localhost/ml.csv', {}, function(data) {
                oThis.aLinhas = data.split("\n");
                oThis.proximaLinha();
            });
        });
    };

    this.proximaLinha = function() {
        var oThis = this;
        this.contLinha++;
        if (typeof this.aLinhas[this.contLinha - 1] != 'undefined') {
            this.importaLinha(this.aLinhas[this.contLinha - 1], function() {
                oThis.proximaLinha();
            });
        } else {
            alert('fim');
        }
    };

    this.importaLinha = function(linha, callBack) {
        var aDadosLinha = linha.split(";");
        if (aDadosLinha[0] != 'Account') {
            var conta = aDadosLinha[0];
            var data = aDadosLinha[1].split("/");
            var dataBd = App.getDate('dd-mm-yyyy', new Date(data[2], (data[1] - 1), data[0]));
            var valor = aDadosLinha[2].replace(',', '.');
            var beneficiario = aDadosLinha[4];
            if (!beneficiario) {
                beneficiario = "Vazio";
            }
            beneficiario = beneficiario.replace("'", '');
            
            var categoria = aDadosLinha[5];
            Conta.getId(conta, function(idConta) {
                var tipo = Transacao.CREDITO;
                if (parseFloat(valor) < 0) {
                    tipo = Transacao.DEBITO;
                }
                Transacao.adicionaTransacao({
                    id: 0,
                    noCache: true,
                    data: dataBd,
                    valor: Math.abs(valor),
                    baneficiario: beneficiario,
                    categoria: categoria,
                    tipo: tipo,
                    conta: idConta
                }, function() {
                    callBack();
                });
            });
        } else {
            callBack();
        }
    };

};