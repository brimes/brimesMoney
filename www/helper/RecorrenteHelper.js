RecorrenteHelper = {
    showLinhaRecorrenteLi: function(dados, dataEmQuestao) {
        if (typeof dataEmQuestao == 'undefined') {
            dataEmQuestao = App.getCurrentDate();
        }
        var htmlRet = "";
        var prefix = (dados.VALOR_FIXO == '1') ? "" : "~ ";
        var extraClass = "";
        var destaque = (dados.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        var diffMeses = App.getDiffDeMesesEntreDatas(dados.DATA, dataEmQuestao);
        var dataExtenso = App.dataPorExtenso(dados.DATA);
        var parcelas = "";
        if (dados.TOTAL_PARCELAS > 0) {
            var parcela = (dados.PARCELA ? parseInt(dados.PARCELA) : 1);
            parcela = parcela + diffMeses;
            if (parcela > parseInt(dados.TOTAL_PARCELAS)) {
                return "";
            }
            parcelas = " - " + parcela + " / " + dados.TOTAL_PARCELAS;
        }
        if (dados.DATA < App.getCurrentDate()) {
            extraClass = "recorrente_atrasado";
            diffMeses = 0;
        } else if (diffMeses > 0) {
            dataExtenso = App.dataPorExtenso(App.incDate(dados.DATA, diffMeses, 'month'));
        }

        htmlRet += "<li class='list-group-item linha_recorrente" + (diffMeses > 0 ? " recorrente_futura" : "") + " " + extraClass + " ' "
                + "id_recorrente='" + dados.ID + "' id_conta='" + dados.ID_CONTA + "'>"
                + "<span class='dataExtenso' data-completa='" + dados.DATA + "'>" + dataExtenso + "</span> " + parcelas
                + "<span class='pull-right " + destaque + "'>"
                + "  <span class='prefix'>" + prefix + "</span>"
                + "  <span class='valor' valor-db='" + dados.VALOR + "'>" + UtilHelper.toValor(dados.VALOR) + "</span>"
                + "</span>"
                + "<br/>"
                + "<span class='ds-categoria'>" + dados.CATEGORIA + "</span> - "
                + "<span class='ds-beneficiario'>" + dados.BENEFICIARIO + "</span>"
                + "<span class='pull-right ds-conta'>" + dados.CONTA + "</span>"
                + "</li>";
        return htmlRet;
    }
};

