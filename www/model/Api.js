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
        App.execSequenceAddFunction("sincCategorias(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("sincRecorrentes(function () { App.execSequenceNext(); })");
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
        this._sinc({
            nameSinc: "sincContas",
            msg: "Sincronizando contas",
            model: 'Conta',
            api: 'contas.json'
        }, callBack);
    };

    this.sincBeneficiarios = function(callBack) {
        this._sinc({
            nameSinc: "sincBeneficiarios",
            msg: "Sincronizando beneficiários",
            model: 'Beneficiario',
            api: 'beneficiarios.json'
        }, callBack);
    };

    this.sincCategorias = function(callBack) {
        this._sinc({
            nameSinc: "sincCategorias",
            msg: "Sincronizando categorias",
            model: 'Categoria',
            api: 'categorias.json'
        }, callBack);
    };

    this.sincRecorrentes = function(callBack) {
        this._sinc({
            nameSinc: "sincRecorrentes",
            msg: "Sincronizando recorrentes",
            model: 'Recorrente',
            api: 'recorrentes.json'
        }, callBack);
    };

    this._sinc = function(params, callBack) {
        for (var field in params) {
            eval('var ' + field + ' = params[field];');
        }
        
        this.currentFunction.name = nameSinc;
        this.currentFunction.pointer = App.execSequenceGetPointer();
        var oThis = this;
        oThis.onProgress({
            status: true,
            msg: msg,
            data: null,
            api: oThis
        });
        eval('_oModel = new ' + model + '();');
        _oModel.findAll('sincronizado is not 1', function(_oModelResps) {
            if (_oModelResps.length == 0) {
                oThis.onProgress({
                    status: true,
                    msg: "OK",
                    data: null,
                    api: oThis
                });
                callBack();
                return true;
            }
            var _jModels = [];
            for (var i in _oModelResps) {
                var _oModelResp = _oModelResps[i];
                _jModels.push(_oModelResp.toJson());
            }
            App.enviaRequisicao('http://' + oThis.host + '/api/' + api, {
                user: {
                    email: oThis.email,
                    token: oThis.token,
                    keyApi: oThis._keyApi
                },
                dados: JSON.stringify(_jModels)
            }, function(data) {
                if (data.status == 'OK') {
                    data.ids.push(0); // #Workaround - isso é para não dar erro se não atualizar nada.
                    eval('var oModel = new ' + model + '()');
                    oModel.sincronizado = 1;
                    oModel.updateAll('id in (' + data.ids + ')', function() {
                        oThis.onProgress({
                            status: true,
                            msg: "OK",
                            data: data,
                            api: oThis
                        });
                        callBack();
                    });
                } else {
                    oThis.onProgress({
                        status: false,
                        msg: "Erro na resposta do servidor",
                        data: data,
                        api: oThis
                    });
                }
            }, function(textError, errorThrown, url) {
                oThis.onProgress({
                    status: false,
                    msg: "Error: " + msg,
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
