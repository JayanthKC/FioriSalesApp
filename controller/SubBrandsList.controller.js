sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	"com/kcc/ZFIORD_SALES/util/Formatter"
], function (BaseController,JSONModel,Filter,FilterOperator,commoncodeused,Formatter) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.SubBrandsList", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.kcc.ZProductCatalog.controller.SubBrandsList
		 */
		orId:"",
		onInit: function ()
		{
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("SubBrands")
			.attachMatched(this._onRouteSubBrandCreateMatched, this);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("oSubBrands")
			.attachMatched(this._onRouteSubBrandCreateMatched, this);
		},
		_onRouteSubBrandCreateMatched:function(oEvent){
			this.getOwnerComponent().getModel("globalModel").setProperty("/Ssearch",true);
			var bId=oEvent.getParameters().arguments.brandId;
			var oId=oEvent.getParameters().arguments.orderId;
			this.orId=oId;
			this.getOwnerComponent().getModel("globalModel").setProperty("/bText",bId);
			this.getView().byId("id_pSBList").setBusy(true);
			commoncodeused.fillSubBrandsData(bId,"X",this);
		},
		onLivesBrandSearch:function(oEvent){
			this.getOwnerComponent().getModel("globalModel").setProperty("/Ssearch",false);
			var sQuery = oEvent.getSource().getValue();
			var aFilters=[];
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter({
					filters: [
						new Filter({path: "Prodh", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
						new Filter({path: "Vtext", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false})]
				}));
			}
			var oTable = this.byId("idSBList");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onSubBrandsSelectionChange: function (oEvent) {
			var sBrandId=oEvent.getParameters().listItems[0].getDescription();
			if(this.orId===undefined || this.orId===""){
				this.getRouter().navTo("skuList", {
					brandId: this.getOwnerComponent().getModel("globalModel").getProperty("/bText"),
					subbrandId:sBrandId
				});
			}else{
				this.getRouter().navTo("oskuList", {
					brandId: this.getOwnerComponent().getModel("globalModel").getProperty("/bText"),
					subbrandId:sBrandId,
					orderId:this.orId
				});
			}
			
		},
		onUpdateFinished:function(oEvent){
			this.masterListItemSelection(oEvent);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.kcc.ZProductCatalog.controller.SubBrandsList
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.kcc.ZProductCatalog.controller.SubBrandsList
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.kcc.ZProductCatalog.controller.SubBrandsList
		 */
		//	onExit: function() {
		//
		//	}
	});

});
