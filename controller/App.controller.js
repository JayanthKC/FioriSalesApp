sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.App", {
		onInit: function () {
			
			this.busyDailog.open();
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel({
				"sImagePath": $.sap.getModulePath("com.kcc.ZFIORD_SALES", "/image")
			}), "oModelImagePath");
            var oFormatterData = {
                "productCatalogBack" : "Launchpad"
            };
            
            sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(oFormatterData), "oFormatterModel");
            
            this._onInitialSOrgDataFetch();
        }
	
	});
});
