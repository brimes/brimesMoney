RecorrenteHelper = {
    showLinhaRecorrenteLi: function(dados) {
        var htmlRet = "";
        var dataExtenso = App.dataPorExtenso(dados.DATA);
        var destaque = (dados.TIPO == Transacao.CREDITO) ? "destaque_credito" : "destaque_debito";
        htmlRet += "<li class='list-group-item' id_recorrente='" + dados.ID + "'>" 
                + "<span class='dataExtenso'>" + dataExtenso + "</span>" 
                + "<span class='pull-right " + destaque + "'>" + UtilHelper.toValor(dados.VALOR) + "</span>" 
                + "<br/>" 
                + dados.BENEFICIARIO 
                + "</li>";
        return htmlRet;
    }
};

