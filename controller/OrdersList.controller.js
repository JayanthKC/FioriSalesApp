sap.ui.define([
	"com/kcc/ZFIORD_SALES/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"com/kcc/ZFIORD_SALES/util/Formatter",
	"sap/m/MessageBox",
	"com/kcc/ZFIORD_SALES/controller/commoncodeused",
], function (BaseController, JSONModel, Filter, FilterOperator, FilterType , Formatter, MessageBox, commoncodeused) {
	"use strict";

	return BaseController.extend("com.kcc.ZFIORD_SALES.controller.OrdersList", {
		_oType: '',
		_fType:[],
		
		onInit: function () {
			var data = {
	               name: ""
	            };
	        this.getView().setModel(new JSONModel(data), "data");
	        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	        oRouter.getRoute("OrdersList").attachPatternMatched(this._onOrderListMatched, this);
		},
		_onOrderListMatched : function(oEvent) {
			var that = this;
			this._oType = '';
			this.resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			this.getView().getModel("globalModel").setProperty("/isEditOptVisble", false);
			
			this.getView().byId("segmentedButtonId").setSelectedKey("allOrders");
			this.getView().byId("idAllOrdersList").setVisible(true);
			var oArgs = oEvent.getParameter("arguments");
			this.getView().getModel("data").setProperty("/name", oArgs.customerId);
			this.getView().getModel("data").setProperty("/shipToid", oArgs.customerShip);
			
			var oMData=[{"Key":"Date"},{"Key":"Status"}];
			var oFModel=new JSONModel(oMData);
			this.getView().setModel(oFModel,"oFParamModel");
			this.fglobalmodel = this.getView().getModel("fglobalmodel");
			this.fglobalmodel.setProperty("/date", false);
			this.fglobalmodel.setProperty("/status", false);
			this._onclrData();
			
			var sOrgData = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrgData");
        	var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
        	
        	if(sOrg !== undefined) {  
        		this.loadOrdesExpandEntity();
        		this.busyDailog.open();
        	}
        	else {
				that._onSelectSorg();
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
				
				if(this._oType == 'Quotation') {
					this.loadDraftExpandEntity();
				}else {
					this.loadOrdesExpandEntity();
				}
			}
		},
		 onTypeOfOrdersListChange: function(oEvent) {	
			this._onclrData();
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			if(sSelectedKey === "allOrders") 
			{
				this.busyDailog.open();
				
				this.getView().getModel("globalModel").setProperty("/isEditOptVisble", false);
				
				this._oType = '';
				this.loadOrdesExpandEntity();
			}
			else if(sSelectedKey === "draftOrders")
			{
				this.busyDailog.open();
				
				this.getView().getModel("globalModel").setProperty("/isEditOptVisble", true);
				
				this._oType = 'Quotation';
				this.loadDraftExpandEntity();
			}
			this.getView().getModel("globalModel").setProperty("/selectedSegmented",sSelectedKey);
			
			var orData=this.getView().getModel("oJsonModelOrderList").getData();
			var TypeofStatus = _.uniq(orData, function (item) {
				return item.Statdesc;
			});
			
			var noOfWeeks = [{"Date":"Last One Week"}, {"Date":"Last Two Weeks"}, {"Date":"Last Three Weeks"}];
			
			this.getView().getModel("oJsonModelOrderList").setProperty("/filterDateData",noOfWeeks);
			this.getView().getModel("oJsonModelOrderList").setProperty("/filterStatusData",TypeofStatus);
			
			this.getView().getModel("oJsonModelOrderList").refresh(true);
		 },
		 
		 onCreateNewOrderPress: function() {
			 this.busyDailog.open();
			 this.getOwnerComponent().getModel("globalModel").setProperty("/createNewOrder",true);
			 var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			 loRouter.navTo("OrderCreation");
		 },
		
		onPressToViewOrderDetail: function(oEvent) {
			var salesOrderId= this.getView().getModel("globalModel").getProperty("/selectedOrderId");
			var shipToId= this.getView().getModel("globalModel").getProperty("/selectedShipToId");
			
			if(this._oType === 'Quotation'){
				salesOrderId = 'Q_' + salesOrderId;
			}
		
			this.getRouter().navTo("OrderDetails", {
				orderId: salesOrderId,
				shipToId:shipToId
			});
		},
		
		onPressToEditOrder: function(oEvent) {
			var salesOrderId = this.getView().getModel("globalModel").getProperty("/selectedOrderId");
			var shipToId = this.getView().getModel("globalModel").getProperty("/selectedShipToId");
			
			commoncodeused.getQuotationDetails(salesOrderId,shipToId,this,true);
			
			var oId = this.getOwnerComponent().getModel("globalModel").getProperty("/selectedOrderId");
			
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			loRouter.navTo("dOrderCreation", {
				dOrderId:oId
			});
		},
		
		onNavBackToAllCustomers: function() {
			this.getRouter().navTo("AllCustomers");
		},
		
		onPressToCopyOrder: function() {
			var salesOrderId= this.getView().getModel("globalModel").getProperty("/selectedOrderId");
			var shipToId= this.getView().getModel("globalModel").getProperty("/selectedShipToId");
			
			var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			if(this._oType === 'Quotation') {
				commoncodeused.getQuotationDetails(salesOrderId,shipToId,this,false);
				var oId=this.getOwnerComponent().getModel("globalModel").getProperty("/selectedOrderId");
				loRouter.navTo("cqOrderCreation", {
					cqOrderId:oId
				});
			}
			else {
				commoncodeused.getOrderDetails(salesOrderId,shipToId,this);
				var oId=this.getOwnerComponent().getModel("globalModel").getProperty("/selectedOrderId");
				loRouter.navTo("cOrderCreation", {
					cOrderId:oId
				});
			}	
		},
		
		onActionPress : function (oEvent) {
			var oButton = oEvent.getSource();
			var oDataPath = this.getView().getModel("oJsonModelOrderList").getData()[parseInt(oEvent.getSource().getBindingContext("oJsonModelOrderList").getPath().split("/")[1])]
			this.getView().getModel("globalModel").setProperty("/selectedOrderId",oDataPath.Vbeln);
			this.getView().getModel("globalModel").setProperty("/selectedShipToId",oDataPath.KunnrSh);
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.ActionSheet", this);
				this.getView().addDependent(this._actionSheet);
			}
			this._actionSheet.openBy(oButton);
		},
		
		onOrdersListSearch : function (oEvt) {
			// add filter for search
			var aFilters = [];
			var oTable ;
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new Filter({
				    filters: [
				    	new Filter({path: "Bstnk", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
				    	new Filter({path: "Vbeln", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
				    	new Filter({path: "Name1", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false}),
				    	new Filter({path: "Kunnr", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false})
				    ]
				}));
			}
			// update list binding
			var selectedSegmented=this.getView().getModel("globalModel").getProperty("/selectedSegmented");
			
			if(selectedSegmented=="allOrders" || selectedSegmented==undefined){
				oTable = this.byId("idAllOrdersList");	
			}else if(selectedSegmented=="draftOrders"){
				oTable = this.byId("idAllOrdersList");
			}
		
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},
		
		handleFilterButtonPressed: function () {
			if (!this.FilterDialog) {
				this.FilterDialog = new sap.ui.xmlfragment("com.kcc.ZFIORD_SALES.fragment.FilterDialog", this);
				this.getView().addDependent(this.FilterDialog);
			}
			this._fType="";
			this.onfBackPress();
			sap.ui.getCore().byId("fparm_id").setSelectedKey("");
			this.FilterDialog.open();
		},
		
		onResetfPress:function(oEvent){
			var id=oEvent.getSource().getId();
			if(id==="id_frest"){
				var type=sap.ui.getCore().byId("id_type").getText();
				type=type==="Date"?"date":type;
				sap.ui.getCore().byId("idf_"+type.toLowerCase()).removeSelections(true);
			}
			else{
				sap.ui.getCore().byId("idf_date").removeSelections(true);
				sap.ui.getCore().byId("idf_status").removeSelections(true);
			}
		},
		
		onfBackPress:function(){
			var navCon=sap.ui.getCore().byId("id_fNav");
			navCon.to(sap.ui.getCore().byId("id_fFPage"));
		},
		
		onFParamPress:function(oEvent){
			var navCon = sap.ui.getCore().byId("id_fNav");
			navCon.to(sap.ui.getCore().byId("id_fvalPage"));
			var headertext = sap.ui.getCore().byId("id_fvalPage").getCustomHeader().getContentMiddle()[1];
			var selectedlist = oEvent.getParameter("item").getText();
			headertext.setText(selectedlist);
			var selectedkey = oEvent.getParameter("item").getKey();
			this.fdispFilterPage(selectedkey);
		},
		
		fdispFilterPage:function(sKey){
			if(sKey==="Status"){
				var oBinding=sap.ui.getCore().byId("idf_status").getBinding("items");
				this.fglobalmodel.setProperty("/date", false);
				this.fglobalmodel.setProperty("/status", true);
			}else if(sKey==="Date"){
				oBinding= sap.ui.getCore().byId("idf_date").getBinding("items");
				this.fglobalmodel.setProperty("/date", true);
				this.fglobalmodel.setProperty("/status", false);
			}
			oBinding.filter([]);
		},
		
		onApplyfPress:function(oEvent){
			var dItems=sap.ui.getCore().byId("idf_date").getSelectedItems();
			var sItems=sap.ui.getCore().byId("idf_status").getSelectedItems();
			var oTable = this.byId("idAllOrdersList"),
			oBinding = oTable.getBinding("items"),
			aFilters = [],
			today = new Date(),
			fromDate = new Date();
			var fData={"Date":[],"Status":[]};
				
			if(dItems.length !== 0 && dItems[0].getTitle() === "Last One Week") {
				fData.Date.push(dItems[0].getTitle());
				fromDate.setDate(fromDate.getDate() - 6);
				var oFilter=new sap.ui.model.Filter("Vdatu","BT", fromDate, today);
				aFilters.push(oFilter);
			}else if(dItems.length !== 0 && dItems[0].getTitle() === "Last Two Weeks") {
				fData.Date.push(dItems[0].getTitle());
				fromDate.setDate(fromDate.getDate() - 13);
				var oFilter=new sap.ui.model.Filter("Vdatu","BT", fromDate, today);
				aFilters.push(oFilter);
			}else if(dItems.length !== 0 && dItems[0].getTitle() === "Last Three Weeks") {
				fData.Date.push(dItems[0].getTitle());
				fromDate.setDate(fromDate.getDate() - 20);
				var oFilter=new sap.ui.model.Filter("Vdatu","BT", fromDate, today);
				aFilters.push(oFilter);
			}
				
			for(var i=0;i<sItems.length;i++){
				fData.Status.push(sItems[i].getTitle());
				oFilter=new sap.ui.model.Filter("Statdesc","EQ", sItems[i].getTitle());
				aFilters.push(oFilter);
			}
			this.fglobalmodel.setProperty("/fData",fData);
			if(aFilters.length===0){
				this.getView().byId("c_filter").setVisible(false);
			}else{
				this.getView().byId("c_filter").setVisible(true);
			}
			if(aFilters.length===0){
				oBinding.filter([]);
			}else{
				oBinding.filter(new sap.ui.model.Filter(aFilters));
			}
			this.FilterDialog.close();
		},
		
		oncFilterPress:function(oEvent){
			this.onResetfPress(oEvent);
			this.onApplyfPress();
		},
		
		_onclrData:function(){
			var fData={"Date":[],"Status":[]};
			this.fglobalmodel.setProperty("/fData",fData);
		},

		handleFilterDialogConfirm:function(oEvent)
		{
			var oTable = this.byId("idAllOrdersList"),
			mParams = oEvent.getParameters(),
			oBinding = oTable.getBinding("items"),
			aFilters = [];
			mParams.filterItems.forEach(function (oItem) {
				var aSplit = oItem.getKey().split("_"),
				sPath = aSplit[0],
				sOperator = "Contains",
				sValue1 = aSplit[1],
				oFilter = new sap.ui.model.Filter(sPath, sOperator, sValue1);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);
		},
		
		loadOrdesExpandEntity: function() {
			var that = this;
			var sOrg = this.getOwnerComponent().getModel("globalModel").getProperty("/sOrg");
			var shipToId=this.getView().getModel("data").getProperty("/shipToid");
			
			var aFilters= [];
            aFilters.push(new Filter({
			    filters: [
				    new Filter({path: "KunnrSh", operator: FilterOperator.EQ, value1: shipToId}),
				    new Filter({path: "Vkorg", operator: FilterOperator.EQ, value1: sOrg}),
				    ],
				    and: true
				}));
			this.getOwnerComponent().getModel("oMainModel").read("/GetOrderHeaderSet", {
				filters: [aFilters],
				success: function(oResponse) {
					console.log(oResponse);
					var fresults=oResponse.results;
					that.getView().getModel("oJsonModelOrderList").setData(fresults);
				
					var TypeofStatus = _.uniq(fresults, function (item) {
						return item.Statdesc;
					});
					
					var noOfWeeks = [{"Date":"Last One Week"}, {"Date":"Last Two Weeks"}, {"Date":"Last Three Weeks"}];
					that.getView().getModel("oJsonModelOrderList").setProperty("/filterDateData",noOfWeeks);
					that.getView().getModel("oJsonModelOrderList").setProperty("/filterStatusData",TypeofStatus);
					that.getView().getModel("oJsonModelOrderList").refresh();
					that.busyDailog.close();
				},
				error: function(oError) {
					that.busyDailog.close();
					console.log(oError);
					that.getView().setModel(new JSONModel([]), "oJsonModelOrderList");
					that.getView().getModel("oJsonModelOrderList").refresh();
					MessageBox.show(that.resourceBundle.getText("EMSG_019"), {
						title: "Error",
						styleClass: "messageBoxColr"
					});
				}
			});
		},
		
		loadDraftExpandEntity: function() {
			var that = this;
			var aFilters= [];
            aFilters.push(new Filter({
			    filters: [
				    new Filter({path: "IvAuart", operator: FilterOperator.EQ, value1: "ZQT"})
				    ],
				    and: true
				}));
			this.getOwnerComponent().getModel("gQuoteModel").read("/SetQuoHdrSet", {
				filters: [aFilters],
				success: function(oResponse) 
				{
					that.busyDailog.close();
					that.getView().setModel(new JSONModel(oResponse.results), "oJsonModelOrderList");
					var TypeofStatus = _.uniq(oResponse.results, function (item) {
						return item.Statdesc;
					});
					var noOfWeeks = [{"Date":"Last One Week"}, {"Date":"Last Two Weeks"}, {"Date":"Last Three Weeks"}];
					that.getView().getModel("oJsonModelOrderList").setProperty("/filterDateData",noOfWeeks);
					that.getView().getModel("oJsonModelOrderList").setProperty("/filterStatusData",TypeofStatus);
					that.getView().getModel("oJsonModelOrderList").refresh();
				},
				error: function(oError) {
					that.busyDailog.close();
					console.log(oError);
					that.getView().setModel(new JSONModel([]), "oJsonModelOrderList");
					that.getView().getModel("oJsonModelOrderList").refresh();
					MessageBox.show(that.resourceBundle.getText("EMSG_020"), {
						title: "Error",
						styleClass: "messageBoxColr"
					});
				}
			});	
		},
		
		onCancelfPress: function(){
			this.FilterDialog.close();
		}
		
	});
});