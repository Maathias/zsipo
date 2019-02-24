$(document).ready(function(){

	$("#burger").on("click", (e) => {
		$("#drawer").toggleClass("active")
	})

	$("#drawerDimm").on("click", (e) => {
		$("#drawer").toggleClass("active")
	})

});
