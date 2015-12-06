# Node PHP Plus
Based on [NodePHP](https://github.com/mkschreder/node-php) with more feature
Install
-------
	npm install git+https://git@github.com/sent44/NPP.git
How to use?
-----------
	var app = require('express')();
	var php = require("node-php-plus");

	//app.get post use all or etc(file or dir [,option]);
	app.use("/laravel", php.gen("laravel/index.php")); // forward to framwork
	app.use("/wordpress", php.gen("wordpress")); // normal route
	app.use("/php", php.gen("php",{index: bind.html})); // bind index file
	app.all("/file.php", php.gen("path/to/file.php")); // route to single file
	app.get("/real/ip", php.gen("ip.php"));
	app.get("fake/ip", pgp.gen("ip.php",{env: {remote_address: "255.254.253.252"}})); //bind environment variables

	app.listen(9000);
	console.log("Listening on 9000");

Want more example? - take a look at test folder

Option
------
index - bind index to giving file name. Set to empty string to disable index (default: index.php)

env - bind many PHP environment variables like request_uri remote_address and signature. Read in source code for more.

Other option is coming

Other Thing
-----------
If this project piracy(?) to nhubbard's [project](https://github.com/mkschreder/node-php),
please tell me what I have to do (delete project/do a folk/change some code/etc.) in issue ticket. Because he didn't write anything about license.

Also I'm not familiar to "piracy" word and I am not good in English.
