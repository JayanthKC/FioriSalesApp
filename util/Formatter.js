jQuery.sap.declare("com.kcc.ZFIORD_SALES.util.Formatter");

sap.ui.require("sap.ui.core.format.DateFormat");

com.kcc.ZFIORD_SALES.util.Formatter = {

		selectCustomer: function (tCustomer, nCustomer) {
			if (tCustomer === nCustomer) {
				return true;
			} else {
				return false;
			}
		},
		retQtyincases:function(cartData,ProductId){
			if(cartData!==undefined && cartData!==""){
				var oProduct=_.where(cartData,{
					"Matnr":ProductId
				});
				if(oProduct.length>0 && oProduct[0].Updateflag!=="D"){
					return parseInt(oProduct[0].Kwmeng);
				}
				else{
					return "";
				}
			}else{
				return "";
			}
		},
		retPalletType:function(cartData,ProductId,dPType){
			if(cartData!==undefined && cartData!==""){
				var oProduct=_.where(cartData,{
					"Matnr":ProductId
				});
				if(oProduct.length>0 && (oProduct[0].Updateflag!=="D"||oProduct[0].Updateflag===undefined)){
					return oProduct[0].Letyp;
				}
				else{
					if(dPType!==undefined && dPType.length>0){
						return dPType[0];
					}
					else{
						return "S1";
					}	
				}
			}else{
				if(dPType!==undefined && dPType.length>0){
					return dPType[0];
				}
				else{
					return "S1";
				}				
			}
		},
		retCPalet:function(cartData,ProductId,dpType){
			if(cartData!==undefined && cartData!==""){
				if(ProductId!==undefined){
					var oProduct=_.where(cartData,{
						"Matnr":ProductId.Matnr
					});
				}else{
					oProduct=[];
				}				
				if(oProduct.length>0 && (oProduct[0].Updateflag!=="D"||oProduct[0].Updateflag===undefined)){
				  return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(oProduct[0],oProduct[0].Letyp);	
				}
				else{
					if(dpType!==undefined){
						if(dpType.length>0) {
							return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(ProductId,dpType[0]);
						}else {
							return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(ProductId,"S1");
						}
					}
					else{
						return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(ProductId,"S1");
					}	
				}
			}else{
				if(dpType!==undefined){
					if(dpType.length>0) {
						return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(ProductId,dpType[0]);
					}else {
						return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(ProductId,"S1"); 
					}
				}
				else{
					return com.kcc.ZFIORD_SALES.util.Formatter.retpCases(ProductId,"S1");
				}				
			}
		},
		retcType:function(cartData,ProductId,dPType){
			if(ProductId===undefined || ProductId===""){
				return 0;
			}
			if(cartData!==undefined && cartData!==""){
				if(ProductId!==undefined){
					var oProduct=_.where(cartData,{
						"Matnr":ProductId.Matnr
					});
				}else{
					oProduct=[];
				}				
				if(oProduct.length>0 && (oProduct[0].Updateflag!=="D"||oProduct[0].Updateflag===undefined)){
				  return ProductId["Cs"+oProduct[0].Letyp+"L"]	
				}
				else{
					if(dPType!==undefined && dPType.length>0){
						return ProductId["Cs"+dPType[0]+"L"]
					}
					else{
						return ProductId["CsS1L"];
					}	
				}
			}else{
				if(dPType!==undefined && dPType.length>0){
					return ProductId["Cs"+dPType[0]+"L"]
				}
				else{
					return ProductId["CsS1L"];
				}				
			}
		},
		retpCases:function(oProduct,PalletType){
			if(oProduct===undefined || oProduct ===""){
				return 0;
			}
			if(PalletType==="S1"){
				return oProduct.CsS1;
			}
			else if(PalletType==="S2"){
				return oProduct.CsS2;
			}else if(PalletType==="S3"){
				return oProduct.CsS3;
			}
		},
		dateConversion:function(dateValue){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd MMM yyyy"
			});
			if (dateValue && typeof (dateValue) === "string") {
				return oDateFormat.format(new Date(dateValue));
			} else if (dateValue !== "" && dateValue !== undefined) {
				return oDateFormat.format(dateValue);
			} else {
				return dateValue;
			}

		},
		retMatText:function(matTexts,pId){
			if(matTexts!==undefined){
				if(matTexts.length>0){
					var pmatText=_.where(matTexts,{
						Matnr:pId
					});
					return pmatText.text;
				}else{
					return "";
				}
			}else{
				return "";
			}
		},
		retItemsLength:function(oProducts){
			var iLength=0;
			if(oProducts !=="" && oProducts!== undefined){
				oProducts=_.reject(oProducts,function(item){
					return item.Updateflag==="D";
				})
				return oProducts.length;
			}
			return iLength;
		},
		retQtyTCases:function(oProducts){
			var cases=0;
			if(oProducts !=="" && oProducts!== undefined){
				for(var i=0;i<oProducts.length;i++)
				{
					if(oProducts[i].Updateflag!=="D"){
						cases+=parseInt(oProducts[i].Kwmeng);
					}					
				}
			}
			return cases;

		},
		retQtyTPallets:function(oProducts){
			var pallets=0.00;
			if(oProducts !=="" && oProducts!== undefined){
				for(var i=0;i<oProducts.length;i++)
				{
					if(oProducts[i].Updateflag!=="D"){
						pallets+=parseFloat(oProducts[i].Palletqty);
					}					
				}
			}
			return pallets;
		},
		selectFDate:function(fDate,fDateList){
			if(fDateList.indexOf(fDate)!==-1){
				return true;
			}else{
				return false;
			}
		},
};