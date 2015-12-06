var php = require("..");
var app = require("../node_modules/express")();

app.all("/",php.gen("nope.php"));
app.all("/man.json",php.gen("man.html"));
app.all("/404",php.gen("notfound.php"));
app.all("/404.2",php.gen("notfound.html"));
app.use("/file",php.gen("file",{index:"b.php"}));
app.use("/nfile",php.gen("file",{index:""}));
app.use("/php",php.gen("php"));
app.get("/realip",php.gen("php/ip.php"));
app.get("/fakeip",php.gen("php/ip.php",{env:{remote_address:"255.255.255.255"}}));
app.use("/fw",php.gen("likeafw.php"));

app.listen(9000);

console.log("Listen on 9000");

