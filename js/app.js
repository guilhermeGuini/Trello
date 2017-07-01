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

            var qtdeCorrecao = 0, qtdeAFazer = 0, qtdeFeita = 0;

            for(var i = 0; i < data.json.cards.length; i++) {
                var itemCard = data.json.cards[i];

                qtdeCorrecao += itemCard.badges.comments;
                qtdeAFazer   += itemCard.badges.checkItems;
                qtdeFeita    += itemCard.badges.checkItemsChecked;
            }

            chart.data =
               {
                  labels: ['Itens a fazer ou pendentes', 'Itens concluídos', 'Correções Pendentes'],
                  datasets: [{
                       label: 'Itens a fazer ou pendentes',
                       data: [qtdeAFazer, 0, 0],
                       backgroundColor: 'black'
                     },
                     {
                       label: 'Itens concluídos',
                       data: [0,qtdeFeita,0],
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
            chart.labels = [];
            chart.colors = [];
            chart.data = [];

            for(var i = 0; i < data.json.labels.length; i++) {
                var itemLabel = data.json.labels[i];

                chart.labels.push(itemLabel.name);
                chart.colors.push(itemLabel.color);
                chart.data.push(itemLabel.uses);
            }

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

            console.log(chart.data);

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