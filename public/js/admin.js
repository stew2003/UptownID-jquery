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
				if(!dealWithAdminError(res)){
					if(!res.shoeError){
						//hide the add new shoe form
						$('#addShoeForm').resetForm().hide();
						$('#shoe-title').text("Setup " + res.shoe.friendlyName);
						
						//set the data of the object as the newly uploaded file
						$('#shoe-svg').attr('data', res.friendly_shoe_path);

						//re-render the parts forms
						$('#shoe-form-container').css('display', 'none').empty();
						renderPartsForm(res);
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

	//this will refresh the parts list (to account for new colors).
	$(document).on('click', '#refresh-parts', function(e){
		e.preventDefault();
		//find the indexes of all of the parts that have not yet been saved
		var remainingIndexes = [];
		$('.part-container').each(function(){
			if($(this).css("display") != "none"){
				remainingIndexes.push(parseInt($(this).find('#part_id').val()) - 1);
			}	
		});
		//find the shoe id associated with these parts
		 var shoe_id = parseInt($('.part-container').first().find('#shoe_id').val());
		 //post the shoe id and remaining indexes to the /refreshParts endpoint
		$.post('/refreshParts', {shoe_id: shoe_id, remainingIndexes: remainingIndexes}, function(res){
			renderPartsForm(res);
		});
	});

	//when a new part is saved
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
						
						//get the template for the default images
						$.get('/templates/default-image.html', function(html){
							//render the default image from
							$('#default-img-container').html(Mustache.render(html, res)).css('display', 'block');
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

	//when a new default image is submitted
	$(document).on('submit', '.addNewDefaultImage', function(e){
		e.preventDefault();
		//check whether a file has been uploaded yet
		if($('.after_img').length == 0){
			if($('#img_width').val() != '' && $('#img_height').val() != '' && $('#img_x').val() != '' && $('#img_y').val() != ''){
				$(this).ajaxSubmit({
					success: function(res){
						if(!dealWithAdminError(res)){
							if(!res.partMetaError){
								//hide this form
								$('.addNewDefaultImage').css('display', 'none').empty();
								//show the list of parts again
								$('#parts').css('display', 'block');
								//reset the draggable image
								$('.draggable_img').remove();
								$('#shoe-svg-container').append('<img class="draggable_img" id="default-img"/>');
								//add the image permanently to the shoe
								$('#shoe-svg-container').append('<img class="part-img" src="' + res.friendly_part_path +'" style="position: absolute; width:' + res.img_width +'; height:' + res.img_height + '; transform: translate(' + res.img_x + ', ' + res.img_y +');"/>');
							}
							else{
								$('#partMetaError').html('<p class="error">' + res.partMetaError + '</p>');
							}
						}
					}
				});
			}
		}
		else{
			//if a file is currently in the form
			if($('#default_img_file')[0].files && $('#default_img_file')[0].files[0]){
				//load a preview of the file
				var reader = new FileReader();

				reader.onload = function (e) {
                    $('#default-img').attr('src', e.target.result);
                };

                reader.readAsDataURL($('#default_img_file')[0].files[0]);

                //show the previously hidden files
                $('.after_img').removeClass('after_img').css('display', 'block');

                //make the image draggable and resizeable
                interact('.draggable_img')
                	.draggable({
						modifiers: [
							interact.modifiers.restrict({
								restriction: '#add-shoe',
								elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
							})
						],

						onmove: function (event) {
						    var target = event.target;

						    // keep the dragged position in the data-x/data-y attributes
						    x = (parseFloat(target.getAttribute('data-x')) || 0) + (event.dx * (100/document.documentElement.clientWidth));
						    y = (parseFloat(target.getAttribute('data-y')) || 0) + (event.dy * (100/document.documentElement.clientWidth));

						    // translate the element
						    target.style.webkitTransform =
						    target.style.transform =
						      'translate(' + x + 'vw, ' + y + 'vw)';

						    // update the posiion attributes
						    target.setAttribute('data-x', x);
						    target.setAttribute('data-y', y);

						    //set the x and y of the form to the current x and y value of the images
						    $('#img_x').val(x.toFixed(5) + 'vw').attr('value', x.toFixed(5) + 'vw');
						    $('#img_y').val(y.toFixed(5) + 'vw').attr('value', x.toFixed(5) + 'vw');
						}
					})
					.resizable({
						// resize from all edges and corners
						edges: { left: true, right: true, bottom: true, top: true },

						modifiers: [
							// keep the edges inside the parent
							interact.modifiers.restrictEdges({
								outer: '#add-shoe',
								endOnly: true,
							}),

							// minimum size
							interact.modifiers.restrictSize({
								min: { width: 10, height: 10 },
							}),
						],

						preserveAspectRatio: true,

						onmove: function(event) {
							var target = event.target;
							// update the element's style
							newWidth = event.rect.width  * (100/document.documentElement.clientWidth);
							newHeight = event.rect.height * (100/document.documentElement.clientWidth);

							target.style.width  = newWidth + 'vw';
							target.style.height = newHeight + 'vw';

							//set the from value to the width and heigh of the img
							$('#img_width').val(target.style.width).attr('value', target.style.width);
							$('#img_height').val(target.style.height).attr('value', target.style.width);
						}
					});
					//show the image
					$('.draggable_img').css('display', 'block');
			}
			else{
				$('#default-img-container').append('<p class="error"> Please choose a file to upload </p>');
			}
		}

		return false;
	});

	//when the user changes the img width.
	$(document).on('change', '#img_width', function(e){
		defaultImg = document.getElementById('default-img');
		//change the width to this thing's value
		defaultImg.style.width = $(this).val();
		//change the height to auto.
		defaultImg.style.height = 'auto';
		//convert the auto height to vw
		defaultImg.style.height = $('#default-img').height()*(100/document.documentElement.clientWidth) + 'vw';
		//put the values into the img_height input box
		$('#img_height').val(defaultImg.style.height).attr('value', defaultImg.style.height);
	});

	//when the user changes the img_height
	$(document).on('change', '#img_height', function(e){
		defaultImg = document.getElementById('default-img');
		//change the height to this thing's value
		defaultImg.style.height= $(this).val();
		//change the width to auto.
		defaultImg.style.width = 'auto';
		//convert the auto width to vw
		defaultImg.style.width = $('#default-img').width()*(100/document.documentElement.clientWidth) + 'vw';
		//put the values into the img_width input box
		$('#img_width').val(defaultImg.style.width).attr('value', defaultImg.style.width);
	});

	//when the user changes the img_x
	$(document).on('change', '#img_x', function(e){
		defaultImg = document.getElementById('default-img');
		//set the default img x to this thing
		x = $(this).val().replace('vw', '');
		y = (defaultImg.getAttribute('data-y') || 0);

		//set the new transfrom
		defaultImg.style.webkitTransform =
    	defaultImg.style.transform =
      		'translate(' + x + 'vw, ' + y + 'vw)';

      	//set the data-x attribute to the new x
      	defaultImg.setAttribute('data-x', x);
	});

	//when the user changes the img_y
	$(document).on('change', '#img_y', function(e){
		defaultImg = document.getElementById('default-img');
		//set the default img y to this thing
		y = $(this).val().replace('vw', '');
		x = (defaultImg.getAttribute('data-x') || 0);

		//set the new transfrom
		defaultImg.style.webkitTransform =
    	defaultImg.style.transform =
      		'translate(' + x + 'vw, ' + y + 'vw)';

      	//set the data-y attribute to the new y
      	defaultImg.setAttribute('data-y', y);
	});
});

function dealWithAdminError(res){
	if(res.adminError){
		$('#error-container').html('<p id="adminError">' + res.adminError + '</p>');
		return true;
	}
	else{
		return false;
	}
}

function renderPartsForm(res){
	$.get('/templates/parts-form.html', function(html){
		//prepare the part_id incrementer
		var part_id = 1;
		res.part_id = function(){return part_id++};

		$('#parts').html(Mustache.render(html, res));
		$('#parts').css('display', 'block');
	}, 'html');
}