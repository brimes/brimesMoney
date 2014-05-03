Api = function() {
    this.host = "";
    this.email = "";
    this.token = "";
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
        App.execSequenceAddFunction("sincTransacoes(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("done(function () { App.execSequenceNext(); })");
        App.execSequenceStart();

    };

    this.baixar = function(onProgress) {
        this.onProgress = onProgress;
        onProgress({
            status: true,
            data: null,
            msg: "Iniciando sincronizacao",
            api: this
        });
        App.execSequenceNew(this);
        App.execSequenceAddFunction("initialize(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("baixaContas(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("baixaBeneficiarios(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("baixaCategorias(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("baixaRecorrentes(function () { App.execSequenceNext(); })");
        App.execSequenceAddFunction("baixaTransacoes(function () { App.execSequenceNext(); })");
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
            api: 'beneficiarios.json',
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

    this.sincTransacoes = function(callBack) {
        var oThis = this;
        this._sinc({
            nameSinc: "sincTransacoes",
            msg: "Sincronizando transações",
            model: 'Transacao',
            api: 'transacoes.json',
            limit: 200,
            skipOnError: true
        }, function() {
            new Transacao().count('sincronizado is not 1', function (total) {
                if (total > 0) {
                    oThis.sincTransacoes(callBack);
                } else {
                    callBack();
                }
            }, function () {
               alert('Erro ao buscar transacoes para sincroniar'); 
            });
        });
    };
    
    this.baixaContas = function(callBack) {
        this._baixa({
            nameSinc: "baixaContas",
            msg: "Baixando contas",
            model: 'Conta',
            api: 'get_contas.json'
        }, callBack);
    };

    this.baixaBeneficiarios = function(callBack) {
        this._baixa({
            nameSinc: "baixaBenericiarios",
            msg: "Baixando beneficiarios",
            model: 'Beneficiario',
            api: 'get_beneficiarios.json'
        }, callBack);
    };

    this.baixaCategorias = function(callBack) {
        this._baixa({
            nameSinc: "baixaCategorias",
            msg: "Baixando categorias",
            model: 'Categoria',
            api: 'get_categorias.json'
        }, callBack);
    };

    this.baixaRecorrentes = function(callBack) {
        this._baixa({
            nameSinc: "baixaRecorrentes",
            msg: "Baixando recorrentes",
            model: 'Recorrente',
            api: 'get_recorrentes.json'
        }, callBack);
    };

    this.baixaTransacoes = function(callBack) {
        this._baixa({
            nameSinc: "baixaTransacoes",
            msg: "Baixando transacoes",
            model: 'Transacao',
            api: 'get_transacoes.json'
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
        var filtro = 'sincronizado is not 1';
        if (typeof limit != 'undefined') {
            filtro = {
                conditions: 'sincronizado is not 1',
                limit: limit
            };
        }

        eval('_oModel = new ' + model + '();');
        _oModel.findAll(filtro, function(_oModelResps) {
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
                if ((typeof params.skipOnError == 'undefined') || params.skipOnError != true) {
                    callBack();
                }
            });
        });
    };

    this._baixa = function(params, callBack) {
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
        var filtro = 'sincronizado is not 1';
        if (typeof limit != 'undefined') {
            filtro = {
                conditions: 'sincronizado is not 1',
                limit: limit
            };
        }
        eval('_oModel = new ' + model + '();');

        App.enviaRequisicao('http://' + oThis.host + '/api/' + api, {
            user: {
                email: oThis.email,
                token: oThis.token,
                keyApi: oThis._keyApi
            }
        }, function(data) {
            console.log(data);
            if (data.status == 'OK') {
                _oModel.importaJson(data.resp, function () {
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
            if ((typeof params.skipOnError == 'undefined') || params.skipOnError != true) {
                callBack();
            }
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
