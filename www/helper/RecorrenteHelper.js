RecorrenteHelper = {
    showLinhaRecorrenteLi: function(dados) {
        var htmlRet = "";
        var prefix = (dados.VALOR_FIXO == '1') ? "" : "~ ";
        var parcelas = (dados.TOTAL_PARCELAS >  0) ?  " - " + (dados.PARCELA ? dados.PARCELA : "1") + " / " +  dados.TOTAL_PARCELAS : "";
        var dataExtenso = App.dataPorExtenso(dados.DATA);
        var destaque = (dados.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        htmlRet += "<li class='list-group-item linha_recorrente' id_recorrente='" + dados.ID + "'>" 
                + "<span class='dataExtenso'>" + dataExtenso + "</span>" 
                + "<span class='pull-right " + destaque + "'>" + prefix + UtilHelper.toValor(dados.VALOR) + "</span>" 
                + "<br/>" 
                + dados.BENEFICIARIO + parcelas
                + "<span class='pull-right'>" + dados.CONTA + "</span>" 
                + "</li>";
        return htmlRet;
    }
};

