(function(){

    'use strict'

    var data = {
        json: {} ,
        enumState: {
           'incomplete' : 'incomplete',
           'complete'   : 'complete'  ,
           'emoji'      : ':warning:'
         } ,
         enumColors: {
           'pendente'  : 'black',
           'incompleto': 'red',
           'completo'  : 'green'
         } 
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
				localStorage.setItem("json", JSON.stringify(data.json));
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

        getSMSs : function() {
            var sms = [];

            data.json.actions.forEach(function(item) {
                if(item.data.text != null ) {
                    var smsSplit = item.data.text.split('-');
                    sms.push({'sms': smsSplit[0], 'funcionalidade': smsSplit[1]});
                }
            });

            return sms.sort(function(a, b){return (a.funcionalidade > b.funcionalidade) ? 1 : ((b.funcionalidade > a.funcionalidade) ? -1 : 0);});
        } ,

        getCountCheckItems : function(checklist) {
            var qtdeCompleto = 0, qtdeAFazer = 0, qtdePendente = 0;
            var card = {};

            checklist.checkItems.forEach(function(item) {
                if(item.state === data.enumState.incomplete) {

                    if(item.name.indexOf(data.enumState.emoji) !== -1)
                        qtdePendente++;
                    else
                        qtdeAFazer++;
                } else {
                    qtdeCompleto++;
                }
            });

            return { 'completo'  : qtdeCompleto,
                     'aFazer'  : qtdeAFazer,
                     'pendente': qtdePendente,
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
                    objCheckGroupCard[indexItemExists].aFazer += qtdeItem.aFazer;
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
			view.clearPage();
		} ,

        init : function() {

           view.init();

		   if(localStorage.getItem("json") !== null) {
			   data.json = JSON.parse(localStorage.getItem("json"));
			   view.renderizarDados();
		   }

        }
    };

    var view =  {

        exibirMensagem : function(msg) {
            alert(msg);
        },

        clearPage : function() {
            document.getElementById('chart-details').innerHTML = '';
        } ,

		controlarExibicao : function() {
			 if(localStorage.getItem("json") !== null) {
				$('.json').hide();
				$('.content').show();
				$('#link-work-space').show();
				$('#titleDefault').hide();
			 } else {
			     $('.json').show();
			     $('.content').hide();
			     $('#link-work-space').hide();
			     $('#titleDefault').show();
			 }
		} ,

        renderizarGraficosDetalhes : function() {
            var divChartDetails = document.getElementById('chart-details');

            var checkItemsList = controller.getCountCheckItemsCards();

            checkItemsList.forEach(function(item) {
                var chart = {};

                var divElem = document.createElement("div");
                divElem.className += "col-md-6 details";

                var canvasElem = document.createElement("canvas");
                canvasElem.id = item.idCard;

                divElem.appendChild(canvasElem);
                divChartDetails.appendChild(divElem);
                
               view.montarGrafico(
                { 'aFazer': item.aFazer , 'pendente': item.pendente, 'concluido': item.completo },
                { 'aFazer': 'A fazer', 'pendente': 'Pendentes', 'concluido': 'Concluídos' },
                item.card, 'bar', item.idCard);
            });
        } ,

        montarGrafico : function (objValores, labels, title, type, id) {
            var chart = {};
          
            chart.data =
               {
                  labels: Object.values(labels),
                  datasets: [{
                       label: labels.aFazer,
                       data: [objValores.aFazer, 0, 0],
                       backgroundColor: data.enumColors.pendente
                     },
                     {
                       label: labels.pendente,
                       data: [0, objValores.pendente, 0],
                       backgroundColor: data.enumColors.incompleto
                    },

                     {
                       label: labels.concluido,
                       data: [0, 0, objValores.concluido],
                       backgroundColor: data.enumColors.completo
                     }
                  ]
               };

            chart.id = id;
            chart.tipo = type;
            chart.title = title;
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

        monstarGraficoCorrecao : function() {
            var qtdeCorrecao = controller.getCountComments();
			var objQtdes = controller.getCountCheckListDoneAndDoing();

            this.montarGrafico(
                { 'aFazer': objQtdes.qtdeAFazer , 'pendente': qtdeCorrecao, 'concluido': objQtdes.qtdeFeita },
                { 'aFazer': 'Itens a fazer ou pendentes', 'pendente': 'Correções Pendentes', 'concluido': 'Itens Concluídos' },
                'Funcionalidades / Correções', 'bar', 'myChartBar');
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

        definirLabelsChart : function() {
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

                            var fontSize = 18;
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
        } ,

        exibirDetalhesSMS : function() {
            
            var sms = controller.getSMSs();
            
            if(sms.length === 0)
             return;

            sms.forEach(function(item, pos) {
               var newRow = $("<tr>");             
               newRow.append('<td>' + (pos + 1) + '</td>');
               newRow.append('<td>' + item.sms + '</td>');
               newRow.append('<td>' + item.funcionalidade + '</td>');
               newRow.append('<td></td>');
               $('#smsTable').append(newRow);
            });
            
            return false;
        } ,

        exibirSMSsSeparadas : function() {
            var table = $('#smsTable').children('tbody').children('tr');
            var strBuilder = '';
            var valueTd = '';

            $.each(table, function(key, value) {
               valueTd = $(value).children('td')[1].innerHTML;                             
               strBuilder += valueTd.substring(0, valueTd.length -1) + ';';
            });

            if(strBuilder.length > 0)
               strBuilder = strBuilder.substring(0, strBuilder.length - 1);

            view.exibirMensagem(strBuilder);
        } ,

        renderizarDados : function() {
			this.controlarExibicao();

			var workspace     = document.getElementById('workspace');
			var lastActivity = document.getElementById('last-activity');
			var linkWorkSpace = document.getElementById('link-work-space');

			workspace.innerHTML = data.json.name;
			linkWorkSpace.href = data.json.url;
            lastActivity.innerHTML = 'Data da última atividade: ' + controller.getFormatData(data.json.dateLastActivity);

            this.montarGraficoPizza();
            this.monstarGraficoCorrecao();
            this.renderizarGraficosDetalhes();
            this.exibirDetalhesSMS();
		} ,

		init: function() {
            this.controlarExibicao();

			var btnNovo = document.getElementById('btnNovo');
			var btn = document.getElementById('btnGerarGraf');
            var btnSMSs = document.getElementById('btnSMSsSeparadas');

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

            if(!btnSMSs) {
                console.log('Erro inesperado.');                
            } else {
                btnSMSs.addEventListener('click', this.exibirSMSsSeparadas);
            }

            this.definirLabelsChart();
		}
    };

    controller.init();

})();