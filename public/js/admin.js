$(document).ready(function() {

	//handle tab changes
	$('.tabs .tab-links a').on('click', function(e) {
		e.preventDefault();

		var currentAttrValue = jQuery(this).attr('href');

		// Show/Hide Tabs
		$('.tabs ' + currentAttrValue).show().siblings().hide();

		// Change/remove current tab to active
		$(this).parent('li').addClass('active').siblings().removeClass('active');
	});

	$("#addShoeForm").submit(function(e){

		e.preventDefault();

		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				//hide the add new shoe form
				$('#addShoeForm').resetForm().hide();
				
				//set the data of the object as the newly uploaded file
				$('#shoe-svg').attr('data', res.friendly_shoe_path);

				var paths = res.shoe_info.svg.g[0].path;

				var partsForms = Mustache.render(
					'{{#paths}}' +
					'<form class="addNewPart action="/newPart" method="POST" enctype="multipart/form-data">' +
						'<input name="partName" class="partName" type="text" autocomplete="off" value="{{$.id}}"/>' +
						'{{#colorsExist}}' +
							'<select name="cid">' + 
								'{{#colors}}' + 
								'<option value="{{cid}}">{{friendlyName}}</option>' +
								'{{/colors}}' +
							'</select>' +
						'{{/colorsExist}}' +
						'{{#materialsExist}}' +
							'<select name="mid">' + 
								'{{#materials}}' + 
								'<option value="{{mid}}">{{friendlyName}}</option>' +
								'{{/materials}}' +
							'</select>' +
						'{{/materialsExist}}' +
					'</form>' + 
					'{{/paths}}', {paths: paths, colorsExist: res.colorsExist, colors: res.colors, materialsExist: res.materialsExist, materials: res.materials}

				);

				$('#parts').html(partsForms);
				$('#parts').css('display', 'block');
			}
		});

		return false;
	});
});