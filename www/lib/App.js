var App = {
    callbackPage: function() {
    },
    opcoesMenu: new Array(
            {label: "Nova dispesa", icon: "glyphicon-minus-sign red", action: "app/transacao?tipo=D", inicial: true},
    {label: "Nova receita", icon: "glyphicon-plus-sign blue", action: "app/transacao?tipo=C", inicial: true},
    {label: "Transferencia", icon: "glyphicon-transfer", action: "app/transacao?tipo=T", inicial: true},
    {label: "Contas", icon: "glyphicon-list-alt", action: "conta/index", inicial: true},
    {label: "Categorias", icon: "glyphicon-tag", action: "categoria/index", inicial: false},
    {label: "Transações Recorrentes", icon: "glyphicon-th-list", action: "recorrente/index", inicial: false},
    {label: "Administração", icon: "", action: "adm/index", inicial: false}
    ),
    aMesesExtenso: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    dadosMove: {},
    actionViewAnterior: "",
    actionAtual: "",
    controller: "",
    view: "",
    locationHome: Util.dirname(location.href),
    init: function() {
        dbSQL.init(); // iniciando o SQL
        this.parseParamsURL();
        this.ativaBotoesAparelho();
        //this.execute(App.getActionIndex());
        this.execute('app/index');
    },
    ativaBotoesAparelho: function() {
        if (navigator.userAgent.match(/Android/i)) {
            document.addEventListener("backbutton", function() {
                if ((typeof this.onBackButton !== 'undefined') && this.onBackButton) {
                    this.onBackButton();
                }
                return false;
            }, false);
            document.addEventListener("menubutton", function() {
                $('#context_menu').click();
                return true;
            }, false);
        }
    },
    parseParamsURL: function() {
        this.paramsURL = {};
        if (location.href.indexOf('?') > 0) {
            var aDadosURL = location.href.split("?");
            var aParams = aDadosURL[1].split("&");
            for (var i in aParams) {
                var aCampo = aParams[i].split("=");
                eval("this.paramsURL." + aCampo[0] + " = '" + aCampo[1] + "'");
            }
        }
        console.log(this.paramsURL);

    },
    getActionIndex: function() {
        if (this.getConfig("versao_atual") != this.getVersao()) {
            //return "atualizacao/index";
        }
        if (typeof this.paramsURL.action !== 'undefined') {
            var action = this.paramsURL.action;
            action = action.replace(/|/g, "/");
            action = action.replace(/:i:/g, "=");
            action = action.replace(/:p:/g, "?");
            action = action.replace(/:e:/g, "&");
            return action;
        }

        if ((this.getConfig('ultima_action') !== null) && (this.getConfig('ultima_action') != "null") && (this.getConfig('ultima_action') != "")) {
            this.log("Reabrindo action " + this.getConfig('ultima_action'));
            var action = this.getConfig('ultima_action');
            this.setConfig('ultima_action', 'app/index');
            return action;
        }

        return "app/index";
    },
    importHelper: function() {
        for (i in configHelpers) {
            var obj = configHelpers[i];
            var nomeHelper = "helper/" + obj.nome.capitalize() + "Helper.js";
            this.log("Importando helper: " + nomeHelper);
            document.write("<script src='" + nomeHelper + "'></s" + "cript>");
        }
    },
    importController: function() {
        for (i in configControllers) {
            var obj = configControllers[i];
            var nomeController = "controller/" + obj.nome.capitalize() + "Controller.js";
            this.log("Importando controle: " + nomeController);
            document.write("<script src='" + nomeController + "'></s" + "cript>");
        }
    },
    importModels: function() {
        for (i in configModels) {
            var obj = configModels[i];
            var nomeModel = "model/" + obj.nome.capitalize() + ".js";
            this.log("Importando Model: " + nomeModel);
            document.write("<script src='" + nomeModel + "'></s" + "cript>");
        }
    },
    execute: function(destination, noCache) {
        if (noCache === true) {
            this.log("No cache");
        }
        this.actionAtual = destination;
        this.controller = destination.split("/")[0];
        var action = destination.split("/")[1].split("?")[0];
        if (destination.split("?")[1]) {
            var params = destination.split("?")[1].split("&");
        } else {
            params = "";
        }
        var objParams = new Object();
        var retorno = null;
        var nomeControllerCap = this.controller.capitalize() + "Controller";
        if (params != "") {
            for (i in params) {
                var aDados = params[i].split("=");
                eval("objParams." + aDados[0] + " = '" + aDados[1] + "' ;")
            }
        }
        eval("if (typeof o" + nomeControllerCap + " == 'undefined') {var    o" + nomeControllerCap + " = new " + nomeControllerCap + ";} ")
        this.log("Rodando action: o" + nomeControllerCap + ".action" + action.capitalize() + "(objParams)");
        eval("retorno = o" + nomeControllerCap + ".action" + action.capitalize() + "(objParams); ")
        return retorno;
    },
    changeView: function(view, titulo, callback) {
        var viewCompleta = "";
        var oThis = this;
        if (view.indexOf("/") > 0) {
            viewCompleta = this.locationHome + "/view/" + view + ".html";
            this.view = view;
        } else {
            viewCompleta = this.locationHome + "/view/" + this.controller + "/" + view + ".html";
            this.view = this.controller + "/" + view;
        }
        this.setConfig('ultima_action', this.actionAtual);
        this.loading(true, "Carregando");
        this.log("Abrindo view: " + viewCompleta);
        $('#conteudoPagina').empty();
        $('#conteudoPagina').html('');
        this.actionViewAnterior = this.actionAtual;
        $('#conteudoPagina').load(viewCompleta, function() {
            App.log("Page Init " + this.controller);
            $('#tituloJanela').html(titulo);
            $('#content_page').trigger('create');

            App.readyPage();
            if (typeof callback != 'undefined') {
                App.log('chamando callback');
                callback();
                App.log('fim callback');
            }
            oThis.params = "";
            $(document).scrollTop(0);
            App.loading(false);
        });
        return;
    },
    modal: function(view, params) {
        if (view == 'close') {
            $('#modalView').modal('hide');
            return;
        }
        var viewCompleta = "";
        var oThis = this;
        if (view.indexOf("/") > 0) {
            viewCompleta = this.locationHome + "/view/" + view + ".html";
        } else {
            viewCompleta = this.locationHome + "/view/" + this.controller + "/" + view + ".html";
        }
        this.loading(true, "Carregando");
        this.log("Abrindo modal view: " + viewCompleta);
        if (typeof params.title != 'undefined') {
            $('#myModalLabel').html(params.title);
        } else {
            $('#myModalLabel').html("Brimes Money");
        }
        if (typeof params.cancel != 'undefined') {
            $('#modelCancel').unbind().click(params.cancel);
        }
        if (typeof params.confirm != 'undefined') {
            $('#modelConfirm').unbind().click(params.confirm);
        }

        $('#conteudoModal').empty();
        $('#conteudoModal').html('');
        $('#conteudoModal').load(viewCompleta, function() {
            $('#modalView').modal();
            if (typeof params.onLoad != 'undefined') {
                params.onLoad();
            }
            App.loading(false);
        });
        return;


    },
    loading: function(ativa, msg) {

    },
    close: function() {
        if (confirm("Deseja sair da aplicação?")) {
            this.setConfig('ultima_action', "");
            navigator.app.exitApp();
        }
    },
    readyPage: function() {
        this.log('ready page');
        $(".link_action").unbind().click(function(e) {
            e.stopPropagation();
            QuesterApp.execute(this.attributes['href'].value);
            return false;
        });
        $('#modalView').on('hidden.bs.modal', function(e) {
            $("#conteudoModal").empty();
        });
    },
    ready: function() {
        for (var i in this.opcoesMenu) {
            var optMenu = this.opcoesMenu[i];
            if (optMenu.inicial == true) {
                $('#btns_tela_inicial').append("<span class=\"btn btn_menu btn_navbar\" action=\"" + optMenu.action + "\"> "
                        + "<span class=\"glyphicon " + optMenu.icon + "\"></span>"
                        + "</span>");
            } else {
                $('#menuOpcoes').append("<button type=\"button\" class=\"btn btn-default btn_menu opcao_menu\" action=\"" + optMenu.action + "\">"
                        + "   <span class=\"glyphicon " + optMenu.icon + "\"></span> " + optMenu.label + ""
                        + "</button>");
            }
        }
        if (App.isAndroid()) {
            $('#menuOpcoes').append("<button type=\"button\" class=\"btn btn-default btn_menu opcao_menu\" action=\"appClose\">"
                    + "   <span class=\"glyphicon glyphicon-off\"></span> Encerrar"
                    + "</button>");
        }
        $(".btn_menu").on('touchstart', function(event) {
            event.stopPropagation();
            event.preventDefault();
            var action = $(this).attr('action');
            if (action == 'migrate') {
                dbSQL.migrate(function() {
                    alert('migrate OK');
                });
            } else if (action == 'appClose') {
                App.close();
            } else if (action == 'toggleMenu') {
                if ($(this).children('span').hasClass('glyphicon-chevron-up')) {
                    $(this).children('span').removeClass('glyphicon-chevron-up');
                    $(this).children('span').addClass('glyphicon-chevron-down');
                    $('#menuOpcoes').slideDown('fast');
                } else {
                    $(this).children('span').addClass('glyphicon-chevron-up');
                    $(this).children('span').removeClass('glyphicon-chevron-down');
                    $('#menuOpcoes').slideUp('fast');
                }
            } else {
                $("#btnMenuToggle").children('span').addClass('glyphicon-chevron-up');
                $("#btnMenuToggle").children('span').removeClass('glyphicon-chevron-down');
                $('#menuOpcoes').slideUp('fast');
                App.execute(action);
            }
        });
    },
    log: function(texto, tipo) {
        var debug = this.getConfig('debug');
        debug = 1;
        if (typeof debug === 'undefined' || debug == 0) {
            return false;
        }
        var contrl = "system";
        if (typeof tipo == 'undefined') {
            tipo = "info";
        }

        if (this.controller != "") {
            contrl = this.controller;
        }
        console.log("[QuesterApp] [" + contrl + "] [" + tipo + "]: " + texto);
    },
    debug: function(obj) {
        var debug = this.getConfig('debug');
        if (typeof debug === 'undefined' || debug == 0) {
            return false;
        }
        console.debug(obj);
    },
    getVersao: function() {
        return VERSAO_APP;
    },
    getConfig: function(variavel) {
        return window.localStorage.getItem(variavel);
    },
    setConfig: function(variavel, valor) {
        return window.localStorage.setItem(variavel, valor);
    },
    toastMessage: function(msg) {
        $("<div class='ui-overlay-shadow ui-body-a ui-corner-all toast_message'>"
                + msg
                + "</div>")
                .css({
            "display": "none",
        })
                .appendTo($.mobile.pageContainer).fadeIn()
                .delay(1500)
                .fadeOut(1000, function() {
            $(this).remove();
        });
    },
    isAndroid: function() {
        return (navigator.userAgent.match(/Android/i));
    },
    decDate: function(dataBase, valor, tipo) {
        var aData = dataBase.split("-");
        var oData = new Date(parseInt(aData[0] * 1), parseInt(aData[1] * 1) - 1, parseInt(aData[2] * 1));
        if (tipo == 'month') {
            oData.setMonth(oData.getMonth() - valor);
        }
        if (tipo == 'day') {
            oData.setDate(oData.getDate() - valor);
        }
        var year = parseInt(oData.getFullYear());
        if (tipo == 'year') {
            year = year - valor;
        }

        var mes = oData.getMonth() + 1;
        if (mes < 10) {
            mes = "0" + mes;
        }
        var dia = oData.getDate();
        if (dia < 10) {
            dia = "0" + dia;
        }
        return  year + '-' + mes + '-' + dia;
    },
    incDate: function(dataBase, valor, tipo) {
        if (valor == 0) {
            return dataBase;
        }
        var aData = dataBase.split("-");
        var oData = new Date(parseInt(aData[0] * 1), parseInt(aData[1] * 1) - 1, parseInt(aData[2] * 1));
        if (tipo == 'month') {
            oData.setMonth(oData.getMonth() + valor);
        }
        if (tipo == 'day') {
            oData.setDate(oData.getDate() + valor);
        }
        var year = parseInt(oData.getFullYear());
        if (tipo == 'year') {
            year = year + valor;
        }

        var mes = oData.getMonth() + 1;
        if (mes < 10) {
            mes = "0" + mes;
        }
        var dia = oData.getDate();
        if (dia < 10) {
            dia = "0" + dia;
        }
        return  year + '-' + mes + '-' + dia;
    },
    getDate: function(format, objDate) {
        if (typeof format == 'undefined') {
            var format = 'yyyy-mm-dd';
        }
        var dataAtual = objDate;
        var mes = dataAtual.getMonth() + 1;
        if (mes < 10) {
            mes = "0" + mes;
        }

        var dia = dataAtual.getDate();
        if (dia < 10) {
            dia = "0" + dia;
        }
        var strRet = format.replace('yyyy', dataAtual.getFullYear());
        strRet = strRet.replace('mm', mes);
        strRet = strRet.replace('dd', dia);
        return   strRet;

    },
    getCurrentDate: function(format) {
        return this.getDate(format, new Date());
    },
    converteData: function(data, formatoOrigem, formatoDestino) {
        data = data + "";
        var mes = data.substr(formatoOrigem.indexOf('mm'), 2);
        var dia = data.substr(formatoOrigem.indexOf('dd'), 2);
        var ano = data.substr(formatoOrigem.indexOf('yyyy'), 4);
        var novaData = formatoDestino.replace('mm', mes).replace('dd', dia).replace('yyyy', ano);
        return  novaData;
    },
    getCurrentDateTime: function() {
        var dataAtual = new Date();
        var hora = dataAtual.getHours();
        if (hora < 10) {
            hora = "0" + hora;
        }

        var minuto = dataAtual.getMinutes();
        if (minuto < 10) {
            minuto = "0" + minuto;
        }
        var segundo = dataAtual.getSeconds();
        if (segundo < 10) {
            segundo = "0" + segundo;
        }
        return  this.getCurrentDate() + ' ' + hora + ':' + minuto + ':' + segundo;
    },
    dataPorExtenso: function(data) {
        if (this.getCurrentDate() == data) {
            return "Hoje";
        }
        var aData = data.split("-");
        var aDataAtual = this.getCurrentDate().split("-");
        var dataAtual = new Date();

        if (dataAtual.getFullYear() == aData[0]) {
            return aData[2] + " de " + this.aMesesExtenso[parseInt(aData[1] * 1) - 1];
        } else {
            return aData[2] + " de " + this.aMesesExtenso[parseInt(aData[1] * 1) - 1] + "/" + aData[0];
        }

    },
    getCurrentTimestamp: function() {
        var dataAtual = new Date();
        return dataAtual.getTime();
    },
    getDiffDeDiasEntreDatas: function(dataMenor, dataMaior) {
        var aData = dataMenor.split("-");
        var oDataMenor = new Date(aData[0], (aData[1] - 1), aData[2], 0, 0, 0);

        var aData = dataMaior.split("-");
        var oDataMaior = new Date(aData[0], (aData[1] - 1), aData[2], 0, 0, 0);

        var diff = Math.round((oDataMaior - oDataMenor) / (60000 * 60 * 24));

        return diff;
    },
    getDiffDeMesesEntreDatas: function(dataMenor, dataMaior) {
        var aData = dataMenor.split("-");
        var oDataMenor = new Date(aData[0], (aData[1] - 1), 1, 0, 0, 0);

        var aData = dataMaior.split("-");
        var oDataMaior = new Date(aData[0], (aData[1] - 1), 1, 0, 0, 0);

        if (oDataMaior == oDataMenor) {
            return 0;
        }

        var diffAnos = (oDataMaior.getFullYear() - oDataMenor.getFullYear());
        diffAnos = diffAnos * 12;
        var diffMeses = (oDataMaior.getMonth() - (oDataMenor.getMonth() - diffAnos));

        return diffMeses;
    },
    toToggle: function(classToggle, onToogle) {
        $(classToggle).click(function() {
            $(classToggle).removeClass("selecionado");
            $(this).addClass("selecionado");
            if (typeof onToogle != 'undefined') {
                onToogle(this);
            }
        });
    },
    trim: function(str) {
        return str.replace(/^\s+|\s+$/g, "");
    },
    enviaRequisicao: function(url, jsonParametros, onSuccess, onError) {
        $.ajax({
            type: "GET",
            url: url,
            crossDomain: true,
            data: jsonParametros,
            success: function(data) {
                onSuccess(data);
            },
            error: function(xhr, textError, errorThrown) {
                if (errorThrown == 'Unauthorized') {
                    textError = 'Token inválido';
                }
                onError(textError, errorThrown, url);
            }
        });
    }
};

