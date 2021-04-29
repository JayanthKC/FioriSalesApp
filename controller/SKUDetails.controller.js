sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	"com/kcc/ZFIORD_SALES/util/Formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
	], function (BaseController,commoncodeused,Formatter,MessageToast,MessageBox) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.SKUDetails", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.kcc.ZProductCatalog.controller.SKUDetails
		 */
		bId:"",
		oSBId:"",
		oSkuId:"",
		"orId":"",
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("SKUDetails")
			.attachMatched(this._onRouteSKUDetailsMatched, this);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("oSKUDetails")
			.attachMatched(this._onRouteSKUDetailsMatched, this);
		},

		_onRouteSKUDetailsMatched:function(oEvent){
			this.getView().byId("id_pcsDetails").setBusy(true);
			var oId=oEvent.getParameters().arguments.orderId;
			this.orId=oId;
			this.resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var bId=oEvent.getParameters().arguments.brandId;
			var oSBId=oEvent.getParameters().arguments.subBrandId;
			var oSkuId=oEvent.getParameters().arguments.skuId;
			this.bId=bId;
			this.oSBId=oSBId;
			this.oSkuId=oSkuId;
			var sOrg=this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			if(sOrg===undefined && oId!==undefined){
				this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",false);
	        	this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",true);
				var orderData=this._onoDataLoad(oId);
				orderData.then(function(orData){
					if(orData==="data Success"){
						var oCartData=this.getOwnerComponent().getModel("oJsonModelOrder").getProperty("/MapOrderItems/results");
						this.getOwnerComponent().getModel("oCartModel").setData(oCartData);
						this.getOwnerComponent().getModel("oCartModel").refresh(true);
						this.getOwnerComponent().getModel("globalModel").setProperty("/bText",bId);
						commoncodeused.fillSubBrandsData(this.bId,"Y",this,this.oSBId);
						commoncodeused.fillSkuListData(this.bId,this.oSBId,this.oSkuId,this);
					}else{
						this.getView().byId("id_pcsDetails").setBusy(false)
					}               	
				}.bind(this));
			} 
			else if(sOrg === undefined){
				this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",true);
	        	this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",false);
				this.getOwnerComponent().getModel("globalModel").setProperty("/bText",bId);
				var sOrgData=this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
				if(sOrgData.length===1)
				{
					this.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",sOrgData[0].Vkorg);
					this.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",sOrgData[0].Vtext);
					commoncodeused.fillSubBrandsData(this.bId,"Y",this,this.oSBId);
					commoncodeused.fillSkuListData(this.bId,this.oSBId,this.oSkuId,this);
				}else{
					this._onSelectSorg();
				}
			}
			else{
				commoncodeused.fillSkuData(oSkuId,this);
			}		   
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.kcc.ZProductCatalog.controller.SKUDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.kcc.ZProductCatalog.controller.SKUDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.kcc.ZProductCatalog.controller.SKUDetails
		 */
		//	onExit: function() {
		//
		//	}
		onPTypeChange:function(oEvent){
			var pType=oEvent.getSource().getSelectedKey();
			var Sku=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuData");
			var cPallets=Sku["Cs"+pType];
			this.getView().byId("c_ptext").setText(cPallets)
			var clayers=Sku["Cs"+pType+"L"];
			this.getView().byId("c_ltext").setText(clayers)
			
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
				commoncodeused.fillSubBrandsData(this.bId,"Y",this,this.oSBId);
				commoncodeused.fillSkuListData(this.bId,this.oSBId,this.oSkuId,this);
			}
		},
		onNavBackSkuList:function(){
			if(this.orId===undefined || this.orId===""){
				this.getRouter().navTo("skuList", {
					brandId: this.bId,
					subbrandId:this.oSBId
				});
			}else{
				this.getRouter().navTo("oskuList", {
					brandId: this.bId,
					subbrandId:this.oSBId,
					orderId:this.orId
				});
			}			
		},
		
		onAddToCartPress:function(oEvent){
			var oKwmeng=oEvent.getSource().getParent().getItems()[0].getValue();
			var palletType=this.getView().byId("id_stype").getSelectedKey();
			var cpallet=this.getView().byId("c_ptext").getText();
			if(oKwmeng === "0" || oKwmeng=== ""){
				MessageBox.show(this.resourceBundle.getText("EMSG_007"), {
					title: "Error", 
					styleClass: "messageBoxColr"
				});
			}else if(palletType===""){
				MessageBox.show(this.resourceBundle.getText("EMSG_013"), {
					title: "Error", 
					styleClass: "messageBoxColr"
				});
			}
			else{
				var oProduct=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuData");
				var oCartData=this.getOwnerComponent().getModel("oCartModel").getData();
				var oProductIndex=_.findIndex(oCartData,{
					"Matnr":oProduct.Matnr
				});
				
				var Palletqty = 0;
				
				if(oProduct["Cs"+palletType] != 0) {
					Palletqty = (parseFloat(oKwmeng)/parseFloat(oProduct["Cs"+palletType])).toFixed(2);
				}
				
				var oCartProduct={
						"Maktx":oProduct.Maktx,
						"Matnr":oProduct.Matnr,
						"Letyp":palletType,
						"Kwmeng":oKwmeng+".00",
						"Palletqty":Palletqty,
						"Posnr":"",
						"Updateflag":"I",
						"CsS1":oProduct.CsS1,
						"CsS2":oProduct.CsS2,
						"CsS3":oProduct.CsS3
				};
                var flag="";
                if(oProductIndex!==-1){
                	flag=oCartData[oProductIndex].Updateflag;
                }				
				if(oProductIndex!==-1 && flag!=="D" && flag!=="I"){
					oCartData[oProductIndex].Updateflag="U";
					oCartData[oProductIndex].Kwmeng=oCartProduct.Kwmeng;
					oCartData[oProductIndex].Palletqty=oCartProduct.Palletqty;
					oCartData[oProductIndex].Letyp=oCartProduct.Letyp;
					this.getOwnerComponent().getModel("oCartModel").setData(oCartData);
				}else{
					if(oCartData.length===0 || oCartData.length === undefined){
						oCartData=[];
					}
					if(flag==="I"){
						oCartData[oProductIndex].Kwmeng=oCartProduct.Kwmeng;
						oCartData[oProductIndex].Palletqty=oCartProduct.Palletqty;
						oCartData[oProductIndex].Letyp=oCartProduct.Letyp;
					}else
					{
						oCartData.push(oCartProduct);
					}
					//oCartData.push(oCartProduct);
					this.getOwnerComponent().getModel("oCartModel").setData(oCartData);
				}
				this.getOwnerComponent().getModel("oCartModel").refresh(true);
				MessageToast.show(this.resourceBundle.getText("EMSG_008"));
			}
		},

		onPresssShowMore: function(oEvent) {
			var oBtnControl = oEvent.getSource();
			var sText = oEvent.getSource().getText();
			if(sText === "Show More") {
				this.byId("idDescription").setMaxLines(100);
				sText = "Show Less";
			} else if(sText === "Show Less") {
				this.byId("idDescription").setMaxLines(2);
				sText = "Show More";
			}
			oBtnControl.setText(sText);
		}

	});

});
