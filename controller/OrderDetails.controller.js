sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController,commoncodeused,JSONModel,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.OrderDetails", {
		_orderType: '',
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.kcc.ZFIORD_SALES.view.OrderDetails
		 */
		onInit: function () {
			var data = {
		               custname: "",
		            };
		            this.getView().setModel(new JSONModel(data), "data");
		            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		            oRouter.getRoute("OrderDetails").attachPatternMatched(this._onMatched, this);
			
		},
		 _onMatched: function (oEvent) {
			 var oArgs = oEvent.getParameter("arguments");
			 
			 this.getView().getModel("globalModel").setProperty("/shipToID", oArgs.shipToId);
	         
	         if(oArgs.orderId.startsWith("Q_")) {
	        	 this._orderType = 'Quatation';
	        	 var oId=oArgs.orderId.split("Q_");
	        	 this.getView().getModel("globalModel").setProperty("/salesorderID", oId[1]);
	        	 commoncodeused.getQuotationDetails(oId[1],oArgs.shipToId,this,false);
	         }
	         else {
	        	 this._orderType = '';
	        	 this.getView().getModel("globalModel").setProperty("/salesorderID", oArgs.orderId);
	        	 commoncodeused.getOrderDetails(oArgs.orderId,oArgs.shipToId,this); 
	         }
		 },  
		 
		 onPressEmail: function() {
				sap.m.URLHelper.triggerEmail("", "", "");
			},
		 
		 onCopyOrderPress: function() {
			 this.busyDailog.open();
			 var oId = this.getView().getModel("oJsonModelOrder").getData().MapOrderHdr[0].Vbeln;
			 var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			 
			 if(this._orderType === 'Quatation') {
				 loRouter.navTo("cqOrderCreation", {
					 cqOrderId:oId
				 });
			 }else {
				 loRouter.navTo("cOrderCreation", {
					 cOrderId:oId
				 });
			 }
			 loRouter.navTo("cOrderCreation", {
				 cOrderId:oId
			 });
		 },
		 
		 onNavBackToAllOrders: function() {
			 this.getRouter().navTo("AllOrders", {}, true /*no history*/);
		 },

	});

});