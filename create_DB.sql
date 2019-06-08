DROP DATABASE IF EXISTS uptown_id;

CREATE DATABASE uptown_id DEFAULT CHARACTER SET utf8;

USE uptown_id;

CREATE TABLE color (
	cid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	friendlyName VARCHAR(255) NOT NULL,
	PRIMARY KEY(cid)
);

CREATE TABLE material (
	mid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	friendlyName VARCHAR(255) NOT NULL,
	PRIMARY KEY(mid)
);

CREATE TABLE shoe (
	sid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	friendlyName VARCHAR(255) NOT NULL,
	PRIMARY KEY(sid)
);

CREATE TABLE shoe_part(
	part_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	shoe_id INT UNSIGNED NOT NULL,
	name VARCHAR(255) NOT NULL,
	default_color INT UNSIGNED NOT NULL,
	default_material INT UNSIGNED NOT NULL,
	UNIQUE KEY shoe_part_index (part_id, shoe_id),
	FOREIGN KEY (shoe_id) REFERENCES shoe(sid),
	FOREIGN KEY (default_color) REFERENCES color(cid),
	FOREIGN KEY (default_material) REFERENCES material(mid)
);

CREATE TABLE option (

	-- idk how to link this to the show_part table

	color_id INT UNSIGNED NOT NULL,
	material_id INT UNSIGNED NOT NULL,
	price FLOAT(7, 2),
	image_path VARCHAR(255)
	FOREIGN KEY (color_id) REFERENCES color(cid),
	FOREIGN KEY (material_id) REFERENCES material(mid),
);