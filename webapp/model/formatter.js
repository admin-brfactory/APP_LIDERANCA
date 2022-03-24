sap.ui.define(function() {
	"use strict";
	return {
		formatDate: function(sValue) {
			if (!sValue) {
				return;
			}

			sValue = sValue.substr(6,2) + "/" + sValue.substr(4,2) + "/" + sValue.substr(0,4);

			return sValue;
		},
		
		formatPeriodo: function(sValue){
			if(!sValue){
				return;
			}
			
			return sValue.replaceAll(".","/");
		},
		
		formatGrupo: function(sValue1, sValue2){
			if(!sValue1 || !sValue2){
				return;
			}
			sValue2 = sValue2.replaceAll(".", "/");
			return sValue1 + "-" + sValue2;
		}

	};
});