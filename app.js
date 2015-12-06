var url = require('url');
var child = require('child_process');
var path = require('path');
var fs = require('fs');

function processPHP(req,res,next,ftp,op){
	if(/^.+\.php$/i.test(ftp)){
		var ps = url.parse(req.url);
		var qdata = ps.query;
		var info = op["env"]["path_info"]||"";
		if(typeof op["env"]["path_info"] === 'undefined'){
			var i = req.url.indexOf(".php");
			if(i > 0) info = ps.pathname.substring(i+4);
			else info = ps.pathname;
		}
		env = {
			SERVER_SIGNATURE: op["env"]["signature"]||"NodeJS server",
			PATH_INFO: info,
			SCRIPT_NAME: op["env"]["script_name"]||ps.pathname,
			SCRIPT_FILENAME: ftp,
			REQUEST_FILENAME: op["env"]["request_file"]||ftp,
			SCRIPT_URI: op["env"]["script_uri"]||req.url,
			REQUEST_URI: op["env"]["request_uri"]||req.url,
			URL: op["env"]["url"]||req.url,
			SCRIPT_URL: op["env"]["script_url"]||req.url,
			REQUEST_METHOD: op["env"]["method"]||req.method,
			QUERY_STRING: op["env"]["query_str"]||qdata||"",
			CONTENT_TYPE: op["env"]["content_type"]||req.get("Content-type")||"",
			CONTENT_LENGTH: req.rawBody.length||0,
			ALL_HTTP: Object.keys(req.headers).map(function(x){return "HTTP_"+x.toUpperCase().replace("-", "_")+": "+req.headers[x];}).reduce(function(a, b){return a+b+"\n";}, ""), //From original node-php
			ALL_RAW: Object.keys(req.headers).map(function(x){return x+": "+req.headers[x];}).reduce(function(a, b){return a+b+"\n";}, ""), //From original node-php
			SERVER_SOFTWARE: op["env"]["software"]||"NodeJS",
			SERVER_NAME: op["env"]["server_name"]||"localhost",
			SERVER_ADDR: op["env"]["server_address"]||"127.0.0.1",
			SERVER_PORT: op["env"]["server_port"]||8011,
			GATEWAY_INTERFACE: op["env"]["gateway"]||"CGI/1.1",
			REMOTE_ADDR: op["env"]["remote_address"]||req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress||"",
			REDIRECT_STATUS: 1
		};
		Object.keys(req.headers).map(function(x){return env["HTTP_"+x.toUpperCase().replace("-", "_")] = req.headers[x];}); //From original node-php
		var r = "";
		var php = child.spawn("php-cgi", [], {
			env: env
		});
		php.stdin.write(req.rawBody);
		php.stdout.on("data", function(data){
			r += data.toString();
		});
		php.on("exit",function(){
				php.stdin.end();
				var l = r.split("\r\n");
				var i = 0;
				if(l.length){
					do{
						var m = l[i].split(": ");
						if(m[0] === "") break;
						if(m[0] == "Status") res.statusCode = parseInt(m[1]);
						if(m[0].length == 2) res.setHeader(m[0], m[1]);
						i++;
					}while(l[i] !== "");
					res.status(res.statusCode).send(l.splice(i+1).join("\n"));
				}else{
					res.status(res.statusCode).send(r);
				}
				res.end();
		});
	}else{
		res.sendFile(ftp);
	}

}

exports.gen = function(pp,op){
	if(typeof op === 'undefined') op = [];
	if(typeof op["env"] === 'undefined') op["env"] = [];
	return function(req,res,next){
		var data = "";
		req.on('data',function(chunk){
			data += chunk;
		});
		req.on('end',function(){
			req.rawBody = data || "";
			if(fs.existsSync(pp)){
				if(fs.statSync(pp).isFile()){
					processPHP(req,res,next,path.join(process.cwd(), pp),op);
				}else{
					var ps = url.parse(req.url);
					var qdata = ps.query;
					var f = path.join(pp, ps.pathname);
					if(fs.existsSync(f)){
						if(fs.statSync(f).isFile()){
							processPHP(req,res,next,path.join(process.cwd(), f),op);
						}else{
							if(op["index"]||"index.php" !== ""){
								f = path.join(f, op["index"]||"index.php");
								if(fs.existsSync(f)){
									processPHP(req,res,next,path.join(process.cwd(), f),op);
								}else{
									res.status(404).send("Not Found");
								}
							}else{
								res.status(404).send("Not Found");
							}
						}
					}else{
						res.status(404).send("Not Found");
					}
				}
			}else{
				res.status(404).send("Not Found");
			}
		});
	}
}
