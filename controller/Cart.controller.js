sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.Cart", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.kcc.ZProductCatalog.controller.Cart
		 */
		onInit: function () {
			this.getView().setModel(new JSONModel([
				{
					"prodDesc": "DryNites 4-7y Jumbo Boy 16x4 L/Yr GUKD",
					"PalletQuantity": "0.57",
					"caseQuantity": "20"
				},
				{
					"prodDesc": "DryNites 4-7y Jumbo Boy 16x4",
					"PalletQuantity": "0.8",
					"caseQuantity": "40"
				}, 
				{
					"prodDesc": "Huggies size 1 starter kit x6",
					"PalletQuantity": "0.33",
					"caseQuantity": "10"
				}, 
				{
					"prodDesc": "DryNites Bed Mats 7x4 McFly",
					"PalletQuantity": "0.67",
					"caseQuantity": "10"
				}, 
				{
					"prodDesc": "DryNites 4-7y Jumbo Boy 16x4 L/Yr GUKD",
					"PalletQuantity": "2.57",
					"caseQuantity": "16"
				}, 
				{
					"prodDesc": "DryNites Bed Mats 7x4 McFly",
					"PalletQuantity": "2.57",
					"caseQuantity": "20"
				}
			]), "oCartModel");
			
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.kcc.ZProductCatalog.controller.Cart
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.kcc.ZProductCatalog.controller.Cart
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.kcc.ZProductCatalog.controller.Cart
		 */
		//	onExit: function() {
		//
		//	}
		onBrandsPress: function(oEvent) {
			this.getRouter().navTo("SubBrands", {
				subBrandId: "HG"
			});
		},
        
		onProductDeletePress: function() {
			
		},
		
		onProceddToOrderPress: function() {
			   var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
		         loRouter.navTo("OrderDetails");
		}
	});

});
