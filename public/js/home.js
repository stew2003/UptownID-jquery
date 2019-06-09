const img = interact('.draggable_img');

img
  .draggable({
    onmove: dragMoveListener,
    modifiers: [
      interact.modifiers.restrict({
        restriction: 'parent',
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      })
    ]
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: 'parent',
        endOnly: true,
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 10, height: 10 },
      }),
    ],

    preserveAspectRatio: true,

    onmove: function(event) {
		var target = event.target,

        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0);

	    // update the element's style
	    newWidth = event.rect.width  * (100/document.documentElement.clientWidth);
	    newHeight = event.rect.height * (100/document.documentElement.clientWidth);

	    console.log(newWidth);

	    target.style.width  = newWidth + 'vw';
	    target.style.height = newHeight + 'vw';

	    target.style.webkitTransform = target.style.transform =
	        'translate(' + x + 'vw,' + y + 'vw)';

	    target.setAttribute('data-x', x);
	    target.setAttribute('data-y', y);
	    target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
 
	}
  });
 


function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + (event.dx * (100/document.documentElement.clientWidth)),
        y = (parseFloat(target.getAttribute('data-y')) || 0) + (event.dy * (100/document.documentElement.clientWidth));

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'vw, ' + y + 'vw)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

