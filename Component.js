sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/kcc/ZFIORD_SALES/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.kcc.ZFIORD_SALES.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();
			
			// enable Ushell back button for the launchpad.
			sap.ushell.Container.getRenderer("fiori2").hideHeaderItem("backBtn", false);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");	
		},
		getContentDensityClass : function () {
			if (!this._sContentDensityClass) {
				if (!Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		
		exit: function(){
			sap.ushell.Container.getRenderer("fiori2").showHeaderItem("backBtn", false);
		}
		
	});
});