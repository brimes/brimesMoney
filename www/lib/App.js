var App = {
    callbackPage: function() {
    },
    opcoesMenu: new Array(
            {label: "Nova dispesa", icon: "glyphicon-circle-arrow-down red", action: "app/novaTransacao?tipo=DESPESA", inicial: true},
    {label: "Nova receita", icon: "glyphicon-circle-arrow-up blue", action: "app/novaTransacao?tipo=RECEITA", inicial: true},
    {label: "Contas", icon: "glyphicon-list-alt", action: "conta/index", inicial: true},
    {label: "Categorias", icon: "glyphicon-tag", action: "categoria/index", inicial: false},
    {label: "Beneficiários", icon: "glyphicon-user", action: "", inicial: false},
    {label: "Migrate", icon: "", action: "migrate", inicial: false}
    ),
    dadosMove: {},
//    this.onBackButton = null;
    actionViewAnterior: "",
    actionAtual: "",
//
//    // Variaveis publicas
    controller: "",
    view: "",
//    this.action = "";
    locationHome: Util.dirname(location.href),
//    this.conectado;
//    this.pathApp;
//    this.params = "";
//    this.tituloTela = "";
//    this.contentMenu = new Array();
//    this.txtNotificacao = "";
//    this.swipesLeftRightOn = false;
//    this.swipeDownOn = false;
//    this.sincronizando = false;
//    this.paramsURL = {};
//    this.global = {};
//    this.configuracaoDataPadrao = {theme: 'android', mode: 'clickpick', display: 'bottom', lang: 'pt-BR'};
//    this.configuracaoGeoLocalizacao = {timeout: 60000, enableHighAccuracy: true};

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
    loading: function(ativa, msg) {

    },
//
//    this.renderPartial = function(dentino, view, params, callback) {
//        var viewCompleta = "";
//        if (view.indexOf("/") > 0) {
//            viewCompleta = this.locationHome + "/view/" + view + ".html";
//            //this.view = view;
//        } else {
//            viewCompleta = this.locationHome + "/view/" + this.controller + "/" + view + ".html";
//            //this.view = this.controller + "/" + view;
//        }
//        this.log("Abrindo view partial: " + viewCompleta);
//        dentino.load(viewCompleta, function() {
//            dentino.trigger('create');
//            if (typeof callback !== 'undefined') {
//                callback(this, params);
//            }
//        });
//
//    };
//
//    this.migrateModels = function() {
//        var modelo;
//        for (i in config_gaModels) {
//
//            this.log("migrando tabela: " + config_gaModels[i]);
//            eval("modelo = new " + config_gaModels[i] + "();");
//
//            this.log("migrando tabela2: " + config_gaModels[i]);
//            ORM.migrate(modelo);
//
//        }
//    };
//
//    this.close = function() {
//        if (this.sincronizando === true) {
//            alert('Você não pode desconectar enquanto estiver sincronizando. Aguarde o final da sincronização.');
//            return;
//        }
//
//        if (confirm("Deseja sair da aplicação?")) {
//            QuesterApp.setConfig('ultima_action', "");
//            navigator.app.exitApp();
//        }
//    };
//
    readyPage: function() {
        this.log('ready page');
        $(".link_action").unbind().click(function(e) {
            e.stopPropagation();
            QuesterApp.execute(this.attributes['href'].value);
            return false;
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
        $(".btn_menu").on('touchstart', function(event) {
            event.stopPropagation();
            event.preventDefault();
            var action = $(this).attr('action');
            if (action == 'migrate') {
                dbSQL.migrate(function() {
                    alert('migrate OK');
                });
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
//
//    this.alteraElemento = function(elemento) {
//        $(elemento).parent("p").children(".oculta").toggleClass("oculta");
//        $(elemento).toggleClass("oculta");
//    };
//
//    this.loadingBtn = function(elemento, ativa, text) {
//        if (ativa) {
//            $(elemento).attr("disabled", true);
//            $(elemento).val("Carregando...");
//            $(elemento).button("refresh");
//        } else {
//            $(elemento).attr("disabled", false);
//            $(elemento).val(text);
//            $(elemento).button("refresh");
//        }
//    };
//
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
//
//    this.getWebolUrl = function() {
//        var url = "";
//        if (parseInt(this.getConfig("conexaossl")) === 1) {
//            url += "https://";
//        } else {
//            url += "http://";
//        }
//
//        if ((this.getConfig("host") === "") || (this.getConfig("host") === null)) {
//            url += "webol.fidelize.com.br/";
//        } else {
//            url += this.getConfig("host") + "/";
//        }
//
//        url += this.trim(this.getConfig("empresa").toLowerCase());
//
//        return url;
//    };
//
//    this.getUrl = function(modulo, complemento) {
//        modulo = typeof modulo !== 'undefined' ? modulo : 'quester';
//        complemento = typeof complemento !== 'undefined' ? complemento : 'api/';
//
//        var url = this.getWebolUrl() + "/" + modulo + "/";
//
//        if (this.getConfig("ambiente") === 'test') {
//            url += "api2/";
//        } else {
//            url += complemento;
//        }
//
//        return url;
//    };
//
//    this.toastMessage = function(msg) {
//        $("<div class='ui-overlay-shadow ui-body-a ui-corner-all toast_message'>"
//                + msg
//                + "</div>")
//                .css({
//            "display": "none",
//        })
//                .appendTo($.mobile.pageContainer).fadeIn()
//                .delay(1500)
//                .fadeOut(1000, function() {
//            $(this).remove();
//        });
//    }
//
//    this.enviaRequisicao = function(url, jsonParametros, onSuccess, onError) {
//        $.ajax({
//            type: "POST",
//            url: url,
//            data: jsonParametros,
//            success: function(data) {
//                onSuccess(data);
//            },
//            error: function(xhr, textError, errorThrown) {
//                if (errorThrown == 'Unauthorized') {
//                    textError = 'Token inválido';
//                }
//                onError(textError, errorThrown, url);
//            }
//        });
//    };
//
//    this.enviaArquivo = function(arquivoLocal, url, params, onSuccess, onError, onProgress) {
//        var options = new FileUploadOptions();
//        options.fileKey = "Imagem";
//        options.fileName = arquivoLocal.substr(arquivoLocal.lastIndexOf('/') + 1);
//        options.mimeType = "image/jpeg";
//        options.params = params;
//        var fileTransfer = new FileTransfer();
//        if (typeof onProgress != 'undefined') {
//            fileTransfer.onprogress = onProgress;
//        }
//        fileTransfer.upload(arquivoLocal, encodeURI(url), onSuccess, onError, options);
//    };
//
//    this.estaLogado = function() {
//        return (this.getConfig('logado') == 1);
//    };
//
//    this.tiraFoto = function(fnSuccess, fnError, params) {
//        QuesterApp.setConfig('controle', 'TIRANDO_FOTO');
//        QuesterApp.setConfig('dados_controle', params);
//        navigator.camera.getPicture(function(localImagem) {
//            QuesterApp.setConfig('controle', '');
//            fnSuccess(localImagem);
//        }, function(msgError) {
//            QuesterApp.setConfig('controle', '');
//            if (typeof fnError !== 'undefined') {
//                fnError(msgError);
//            }
//        }, {
//            quality: 50,
//            destinationType: Camera.DestinationType.FILE_URI,
//            sourceType: Camera.PictureSourceType.CAMERA,
//            saveToPhotoAlbum: false,
//            correctOrientation: true,
//            targetWidth: 800,
//            targetHeight: 600
//        });
//    };
//
//    this.renderMiniatura = function(locaFoto, elemento, width) {
//        var img = new Image();
//        img.onload = function() {
//            var height = 0;
//            var proporcao = (img.width - img.height);
//            if (proporcao === 0) {
//                height = width;
//            } else {
//                height = ((width * img.height) / img.width);
//            }
//            height = (height * 0.80); // POG
//            var elementCanvas = $('<canvas></canvas>');
//            var context = elementCanvas[0].getContext("2d");
//            context.drawImage(img, 0, 0, img.width, img.height, 5, 0, width, height);
//            elemento.append(elementCanvas);
//        };
//        img.src = locaFoto;
//    };
//
//    this.input = function(label, onSuccess) {
//        var conteudo = $('#divPopup').find('.conteudo');
//        conteudo.html('<label>' + label + '</label><br/><input id="popupInputText" class="input_padrao" type="password" data-role="none" /><br/>' +
//                '<a href="#" id="btnConfirmarInputPopup" data-role="button" data-icon="check">Confirmar</a>');
//        conteudo.trigger('create');
//        conteudo.find('#btnConfirmarInputPopup').unbind().click(function(e) {
//            //e.stopPropagation();
//            $('#divPopup').slideUp();
//            onSuccess($('#popupInputText').val());
//        });
//        $('#divPopup').slideDown();
//    };
//
//    this.buscaImei = function() {
//        if (QuesterApp.getConfig('imei') === null) {
//            if (typeof this.paramsURL.imei != 'undefined') {
//                QuesterApp.setConfig('imei', this.paramsURL.imei);
//            } else {
//                QuesterApp.setConfig('imei', device.uuid);
//            }
//        }
//        return QuesterApp.getConfig('imei');
//    };
//
//    this.isAndroid = function() {
//        return (navigator.userAgent.match(/Android/i));
//    };
//
//    this.setNotificacao = function(msg) {
//        $('#divNotificacao').find('span').html(msg);
//        $('#divNotificacao').show();
//    };
//
//    this.limpaNotificacao = function() {
//        $('#divNotificacao').find('span').html('');
//        $('#divNotificacao').hide();
//    };
    getCurrentDate: function() {
        var dataAtual = new Date();
        var mes = dataAtual.getMonth() + 1;
        if (mes < 10) {
            mes = "0" + mes;
        }

        var dia = dataAtual.getDate();
        if (dia < 10) {
            dia = "0" + dia;
        }

        return  dataAtual.getFullYear() + '-' + mes + '-' + dia;

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

    }

};

/* App.prototype = new ExtrasFidelize();
 
 
 function ExtrasFidelize() {
 }
 
 
 ExtrasFidelize.prototype.trim = function(str) {
 return str.replace(/^\s+|\s+$/g, "");
 };
 
 ExtrasFidelize.prototype.getObjectClass = function(obj) {
 if (obj && obj.constructor && obj.constructor.toString) {
 var arr = obj.constructor.toString().match(
 /function\s*(\w+)/);
 
 if (arr && arr.length == 2) {
 return arr[1];
 }
 }
 
 return undefined;
 }
 
 
 ExtrasFidelize.prototype.getCurrentTimestamp = function() {
 var dataAtual = new Date();
 return dataAtual.getTime();
 };
 
 ExtrasFidelize.prototype.getDiffDeDiasEntreDatas = function(dataMenor, dataMaior) {
 var aData = dataMenor.split("-");
 var oDataMenor = new Date(aData[0], (aData[1] - 1), aData[2], 0, 0, 0);
 
 var aData = dataMaior.split("-");
 var oDataMaior = new Date(aData[0], (aData[1] - 1), aData[2], 0, 0, 0);
 
 var diff = Math.round((oDataMaior - oDataMenor) / (60000 * 60 * 24));
 
 return diff;
 };
 
 
 
 
 */