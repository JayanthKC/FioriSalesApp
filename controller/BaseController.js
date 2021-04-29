sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	], function(Controller, UIComponent, Filter, FilterOperator, FilterType, History, MessageBox, commoncodeused){
	"use strict";

	return Controller.extend("com.kcc.ZFIORD_SALES.controller.BaseController", {
		busyDailog: new sap.m.BusyDialog(),
		_navFlag: '',
		
		onNavBackToOrderPage:function(oEvent){
			var orderData=this.getOwnerComponent().getModel("oJsonModelOrder").getData().MapOrderHdr;
			var oId="";
			if(orderData!==undefined){
				if(orderData.length>0) {
					oId=orderData[0].Vbeln;
				}
			}
			var gModel=this.getOwnerComponent().getModel("globalModel").getData();
			if(gModel.dFlag){
				this.getRouter().navTo("dOrderCreation",{
					dOrderId:oId
				});
			}else if(gModel.cqFlag){
					this.getRouter().navTo("cqOrderCreation",{
						cqOrderId:oId
					});
			}else if(gModel.cFlag){
					this.getRouter().navTo("cOrderCreation",{
						cOrderId:oId
					});
			}else
			{
				this.getRouter().navTo("OrderCreation");
			}
		},
		_onoDataLoad:function(orderId){
			if(orderId.indexOf("c")!==-1){
				this.getOwnerComponent().getModel("globalModel").setProperty("/cFlag",true);
				if(orderId.indexOf("q")!==-1){
					this.getOwnerComponent().getModel("globalModel").setProperty("/qFlag",true);	
					var fData=commoncodeused.loadQuotationEntity(orderId.split("cq")[1],this);
				}else{
					fData=commoncodeused.loadOrderExpandEntity(orderId.split("c")[1],this);
				}				
			}else{
				fData=commoncodeused.loadOdataQuotationEntity(orderId.split("d")[1],this);
				this.getOwnerComponent().getModel("globalModel").setProperty("/dFlag",true);
				this.getOwnerComponent().getModel("globalModel").setProperty("/qFlag",true);
			}
			return fData;
		},
		onQuantChange:function(oEvent){
			var oPath=oEvent.getSource().getBindingContext("oCartModel").getPath();
			var oValue=oEvent.getSource().getValue();
			var oProduct=this.getOwnerComponent().getModel("oCartModel").getProperty(oPath);
			if(oProduct.Letyp === "S1"){
				var cPallet=oProduct.CsS1;
			}else if(oProduct.Letyp === "S2"){
				cPallet=oProduct.CsS2;
			}else if(oProduct.Letyp=== "S3"){
				cPallet=oProduct.CsS3;
			}
			oProduct.Palletqty=(parseFloat(oValue)/parseFloat(cPallet)).toFixed(2);
			this.getOwnerComponent().getModel("oCartModel").setProperty(oPath,oProduct);
			this.getOwnerComponent().getModel("oCartModel").refresh(true);
		},
		masterListItemSelection:function(oEvent){
			var oList = oEvent.getSource();
			var aItems = oList.getItems();
			if(this.getOwnerComponent().getModel("globalModel").getProperty("/fSelect") && 
					this.getOwnerComponent().getModel("globalModel").getPoperty("/Ssearch")){           
	                oList.setSelectedItem(aItems[0]);
	        }else{
				var sBrandsData=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/subBrands");
				var sbIndex=_.findIndex(sBrandsData,{
					Prodh:this.getOwnerComponent().getModel("globalModel").getProperty("/sSbid")
				});
				oList.setSelectedItem(aItems[sbIndex]);
			}
			this.getView().byId("id_pSBList").setBusy(false);
		},

		onProceddToOrderPress:function(oEvent){
			var oCartData=this.getOwnerComponent().getModel("oCartModel").getData();
			this.getOwnerComponent().getModel("oJsonModelOrder").setProperty("/MapOrderItems",oCartData);
			this.getOwnerComponent().getModel("oJsonModelOrder").refresh(true);
			this.getOwnerComponent().getModel("oCartModel").setData([]);
			this.getOwnerComponent().getModel("oCartModel").refresh(true);
			this.onNavBackToOrderPage();
		},
		onNProductDeletePress:function(oEvent){
			var path=oEvent.getSource().getBindingContext("oCartModel").getPath().split("/");
			var pathId=path[path.length-1];
			var oProduct=this.getOwnerComponent().getModel("oCartModel").getProperty("/"+pathId);
			var oProductData=this.getOwnerComponent().getModel("oCartModel").getData();
			
			if(oProduct.Updateflag==="I" || oProduct.Updateflag === undefined){
				oProductData.splice(pathId, 1);
				this.getOwnerComponent().getModel("oCartModel").setData(oProductData);
			}else if(oProduct.Updateflag==="U"){
				oProductData[pathId].Updateflag="D";
				this.getOwnerComponent().getModel("oCartModel").setData(oProductData);
			}
			this.getOwnerComponent().getModel("oCartModel").refresh(true);
			var oBModel=this.getOwnerComponent().getModel("oBrandsModel");
			/*var sData=oBModel.getData().skuData;
			oBModel.getData().skuData=[];
			oBModel.refresh(true);
			oBModel.getData().skuData=sData;*/
			oBModel.refresh(true);
		},		
		onptfilterapply:function(oEvent){
			var oBinding = oEvent.getSource().getBinding("items");
			var oFilter=new Filter("Updateflag","NE","D");
			if(this.getOwnerComponent().getModel("globalModel").getProperty("/dFlag")){
				oBinding.filter([oFilter]);
			}
			else{
				oBinding.filter([]);
			}					
		},

		//oJsonModelOrderList : new sap.ui.model.json.JSONModel(),
		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("AllOrders", {}, true /*no history*/);
			}
		},

		getPCResourceModel: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},	

		_onInitialSOrgDataFetch: function(){
			var that=this;
			var oDataModel=that.getOwnerComponent().getModel("quoteModel");
			return new Promise(function (resolve, reject) {
				oDataModel.read("/GetSorgF4Set", {
					success: function(oResponse) {					
						that.getOwnerComponent().getModel("globalModel").setProperty("/sOrgData",oResponse.results);
						console.log(oResponse);
						
						that.busyDailog.close();
						
						if(oResponse.results.length == 1) {
							this.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",oResponse.results[0].Vtext);
							this.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",oResponse.results[0].Vkorg);
						}
						resolve("success");
					},
					error: function(oError) {
						that.busyDailog.close();
						console.log(oError);
						resolve("error");
						MessageBox.show("Error in fetching Sales Organization List", {
							title: "Error",
							styleClass: "messageBoxColr"
						});
					}
				});
			}.bind(this));
		},

		onSelectSorg: function(){
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

				if(this._navFlag === 'X') {
					var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
					loRouter.navTo("Brands");
					this._navFlag = '';
				}else {
					var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
					loRouter.navTo("AllCustomers");	 	
				}

			}
		},

		_onSelectSorg: function(){
			if (!this._salesOrgSelection) {
				this._salesOrgSelection = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.selectSOrg", this);
				this.getView().addDependent(this._salesOrgSelection);
			}
			this._salesOrgSelection.open();	
		},

		onCancelSOrgPress: function() {
			this._navFlag = '';
			this._salesOrgSelection.close();
		},

		onCartPress: function() {
			if(!this._cartFragment){
				this._cartFragment = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.cart", this);
				this.getView().addDependent(this._cartFragment);
			}
			this._cartFragment.open();
		},

		onCartClose:function(){
			this._cartFragment.close();
		}

	});
});