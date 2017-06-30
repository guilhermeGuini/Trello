(function(){

    'use strict'

    var data = {
        json: {}
    }

    var controller = {

        validarJson : function () {
            var txtJson = document.getElementById('txtJson');

            if(!txtJson) {
               view.exibirMensagem('Erro inesperado.');
               return;
            }

            if(txtJson.value.length === 0) {
                view.exibirMensagem('Informe um arquivo Json.');
                return;
            }

            try {
                data.json = JSON.parse("'" + txtJson.value + "'");
            } catch (err) {
                console.log('Erro ao converter Json');
                view.exibirMensagem('Ocorreu um erro ao converter Json.');
            }

        } ,

        init : function() {
            var btn = document.getElementById('btnGerarGraf');
            if(!btn) {
                 view.exibirMensagem('Erro inesperado.');
                return;
            }

            btn.addEventListener('click', this.validarJson);
        }

    }

    var view =  {

        exibirMensagem : function(msg) {
            alert(msg);
        }
    }

    controller.init();

})();