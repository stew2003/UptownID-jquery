module.exports = {

	// port on which server listens
	PORT: 8080,

	//file limits
	icon_limits: {fileSize: 10 * 8 * 1024 * 1024, files: 1},

	//file limits
	part_limits: {fileSize: 10 * 8 * 1024 * 1024, files: 10},

	//svg shoe limits
	shoe_limits: {fileSize: 10 * 8 * 1024 * 1024, files: 1},

	//the base path for the color icons
	color_icon_path: './assets/color_icons',

	//the base path for the material icons
	material_icon_path: './assets/material_icons',

	//the base path for shoes
	shoe_path: './assets/shoes',

	//the base path for the parts
	parts_path: './assets/parts',

	//in dev mode
	dev: true
}