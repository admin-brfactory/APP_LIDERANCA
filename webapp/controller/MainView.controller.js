sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"com/arcelor/ZLIDERANCA_AREA/model/formatter"
], function(Controller, JSONModel, MessageBox, formatter) {
	"use strict";

	return Controller.extend("com.arcelor.ZLIDERANCA_AREA.controller.mainview2", {

		formatter: formatter,

		onInit: function() {
			var oViewModel = new JSONModel({
				LinkPortaCompSeguro: "",
				N_Anomalia: "N° Anomalia",
				N_Aboradgem: "N° Abordagem",
				ListTemasVerifcados: [],
				ListTemasVerifcado: [],
				NomeUsuario: "",
				TabelaDados: [],
				TemaAbordados: "",
				GravarBTN: "",
				Matricula: "",
				SelectRowData: "",
				ListLocais: [],
				ListParticipantes: [],
				ListTemas: [],
				LocalInp: "",
				AreaText: "",
				ParameterPeriodo: "",
				ParameterLocal: "",
				ParameterSQNR: "",
				DadosGravarPeriodo: "",
				DadosGravarData: "",
				DadosGravarLocal: "",
				VisibleScreenComParameter: false,
				VisibleScreenSemParameter: false,
				VisibleCheckBoxItensVerif: false,
				EnabledCheckBoxItensVerif: false,
				VisibleCheckBoxItensVerifParam: false,
				EnabledCheckBoxItensVerifParam: false,
				TabVisible: false,
				RelatorioVisible: false,
				enableBtnRealizar: true,
				enableBtnGravar: true,
				enableTextArea: true,
				TemasVerifMode: "MultiSelect",
				tab_grupos: "",
				oTableItemNumber: 0
			});

			this.getView().setModel(oViewModel, "CheckInView");
			this.getUrlParameter();
			this.getListaLocais();
		},

		getUrlParameter: function() {
			var oViewModel = this.getView().getModel("CheckInView");
			var oHashChanger = new sap.ui.core.routing.HashChanger();
			var sHash = oHashChanger.getHash();
			var oArrayAux = [];
			if (sHash.includes("?")) {
				oViewModel.setProperty("/VisibleScreenComParameter", true); //Habilita view para quando usuário utilizar link do email para entrar
				sHash = sHash.split("?");
				sHash.splice(0, 1); // Retira o parâmetro de display
				for (var i in sHash) {
					var indexSpecialCaracter = sHash[i].indexOf("=");
					var AuxValueHash = sHash[i].substr(indexSpecialCaracter + 1);
					oArrayAux.push(AuxValueHash);
				}

				oViewModel.setProperty("/ParameterPeriodo", oArrayAux[0]);
				oViewModel.setProperty("/ParameterLocal", oArrayAux[1]);
				oViewModel.setProperty("/ParameterSQNR", oArrayAux[2]);

				this.getRelatComParameter();
			} else {
				oViewModel.setProperty("/VisibleScreenSemParameter", true); // Habilita view para quando o usuário ingressar no app fora do link enviado por email
			}
		},

		getRelatComParameter: function() { //Busca os dados de relatório quando há parâmetro na URL
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var Periodo = oViewModel.getProperty("/ParameterPeriodo");
			var Local = oViewModel.getProperty("/ParameterLocal");
			var Sqnr = oViewModel.getProperty("/ParameterSQNR");
			var sUrl = "/GET_DADOS_RELATORIOSet(PERIODO='" + Periodo + "',LOCAL='" + Local + "',SEQNR='" + Sqnr + "')";

			sap.ui.core.BusyIndicator.show();

			oModel.read(sUrl, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var aListTemas = [];

					oViewModel.setProperty("/AreaText", oData.RELATAR_PONTOS_RELEVAN);
					oViewModel.setProperty("/LinkPortaCompSeguro", oData.LINK_PORTAL_SEG);

					if (oData.IS_REALIZADO === "X") {
						oViewModel.setProperty("/enableBtnRealizar", false);
						oViewModel.setProperty("/enableBtnGravar", false);
						oViewModel.setProperty("/enableTextArea", false);
						oViewModel.setProperty("/VisibleCheckBoxItensVerifParam", true);
						oViewModel.setProperty("/TemasVerifMode", "None");
					} else {
						oViewModel.setProperty("/enableBtnRealizar", true);
						oViewModel.setProperty("/enableBtnGravar", true);
						oViewModel.setProperty("/enableTextArea", true);
						oViewModel.setProperty("/VisibleCheckBoxItensVerifParam", false);
						oViewModel.setProperty("/TemasVerifMode", "MultiSelect");
					}

					if (oData.LISTA_PARTICIPANTES) {
						var oParticipantes = JSON.parse(oData.LISTA_PARTICIPANTES);
						oViewModel.setProperty("/ListParticipantes", oParticipantes);
					}

					if (oData.LISTA_PRIORI_TEMAS) {
						var oTemas = JSON.parse(oData.LISTA_PRIORI_TEMAS);
						aListTemas.push({
							TEMA: oTemas[0].TEMA01
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA02
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA03
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA04
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA05
						});
						oViewModel.setProperty("/ListTemas", aListTemas);
					}

					var oVerifi = [];

					if (oData.LISTA_ITENS_VERIFI != "[]") {
						oVerifi = JSON.parse(oData.LISTA_ITENS_VERIFI);
						oViewModel.setProperty("/ListTemasVerifcados", oVerifi);

						var oListTemasVerif = this.getView().byId("temasVerificado").getItems();

						for (var count in oVerifi) {
							if (oVerifi[count].VALOR == "X") {
								oListTemasVerif[count].setSelected(true);
								oListTemasVerif[count].getAggregation("content")[0].getAggregation("content")[0].setSelected(true);
							} else {
								oListTemasVerif[count].setSelected(false);
								oListTemasVerif[count].getAggregation("content")[0].getAggregation("content")[0].setSelected(false);
							}
						}
					} else {
						oViewModel.setProperty("/ListTemasVerifcados", oVerifi);
					}

					if (oData.LOCAL) {
						oViewModel.setProperty("/LocalInp", oData.LOCAL);
					}

					oViewModel.setProperty("/RelatorioVisible", true);
					oViewModel.setProperty("/DadosGravarPeriodo", Periodo);
					oViewModel.setProperty("/DadosGravarLocal", Local);
					oViewModel.setProperty("/DadosGravarSEQNR", Sqnr);

				}.bind(this),

				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		getTabelaDados: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var Matricula = oViewModel.getProperty("/Matricula");
			var Local = this.getView().byId("LocL").getSelectedKey();
			var Periodo = this.getView().byId("Data").getDateValue();

			if (Matricula === "") {
				MessageBox.error("Favor preencher uma Matricula!");
				return;
			}

			if (Periodo !== null && Periodo !== "") {
				Periodo = Periodo.toLocaleDateString().substr(3);
				Periodo = Periodo.replaceAll("/", ".");
			} else {
				Periodo = "";
			}

			if (oViewModel.getProperty("/RelatorioVisible") === true) {
				var oListItensVerif = this.getView().byId("temasVerificados");
				oListItensVerif.removeSelections();
				oViewModel.setProperty("/RelatorioVisible", false);
			}

			var sUrl = "/GET_GRUPOSSet(PERIODO='" + Periodo + "',MATRICULA='" + Matricula + "',LOCAL='" + Local + "')";

			sap.ui.core.BusyIndicator.show();

			oModel.read(sUrl, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					if (oData.TAB_MENSAGEM) {
						var oMensagem = JSON.parse(oData.TAB_MENSAGEM);

						for (var i in oMensagem) {
							if (oMensagem[i].TYPE === "E") {
								MessageBox.error(oMensagem[i].MESSAGE);
								return;
							}
						}
					}

					if (oData.TAB_GRUPOS) {
						var oTabelaDados = JSON.parse(oData.TAB_GRUPOS);
						oViewModel.setProperty("/TabelaDados", oTabelaDados);
					}

					if (oData.NOME) {
						oViewModel.setProperty("/NomeUsuario", oData.NOME);
					}

					oViewModel.setProperty("/TabVisible", true);

				}.bind(this),

				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}

			});

		},

		onIsRealizado: function(oEvent) {
			var oMode = oEvent;
			var oTable = this.getView().byId("temasVerificados");
			var oItemNavigation = oTable.getItemNavigation();
			var oItemRef = oItemNavigation.getItemDomRefs();

			for (var i = 1; i < oItemRef.length; i++) {
				var oDomRef = oItemRef[i].cells[0];
				var oCheckBoxId = oDomRef.childNodes[0].childNodes[0].id;
				var oTextMatch = oTable.getAggregation("items")[i - 1].getCells()[1].getText();
				if (oTextMatch == "33") {
					var oSelectBox = sap.ui.getCore().byId(oCheckBoxId);
					oSelectBox.setEnabled(false);
				}
			}

		},

		VisibleRelatorio: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var oListItensVerif = this.getView().byId("temasVerificados");
			var oTablePath = oEvent.getSource().getBindingContext("CheckInView").getPath();
			var oDados = oViewModel.getProperty(oTablePath);
			var sUrl = "/GET_DADOS_RELATORIOSet(PERIODO='" + oDados.PERIOD + "',LOCAL='" + oDados.CODLOCAL + "',SEQNR='" + oDados.SEQNR + "')";

			oListItensVerif.removeSelections();
			sap.ui.core.BusyIndicator.show();

			oModel.read(sUrl, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					oViewModel.setProperty("/RelatorioVisible", true);
					var aListTemas = [];

					oViewModel.setProperty("/AreaText", oData.RELATAR_PONTOS_RELEVAN);

					if (oData.LINK_PORTAL_SEG) {
						oViewModel.setProperty("/LinkPortaCompSeguro", oData.LINK_PORTAL_SEG);
					}

					if (oData.IS_REALIZADO === "X") {
						oViewModel.setProperty("/enableBtnRealizar", false);
						oViewModel.setProperty("/enableBtnGravar", false);
						oViewModel.setProperty("/enableTextArea", false);
						oViewModel.setProperty("/VisibleCheckBoxItensVerif", true);
						oViewModel.setProperty("/TemasVerifMode", "None");
					} else {
						oViewModel.setProperty("/enableBtnRealizar", true);
						oViewModel.setProperty("/enableBtnGravar", true);
						oViewModel.setProperty("/enableTextArea", true);
						oViewModel.setProperty("/VisibleCheckBoxItensVerif", false);
						oViewModel.setProperty("/TemasVerifMode", "MultiSelect");
					}

					if (oData.LISTA_PARTICIPANTES) {
						var oParticipantes = JSON.parse(oData.LISTA_PARTICIPANTES);
						oViewModel.setProperty("/ListParticipantes", oParticipantes);
					}

					if (oData.LISTA_PRIORI_TEMAS != "[]") {
						var oTemas = JSON.parse(oData.LISTA_PRIORI_TEMAS);
						aListTemas.push({
							TEMA: oTemas[0].TEMA01
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA02
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA03
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA04
						});
						aListTemas.push({
							TEMA: oTemas[0].TEMA05
						});
						oViewModel.setProperty("/ListTemas", aListTemas);
					} else {
						oViewModel.setProperty("/ListTemas", aListTemas);
					}

					var oVerifi = [];

					if (oData.LISTA_ITENS_VERIFI != "[]") {
						oVerifi = JSON.parse(oData.LISTA_ITENS_VERIFI);
						oViewModel.setProperty("/ListTemasVerifcados", oVerifi);

						var oListTemasVerif = this.getView().byId("temasVerificados").getItems();

						for (var count in oVerifi) {
							if (oVerifi[count].VALOR == "X") {
								oListTemasVerif[count].setSelected(true);
								oListTemasVerif[count].getAggregation("content")[0].getAggregation("content")[0].setSelected(true);
							} else {
								oListTemasVerif[count].setSelected(false);
								oListTemasVerif[count].getAggregation("content")[0].getAggregation("content")[0].setSelected(false);
							}
						}
					} else {
						oViewModel.setProperty("/ListTemasVerifcados", oVerifi);
					}

					oViewModel.setProperty("/LocalInp", oData.LOCAL);

					oViewModel.setProperty("/oDadosSelecionados", oDados);
					oViewModel.setProperty("/DadosGravarPeriodo", oDados.PERIOD);
					oViewModel.setProperty("/DadosGravarLocal", oDados.CODLOCAL);
					oViewModel.setProperty("/DadosGravarSEQNR", oDados.SEQNR);
					oViewModel.setProperty("/oTableItemNumber", oTablePath.substr(13));

				}.bind(this),

				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}
			});

		},

		onGravar: function(sID) {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var oTableItemNumber = oViewModel.getProperty("/oTableItemNumber");
			var usuario = sap.ushell.Container.getService("UserInfo").getId();
			var ListTemas = oViewModel.getProperty("/ListTemas");
			var ListParticipantes = oViewModel.getProperty("/ListParticipantes");
			var AreaTexto = oViewModel.getProperty("/AreaText");
			var ListTemasVerifBinding = oViewModel.getProperty("/ListTemasVerifcados");
			var oListTemasVerif = this.getView().byId(sID);
			var oListTemasVerifItems = oListTemasVerif.getItems();
			var SelectedVerifItems = oListTemasVerif.getSelectedContextPaths();
			var CheckTipoView = oViewModel.getProperty("/VisibleScreenComParameter");

			if (SelectedVerifItems.length === 0) {
				MessageBox.error("Necessário Selecionar pelo um item de verificação");
				return;
			}

			for (var count in oListTemasVerifItems) {
				if (oListTemasVerifItems[count].getSelected() === false) {
					var oListBinding = oListTemasVerif.getBindingInfo("items").path;
					var oPropertyValue = oViewModel.getProperty(oListBinding + "/" + count);
					oPropertyValue.VALOR = "";
				}
			}

			for (var i in SelectedVerifItems) {
				var oItemSelected = oViewModel.getProperty(SelectedVerifItems[i]);

				oItemSelected.VALOR = "X";
			}

			var oEntry = {
				TEMAS_VERIFICADOS: JSON.stringify(ListTemasVerifBinding),
				PONTOS_RELEVANTES: AreaTexto,
				LISTA_PARTICIPANTES: JSON.stringify(ListParticipantes),
				LISTA_TEMAS: JSON.stringify(ListTemas),
				USUARIO: usuario
			};

			MessageBox.confirm("Deseja gravar dados de relatório?", {
				onClose: function(oAction) {
					if (oAction == "OK") {
						sap.ui.core.BusyIndicator.show();
						oModel.create("/GRAVAR_DADOS_RELATORIOSet", oEntry, {

							success: function(oData) {
								sap.ui.core.BusyIndicator.hide();

								if (oData.TAB_MENSAGEM) {
									var oMensagem = JSON.parse(oData.TAB_MENSAGEM);
									var checkError = false;
									for (i in oMensagem) {
										if (oMensagem[i].TYPE === "S") {
											MessageBox.success(oMensagem[i].MESSAGE);
										} else {
											checkError = true;
											MessageBox.error(oMensagem[i].MESSAGE);
										}
									}

									if (checkError === false && CheckTipoView === false) {
										oListTemasVerif.removeSelections();
										this.getView().byId("idTable").getItems()[oTableItemNumber].firePress();
									}

									if (CheckTipoView === true) {
										oListTemasVerif.removeSelections();
										this.getRelatComParameter();
									}
								}

							}.bind(this),

							error: function(error) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocorreu um erro inesperado ao salvar os dados, tente novamente.");
							}.bind(this)

						});
					}
				}.bind(this)
			});
		},

		onRealizar: function(sID) {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var oTableItemNumber = oViewModel.getProperty("/oTableItemNumber");
			var usuario = sap.ushell.Container.getService("UserInfo").getId();
			var ListTemas = oViewModel.getProperty("/ListTemas");
			var ListParticipantes = oViewModel.getProperty("/ListParticipantes");
			var AreaTexto = oViewModel.getProperty("/AreaText");
			var ListTemasVerifBinding = oViewModel.getProperty("/ListTemasVerifcados");
			var oListTemasVerif = this.getView().byId(sID);
			var oListTemasVerifItems = oListTemasVerif.getItems();
			var SelectedVerifItems = oListTemasVerif.getSelectedContextPaths();
			var CheckTipoView = oViewModel.getProperty("/VisibleScreenComParameter");

			if (SelectedVerifItems.length === 0) {
				MessageBox.error("Necessário Selecionar pelo um item de verificação");
				return;
			}

			for (var count in oListTemasVerifItems) {
				if (oListTemasVerifItems[count].getSelected() === false) {
					var oListBinding = oListTemasVerif.getBindingInfo("items").path;
					var oPropertyValue = oViewModel.getProperty(oListBinding + "/" + count);
					oPropertyValue.VALOR = "";
				}
			}

			for (var i in SelectedVerifItems) {
				var oItemSelected = oViewModel.getProperty(SelectedVerifItems[i]);

				oItemSelected.VALOR = "X";
			}

			var oEntry = {
				TEMAS_VERIFICADOS: JSON.stringify(ListTemasVerifBinding),
				PONTOS_RELEVANTES: AreaTexto,
				LISTA_PARTICIPANTES: JSON.stringify(ListParticipantes),
				LISTA_TEMAS: JSON.stringify(ListTemas),
				USUARIO: usuario
			};

			MessageBox.confirm("Deseja marcar como realizados?", {
				onClose: function(oAction) {
					if (oAction == "OK") {
						sap.ui.core.BusyIndicator.show();
						oModel.create("/REALIZAR_DADOSSet", oEntry, {

							success: function(oData) {
								sap.ui.core.BusyIndicator.hide();

								if (oData.TAB_MENSAGEM) {
									var checkError = false;
									var oMensagem = JSON.parse(oData.TAB_MENSAGEM);

									for (i in oMensagem) {
										if (oMensagem[i].TYPE === "S") {
											MessageBox.success(oMensagem[i].MESSAGE);
										} else {
											checkError = true;
											MessageBox.error(oMensagem[i].MESSAGE);
										}
									}
									if (checkError === false && CheckTipoView === false) {
										oListTemasVerif.removeSelections();
										this.getView().byId("idTable").getItems()[oTableItemNumber].firePress();
									}

									if (CheckTipoView === true) {
										oListTemasVerif.removeSelections();
										this.getRelatComParameter();
									}
								}

							}.bind(this),

							error: function(error) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocorreu um erro inesperado ao salvar os dados, tente novamente.");
							}.bind(this)

						});
					}
				}.bind(this)
			});
		},

		onEncerrar: function(sID) {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var oTableItemNumber = oViewModel.getProperty("/oTableItemNumber");
			var usuario = sap.ushell.Container.getService("UserInfo").getId();
			var ListTemas = oViewModel.getProperty("/ListTemas");
			var ListParticipantes = oViewModel.getProperty("/ListParticipantes");
			var AreaTexto = oViewModel.getProperty("/AreaText");
			var ListTemasVerifBinding = oViewModel.getProperty("/ListTemasVerifcados");
			var oListTemasVerif = this.getView().byId(sID);
			var oListTemasVerifItems = oListTemasVerif.getItems();
			var SelectedVerifItems = oListTemasVerif.getSelectedContextPaths();
			var CheckTipoView = oViewModel.getProperty("/VisibleScreenComParameter");

			if (SelectedVerifItems.length === 0) {
				MessageBox.error("Necessário Selecionar pelo um item de verificação");
				return;
			}

			for (var count in oListTemasVerifItems) {
				if (oListTemasVerifItems[count].getSelected() === false) {
					var oListBinding = oListTemasVerif.getBindingInfo("items").path;
					var oPropertyValue = oViewModel.getProperty(oListBinding + "/" + count);
					oPropertyValue.VALOR = "";
				}
			}

			for (var i in SelectedVerifItems) {
				var oItemSelected = oViewModel.getProperty(SelectedVerifItems[i]);

				oItemSelected.VALOR = "X";
			}

			var oEntry = {
				TEMAS_VERIFICADOS: JSON.stringify(ListTemasVerifBinding),
				PONTOS_RELEVANTES: AreaTexto,
				LISTA_PARTICIPANTES: JSON.stringify(ListParticipantes),
				LISTA_TEMAS: JSON.stringify(ListTemas),
				USUARIO: usuario
			};

			MessageBox.confirm("Ao marcar como encerrado não será possível modicações. Deseja continuar?", {
				onClose: function(oAction) {
					if (oAction == "OK") {
						sap.ui.core.BusyIndicator.show();
						oModel.create("/ENCERRARSet", oEntry, {

							success: function(oData) {
								sap.ui.core.BusyIndicator.hide();

								if (oData.TAB_MENSAGEM) {
									var checkError = false;
									var oMensagem = JSON.parse(oData.TAB_MENSAGEM);

									for (i in oMensagem) {
										if (oMensagem[i].TYPE === "S") {
											MessageBox.success(oMensagem[i].MESSAGE);
										} else {
											checkError = true;
											MessageBox.error(oMensagem[i].MESSAGE);
										}
									}
									if (checkError === false && CheckTipoView === false) {
										oListTemasVerif.removeSelections();
										this.getView().byId("idTable").getItems()[oTableItemNumber].firePress();
									}

									if (CheckTipoView === true) {
										oListTemasVerif.removeSelections();
										this.getRelatComParameter();
									}
								}

							}.bind(this),

							error: function(error) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Ocorreu um erro inesperado ao salvar os dados, tente novamente.");
							}.bind(this)

						});
					}
				}.bind(this)
			});
		},

		checaNumerico: function(sID, sLength) {
			var regExp = /[a-zA-Z]/g;
			var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?°¨¨ºª₢£¢¬§`~´çÇ]+/;
			var sValue = this.getView().byId(sID).getValue();

			if (sLength) {
				this.getView().byId(sID).setValue(sValue.substr(0, sLength));
			}

			if (regExp.test(sValue) || format.test(sValue)) {
				this.getView().byId(sID).setValue(sValue.substring(0, sValue.length - 1));
			}
		},

		getListaLocais: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("CheckInView");
			var usuario = sap.ushell.Container.getService("UserInfo").getId();
			var sUrl = "/GET_LISTA_LOCAISSet(USUARIO='" + usuario + "')";

			sap.ui.core.BusyIndicator.show();

			oModel.read(sUrl, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					if (oData.LISTA_LOCAIS) {
						var oListaLocais = JSON.parse(oData.LISTA_LOCAIS);
						oListaLocais.unshift({
							CODLOCAL: "",
							ZLOCAL: ""
						});
						oViewModel.setProperty("/ListLocais", oListaLocais);
					}

				}.bind(this),

				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}
			});
		}
	});
});