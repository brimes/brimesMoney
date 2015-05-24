ImportacaoController = function() {
    this.aLinhas = "";
    this.contLinha = 0;

    this.actionIndex = function(param) {
        var oThis = this;
        App.changeView('index', 'Importando arquivos', function() {
            App.enviaRequisicao('http://www.brimes.com.br/ml2.csv', {}, function(data) {
                new Beneficiario().deleteAll('id > 0', function () {});
                new Categoria().deleteAll('id > 0', function () {});
                new Transacao().deleteAll('id > 0', function () {});
                new Conta().deleteAll('id > 0', function () {});
                oThis.aLinhas = data.split("\n");
                oThis.proximaLinha();
            }, function (textError, errorThrown, url) {
                alert(textError + ' - ' +  errorThrown + ' - ' + url);
            });
        });
    };

    this.proximaLinha = function() {
        var oThis = this;
        this.contLinha++;
        var perc = Math.round((parseInt(this.contLinha) * 100) / this.aLinhas.length);
        $('#perc').html(perc);
        $('#progressBarImp').css('width', perc+'%');
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
            try {
                var data = aDadosLinha[1].split("/");
            } catch (e) {
                callBack();
                return false;
            }
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