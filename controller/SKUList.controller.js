sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	"com/kcc/ZFIORD_SALES/util/Formatter",
	"sap/m/MessageToast"
	], function (BaseController, JSONModel, MessageBox,Filter,FilterOperator,commoncodeused,Formatter,MessageToast)
	{
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.SKUList", {

		"bId":"",
		"sBrandId":"",
		"orId":"",
		onInit: function () {
			this.getView().byId("id_pSkuList").setBusy(true);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("skuList")
			.attachMatched(this._onRouteSkuListCreateMatched, this);
			sap.ui.core.UIComponent.getRouterFor(this).getRoute("oskuList")
			.attachMatched(this._onRouteSkuListCreateMatched, this);

			this.getOwnerComponent().getModel("globalModel").setProperty("/list",false);            
			this.getOwnerComponent().getModel("globalModel").setProperty("/grid",true);
		},

		_onRouteSkuListCreateMatched:function(oEvent){
			this.getView().byId("id_pSkuList").setBusy(true);
			this.resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().byId("idProducts").setSelectedKey("All Products");
			var sBrandId=oEvent.getParameters().arguments.subbrandId;
			var bId=oEvent.getParameters().arguments.brandId;
			var oId=oEvent.getParameters().arguments.orderId;
			this.orId=oId;
			this.getView().byId("id_slSearch").setValue("");
			this.onLiveProductSearch();
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
						commoncodeused.fillSubBrandsData(this.bId,"Y",this,this.sBrandId);
						commoncodeused.fillSkuListData(this.bId,this.sBrandId,"",this);	
					}else{
						this.getView().byId("id_pSkuList").setBusy(false)
					}               	
				}.bind(this));
				this.getOwnerComponent().getModel("globalModel").setProperty("/bText",bId);
			} 
			else if(sOrg === undefined){
				this.getOwnerComponent().getModel("globalModel").setProperty("/dPTile",true);
				this.getOwnerComponent().getModel("globalModel").setProperty("/dOTile",false);
				this.bId=bId;
				this.sBrandId=sBrandId;
				var sOrgData=this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
				if(sOrgData.length===1)
				{
					this.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",sOrgData[0].Vkorg);
					this.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",sOrgData[0].Vtext);
					commoncodeused.fillSubBrandsData(this.bId,"Y",this,this.sBrandId);
					commoncodeused.fillSkuListData(this.bId,this.sBrandId,"",this);
				}else{
					this._onSelectSorg();
				}
				this.getOwnerComponent().getModel("globalModel").setProperty("/bText",bId);
			}
			else{
				if(this.getOwnerComponent().getModel("globalModel").getProperty("/fSelect")){
					this.getOwnerComponent().getModel("globalModel").setProperty("/fSelect",false);
					this.getView().byId("id_pSkuList").setBusy(false);
				}else{
					commoncodeused.fillSkuListData(bId,sBrandId,"",this);	
				}
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
				commoncodeused.fillSubBrandsData(this.bId,"Y",this,this.sBrandId);
				commoncodeused.fillSkuListData(this.bId,this.sBrandId,"",this);
			}
		},

		onLiveProductSearch:function(oEvent){
			if(oEvent !==undefined){
				var sQuery = oEvent.getSource().getValue();
			}
			else{
				sQuery = "";
			}
			var aFilters=[];
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter({
					filters: [
						new Filter({path: "Maktx", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
						new Filter({path: "Matnr", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
						new Filter({path: "Eancode", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false})
						]
				}));
			}
			var oBinding=this._onReturnBindingItems();
			oBinding.filter(aFilters);
		},

		_onReturnBindingItems:function(){
			if(this.getOwnerComponent().getModel("globalModel").getProperty("/list"))
			{
				var oTable = this.byId("idSKUTableView");
				var oBinding = oTable.getBinding("items");
			}
			else if(this.getOwnerComponent().getModel("globalModel").getProperty("/grid")){
				oBinding=this.byId("idSKUListView").getBinding("items");
			}
			return oBinding;
		},

		onChangeShowProducts:function(oEvent){
			var oKey=oEvent.getSource().getSelectedKey();
			var	aFilters=[];
			if(oKey==="Favourite Products")
			{
				aFilters.push(new Filter("IsFavourite","EQ","X"));
			}else if(oKey==="All Products"){

			}
			var oBinding=this._onReturnBindingItems();
			oBinding.filter(aFilters);
		},

		onAddToCartPress:function(oEvent){
			var vType=oEvent.getSource().data("vType");
			if(vType==="Grid"){
				var oKwmeng=oEvent.getSource().getParent().getItems()[1].getValue();
				var cpallet=oEvent.getSource().getParent().getParent().getParent().getItems()[3].getContent()[0].getItems()[1].getItems()[1].getNumber();
				var palletType=oEvent.getSource().getParent().getParent().getParent().getItems()[2].getContent()[0].getItems()[0].getSelectedKey();
			}else if(vType==="List"){
				palletType=oEvent.getSource().getParent().getAggregation("cells")[3].getSelectedKey();
				oKwmeng=oEvent.getSource().getParent().getAggregation("cells")[6].getValue();
				cpallet=oEvent.getSource().getParent().getAggregation("cells")[5].getText();
			}
			if(oKwmeng === "0" || oKwmeng === ""){
				MessageBox.show(this.resourceBundle.getText("EMSG_007"), {
					title: "Error", 
					styleClass: "messageBoxColr"
				});
			}else if(palletType===""){
				MessageBox.show(this.resourceBundle.getText("EMSG_013"), {
					title: "Error", 
					styleClass: "messageBoxColr"
				});
			}else{
				var oSkuId=oEvent.getSource().getBindingContext("oBrandsModel").getPath().split("/")[2];
				var oProduct=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId);
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
				if(oProductIndex!==-1 && flag!=="I"){
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
					this.getOwnerComponent().getModel("oCartModel").setData(oCartData);
				}
				this.getOwnerComponent().getModel("oCartModel").refresh(true);
				MessageToast.show(this.resourceBundle.getText("EMSG_008"));
			}
		},
		onPTypeChange:function(oEvent){
			var vType=oEvent.getSource().data("vType");
			var pType=oEvent.getSource().getSelectedKey();
			var Sku=this.getOwnerComponent().getModel("oBrandsModel").getProperty(oEvent.getSource().getBindingContext("oBrandsModel").getPath());
			var cPallets=Sku["Cs"+pType];
			var cLayers=Sku["Cs"+pType+"L"]
			if(vType==="Grid"){
				oEvent.getSource().getParent().getParent().getParent().getItems()[3].getContent()[0].getItems()[1].getItems()[1].setNumber(cPallets);
				oEvent.getSource().getParent().getParent().getParent().getItems()[3].getContent()[0].getItems()[0].getItems()[1].setNumber(cLayers);
			}else if(vType==="List"){
				oEvent.getSource().getParent().getAggregation("cells")[5].setText(cPallets);
				oEvent.getSource().getParent().getAggregation("cells")[4].setText(cLayers);
			}
		},
		onFavouriteChangePress: function(oEvent) {
			var oSource=oEvent.getSource();
			var oSkuId=oEvent.getSource().getBindingContext("oBrandsModel").getPath().split("/")[2];
			var oMatnr=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId).Matnr;
			var oNewIcon = "";
			var oData = {
					"IvInd": "CRE",
					"IvApptype": "NEW",
					"IvMatnr": oMatnr
			};

			if(oSource.getSrc() === "sap-icon://unfavorite") {
				this._addToFrequentlyOrderedList(oSource, oData,oSkuId);
			} else if(oSource.getSrc() === "sap-icon://favorite") {
				this._deleteFromFrequentlyOrderedList(oSource, oData,oSkuId);
			}		
		},

		_addToFrequentlyOrderedList: function(oSource, oData,oSkuId) {
			this.getOwnerComponent().getModel("gQuoteModel").create("/GetFavProdSet", oData, {
				success: function(oResponse) {		
					// Set icon as favorite once the products is added to the favorites list
					//oSource.setSrc("sap-icon://favorite");
					this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId).IsFavourite="X";
					this.getOwnerComponent().getModel("oBrandsModel").refresh(true);
					MessageBox.show(this.resourceBundle.getText("EMSG_009"), {
						title: "Confirmation", 
						styleClass: "messageBoxColr"
					});
				}.bind(this),
				error: function(oError) {
					MessageBox.show(this.resourceBundle.getText("EMSG_010"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}.bind(this)
			});
		},


		_deleteFromFrequentlyOrderedList: function(oSource, oData,oSkuId) {
			this.getOwnerComponent().getModel("gQuoteModel").remove("/GetFavProdSet(IvInd='DEL',IvApptype='NEW',IvMatnr='"+ oData.IvMatnr +"')", {				
				success: function(oResponse) {	
					// Set icon as unfavorite once the products is removed from the favorites list
					//oSource.setSrc("sap-icon://unfavorite");
					this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId).IsFavourite="";
					this.getOwnerComponent().getModel("oBrandsModel").refresh(true);
					MessageBox.show(this.resourceBundle.getText("EMSG_011"), {
						title: "Confirmation", 
						styleClass: "messageBoxColr"
					});
				}.bind(this),
				error: function(oError) {
					MessageBox.show(this.resourceBundle.getText("EMSG_012"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}.bind(this)
			});
		},

		onViewSelectionChange: function(oEvent) {
			var oSelectedItem = this.byId("idViewTypeSgmntBtn").getSelectedKey();
			switch(oSelectedItem) {
			case "gridView":
				this.getOwnerComponent().getModel("globalModel").setProperty("/list",false);
				this.getOwnerComponent().getModel("globalModel").setProperty("/grid",true);
				break;
			case "listView":
				this.getOwnerComponent().getModel("globalModel").setProperty("/list",true);
				this.getOwnerComponent().getModel("globalModel").setProperty("/grid",false);
				break;
			default:
				this.getOwnerComponent().getModel("globalModel").setProperty("/list",false);
			this.getOwnerComponent().getModel("globalModel").setProperty("/grid",true);
			}			
		},


		onProductImagePress: function(oEvent) {
			var oSkuId=oEvent.getSource().getBindingContext("oBrandsModel").getPath().split("/")[2];
			var oMatnr=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId).Matnr;
			var sbId=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId).Level07;
			var bId=this.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList/"+oSkuId).Brand;

			if(this.orId===undefined || this.orId===""){
				this.getRouter().navTo("SKUDetails", {
					brandId:bId,
					subBrandId: sbId,
					skuId: oMatnr
				});
			}else{
				this.getRouter().navTo("oskuList", {
					brandId:bId,
					subBrandId: sbId,
					skuId: oMatnr,
					orderId:this.orId
				});
			}

		},

	});
	});
