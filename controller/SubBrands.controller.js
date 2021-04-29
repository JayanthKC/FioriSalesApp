sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	"com/kcc/ZFIORD_SALES/util/Formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator,commoncodeused,Formatter) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.SubBrands", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.kcc.ZFIORD_PC.controller.SKUList
		 */
		onInit: function () {

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.kcc.ZFIORD_PC.controller.SKUList
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.kcc.ZFIORD_PC.controller.SKUList
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.kcc.ZFIORD_PC.controller.SKUList
		 */
		//	onExit: function() {
		//
		//	}
		/**
		 * Function Name: onTypeOfProductsListChange
		 * Description: The function is called when the user wants to see all and frequently ordered products
		 * Input parameters: oEvent (selection change event of segmented button)
		 * Output parameters: NA
		 */
		onTypeOfProductsListChange: function(oEvent) {			
			var sSelectedKey = oEvent.getSource().getSelectedKey();

			if(sSelectedKey === "allProducts") {
				this._loadAllProducts();
			} 
			else if (sSelectedKey === "frequentlyOrdred") {
				this._loadFrequentlyOrderedProducts();
			}
		},

		onNavBackToBrandsPage:function(oEvent){
			this.getRouter().navTo("Brands");
		},

		/**
		 * Function Name: _loadAllProducts
		 * Description: The function is loads all products when the user clicks on All Products 
		 *              segmented button
		 * Input parameters: NA
		 * Output parameters: NA
		 */
		_loadAllProducts: function() {
			this.getOwnerComponent().getModel("oSKUListModel").setData([
				{
					"Maktx": "DryNites 4-7y Jumbo Boy 16x4 L/Yr GUKD",
					"Matnr": "1984",
					"IvMatnr": "",
					"PalletQuantity": "0.57",
					"caseQuantity": "20"
				},
				{
					"Maktx": "DryNites 4-7y Jumbo Boy 16x4",
					"Matnr": "1985",
					"IvMatnr": "",
					"PalletQuantity": "0.8",
					"caseQuantity": "40"
				}, 
				{
					"Maktx": "Huggies size 1 starter kit x6",
					"Matnr": "1986",
					"IvMatnr": "",
					"PalletQuantity": "0.33",
					"caseQuantity": "10"
				},
				{
					"Maktx": "DryNites Bed Mats 7x4 McFly",
					"Matnr": "1987",
					"IvMatnr": "",
					"PalletQuantity": "0.67",
					"caseQuantity": "10"
				}, 
				{
					"Maktx": "DryNites 4-7y Jumbo Boy 16x4 L/Yr GUKD",
					"Matnr": "1988",
					"IvMatnr": "",
					"PalletQuantity": "2.57",
					"caseQuantity": "16"
				}, 
				{
					"Maktx": "DryNites Bed Mats 7x4 McFly",
					"Matnr": "1989",
					"IvMatnr": "",
					"PalletQuantity": "2.57",
					"caseQuantity": "20"
				}
				]);
		},

		/**
		 * Function Name: _loadFrequentlyOrderedProducts
		 * Description: The function is loads the frequently ordered products when the user clicks on Frequently Ordered 
		 *              segmented button
		 * Input parameters: NA
		 * Output parameters: NA
		 */
		_loadFrequentlyOrderedProducts: function() {
			var aFilters= [];

			aFilters.push(new Filter({
				filters: [
					new Filter({path: "IvInd", operator: FilterOperator.EQ, value1: "DIS"}),
					new Filter({path: "IvApptype", operator: FilterOperator.EQ, value1: "NEW"})
					],
					and: true
			}));

			this.getOwnerComponent().getModel("oMainModel2").read("/GetFavProdSet", {
				filters: [aFilters],
				success: function(oResponse) {
					this.getOwnerComponent().getModel("oSKUListModel").setData(oResponse.results);
					//this.getOwnerComponent().setModel(new JSONModel(oResponse.results), "oSKUListModel");
				}.bind(this),
				error: function(oError) {
					this.getOwnerComponent().getModel("oSKUListModel").setData([]);
					MessageBox.error("Oops...Unable to load frequently ordered products.", {
						styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
					});
				}.bind(this)
			});
		}
	});

});