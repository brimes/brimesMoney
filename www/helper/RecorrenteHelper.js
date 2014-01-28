RecorrenteHelper = {
    showLinhaRecorrenteLi: function(dados) {
        var htmlRet = "";
        var prefix = (dados.VALOR_FIXO == '1') ? "" : "~ ";
        var parcelas = (dados.TOTAL_PARCELAS > 0) ? " - " + (dados.PARCELA ? dados.PARCELA : "1") + " / " + dados.TOTAL_PARCELAS : "";
        var extraClass = "";
        var dataExtenso = App.dataPorExtenso(dados.DATA);
        var destaque = (dados.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";

        if (dados.DATA < App.getCurrentDate()) {
            extraClass = "recorrente_atrasado";
        }

        htmlRet += "<li class='list-group-item linha_recorrente " + extraClass + " ' id_recorrente='" + dados.ID + "'>"
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

