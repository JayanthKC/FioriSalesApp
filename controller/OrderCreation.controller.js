sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/kcc/ZFIORD_SALES/util/Formatter",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
	'sap/ui/core/Fragment',
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
], function (BaseController, JSONModel, Formatter, commoncodeused, Fragment,MessageBox,MessageToast,Filter,FilterOperator,FilterType) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.OrderCreation", {
		formatter: Formatter,
		_cFlag: false,
		_dFlag: false,
		_cqFlag: false,
		_nFlag:	true,
		_first: true,
		
		onInit: function () {
			
			var getMinDay = new Date();
			getMinDay.setDate(getMinDay.getDate() - 3);
			
			var oDateObject = {
					"minDate": getMinDay
			};
			
			var oDateModel = new sap.ui.model.json.JSONModel(oDateObject);
			this.getView().setModel(oDateModel, "dateModel");
			
			var sOrgData = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
        	var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			
			if(sOrg !== undefined) {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		        oRouter.getRoute("OrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        oRouter.getRoute("cOrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        oRouter.getRoute("cqOrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        oRouter.getRoute("dOrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
			}else {
				this._onSelectSorg();
	    	}
		},
					
		_OrderCreationMatched:function(oEvent){
			this.resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			
			var eModel=this.getView().getModel("errorMsgModel");
			eModel.setData([]);
			eModel.refresh(true);
		
			var oArgs = oEvent.getParameter("arguments");
			
			var cOId = oArgs.cOrderId;
			var cqOId = oArgs.cqOrderId;
			var dOId = oArgs.dOrderId;
			
			if(cOId) {
				this._cFlag = true;
				this._cqFlag = false;
				this._dFlag = false;
				
				this.getView().getModel("globalModel").setProperty("/OrderId", cOId);
				this.loadTableSoldData();
			}
			else if(cqOId) {
				this._cFlag = false;
				this._cqFlag = true;
				this._dFlag = false;
				
				this.getView().getModel("globalModel").setProperty("/OrderId", cqOId);
				this.loadTableSoldData();
			}
			else if(dOId){
				this._cFlag = false;
				this._cqFlag = false;
				this._dFlag = true;
				
				this.getView().getModel("globalModel").setProperty("/OrderId", dOId);
				this.loadTableSoldData();
			}else if(this._nFlag){
				this._cFlag = false;
				this._cqFlag = false;
				this._dFlag = false;
				
				var NameSh = this.getView().getModel("globalModel").getProperty("/shipToName");
				var Delvadd1 = this.getView().getModel("globalModel").getProperty("/shipToLocation");
				var KunnrSh = this.getView().getModel("globalModel").getProperty("/shipToID");
				
				this._nFlag = false;
				this._loadModelData();
				
				var oJsonModel = this.getView().getModel("oJsonModelOrder")
				oJsonModel.getData().MapOrderHdr[0].NameSh = NameSh;
				oJsonModel.getData().MapOrderHdr[0].Delvaddr1 = Delvadd1;
				oJsonModel.getData().MapOrderHdr[0].KunnrSh = KunnrSh;
				oJsonModel.refresh(true);
				
				this.getPalletType(KunnrSh);
				
				this.busyDailog.close();
			}else {
				this.busyDailog.close();
			}
			var customerData = this.getView().getModel("oJsonModelCustomers").getData();
			this.getView().setModel(new JSONModel(customerData), "oJsonModelOrder2");
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
				
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		        oRouter.getRoute("OrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        oRouter.getRoute("cOrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        oRouter.getRoute("cqOrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        oRouter.getRoute("dOrderCreation").attachPatternMatched(this._OrderCreationMatched, this);
		        this._loadModelData();
			}
		},
		
		_loadModelData: function() {
			var oData = this.getOwnerComponent().getModel("oJsonModelOrder").getData();
			var flag = this.getOwnerComponent().getModel("globalModel").getData().dPTile;
			var createNewOrder = this.getOwnerComponent().getModel("globalModel").getProperty("/createNewOrder");
			
			var OrderData = {
					"Vbeln": " ",
					"MapOrderHdr": [{
						"Auart": "ZOR",			
						"Bstnk": "",
						"Vbeln": " ",
						"Kunnr": "",
						"Vkorg": "",
						"Vdatu": "",
						"KunnrSh": "",
						"Cname": "",
						"Cnumber": "",
						"ContactEmail": "",
						"VehicleDiscount":"",
						"Delvaddr1": "",
						"NameSh": ""
					}],
					"MapOrderItems": [],
					"MapOrderText": [{
						"Vbeln": " ",
						"Tdline": "",
						"Type": "DEL"
					},
					{
						"Vbeln": " ",
						"Tdline": "",
						"Type": "INV"
					},
					{
						"Vbeln": " ",
						"Tdline": "",
						"Type": "INT"
					}]
			};
		
			if(!createNewOrder && flag && oData.MapOrderItems !== undefined) {
				OrderData.MapOrderItems = oData.MapOrderItems;
			}else {
				OrderData.MapOrderItems = [];
			}
			
		
			this.getView().getModel("oJsonModelOrder").setData(OrderData);
			this.getView().getModel("oJsonModelOrder").refresh(true);
		},
		
		//messagebox popup
		_onMsgBoxShow:function(tdesc,msg)
		{
			MessageBox.show(msg, {
				title: tdesc, 
				styleClass: "messageBoxColr"
			});
		},
		 
		_onMsgBoxConfirm:function(msg){
			MessageBox.show(msg, {
				title:"Confirmation",
				actions: [sap.m.MessageBox.Action.OK],
				styleClass: "messageBoxColr",
				onClose: function (sAction) {
					if (sAction === "OK") {
					}
				}
			});
		},
		
		handleMessagePopoverPress:function(oEvent){
			if (!this._eMsgPopover) {
				this._eMsgPopover = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.errorMsg", this);
				this.getView().addDependent(this._eMsgPopover);
			}
			this._eMsgPopover.openBy(oEvent.getSource());	
		},

		onEmailValidation: function(oEvent) {
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			var eValue = oEvent.getParameters().value;
			if (!mailregex.test(eValue)) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},

		onStringValidation: function(oEvent) {
			var regex = /^[-a-zA-Z-().]+(\s+[-a-zA-Z-().]+)*$/;
			var sValue = oEvent.getParameters().value;
			if (!regex.test($.trim(sValue))) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			}
		},
		
		onDateValidation: function(oEvent) {
			var dateVal = this.getView().getModel("oJsonModelOrder");
			
			dateVal.getData().MapOrderHdr[0].Vdatu = oEvent.getSource().mProperties.dateValue;
			
			var bValid = oEvent.getParameter("valid");
			if (bValid) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
			}
		},
		
		onVDiscountChange: function(oEvent) {
			var dateVal = this.getView().getModel("oJsonModelOrder");
			
			if(oEvent.getSource().mProperties.state) {
				dateVal.getData().MapOrderHdr[0].VehicleDiscount = 'X';
			}else {
				dateVal.getData().MapOrderHdr[0].VehicleDiscount = '';
			}
			 
		},
		
		onDELTxtChange: function(oEvent) {
			var oModelData = this.getOwnerComponent().getModel("oJsonModelOrder");
			var delTxt = oEvent.getParameters().value;
			oModelData.getData().MapOrderText[0].Tdline = delTxt;
			oModelData.getData().MapOrderText[0].Type = "DEL";
			oModelData.refresh(true);
		},
		
		onINVTxtChange: function(oEvent) {
			var invTxt = oEvent.getParameters().value;
			var oModelData = this.getOwnerComponent().getModel("oJsonModelOrder");
			oModelData.getData().MapOrderText[1].Tdline = invTxt;
			oModelData.getData().MapOrderText[1].Type = "INV";
			oModelData.refresh(true);
		},
		
		onINTTxtChange: function(oEvent) {
			var intTxt = oEvent.getParameters().value;
			var oModelData = this.getOwnerComponent().getModel("oJsonModelOrder");
			oModelData.getData().MapOrderText[2].Tdline =  intTxt;
			oModelData.getData().MapOrderText[2].Type =  "INT";
			oModelData.refresh(true);
		},
		
		onName: function(oEvent)
		{
			MessageBox.warning("Sorry you cannot type here, select the customer name from the drop down");
			
		},
		
		onAddress: function(oEvent)
		{
			MessageBox.warning("Sorry you cannot type here, select the customer address from the drop down");
			
		},
		
		onSoldTo: function(oEvent)
		{
			MessageBox.warning("Sorry you cannot type here, select the Sold to from the drop down");
			this.getView().byId("idSoldto").setValue("");
		},
		
		onShipTo: function(oEvent)
		{
			MessageBox.warning("Sorry you cannot type here, select the Ship to from the drop down");
			this.getView().byId("idShipTo").setValue("");
		},
		
		onNumValidation: function (oEvent) {
			var mobregex = /^[0-9]+$/;
			var nValue = oEvent.getParameters().value;
			var vId = this.getView().byId(oEvent.getSource().getId());
			if (!mobregex.test(nValue)) {
				vId.setValueState("Error");
			} else {
				vId.setValueState("None");
			}
		},
		
		onProductDeletePress: function(oEvent) {
			var path=oEvent.getSource().getBindingContext("oJsonModelOrder").getPath().split("/");
			var pathId=path[path.length-1];
			var oProduct=this.getOwnerComponent().getModel("oJsonModelOrder").getProperty("/MapOrderItems"+"/"+pathId);
			var oProductData=this.getOwnerComponent().getModel("oJsonModelOrder").getData();
			
			if(oProduct.Updateflag==="I" || oProduct.Updateflag === undefined){
				oProductData.MapOrderItems.splice(pathId, 1);
				this.getOwnerComponent().getModel("oJsonModelOrder").setData(oProductData);
			}else if(oProduct.Updateflag==="U"){
				oProductData.MapOrderItems[pathId].Updateflag="D";
				this.getOwnerComponent().getModel("oJsonModelOrder").setData(oProductData);
			}
			this.getOwnerComponent().getModel("oJsonModelOrder").refresh(true);
		},
		
		onCustomerSelectPress: function (oEvent) {
			var oData = this.getOwnerComponent().getModel("oJsonModelCustomers").getData();
			
			if(oData.length === undefined) {
				commoncodeused.fetchCustomerData(this, true);
			}else {
				if (!this._CustomerSelection) {
					this._CustomerSelection = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.Table", this);
					this.getView().addDependent(this._CustomerSelection);
				}
				this._CustomerSelection.open();	
			}		
		},
	
		loadSoldToData: function (oEvent) {
			this.busyDailog.close();
			
			if (!this._tableSelection) {
				this._tableSelection = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.SoldToFrag", this);
				this.getView().addDependent(this._tableSelection);
			}
			this._tableSelection.open();
			
		},
		
		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter([new Filter("Name1", FilterOperator.Contains, sValue),new Filter("KunnrSh", FilterOperator.Contains, sValue)]);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleValueHelpSelect: function (oEvent) {
			var oJsonModelOrder3 = this.getView().getModel("oJsonModelOrder");
			var obj = this.getView().getModel("oJsonModelCustomers").getProperty(oEvent.getParameters().selectedItem.getBindingContextPath());
			oJsonModelOrder3.getData().MapOrderHdr[0].NameSh = obj.Name1;
			oJsonModelOrder3.getData().MapOrderHdr[0].Delvaddr1 = obj.Ort01;
			oJsonModelOrder3.getData().MapOrderHdr[0].KunnrSh = obj.KunnrSh;
			oJsonModelOrder3.getData().MapOrderHdr[0].Kunnr = '';
		    oJsonModelOrder3.refresh(true);
		    
		    this.getPalletType(obj.KunnrSh);
		},
			 
		onSelectItem:function(oEvent){
			var oJsonModelOrder3 = this.getView().getModel("oJsonModelOrder");
			
			oJsonModelOrder3.getData().MapOrderHdr[0].Kunnr = this.getView().getModel("osoldToModel").getProperty(oEvent.getParameters().selectedItem.getBindingContextPath()).Kunnr;
			
			oJsonModelOrder3.refresh(true);		
		},
			 	 
		onAddProductPressed: function()
		{
			
			var productData = this.getView().getModel("oJsonModelOrder").getData();
			
			this.getOwnerComponent().getModel("oCartModel").setData(productData.MapOrderItems);
			this.getOwnerComponent().getModel("oCartModel").refresh(true);
			
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			if(this._cFlag){
				this.getOwnerComponent().getModel("globalModel").setProperty("/dFlag",false);
				this.getOwnerComponent().getModel("globalModel").setProperty("/cFlag",true);
				this.getOwnerComponent().getModel("globalModel").setProperty("/cqFlag",false);
				
				var orderId = 'c' + productData.MapOrderHdr[0].Vbeln;
				
				loRouter.navTo("oBrands", {
					orderId: orderId
				});
			}else if(this._dFlag){
				
				this.getOwnerComponent().getModel("globalModel").setProperty("/dFlag",true);
				this.getOwnerComponent().getModel("globalModel").setProperty("/cFlag",false);
				this.getOwnerComponent().getModel("globalModel").setProperty("/cqFlag",false);
				
				var orderId = 'd' + productData.MapOrderHdr[0].Vbeln;
				
				loRouter.navTo("oBrands", {
					orderId: orderId
				});
			}else if(this._cqFlag){
				
				this.getOwnerComponent().getModel("globalModel").setProperty("/dFlag",false);
				this.getOwnerComponent().getModel("globalModel").setProperty("/cFlag",false);
				this.getOwnerComponent().getModel("globalModel").setProperty("/cqFlag",true);
				
				var orderId = 'cq' + productData.MapOrderHdr[0].Vbeln;
				
				loRouter.navTo("oBrands", {
					orderId: orderId
				});
			}else {
				loRouter.navTo("Brands");
			} 
		},
		
		onPressEmail: function() {
			sap.m.URLHelper.triggerEmail("", "", "");
		},
		
		onSubmitPress: function()
		{   
			this.busyDailog.open();
			var that=this;
			
			var oModelData = this.getView().getModel("oJsonModelOrder").getData();
			var Vkorg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			
			var eFlag = commoncodeused.orderVlidation(oModelData,this);
	       	
			if(!eFlag) {
        	
				var eModel=that.getView().getModel("errorMsgModel");
				eModel.setData([]);
				eModel.refresh(true);
				
	        	var payload = commoncodeused._onFormatOrderData(oModelData,Vkorg,this);
	        	
				var url = "/CreateOrderSet";
				
				var mParameters = {
					success: function(odata, oResponse) {		
						// Set icon as favorite once the products is added to the favorites list
						MessageBox.show("Order ("+odata.Vbeln+") created successfully", {
							title:"Information",
							actions: [sap.m.MessageBox.Action.OK],
							styleClass: "messageBoxColr",
							onClose: function (sAction) {
								if (sAction === "OK"){
									that._nFlag = true;
									that._first = true;
									that.getRouter().navTo("OrdersList", {
										customerId: that.getView().byId("name").getValue(),
										customerShip:that.getView().byId("idShipTo").getValue()
									});
								}
							}
						});
						that.busyDailog.close();
					},
					error: function(odata, resp) {    
						var eMsg=JSON.parse(odata.responseText).error.innererror.errordetails[0].message;
						that.getView().getModel("errorMsgModel").setData([{"eMsg":eMsg,"field":""}]);
						eModel.refresh(true)
						that.busyDailog.close();
						that._onMsgBoxShow("Warning","Please check error messages.");
					}
				}
				
				var createOrder = this.getOwnerComponent().getModel("createOrderModel");
				createOrder.create(url, payload, mParameters);
				
        	}else {
        		that._onMsgBoxShow("Warning","Please check error messages.");
        		that.busyDailog.close();
        	}
		},
		
		onSavePress: function()
		{ 
			this.busyDailog.open();
			var that=this;
			
			var oModelData = this.getView().getModel("oJsonModelOrder").getData();
			var Vkorg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			
			var eFlag = commoncodeused.orderVlidation(oModelData,this);

			if(!eFlag) {
				
				var eModel=that.getView().getModel("errorMsgModel");
				eModel.setData([]);
				eModel.refresh(true);
				
				var payload;
				var url;
				var message;
				
				if(this._dFlag) {
					payload = commoncodeused._onFormatQuotionEditData(oModelData,Vkorg,this);
					url = "/ChangeQuotationSet";
					message = " changed successfully";
				}else {
					payload = commoncodeused._onFormatQuotData(oModelData,Vkorg,this);
					url = "/CreateQuotationSet";
					message = " created successfully";
				}
				 
				var mParameters = {
					success: function(oData, oResponse) {					 
						MessageBox.show("Quotation ("+oData.Vbeln+")" + message, {
							title:"Information",
							actions: [sap.m.MessageBox.Action.OK],
							styleClass: "messageBoxColr",
							onClose: function (sAction) {
								if (sAction === "OK") {
									that._nFlag = true;
									that._first = true;
									that.getRouter().navTo("OrdersList", {
										customerId: that.getView().byId("name").getValue(),
										customerShip:that.getView().getModel("globalModel").getData().shipToID
									});
								}
							}
						});
						that.busyDailog.close();
					},
					
					error: function(oData, oError) { 
						var eMsg=JSON.parse(oData.responseText).error.innererror.errordetails[0].message;
						that.getView().getModel("errorMsgModel").setData([{"eMsg":eMsg,"field":""}]);
						eModel.refresh(true);
						that.busyDailog.close();
						that._onMsgBoxShow("Warning","Please check error messages.");
					}
				}
				
				var createQuotation = this.getOwnerComponent().getModel("quoteModel");
				createQuotation.create(url, payload, mParameters);
	        
	        }else {
	        	that._onMsgBoxShow("Warning","Please check error messages.");
	        	that.busyDailog.close();
            }
		},
		
		onDiscardPress: function(e)
		{
			var that=this;
			
			MessageBox.show("Entered Data will be lost . Do you want to proceed.", {
				title:"Confirmation",
				actions: [sap.m.MessageBox.Action.OK, MessageBox.Action.CANCEL],
				styleClass: "messageBoxColr",
				onClose: function (sAction) {
					if (sAction === "OK") {
						that._nFlag = true;
						that._first = true;
						that.getOwnerComponent().getModel("globalModel").setProperty("/createNewOrder",false);
						that.getRouter().navTo("AllOrders", {}, true /*no history*/);
					}else{
						
					}
				}
			});
		},
		
		onSoldtoSelectPress:function(){
			this.busyDailog.open();
			var that=this;
			this.getView()
			
			var shiptoId=this.getView().byId("idShipTo").getValue();
			if(shiptoId!=""){
				this.getView().getModel("globalModel").setProperty("/soldToData", shiptoId);
			
				var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
				
				var aFilters= [];
				aFilters.push(new Filter({
				    filters: [
					    new Filter({path: "KunnrSh", operator: FilterOperator.EQ, value1: shiptoId}),
					    new Filter({path: "Vkorg", operator: FilterOperator.EQ, value1: sOrg}),
					    new Filter({path: "IsSoldTo", operator: FilterOperator.EQ, value1: "true"}),
					    ],
					    and: true
					}));
				
				var orderListData = this.getView().getModel("oJsonModelOrderList").getData();
				
				this.getOwnerComponent().getModel("oMainModel").read("/GetOrderHeaderSet", {
				   filters: [aFilters],
				   success: function(oResponse) {
						
					   	var fresults=oResponse.results;
					   	
						var uniqSoldTo = _.uniq(fresults, function (item) {
							return item.Kunnr;
						});
						
						that.getView().setModel(new JSONModel(uniqSoldTo), "osoldToModel");
						that.getView().getModel("osoldToModel").refresh();
						that.loadSoldToData();
					},
					error: function(oError) {
						console.log(oError);
						that.busyDailog.close();
					}
				});
			}
			else{
				this._onMsgBoxShow("Warning","Please select customer first.");
				MessageBox.information("Please select Customer Details");	
			}
		},
		
		loadTableSoldData: function() {
			this.getView().setModel("oJsonModelOrder");
			var oJsonModel = this.getOwnerComponent().getModel("oJsonModelOrder");
			this.getPalletType(oJsonModel.getData().MapOrderHdr[0].KunnrSh);
			this.busyDailog.close();
		},
		
		getPalletType: function(KunnrSh) {
			var that=this;
			var aFilters = new Filter("KunnrSh","EQ",KunnrSh);	
			var oDataModel=that.getOwnerComponent().getModel("oMainModel");
			return new Promise(function (resolve, reject) {
				oDataModel.read("/SetPalletSet", {
					filters: [aFilters],
					success: function(oResponse) {	
						var obj = [];
						if(oResponse.results.length > 0) {
							obj[0] = oResponse.results[0].PalletID;
							that.getOwnerComponent().getModel("globalModel").setProperty("/dPType", obj);
						}else{
							that.getOwnerComponent().getModel("globalModel").setProperty("/dPType", obj);
						}
						console.log(oResponse);
						resolve("success");
					},
					error: function(oError) {
						console.log(oError);
						resolve("error");
					}
				});
			}.bind(this));
		},
		
		dateToBackend:function(valueFromUi){
			var oDatePattren = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd"
			});
			if (valueFromUi!==""&& valueFromUi!==undefined){
				return oDatePattren.format(new Date(valueFromUi)).concat("T00:00:00");
			}else{
				return valueFromUi;
			}
		}
	});

});