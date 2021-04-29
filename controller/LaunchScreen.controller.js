sap.ui.define([
    "com/kcc/ZFIORD_SALES/controller/BaseController",
    "com/kcc/ZFIORD_SALES/controller/commoncodeused",
    "sap/ui/model/json/JSONModel"
], function (BaseController, commoncodeused, JSONModel) {
    "use strict";

    return BaseController.extend("com.kcc.ZFIORD_SALES.controller.LaunchScreen", {
    	flag: '',
    	
        onInit: function () {
//        	sap.ui.core.UIComponent.getRouterFor(this).getRoute("LaunchScreen")
//			.attachMatched(this._onRouteLaunchPadMatched, this);
            // Use smaller margin around grid when on smaller screens
            var oGrid = this.getView().byId("demoGrid");
            oGrid.attachLayoutChange(function (oEvent) {
                var sLayout = oEvent.getParameter("layout");

                if (sLayout === "layoutXS" || sLayout === "layoutS") {
                    oGrid.removeStyleClass("sapUiSmallMargin");
                    oGrid.addStyleClass("sapUiTinyMargin");
                } else {
                    oGrid.removeStyleClass("sapUiTinyMargin");
                    oGrid.addStyleClass("sapUiSmallMargin");
                }
            });
            
        },
        _onRouteLaunchPadMatched:function(){
        	this.getOwnerComponent().getModel("globalModel").setProperty("/sOrg","");
        	this._navFlag = '';
        },
        onSalesOrderPressed: function() {
          //  this.getRouter().navTo("AllCustomers", {});
        	this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",false);
        	this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",true);
        	
        	var sOrgData = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
        	var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
        	
        	if(sOrg !== undefined) {    
            	var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
            	loRouter.navTo("AllCustomers");
        	}
        	else {
        		this._onSelectSorg();
        	}
        },
        
        onProductCatalogPressed: function() {
            // this.getRouter().navTo("Brands", {});
        	
        	this._navFlag = 'X';
        	this.getOwnerComponent().getModel("oCartModel").setData([]);
        	this.getOwnerComponent().getModel("oCartModel").refresh(true);
        	this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",true);
        	this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",false);
        	
        	var sOrgData = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
        	var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
        	
        	if(sOrg !== undefined) {    
                var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
                loRouter.navTo("Brands");
        	}
        	else {
        		this._onSelectSorg();
        		
        	}
        },
        
        naveBackToLaunchPad: function() {
        	window.location=window.location.href.split("#")[0];
        }
        
    });
});
