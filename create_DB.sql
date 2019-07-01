DROP DATABASE IF EXISTS uptown_id;

CREATE DATABASE uptown_id DEFAULT CHARACTER SET utf8;

USE uptown_id;

CREATE TABLE colors (
	cid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	friendlyName VARCHAR(255) NOT NULL,
	icon_path VARCHAR(255) NOT NULL,
	PRIMARY KEY(cid)
);

CREATE TABLE materials (
	mid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	friendlyName VARCHAR(255) NOT NULL,
	icon_path VARCHAR(255) NOT NULL,
	PRIMARY KEY(mid)
);

CREATE TABLE shoes (
	sid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	friendlyName VARCHAR(255) NOT NULL,
	svg_path VARCHAR(255),
	PRIMARY KEY(sid)
);

CREATE TABLE parts ( 
	shoe_id INT UNSIGNED NOT NULL,
	part_id INT UNSIGNED NOT NULL,
	name VARCHAR(255) NOT NULL,
	default_color INT UNSIGNED NOT NULL,
	default_material INT UNSIGNED NOT NULL,
	default_x VARCHAR(16),
	default_y VARCHAR(16),
	default_width VARCHAR(16),
	default_height VARCHAR(16),
    UNIQUE KEY shoe_part_key(shoe_id, part_id),
	FOREIGN KEY (shoe_id) REFERENCES shoes(sid),
	FOREIGN KEY (default_color) REFERENCES colors(cid),
	FOREIGN KEY (default_material) REFERENCES materials(mid)
);

CREATE TABLE part_meta (
	option_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	part_id INT UNSIGNED NOT NULL,
	shoe_id INT UNSIGNED NOT NULL,
	color_id INT UNSIGNED NOT NULL,
	material_id INT UNSIGNED NOT NULL,
	img_x VARCHAR(16),
	img_y VARCHAR(16),
	img_width VARCHAR(16),
	img_height VARCHAR(16),
	price FLOAT(7, 2),
	image_path VARCHAR(255),
	PRIMARY KEY(option_id),
	FOREIGN KEY (shoe_id, part_id) REFERENCES parts(shoe_id, part_id),
	FOREIGN KEY (color_id) REFERENCES colors(cid),
	FOREIGN KEY (material_id) REFERENCES materials(mid)
);

CREATE TABLE admins (
	uid INT UNSIGNED NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	PRIMARY KEY(uid)
);

INSERT INTO admins (name, email) VALUES ("Stewart Morris", "stewshadow@gmail.com");

-- INSERT INTO colors (name, friendlyName) VALUES ("black", "black");
-- INSERT INTO materials (name, friendlyName) VALUES ("paint", "paint");
-- INSERT INTO shoes (name, friendlyName, svg_path) VALUES ("nike_air_force_1_low", "Nike Air Force 1 Low", "/paths/1/full.svg");
-- INSERT INTO parts VALUES (1, 1, "tongue", 1, 1, 0, 0, 0, 0);


