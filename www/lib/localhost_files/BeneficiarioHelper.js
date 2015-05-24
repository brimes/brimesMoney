BeneficiarioHelper = {
    carregaBeneficiarios: function(element, filtro, onSuccess) {
        var oBeneficiario = new Beneficiario();
        if (filtro != '') {
            filtro = "descricao like '%" + filtro + "%'";
        }
        oBeneficiario.buscaPorRelevancia(filtro, function(arrayBeneficiarios) {
            $(element).html('');
            $(element).show();
            for (var i in arrayBeneficiarios) {
                var oResult = arrayBeneficiarios[i];
                $(element).append("<li class='list-group-item' id_ulima_categoria='" + oResult.ID_ULTIMA_CATEGORIA + "'>" 
                        + oResult.DESCRICAO + "</li>")
            }
            if (typeof onSuccess != 'undefined') {
                onSuccess();
            }
        });
    }
};

