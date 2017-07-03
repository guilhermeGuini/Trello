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

            //try {
                data.json = JSON.parse(txtJson.value);
				view.renderizarDados();
          //  } catch (err) {
            //    console.log(err.message);
           //     view.exibirMensagem('Ocorreu um erro ao converter Json.');
           // }
		} ,

        obterDataFormatada : function(dateStr) {
            var dataRetorno = '';

            try {
                var data = new Date(dateStr);
                dataRetorno = data.getDate().toString().length === 1 ? '0' + data.getDate() : data.getDate();
                dataRetorno += (data.getMonth() + 1).toString().length === 1 ? '/0' + (data.getMonth() + 1) : '/' + (data.getMonth() + 1);
                dataRetorno += '/' + data.getFullYear();
            } catch(err) {
                console.log('erro ao converter data');
            }

            return dataRetorno;
        } ,

		obterLabels : function() {
			var labels = [];
			
			data.json.labels.forEach(function(item){
                labels.push(item.name);
			});
			
			return labels;
		} , 
		
		obterColorsLabels : function() {
			var colorLabels = [];
			
			data.json.labels.forEach(function(item) {
				colorLabels.push(item.color);
			});
			
			return colorLabels;
		} ,
		
		obterUsesLabels : function() {
			var usesLabels = [];
			
			data.json.labels.forEach(function(item) {
				usesLabels.push(item.uses);
			});
			
			return usesLabels;
		} ,
		
		obterQtdeFeitaEAFazer : function() {
			var qtdeFeita = 0, qtdeAFazer = 0;
			
			data.json.checklists.forEach(function(item){
				item.checkItems.forEach(function(item){
					if(item.state === "complete")
						qtdeFeita++;
					else
						qtdeAFazer++;
				});
			});
			
			return { qtdeFeita: qtdeFeita, qtdeAFazer : qtdeAFazer };
		} ,
		
		obterQtdeCorrecaoComments : function() {
			var qtdeCorrecao = 0;			
			
			data.json.cards.forEach(function(item){
				qtdeCorrecao += item.badges.comments;
			});
			
			return qtdeCorrecao;
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
			var workspace     = document.getElementById('workspace');
			var linkWorkSpace = document.getElementById('link-work-space');
            var lastActivity  = document.getElementById('last-activity');

			workspace.innerHTML = data.json.name;
			linkWorkSpace.href = data.json.url;
            lastActivity.innerHTML = 'Data da última atividade: ' + controller.obterDataFormatada(data.json.dateLastActivity);

            this.montarGraficoPizza();
            this.montarGraficoLinha();
		} ,

        montarGraficoLinha : function () {
            var chart = {};

            var qtdeCorrecao = controller.obterQtdeCorrecaoComments();
			var objQtdes = controller.obterQtdeFeitaEAFazer();
		
            chart.data =
               {
                  labels: ['Itens a fazer ou pendentes', 'Itens concluídos', 'Correções Pendentes'],
                  datasets: [{
                       label: 'Itens a fazer ou pendentes',
                       data: [objQtdes.qtdeAFazer, 0, 0],
                       backgroundColor: 'black'
                     },
                     {
                       label: 'Itens concluídos',
                       data: [0,objQtdes.qtdeFeita,0],
                       backgroundColor: 'green'
                     },
                     {
                       label: 'Correções Pendentes',
                       data: [0,0,qtdeCorrecao],
                       backgroundColor: 'red'
                    }
                  ]
               };

            chart.id = 'myChartBar';
            chart.tipo = 'bar';
            chart.title = 'Funcionalidades / Correções';
            chartjs.renderChart(chart);
        } ,

        montarGraficoPizza : function() {
            var chart = {};
            chart.labels = controller.obterLabels();
            chart.colors = controller.obterColorsLabels();
            chart.data = controller.obterUsesLabels();
		
            chart.id = 'myChartPie';
            chart.tipo = 'pie';
            chart.title = 'Processos';
			
            chart.data =
                     {
                        labels: chart.labels,
                        datasets: [{
                            label: chart.label,
                            data: chart.data,
                            backgroundColor: chart.colors
                        }]
                     }

            chartjs.renderChart(chart);
        } ,

		init: function() {
            $('.content').hide();

			var btn = document.getElementById('btnGerarGraf');

            if(!btn) {
                console.log('Erro inesperado.');
            } else {
                btn.addEventListener('click', controller.armazenarJson);
            }
		}
    };

    var chartjs = {

        renderChart : function(chart) {
            var ctx = document.getElementById(chart.id).getContext('2d');

            var mychart = new Chart(ctx, {
                      type: chart.tipo,
                      data: chart.data,
                      options: {
                        responsive: true,
                        legend: {
                          position: 'top',
                        },
                        title: {
                           display: true,
                           text: chart.title
                        }
                      }
            });
        }
    };

    controller.init();

})();