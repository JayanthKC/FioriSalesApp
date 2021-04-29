sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
], function (BaseController, commoncodeused, JSONModel, Filter, FilterOperator,MessageBox) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.AllCustomers", {
		emptyArry : [],

		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("AllCustomers")
			.attachMatched(this._onRouteAllcustomMatched, this);
		},
		
		_onRouteAllcustomMatched:function(){
			this.resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getOwnerComponent().getModel("globalModel").setProperty("/dPType",[]);
		    var selectedKey=this.getView().getModel("globalModel").getProperty("/selectedKey");
		    this.getView().byId("idAllCustomersList").setVisible(true);
		    
		    var sOrgData = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
        	var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
        	
		    if(sOrg !== undefined) {
		    	commoncodeused.fetchCustomerData(this, false);
		    }else {
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
				commoncodeused.fetchCustomerData(this, false);
			}
		},
		
		onTypeOfCustomersListChange: function(oEvent) {	
			var oKey=oEvent.getSource().getSelectedKey();
			var	aFilters=[];
			if(oKey==="favourites")
			{
				aFilters.push(new Filter("IsFavourite","EQ","X"));
			}else if(oKey==="All Products"){

			}
			var oTable = this.byId("idAllCustomersList");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},
		
		onFavouritesPress: function(oEvent)
		{
			this.busyDailog.open();
			var oSource=oEvent.getSource();
			var sPData = this.getOwnerComponent().getModel("oJsonModelCustomers").getData()
			[parseInt(oEvent.getSource().getBindingContext("oJsonModelCustomers").getPath().split("/")[1])];
			var oNewIcon = "";
			var oData = {
			        "IvInd" : "CRE",
			        "Kunnr" : sPData.KunnrSh,
			        "Name1" : sPData.Name1
			};

			if(oSource.getSrc() === "sap-icon://unfavorite") {
				this._addToFavouriteCustomerList(oSource, oData, sPData);
			} else if(oSource.getSrc() === "sap-icon://favorite") {
				this._deleteFromFavouriteCustomerList(oSource, oData, sPData);
			}
		},
		
		_addToFavouriteCustomerList: function(oSource, oData, sPData) {
			this.getOwnerComponent().getModel("gQuoteModel").create("/GetFavCustSet", oData, {
				success: function(oResponse) {	
					this.busyDailog.close();
					oSource.setSrc("sap-icon://favorite")
				    sPData.IsFavourite = 'X';
					MessageBox.show(this.resourceBundle.getText("EMSG_014"), {
						title: "Confirmation",
						styleClass: "messageBoxColr"
					});		
				}.bind(this),
				error: function(oError) { 
					this.busyDailog.close();
					MessageBox.show(this.resourceBundle.getText("EMSG_015"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}.bind(this)
			});
		},
		
		_deleteFromFavouriteCustomerList: function(oSource, oData, sPData) {
			var that = this;
			this.getOwnerComponent().getModel("gQuoteModel").remove("/GetFavCustSet('"+oData.Kunnr+"')", {				
				success: function(oResponse) {	
					that.busyDailog.close();
					oSource.setSrc("sap-icon://unfavorite");
					sPData.IsFavourite = '';
					MessageBox.show(this.resourceBundle.getText("EMSG_016"), {
						title: "Confirmation",
						styleClass: "messageBoxColr"
					});
					
					that.getView().getModel("oJsonModelCustomers").refresh(true);
					
				}.bind(this),
				error: function(oError) { 
					that.busyDailog.close();
					MessageBox.show(this.resourceBundle.getText("EMSG_017"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}.bind(this)		
			});		
		},
		
		onUnFavouritesPress: function(oEvent)
		{
			var oData = this.getOwnerComponent().getModel("oJsonModelCustomers").getData()
			[parseInt(oEvent.getSource().getBindingContext("oJsonModelCustomers").getPath().split("/")[1])]
			oData.IsFavourite = '';
			MessageBox.success("Customer removed from favorite list successfully", {
				styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
			});
		},
		
		setModelData:function(oData){
			var getFevData=this.getView().getModel("oJsonModelCustomers1").getData(); 
			var rejectFunction=_.reject(getFevData,function(item){
				return item.KunnrSh===oData.KunnrSh;
			});
			this.emptyArry=_.reject(this.emptyArry,function(item){
				return item.KunnrSh===oData.KunnrSh;
			});
			this.getView().getModel("oJsonModelCustomers1").setData(rejectFunction);
			this.getView().getModel("oJsonModelCustomers1").refresh();	
		},
			
		onCustomerListPress: function(oEvent) {
			var path=oEvent.mParameters.listItem.oBindingContexts.oJsonModelCustomers.sPath.split("/")[1]
			var name = oEvent.oSource.oPropagatedProperties.oModels.oJsonModelCustomers.oData[path].Name1;
			var shiptoid = oEvent.oSource.oPropagatedProperties.oModels.oJsonModelCustomers.oData[path].KunnrSh;
			var location = oEvent.oSource.oPropagatedProperties.oModels.oJsonModelCustomers.oData[path].Ort01;
			
			this.getView().getModel("globalModel").setProperty("/shipToName", name);
			this.getView().getModel("globalModel").setProperty("/shipToLocation", location);
			this.getView().getModel("globalModel").setProperty("/shipToID", shiptoid);
		
			this.getRouter().navTo("OrdersList", {
				customerId: name,
				customerShip:shiptoid
			});
		},
		
		onFavCustomerListPress: function(oEvent) {
			var path=oEvent.mParameters.listItem.oBindingContexts.oJsonModelCustomers1.sPath.split("/")[1]
			var name = oEvent.oSource.oPropagatedProperties.oModels.oJsonModelCustomers1.oData[path].Name1;
			var shiptoid = oEvent.oSource.oPropagatedProperties.oModels.oJsonModelCustomers.oData[path].KunnrSh;
			this.getRouter().navTo("OrdersList", {
				customerId: name,
				customerShip:shiptoid
			});
		},
		
		onNavBackToHome: function() {
			this.getRouter().navTo("LaunchScreen");
		},
		
		onAllCustomersSearch : function (oEvt) {
			// add filter for search
			var aFilters = [];
			var oTable;
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter({
				    filters: [
					    new Filter({path: "Name1", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
					    new Filter({path: "Address", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
					    new Filter({path: "Pstlz", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
					    new Filter({path: "KunnrSh", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
				    ]
				}));
			}
			//var searchSelectedKey=this.getView().getModel("globalModel").getProperty("/selectedKey");
			
//			if(searchSelectedKey=="allCustomers" || searchSelectedKey==undefined){
				oTable = this.byId("idAllCustomersList");		
//			}else if(searchSelectedKey=="favourites"){
//				oTable = this.byId("idFavCustomersList");
//			}
			
			// update list binding
			
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
		}
		
	});
});