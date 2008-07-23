<?php

$modules["yui"] = array(
		"name" => "The YUI Global Object",
		"type" => "core",
        /*this description appears on the component's examples index page*/
		"description" => "YUI Global Object Examples", 
		"cheatsheet" => false 
);	


$examples["yui-simple"] = array(
	name => "Simple YUI Usage",
	modules => array("yui"),
	description => "Simple YUI Usage",
	sequence => array(1),
	newWindow => "default",
	requires => array("yui", 'node'),
	highlightSyntax => true
);

$examples["yui-more"] = array(
	name => "Load All Modules",
	modules => array("yui"),
	description => "Load All Modules",
	sequence => array(2),
	newWindow => "default",
	requires => array("yui", 'node', 'io', 'animation', 'dd-drag'),
	highlightSyntax => true
);

$examples["yui-multi"] = array(
	name => "Multiple Instances",
	modules => array("yui"),
	description => "Working with multiple YUI instances.",
	sequence => array(3),
	newWindow => "default",
	requires => array("yui", 'node', 'io', 'animation', 'dd-drag'),
	highlightSyntax => true
);


?>