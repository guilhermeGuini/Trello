(function(){

    'use strict'

    const enumState = {
        'incomplete' : 'incomplete',
        'complete'   : 'complete'  ,
        'emoji'      : ':warning:'
    };

    const enumColors = {
        'pendente'  : 'black',
        'incompleto': 'red',
        'completo'  : 'green'
    };

    var data = {
        json: {}
    };

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
				localStorage.setItem("json", data.json);
				view.renderizarDados();
            } catch (err) {
                console.log(err.message);
                view.exibirMensagem('Ocorreu um erro ao converter Json.');
            }
		} ,

        getFormatData : function(dateStr) {
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

		getLabels : function() {
			var labels = [];

			data.json.labels.forEach(function(item){
                labels.push(item.name);
			});

			return labels;
		} ,

		getColorsLabels : function() {
			var colorLabels = [];

			data.json.labels.forEach(function(item) {
				colorLabels.push(item.color);
			});

			return colorLabels;
		} ,

		getUsesLabels : function() {
			var usesLabels = [];

			data.json.labels.forEach(function(item) {
				usesLabels.push(item.uses);
			});

			return usesLabels;
		} ,

		getCountCheckListDoneAndDoing : function() {
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

		getCountComments : function() {
			var qtdeCorrecao = 0;

			data.json.cards.forEach(function(item){
				qtdeCorrecao += item.badges.comments;
			});

			return qtdeCorrecao;
		} ,

        getCard : function(idCard) {
            var card = {};
            for(var i = 0; i < data.json.cards.length; i++) {
                if(data.json.cards[i].id === idCard)
                    card = data.json.cards[i];
            }

            return card;
        } ,

        getCountCheckItems : function(checklist) {
            var qtdeCompleto = 0, qtdePendente = 0, qtdeIncompleto = 0;
            var card = {};

            checklist.checkItems.forEach(function(item) {
                if(item.state === enumState.incomplete) {

                    if(item.name.indexOf(enumState.emoji) !== -1)
                        qtdeIncompleto++;
                    else
                        qtdePendente++;
                } else {
                    qtdeCompleto++;
                }
            });

            return { 'completo'  : qtdeCompleto,
                     'pendente'  : qtdePendente,
                     'incompleto': qtdeIncompleto,
                     'card'      : this.getCard(checklist.idCard).name,
                     'idCard'    : checklist.idCard
                   };
        } ,

        getCountCheckItemsCards : function() {
            var objCheckGroupCard = [];
            var indexItemExists = 0;

            for(var i = 0; i < data.json.checklists.length; i++) {
                var item = data.json.checklists[i];
                indexItemExists = -1;

                for(var j = 0; j < objCheckGroupCard.length; j++) {
                    if(objCheckGroupCard[j].idCard === item.idCard)
                        indexItemExists = j;
                }

                if(indexItemExists !== -1) {

                    var qtdeItem = this.getCountCheckItems(item);
                    objCheckGroupCard[indexItemExists].completo   += qtdeItem.completo;
                    objCheckGroupCard[indexItemExists].pendente   += qtdeItem.pendente;
                    objCheckGroupCard[indexItemExists].incompleto += qtdeItem.incompleto;
                }
                else
                    objCheckGroupCard.push(controller.getCountCheckItems(item));
            }
            return objCheckGroupCard;
        } ,
		
		novaConsulta : function() {
			localStorage.clear();
			data.json = {};
			view.controlarExibicao();
		} , 

        init : function() {
           view.init();
		   
		   if(localStorage.getItem("json") !== null) {
			   data.json = localStorage.getItem("json");
			   view.renderizarDados();
		   }
			   
        }
    };

    var view =  {

        exibirMensagem : function(msg) {
            alert(msg);
        } ,

		renderizarDados : function() {
			this.controlarExibicao();
			var workspace     = document.getElementById('workspace');
			var linkWorkSpace = document.getElementById('link-work-space');
            var lastActivity  = document.getElementById('last-activity');

			workspace.innerHTML = data.json.name;
			linkWorkSpace.href = data.json.url;
            lastActivity.innerHTML = 'Data da última atividade: ' + controller.getFormatData(data.json.dateLastActivity);

            this.montarGraficoPizza();
            this.montarGraficoLinha();
            this.renderizarGraficosFunc();
		} ,
		
		controlarExibicao : function() {
			 if(localStorage.getItem("json") !== null) { 
				$('.json').hide();
		    	$('.content').show();
			 } else {
				 $('.content').hide();
				 $('.json').show();
			 }
		} , 

        renderizarGraficosFunc : function() {
            var divChartDetails = document.getElementById('chart-details');

            var checkItemsList = controller.getCountCheckItemsCards();
            var labels = ['A fazer', 'Pendentes', 'Concluídos'];

            checkItemsList.forEach(function(item) {
                var chart = {};

               /* var newTemplate = template.replace("{id}", item.idCard);
                divChartDetails.innerHTML += newTemplate;*/

                var divElem = document.createElement("div");
                divElem.className += "col-md-6 details";

                var canvasElem = document.createElement("canvas");
                canvasElem.id = item.idCard;

                divElem.appendChild(canvasElem);
                divChartDetails.appendChild(divElem);

               chart.data =
               {
                  labels: labels,
                  datasets: [{
                       label: labels[0],
                       data: [item.pendente, 0, 0],
                       backgroundColor: enumColors.pendente
                     },
                     {
                       label: labels[1],
                       data: [0, item.incompleto, 0],
                       backgroundColor:  enumColors.incompleto
                     },
                     {
                       label: labels[2],
                       data: [0, 0, item.completo],
                       backgroundColor: enumColors.completo
                    }
                  ]
               };

               chart.id = item.idCard;
               chart.tipo = 'bar';
               chart.title = item.card;
               view.renderChart(chart);
            });
        } ,

        montarGraficoLinha : function () {
            var chart = {};

            var qtdeCorrecao = controller.getCountComments();
			var objQtdes = controller.getCountCheckListDoneAndDoing();

            chart.data =
               {
                  labels: ['Itens a fazer ou pendentes', 'Correções Pendentes', 'Itens concluídos'],
                  datasets: [{
                       label: 'Itens a fazer ou pendentes',
                       data: [objQtdes.qtdeAFazer, 0, 0],
                       backgroundColor: enumColors.pendente
                     },
                     {
                       label: 'Correções Pendentes',
                       data: [0, qtdeCorrecao, 0],
                       backgroundColor: enumColors.incompleto
                    },

                     {
                       label: 'Itens concluídos',
                       data: [0, 0, objQtdes.qtdeFeita],
                       backgroundColor: enumColors.completo
                     }
                  ]
               };

            chart.id = 'myChartBar';
            chart.tipo = 'bar';
            chart.title = 'Funcionalidades / Correções';
            view.renderChart(chart);
        } ,

        montarGraficoPizza : function() {
            var chart = {};
            chart.labels = controller.getLabels();
            chart.colors = controller.getColorsLabels();
            chart.data = controller.getUsesLabels();

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

            view.renderChart(chart);
        } ,

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
        } ,

		init: function() {
            this.controlarExibicao();
			
			var btnNovo = document.getElementById('btnNovo');
			var btn = document.getElementById('btnGerarGraf');

            if(!btn) {
                console.log('Erro inesperado.');
            } else {
                btn.addEventListener('click', controller.armazenarJson);
            }
			
			if(!btnNovo) {
				console.log('Erro inesperado.');
			} else {
				btnNovo.addEventListener('click', controller.novaConsulta);
			}

             // Define a plugin to provide data labels
            Chart.plugins.register({
            afterDatasetsDraw: function(chart, easing) {
                // To only draw at the end of animation, check for easing === 1
                var ctx = chart.ctx;

                chart.data.datasets.forEach(function (dataset, i) {
                    var meta = chart.getDatasetMeta(i);
                    if (!meta.hidden) {
                        meta.data.forEach(function(element, index) {
                            // Draw the text in black, with the specified font
                            ctx.fillStyle = 'blue'; //'rgb(155, 155, 155)';

                            var fontSize = 16;
                            var fontStyle = 'normal';
                            var fontFamily = 'Helvetica Neue';
                            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                            // Just naively convert to string for now
                            var dataString = dataset.data[index].toString();
                            if(dataString === "0")
                                return;

                            // Make sure alignment settings are correct
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            var padding = 5;
                            var position = element.tooltipPosition();
                            ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                        });
                    }
                });
            }
        });

		}
    };

    controller.init();

})();