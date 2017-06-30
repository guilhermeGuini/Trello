(function(){

    'use strict'

    var data = {
        json: {}
    }

    var controller = {

        validarJson : function (jsonElem) {
            
            if(!jsonElem) {
               view.exibirMensagem('Erro inesperado.');
               return false;
            }

            if(jsonElem.value.length === 0) {
                view.exibirMensagem('Informe um arquivo Json.');
                return false;
            }
			
			return true;
        } ,
		
		armazenarJson : function() {
			var txtJson = document.getElementById('txtJson');
			
			if(!controller.validarJson(txtJson)) {
				return;
			} 				
			
            try {
                data.json = JSON.parse(txtJson.value);
				console.log(data.json.name);
				view.renderizarDados();	
            } catch (err) {
                console.log('Erro ao converter Json');
                view.exibirMensagem('Ocorreu um erro ao converter Json.');
            }
		} ,

        init : function() {
           view.init();
        }

    };

    var view =  {

        exibirMensagem : function(msg) {
            alert(msg);
        } ,
		
		renderizarDados : function() {
			$('.json').hide();
			$('.content').show();
			var workspace = document.getElementById('workspace');
			
			workspace.innerHTML = data.json.name;
			
		} ,
		
		init: function() {
			var btn = document.getElementById('btnGerarGraf');
			
			
            if(!btn) {
                 view.exibirMensagem('Erro inesperado.');
                return;
            }

            btn.addEventListener('click', controller.armazenarJson);
		}
    };

    controller.init();

})();