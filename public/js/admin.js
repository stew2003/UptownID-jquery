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

	//when the color form is submitted
	$(document).on('submit', '#addColorForm', function(e){
		e.preventDefault();
		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				if(!dealWithAdminError(res)){
					//get the color form template
					$.get('/templates/color-form.html', function(html){
						//render the color template
						$('#color-container').html(Mustache.render(html, res));
					}, 'html');
				}
			}
		});

		return false;
	});

	//when the remove color form is submitted
	$(document).on('submit', '#deleteColorForm', function(e){
		e.preventDefault();
		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				if(!dealWithAdminError(res)){
					//get the color form template
					$.get('/templates/color-form.html', function(html){
						//render the color template
						$('#color-container').html(Mustache.render(html, res));
					}, 'html');
				}
			}
		});

		return false;
	});

	//when the add material form is submitted
	$(document).on('submit', '#addMaterialForm', function(e){
		e.preventDefault();
		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				if(!dealWithAdminError(res)){
					//get the color form template
					$.get('/templates/material-form.html', function(html){
						//render the color template
						$('#material-container').html(Mustache.render(html, res));
					}, 'html');
				}
			}
		});

		return false;
	});

	//when the remove material form is submitted
	$(document).on('submit', '#deleteMaterialForm', function(e){
		e.preventDefault();
		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				if(!dealWithAdminError(res)){
					//get the color form template
					$.get('/templates/material-form.html', function(html){
						//render the color template
						$('#material-container').html(Mustache.render(html, res));
					}, 'html');
				}
			}
		});

		return false;
	});

	//when the new shoe form is submitted
	$(document).on('submit', "#addShoeForm", function(e){
		e.preventDefault();
		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				console.log(res);
				if(!dealWithAdminError(res)){
					if(!res.shoeError){
						//hide the add new shoe form
						$('#addShoeForm').resetForm().hide();
						$('#shoe-title').text("Setup " + res.shoe.friendlyName);
						
						//set the data of the object as the newly uploaded file
						$('#shoe-svg').attr('data', res.friendly_shoe_path);

						$.get('/templates/parts-form.html', function(html){
							//prepare the part_id incrementer
							var part_id = 1;
							res.part_id = function(){return part_id++};

							$('#parts').html(Mustache.render(html, res));
							$('#parts').css('display', 'block');
						}, 'html');
					}
					else{
						//get the template for the shoe form
						$.get('/templates/shoe-form.html', function(html){
							//render the shoe form template (with the err)
							$('#shoe-form-container').html(Mustache.render(html, res));
						}, 'html');
					}
				}
			}
		});

		return false;
	});

	$(document).on('submit', '.addNewPart', function(e){
		e.preventDefault();

		var parent = $(this).parent();

		//submit the form through ajax
		$(this).ajaxSubmit({
			success: function(res){
				if(!dealWithAdminError(res)){
					if(res.partSuccess){
						$(parent).html('<p class="success">' + res.partSuccess + '</p>');
						$('#parts').css('display', 'none');
						
						$.get('/templates/default-image.html', function(html){
							
						});
					}
					else{
						$(parent).append('<p class="error">' + res.partError + '</p>');
					}
				}
			}
		});

		return false;
	});
});

function dealWithAdminError(res){
	if(res.adminError){
		$('#error-container').empty();
		$('#error-container').append('<p id="adminError">' + res.adminError + '</p>');
		return true;
	}
	else{
		return false;
	}
}