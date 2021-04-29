sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
	], function (Controller, History, MessageToast, MessageBox) {
	"use strict";
	return {
		
		fetchCustomerData: function(that, flag){
			that.busyDailog.open();
			var sOrg = that.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			var aFilters= new sap.ui.model.Filter("Vkorg","EQ",sOrg);
			var oJsonModelCustomer = that.getView().getModel("oJsonModelCustomers");
			that.getOwnerComponent().getModel("oMainModel").read("/SetOrderSHSet?$format=json", {
				filters: [aFilters],
				urlParameters: {
					"$expand": "MapOrderSH"
				},
				success: function(oResponse) {
					oJsonModelCustomer.setSizeLimit(10000);
					oJsonModelCustomer.setSizeLimit(oResponse.results[0].MapOrderSH.results.length > 100 ? oResponse.results[0].MapOrderSH.results.length : 100);
					oJsonModelCustomer.setData(oResponse.results[0].MapOrderSH.results);
					oJsonModelCustomer.refresh();
					
					if(flag) {
						that.getView().setModel(new sap.ui.model.json.JSONModel(oJsonModelCustomer.getData()), "oJsonModelOrder2");
						if (!that._CustomerSelection) {
							that._CustomerSelection = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.Table", that);
							that.getView().addDependent(that._CustomerSelection);
						}
						that._CustomerSelection.open();	
					}
					that.busyDailog.close();
				},
				error: function(oError) {
					that.busyDailog.close();
					console.log(oError);
					that.getView().setModel(new sap.ui.model.json.JSONModel([]), "oJsonModelCustomers");
					that.getView().getModel("oJsonModelOrderList").refresh();
					MessageBox.show(that.resourceBundle.getText("EMSG_018"), {
						title: "Error",
						styleClass: "messageBoxColr"
					});
				}
			});		
		},
		
		_onFetchSubBrands:function(bId,that){
			var oDataModel=that.getOwnerComponent().getModel("gQuoteModel");
			var url="/GetProdCatalogSet";
			var sOrg=that.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			var oFilter=new sap.ui.model.Filter([new sap.ui.model.Filter("Vkorg","EQ",sOrg),
				new sap.ui.model.Filter("Brand","EQ",bId),
				new sap.ui.model.Filter("Type","EQ","SAL")],true);
			return new Promise(function (resolve, reject) {
				oDataModel.read(url,{
					urlParameters: {
						"$expand": "GetSubBrands,GetProducts,GetMatText"
					},
					filters:[oFilter],
					success:function(oResponse){
						resolve([oResponse.results[0],"success"]);
					},
					error:function(oError){
						resolve([oError,"error"]);
					}
				});
			}.bind(this));
		},
		fillSubBrandsData:function(bId,flag,that,sbId){
			var sBrands=this._onFetchSubBrands(bId,that);
			sBrands.then(function(sBrandsData){
				if(sBrandsData[1]==="success"){
					var sBrands=sBrandsData[0].GetSubBrands.results;
					that.getOwnerComponent().getModel("oBrandsModel").setProperty("/subBrands",sBrands);
					if(sBrands.length>0){
						//need to select first Sub Brand in Master
						if(flag==="X"){
							//fillfirstsubBrandData		
							that.getOwnerComponent().getModel("globalModel").setProperty("/fSelect",true);
							that.getOwnerComponent().getModel("oBrandsModel").setProperty("/skuList",sBrandsData[0].GetProducts.results);
							that.getOwnerComponent().getModel("oBrandsModel").setProperty("/matText",sBrandsData[0].GetMatText.results);
							that.getRouter().navTo("skuList", {
								brandId: bId,
								subbrandId:sBrands[0].Prodh
							});
							var oList = that.getView().byId("idSBList");//oEvent.getSource();
							var aItems = oList.getItems();			
							oList.setSelectedItem(aItems[0]);
							that.getView().byId("id_pSBList").setBusy(false);
							that.busyDailog.close();
						}else{
							that.getOwnerComponent().getModel("globalModel").setProperty("/fSelect",false);
							that.getOwnerComponent().getModel("globalModel").setProperty("/sSbid",sbId);
						}
						
					}else {
						that.busyDailog.close();
					}
				}else if(sBrandsData[1]==="error"){
					that.busyDailog.close();
					MessageBox.show(that.getResourceBundle.getText("EMSG_002"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}
			}.bind(this));
		},
		onFetchSkuList:function(bId,sBId,that){
			var oDataModel=that.getOwnerComponent().getModel("gQuoteModel");
			var url="/GetProdCatalogSet";
			var sOrg=that.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			var oFilter=new sap.ui.model.Filter([new sap.ui.model.Filter("Vkorg","EQ",sOrg),new sap.ui.model.Filter("Brand","EQ",bId),
				new sap.ui.model.Filter("Level07","EQ",sBId),new sap.ui.model.Filter("Type","EQ","SAL")],true);
			return new Promise(function (resolve, reject) {
				oDataModel.read(url,{
					filters:[oFilter],
					urlParameters: {
						"$expand": "GetProducts,GetMatText"
					},
					success:function(oResponse){
						resolve([oResponse.results[0],"success"]);
					},
					error:function(oError){
						resolve([oError,"error"]);
					}
				});
			}.bind(this));
		},
		fillSkuData:function(oSkuId,that){
			var oSKUList=that.getOwnerComponent().getModel("oBrandsModel").getProperty("/skuList");
			var oSKUData=_.where(oSKUList,{
				Matnr:oSkuId
			})
			that.getOwnerComponent().getModel("oBrandsModel").setProperty("/skuData",oSKUData[0]);
			that.getView().byId("id_pcsDetails").setBusy(false);
		},
		fillSkuListData:function(bId,sbId,skuId,that){
			var oSkuDataCall=this.onFetchSkuList(bId,sbId,that);
			oSkuDataCall.then(function(oSkuItemsData){
				if(oSkuItemsData[1]==="success"){
					that.getOwnerComponent().getModel("oBrandsModel").setProperty("/skuList",oSkuItemsData[0].GetProducts.results);
					that.getOwnerComponent().getModel("oBrandsModel").setProperty("/matText",oSkuItemsData[0].GetMatText.results);
					if(skuId!==undefined && skuId!==""){
						this.fillSkuData(skuId,that);
					}
				}else if(oSkuItemsData[1]==="error"){
					MessageBox.show(that.getResourceBundle.getText("EMSG_001"), {
						title: "Error", 
						styleClass: "messageBoxColr"
					});
				}
				if(that !== undefined){
					that.getView().byId("id_pSkuList").setBusy(false);
				}
			}.bind(this));
		},
		
		loadOrderExpandEntity: function(orderId,that) {
			var durl="/GetOrderModeSet?$format=json";
			var oFilter=new sap.ui.model.Filter("Vbeln","EQ",orderId);
			var oDataModel=that.getOwnerComponent().getModel("oMainModel");
			return new Promise(function (resolve, reject) {
				oDataModel.read(durl, {
					urlParameters: {
						"$expand": "MapOrderHdr,MapOrderItems,MapOrderText"
					},
					filters:[oFilter],
					success: function(oResponse) {
						that.getOwnerComponent().getModel("oJsonModelOrder").setData(oResponse.results[0]);
						that.getOwnerComponent().getModel("oJsonModelOrder").refresh(true);
						that.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",oResponse.results[0].MapOrderHdr.Vkorg);
						that.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",oResponse.results[0].MapOrderHdr.Vtext);
						//console.log(oResponse);
						resolve("data Success");
					},
					error: function(oError) {
						resolve("data fail");
						//console.log(oError);
					}
				});
			}.bind(this));
		},
		
		loadQuotationEntity:function(qId,that){
			var durl="/GetQuoHdrSet";
			var oDataModel=that.getOwnerComponent().getModel("gQuoteModel");
			var oFilter=new sap.ui.model.Filter([new sap.ui.model.Filter("IvVbeln","EQ",qId),new sap.ui.model.Filter("IvAuart","EQ","ZQT")],true);
			return new Promise(function (resolve, reject) {
				oDataModel.read(durl, {
					urlParameters: {
						"$expand": "QuoToHdr,QuoToItems,QuoToDelText"
					},
					filters:[oFilter],
					success: function(oResponse) {
						var rObj=oResponse.results[0];
						var fObj=[];
						if(rObj.length!==0){
							var fObj={"MapOrderText":rObj.QuoToDelText,"MapOrderItems":rObj.QuoToItems,"MapOrderHdr":rObj.QuoToHdr};
							//var fObj=$.extend({}, obj, rObj.QuoToHdr.results[0]);
							that.getOwnerComponent().getModel("oJsonModelOrder").setData(fObj);
							that.getOwnerComponent().getModel("oJsonModelOrder").refresh(true);
							that.getOwnerComponent().getModel("globalModel").setProperty("/sOrg",fObj.MapOrderHdr.Vkorg);
							that.getOwnerComponent().getModel("globalModel").setProperty("/sOrgDesc",fObj.MapOrderHdr.Vtext);	
						}
						console.log(oResponse);
						resolve("data Success");
					},
					error: function(oError) {
						resolve("data fail");
						console.log(oError);
					}
				});
			}.bind(this));
		},
		
		_oDateFormat:function(value)
		{
			if(typeof value !== "object"){
				if(value.indexOf(" ")!== -1){
					var dvalue=value.split(" ");
					var months = {'Jan': "01", 'Feb': "02", 'Mar': "03", 'Apr': "04", 'May': "05", 'Jun': "06", 'Jul': "07",
							'Aug': "08", 'Sep': "09", 'Oct': "10", 'Nov': "11", 'Dec': "12"}
					value=months[dvalue[1]]+"/"+dvalue[0]+"/"+dvalue[2];
				}
			}
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd"
			});
			var dateValue;
			if (value !== null && value !== "" && value !== undefined)
				dateValue = oDateFormat.format(new Date(value)) + "T00:00:00";
			else
				dateValue = oDateFormat.format(new Date()) + "T00:00:00";
			return dateValue;
		},
		
		_onFormatOrderData: function(oModelData,Vkorg,that) {
			
			var Vbeln;
			var gModel = that.getOwnerComponent().getModel("globalModel").getData();
			if(gModel.dFlag){
				Vbeln = oModelData.MapOrderHdr[0].Vbeln;
			}else {
				Vbeln = ' ';
			}
			
			var payload =
			{
				"Vbeln": " ",
				"OrderToHeader": [{
					"Auart": "ZOR",			
					"Bstnk": oModelData.MapOrderHdr[0].Bstnk,
					"Vbeln": Vbeln,
					"Kunnr": oModelData.MapOrderHdr[0].Kunnr,
					"Vkorg": Vkorg,
					"Vdatu": this._oDateFormat(oModelData.MapOrderHdr[0].Vdatu),
					"KunnrSh": oModelData.MapOrderHdr[0].KunnrSh,
					"Cname": oModelData.MapOrderHdr[0].Cname,
					"Cnumber": oModelData.MapOrderHdr[0].Cnumber,
					"ContactEmail": oModelData.MapOrderHdr[0].ContactEmail,
					"VehicleDiscount":oModelData.MapOrderHdr[0].VehicleDiscount
				}],
				"OrderToItems": [],
				"ToDelText": [],
				"ToInvText": [],
				"ToIntText": []
			}
			
			for(var i=0; i<oModelData.MapOrderItems.length; i++){
				
				var fObj = {
						"Vbeln": " ",
						"Posnr": oModelData.MapOrderItems[i].Posnr,
						"Matnr": oModelData.MapOrderItems[i].Matnr,
						"Kwmeng": oModelData.MapOrderItems[i].Kwmeng,
						"Letyp": oModelData.MapOrderItems[i].Letyp
				}
				
				payload.OrderToItems.push(fObj);
			}
			
			var delTxt = that.getView().byId("idDelText").getValue();
			var invTxt = that.getView().byId("idInvText").getValue();
			var intTxt = that.getView().byId("idIntText").getValue();
			
			delTxt = delTxt.match(/.{1,120}/g);
			invTxt = invTxt.match(/.{1,120}/g);
			intTxt = intTxt.match(/.{1,120}/g);
			
			if(delTxt !== null && delTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": delTxt[i]
					}
					payload.ToDelText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idDelText").getValue()
				}
				payload.ToDelText.push(iObj);
			}
			
			if(invTxt !== null && invTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": invTxt[i]
					}
					payload.ToInvText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idInvText").getValue()
				}
				payload.ToInvText.push(iObj);
			}
			
			if(intTxt !== null && intTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": intTxt[i]
					}
					payload.ToIntText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idIntText").getValue()
				}
				payload.ToIntText.push(iObj);
			}
			
			return payload;
			
		},
		
		_onFormatQuotData: function(oModelData,Vkorg,that) {
			
			var payload =
			{
				"Vbeln": " ",
				"QuoToHeader": [{
					"Auart": "ZQT",			
					"Bstnk": oModelData.MapOrderHdr[0].Bstnk,
					"Vbeln": " ",
					"Kunnr": oModelData.MapOrderHdr[0].Kunnr,
					"Vkorg": Vkorg,
					"Vdatu": this._oDateFormat(oModelData.MapOrderHdr[0].Vdatu),
					"KunnrSh": oModelData.MapOrderHdr[0].KunnrSh,
					"Cname": oModelData.MapOrderHdr[0].Cname,
					"Cnumber": oModelData.MapOrderHdr[0].Cnumber,
					"ContactEmail": oModelData.MapOrderHdr[0].ContactEmail,
					"Ddcountry": "GB",
					"VehicleDiscount": oModelData.MapOrderHdr[0].VehicleDiscount

				}],
				"QuoToItems": [],
				"QToDelText": [],
				"QToInvText": [],
				"QToIntText": []
			}
			
			for(var i=0; i<oModelData.MapOrderItems.length; i++){
				
				var fObj = {
						"Vbeln": " ",
						"Posnr": oModelData.MapOrderItems[i].Posnr,
						"Matnr": oModelData.MapOrderItems[i].Matnr,
						"Kwmeng": oModelData.MapOrderItems[i].Kwmeng,
						"Letyp": oModelData.MapOrderItems[i].Letyp
				}
				
				payload.QuoToItems.push(fObj);
			}
			
			var delTxt = that.getView().byId("idDelText").getValue();
			var invTxt = that.getView().byId("idInvText").getValue();
			var intTxt = that.getView().byId("idIntText").getValue();
			
			delTxt = delTxt.match(/.{1,120}/g);
			invTxt = invTxt.match(/.{1,120}/g);
			intTxt = intTxt.match(/.{1,120}/g);
			
			if(delTxt !== null && delTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": delTxt[i]
					}
					payload.QToDelText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idDelText").getValue()
				}
				payload.QToDelText.push(iObj);
			}
			
			if(invTxt !== null && invTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": invTxt[i]
					}
					payload.QToInvText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idInvText").getValue()
				}
				payload.QToInvText.push(iObj);
			}
			
			if(intTxt !== null && intTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": intTxt[i]
					}
					payload.QToIntText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idIntText").getValue()
				}
				payload.QToIntText.push(iObj);
			}
			
			return payload;
		},
		
		_onFormatQuotionEditData: function(oModelData,Vkorg,that) {
			
			var mValue=_.max(oModelData.MapOrderItems, function(o) { 
				return o.Posnr; 
			});
			var maxValue = mValue.Posnr;
			var count = parseInt(maxValue);
			
			var payload =
			{
				"Vbeln": oModelData.MapOrderHdr[0].Vbeln,
				"CQuoToHeader": [{
					"Auart": "ZQT",			
					"Bstnk": oModelData.MapOrderHdr[0].Bstnk,
					"Vbeln": oModelData.MapOrderHdr[0].Vbeln,
					"Kunnr": oModelData.MapOrderHdr[0].Kunnr,
					"Vkorg": Vkorg,
					"Vdatu": this._oDateFormat(oModelData.MapOrderHdr[0].Vdatu),
					"KunnrSh": oModelData.MapOrderHdr[0].KunnrSh,
					"Cname": oModelData.MapOrderHdr[0].Cname,
					"Cnumber": oModelData.MapOrderHdr[0].Cnumber,
					"ContactEmail": oModelData.MapOrderHdr[0].ContactEmail,
					"Ddcountry": "GB",
					"VehicleDiscount": oModelData.MapOrderHdr[0].VehicleDiscount
				}],
				"CQuoToItems": [],
				"CQToDelText": [],
				"CQToInvText": [],
				"CQToIntText": []
			}
			
			for(var i=0; i<oModelData.MapOrderItems.length; i++){
				var fObj = {
						"Vbeln": oModelData.MapOrderHdr[0].Vbeln,
						"Posnr": oModelData.MapOrderItems[i].Posnr,
						"Matnr": oModelData.MapOrderItems[i].Matnr,
						"Kwmeng": oModelData.MapOrderItems[i].Kwmeng,
						"Updateflag" : oModelData.MapOrderItems[i].Updateflag,
						"Letyp": oModelData.MapOrderItems[i].Letyp
				}
				if(fObj.Updateflag==="I"){
					count = count + 10;
					fObj.Posnr = count.toString().padStart(6,"0");
				}
				payload.CQuoToItems.push(fObj);
			}
			
			var delTxt = that.getView().byId("idDelText").getValue();
			var invTxt = that.getView().byId("idInvText").getValue();
			var intTxt = that.getView().byId("idIntText").getValue();
			
			delTxt = delTxt.match(/.{1,120}/g);
			invTxt = invTxt.match(/.{1,120}/g);
			intTxt = intTxt.match(/.{1,120}/g);
			
			if(delTxt !== null && delTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": delTxt[i]
					}
					payload.CQToDelText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idDelText").getValue()
				}
				payload.CQToDelText.push(iObj);
			}
			
			if(invTxt !== null && invTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": invTxt[i]
					}
					payload.CQToInvText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idInvText").getValue()
				}
				payload.CQToInvText.push(iObj);
			}
			
			if(intTxt !== null && intTxt.length != 1) {
				for(var i=0; i<delTxt.length; i++) {
					var iObj = {
							"Vbeln": '',
							"Tdline": intTxt[i]
					}
					payload.CQToIntText.push(iObj);
				}
			}else {
				var iObj = {
						"Vbeln": '',
						"Tdline": that.getView().byId("idIntText").getValue()
				}
				payload.CQToIntText.push(iObj);
			}
			
			return payload;
		},
		
		getOrderDetails: function(orderId,shipToId,that) {
			
			var oJsonModelOrder = that.getOwnerComponent().getModel("oJsonModelOrder");
			var aFilters= new sap.ui.model.Filter("Vbeln","EQ",orderId);
			
			return new Promise(function (resolve, reject) {
				that.getOwnerComponent().getModel("oMainModel").read("/GetOrderModeSet", {
					filters: [aFilters],
					urlParameters: {
					    "$expand": "MapOrderHdr,MapOrderItems,MapOrderText"
					},
					success: function(oResponse) {
						console.log(oResponse);
						var delTxt='';
						var invTxt='';
						var intTxt='';
						
						var headerItemText= oResponse.results[0].MapOrderHdr.results;
						var productItems= oResponse.results[0].MapOrderItems.results;				
						var textItems= oResponse.results[0].MapOrderText.results;		
						
						that.getView().setModel(new sap.ui.model.json.JSONModel(headerItemText), "headerDataModel");
						that.getView().setModel(new sap.ui.model.json.JSONModel(productItems), "productModel");
						that.getView().setModel(new sap.ui.model.json.JSONModel(textItems), "itemTextModel");
						that.getView().getModel("headerDataModel").refresh();
						that.getView().getModel("productModel").refresh();
						that.getView().getModel("itemTextModel").refresh();
						
						for(var i=0; i<textItems.length; i++) {
							if(textItems[i].Type === 'DEL') {
								delTxt = delTxt + textItems[i].Tdline;
							}else if(textItems[i].Type === 'INV') {
								invTxt = invTxt + textItems[i].Tdline;
							}else if(textItems[i].Type === 'INT') {
								intTxt = intTxt + textItems[i].Tdline;
							}
						}
						
						var iObj = {
							"MapOrderText": [{
								"Vbeln": " ",
								"Tdline": delTxt,
								"Type": "DEL"
								},
								{
								"Vbeln": " ",
								"Tdline": invTxt,
								"Type": "INV"
								},
								{
								"Vbeln": " ",
								"Tdline": intTxt,
								"Type": "INT"
								}]
						};
						
						var fObj = {"MapOrderHdr":headerItemText,"MapOrderItems":productItems,"MapOrderText":iObj.MapOrderText};
						oJsonModelOrder.setData(fObj);
						oJsonModelOrder.refresh(true);
						
						that.getOwnerComponent.getModel("globalModel").setProperty("/selectedOrderId", headerItemText[0].Vbeln);
						resolve("Data Success");
							
					},
					error: function(oError) {
						resolve("Data Fail");
						console.log(oError);
						MessageBox.show(that.resourceBundle.getText("EMSG_004"), {
							title: "Error",
							styleClass: "messageBoxColr"
						});
					}
				});
			
			}.bind(this));
			
		},
		
		getQuotationDetails: function(orderId,shipToId,that,dFlag) {
			 
			var oJsonModelOrder = that.getOwnerComponent().getModel("oJsonModelOrder");
			
			var aFilters= new sap.ui.model.Filter([new sap.ui.model.Filter("IvVbeln", "EQ", orderId), 
				new sap.ui.model.Filter("IvAuart","EQ", "ZQT")],true);
			
			return new Promise(function (resolve, reject) {
				that.getOwnerComponent().getModel("gQuoteModel").read("/GetQuoHdrSet", {
					filters: [aFilters],
					urlParameters: {
					    "$expand": "QuoToHdr,QuoToItems,QuoToDelText"
					},
					success: function(oResponse) {
						console.log(oResponse);
						var delTxt='';
						var invTxt='';
						var intTxt='';
						
						var headerItemText= oResponse.results[0].QuoToHdr.results;
						var productItems= oResponse.results[0].QuoToItems.results;				
						var textItems= oResponse.results[0].QuoToDelText.results;		
						
						that.getView().setModel(new sap.ui.model.json.JSONModel(headerItemText), "headerDataModel");
						that.getView().setModel(new sap.ui.model.json.JSONModel(productItems), "productModel");
						that.getView().setModel(new sap.ui.model.json.JSONModel(textItems), "itemTextModel");
						that.getView().getModel("headerDataModel").refresh();
						that.getView().getModel("productModel").refresh();
						that.getView().getModel("itemTextModel").refresh();
						
						for(var i=0; i<textItems.length; i++) {
							if(textItems[i].Type === 'DEL') {
								delTxt = delTxt + textItems[i].Tdline;
							}else if(textItems[i].Type === 'INV') {
								invTxt = invTxt + textItems[i].Tdline;
							}else if(textItems[i].Type === 'INT') {
								intTxt = intTxt + textItems[i].Tdline;
							}
						}
						
						var iObj = {
							"MapOrderText": [{
								"Vbeln": " ",
								"Tdline": delTxt,
								"Type": "DEL"
								},
								{
								"Vbeln": " ",
								"Tdline": invTxt,
								"Type": "INV"
								},
								{
								"Vbeln": " ",
								"Tdline": intTxt,
								"Type": "INT"
								}]
						};
						
						var fObj = {"MapOrderHdr":headerItemText,"MapOrderItems":productItems,"MapOrderText":iObj.MapOrderText};
						oJsonModelOrder.setData(fObj);
						oJsonModelOrder.refresh(true);
						
						that.getOwnerComponent().getModel("globalModel").setProperty("/selectedOrderId", headerItemText[0].Vbeln);
						
						if(dFlag){
							for(var i=0; i<oJsonModelOrder.getData().MapOrderItems.length; i++){
								oJsonModelOrder.getData().MapOrderItems[i].Updateflag = 'U';
							}
						}
						resolve("data Success");	
					},
					error: function(oError) {
						resolve("data Fail");
						console.log(oError);
						MessageBox.show(that.resourceBundle.getText("EMSG_004"), {
							title: "Error",
							styleClass: "messageBoxColr"
						});
					}
				});
				
			}.bind(this));
			   	   
		},
		
		orderVlidation: function(oModelData,that) {
			
			var eFlag = false;
			
			var custName = that.getView().byId("name").getValue();
	        var custLoc = that.getView().byId("address").getValue();
	        var soldTo = that.getView().byId("idSoldto").getValue();
	        var shipTo = that.getView().byId("idShipTo").getValue();
	        var date = that.getView().byId("idDate").getValue();
	        var poNo = that.getView().byId("idPoNumber").getValue();	        
	        var cName = that.getView().byId("idCname").getValue();
	        var cNumber = that.getView().byId("idCNumber").getValue();
	        var cEmail = that.getView().byId("idCEmail").getValue();
	        var delTxt = that.getView().byId("idDelText").getValue();
	        var invTxt = that.getView().byId("idInvText").getValue();
	        var intTxt = that.getView().byId("idIntText").getValue();
	      
			var eMsg=[];
	        
	        if(custName == "") {
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Enter Valid Customer Name","field":"Customer Name"});
	        }if(custLoc == "") {
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Enter Valid Customer Location","field":"Customer Location"});
	        }if(soldTo == "") {
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Enter Valid Sold To","field":"Sold To"});
	        }if(shipTo == "") {
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Enter Valid Ship To","field":"Ship To"});
	        }if(date =="") {
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Enter Valid Delivery Date","field":"Delivery Date"});
	        }if(poNo =="") {
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Enter Valid PO Number","field":"PO Number"});
	        }if(oModelData.MapOrderItems.length === 0){
	        	eFlag = true;
	        	eMsg.push({"eMsg":"Please Add atleast one Product","field":"Products"});
	        }if(eMsg.length>0)
			{
	        	that.getView().getModel("errorMsgModel").setData(eMsg);
			}
	        
	        return eFlag;
		}
	}
});