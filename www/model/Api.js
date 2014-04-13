Api = function() {
    this.host = "localhost:3000";
    this.email = "brunodelima@gmail.com";
    this.token = "132jdh38j73ge234rfwer33f2wwsd";
    this._keyApi = null;
    this.currentFunction = {};
    this.onProgress = function() {
    };

    this.sincroniza = function(onProgress) {
        this.onProgress = onProgress;
        onProgress({
            status: true,
            data: null,
            msg: "Iniciando sincronizacao",
            api: this
        });
        App.execSequenceNew(this);
        App.execSequenceAddFunction("initialize(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("sincContas(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("sincBeneficiarios(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("done(function () { App.execSequenceNext(); })");
        App.execSequenceStart();

    };

    this.initialize = function(callBack) {
        this.currentFunction.name = "initialize";
        this.currentFunction.pointer = App.execSequenceGetPointer();
        var oThis = this;
        oThis.onProgress({
            status: true,
            msg: "Registrando...",
            data: null,
            api: oThis
        });
        App.enviaRequisicao('http://' + this.host + '/api/start.json', {
            user: {
                email: this.email,
                token: this.token
            }
        }, function(data) {
            oThis._keyApi = data._id.$oid;
            oThis.onProgress({
                status: true,
                msg: "OK",
                data: data,
                api: oThis
            });
            callBack();
        }, function(textError, errorThrown, url) {
            oThis.onProgress({
                status: false,
                msg: "Erro ao registrar",
                data: {
                    error: errorThrown,
                    msg: textError,
                    url: url
                },
                api: oThis
            });
            callBack();
        });
    };

    this.sincContas = function(callBack) {
        this.currentFunction.name = "sincContas";
        this.currentFunction.pointer = App.execSequenceGetPointer();
        var oThis = this;
        oThis.onProgress({
            status: true,
            msg: "Sincronizando Contas",
            data: null,
            api: oThis
        });
        
        new Conta().findAll('sincronizado is not 1', function(oContas) {
            var jContas = [];
            for (var i in oContas) {
                var oConta = oContas[i];
                jContas.push(oConta.toJson());
            }
            App.enviaRequisicao('http://' + oThis.host + '/api/contas.json', {
                user: {
                    email: oThis.email,
                    token: oThis.token,
                    keyApi: oThis._keyApi
                },
                contas: JSON.stringify(jContas)
            }, function(data) {
                if (data.status == 'OK') {
                    alert(data.ids);
//                    var oConta = new Conta();
//                    oConta.sincronizado = 1;
//                    oConta.updateAll('id in (' + idsAtualizar + ')', function() {
//                    });
                }

                oThis.onProgress({
                    status: true,
                    msg: "OK",
                    data: data,
                    api: oThis
                });
                callBack();
            }, function(textError, errorThrown, url) {
                oThis.onProgress({
                    status: false,
                    msg: "Erro ao sincronizar contas",
                    data: {
                        error: errorThrown,
                        msg: textError,
                        url: url
                    },
                    api: oThis
                });
                callBack();
            });
        });
    };

    this.sincBeneficiarios = function(callBack) {
        this.currentFunction.name = "sincBeneficiarios";
        this.currentFunction.pointer = App.execSequenceGetPointer();
        var oThis = this;
        oThis.onProgress({
            status: true,
            msg: "Sincronizando Beneficiarios",
            data: null,
            api: oThis
        });
        
        new Beneficiario().findAll('sincronizado is not 1', function(oBeneficiarios) {
            var jBeneficiarios = [];
            for (var i in oBeneficiarios) {
                var oBeneficiario = oBeneficiarios[i];
                jBeneficiarios.push(oBeneficiario.toJson());
            }
            App.enviaRequisicao('http://' + oThis.host + '/api/beneficiarios.json', {
                user: {
                    email: oThis.email,
                    token: oThis.token,
                    keyApi: oThis._keyApi
                },
                beneficiarios: JSON.stringify(jBeneficiarios)
            }, function(data) {
                oThis.onProgress({
                    status: true,
                    msg: "OK",
                    data: data,
                    api: oThis
                });
                callBack();
            }, function(textError, errorThrown, url) {
                oThis.onProgress({
                    status: false,
                    msg: "Erro ao sincronizar beneficiarios",
                    data: {
                        error: errorThrown,
                        msg: textError,
                        url: url
                    },
                    api: oThis
                });
                callBack();
            });
        });
    };


    this.done = function(callBack) {
        this.currentFunction.name = "done";
        this.currentFunction.pointer = App.execSequenceGetPointer();
        var oThis = this;
        oThis.onProgress({
            status: true,
            msg: "Concluindo sincronização",
            data: null,
            api: oThis
        });
        App.enviaRequisicao('http://' + this.host + '/api/stop.json', {
            user: {
                email: this.email,
                token: this.token,
                keyApi: this._keyApi
            }
        }, function(data) {
            oThis.onProgress({
                status: true,
                msg: "OK",
                data: data,
                api: oThis
            });
            callBack();
        }, function(textError, errorThrown, url) {
            oThis.onProgress({
                status: false,
                msg: "Erro ao finalizar",
                data: {
                    error: errorThrown,
                    msg: textError,
                    url: url
                },
                api: oThis
            });
            callBack();
        });
    };

};
