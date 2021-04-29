sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/m/MessageBox",
	"com/kcc/ZFIORD_SALES/util/Formatter",
	], function (BaseController,MessageBox,Formatter) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.Brands", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.kcc.ZFIORD_PC.controller.Brands
		 */
		"orId":"",
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("Brands")
			.attachMatched(this._onRouteBrandCreateMatched, this);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("oBrands")
			.attachMatched(this._onRouteBrandCreateMatched, this);
		},
		_onRouteBrandCreateMatched:function(oEvent){
			this.busyDailog.open();
			this.getOwnerComponent().getModel("oBrandsModel").setData([]);
			this.getOwnerComponent().getModel("oBrandsModel").refresh(true);
			this.resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var sOrg=this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			var oId=oEvent.getParameters().arguments.orderId;
			this.orId=oId;
			if(sOrg!==undefined){
				this.loadBrandsData();	
			}else if(sOrg===undefined && oId!==undefined){
				this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",false);
	        	this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",true);
				var orderData=this._onoDataLoad(oId);
				orderData.then(function(orData){
					if(orData==="data Success"){
						this.loadBrandsData();	
					}else{
						this.busyDailog.close();
					}               	
				}.bind(this));
			} 
			else if(sOrg==="" || sOrg===undefined){
				this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",true);
	        	this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",false);
				var sOrgData=this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
				if(sOrgData===undefined){
					var sOrgr=this._onInitialSOrgDataFetch();
					sOrgr.then(function(oSdata){
						if(oSdata==="success"){
							this.onloadSorgData();
						}
					}.bind(this));
				}
				else{
					this.onloadSorgData();
				}

				this.loadBrandsData();	
			}

		},
		onloadSorgData:function(){
			var sOrgData=this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
			if(sOrgData.length===1)
			{
				this.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",sOrgData[0].Vkorg);
				this.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",sOrgData[0].Vtext);
			}else{
				this._onSelectSorg();
			}
		},
		onSelectSorg: function(oEvent){
			var key=sap.ui.getCore().byId("idsorg").getSelectedKey();
			if(key==""){
				MessageBox.show("Please select sales org", {
					title: "Error", 
					styleClass: "messageBoxColr"
				});
			}
			else{
				var sText=sap.ui.getCore().byId("idsorg").getSelectedItem().getAdditionalText();
				this.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",sText);
				this.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",key);
				this._salesOrgSelection.close();
				this._salesOrgSelection.destroy();
			}
		},
		
		loadBrandsData:function(){
			var bData=this._fetchBrands();
			bData.then(function(bResData){
				if(bResData[1]==="success"){
					this.getView().getModel("oBrandsModel").setProperty("/Brands",bResData[0]);
					this.getView().getModel("oBrandsModel").refresh(true);
					this.busyDailog.close();
				}else if(bResData[1]==="error"){
					this.busyDailog.close();
					MessageBox.show(this.resourceBundle.getText("EMSG_006"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}
			}.bind(this));
		},
		_fetchBrands:function(){
			var oDataModel=this.getOwnerComponent().getModel("gQuoteModel");
			var url="/SetBrandsSet";
			return new Promise(function (resolve, reject) {
				oDataModel.read(url,{
					success:function(oResponse){
						resolve([oResponse.results,"success"]);
					},
					error:function(oError){
						resolve([oError,"error"]);
					}
				});
			}.bind(this));
		},
		onNavBackToHomePage:function(oEvent){
			this.getRouter().navTo("LaunchScreen");
		},
		
		onBrandsPress: function(oEvent) {
			this.busyDailog.open();
			var bId=oEvent.getSource().data("bId");
			if(this.orId===undefined || this.orId===""){
				this.getRouter().navTo("SubBrands", {
					brandId: bId
				});
			}else{
				this.getRouter().navTo("oSubBrands", {
					brandId: bId,
					orderId:this.orId
				});
			}

		}
	});

});