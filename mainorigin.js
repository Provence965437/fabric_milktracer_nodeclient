var co = require('co');
var fabricservice = require('./fabricservice.js');
var express = require('express');

var app = express();

//var cowid = "cow_001";
//var machiningid = "machining_002";
//var milk_bottle = "milk_bottle_002";

//var cow_cc_name = "dairyfarm";
//var machining_cc_name = "machining";
//var milkbottle_cc_name = "salesterminal";

//var channelid = "milkgen";
//for test 

//牛奶厂相关操作   jump orgs
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})
app.get('/dairyfarm1', function (req, res) {
    res.sendFile( __dirname + "/" + "dairyfarm.html" );
})
app.get('/machining1', function (req, res) {
    res.sendFile( __dirname + "/" + "machining.html" );
})
app.get('/salesterminal1', function (req, res) {
    res.sendFile( __dirname + "/" + "salesterminal.html" );
})
////////////////////////////////////////     jump dairyfarm func
app.get('/farm_newcow', function (req, res) {
    res.sendFile( __dirname + "/" + "farm_newcow.html" );
})
app.get('/farm_upcowinfo', function (req, res) {
    res.sendFile( __dirname + "/" + "farm_upcowinfo.html" );
})
app.get('/farm_getstate', function (req, res) {
    res.sendFile( __dirname + "/" + "farm_getstate.html" );
})
app.get('/farm_getcowhistory', function (req, res) {
    res.sendFile( __dirname + "/" + "farm_getcowhistory.html" );
})
////////////////////////////////////////jump mach func
app.get('/mach_newmach', function (req, res) {
    res.sendFile( __dirname + "/" + "mach_newmach.html" );
})
app.get('/mach_upinfo', function (req, res) {
    res.sendFile( __dirname + "/" + "mach_upinfo.html" );
})
app.get('/mach_newmilk', function (req, res) {
    res.sendFile( __dirname + "/" + "mach_newmilk.html" );
})
app.get('/mach_getmachstate', function (req, res) {
    res.sendFile( __dirname + "/" + "mach_getmachstate.html" );
})
app.get('/mach_getmilkinfo', function (req, res) {
    res.sendFile( __dirname + "/" + "mach_getmilkinfo.html" );
})
app.get('/mach_getmachhistory.', function (req, res) {
    res.sendFile( __dirname + "/" + "mach_getmachhistory.html" );
})
///////////////////////////////////////////////jump salesterminal func
app.get('/sale_neworder', function (req, res) {
    res.sendFile( __dirname + "/" + "sale_neworder.html" );
})
app.get('/sale_getorderhistory', function (req, res) {
    res.sendFile( __dirname + "/" + "sale_getorderhistory.html" );
})
app.get('/sale_getmilkhistory', function (req, res) {
    res.sendFile( __dirname + "/" + "sale_getmilkhistory.html" );
})
app.get('/sale_getorderstate', function (req, res) {
    res.sendFile( __dirname + "/" + "sale_getorderstate.html" );
})

///////////////////////////////////////////
app.get('/dairyfarm',function(req,res){

	co(function* () {
		var parms= req.query;
		cc_name="dairyfarm";
		func=parms.command;
		delete parms.command;
		var parms1=[];
	   for(var k in parms)
	   {
		   parms1.push(parms[k]);
	   }

		console.info(parms1);
		var chaincodequeryresult = yield fabricservice.sendTransaction(cc_name,func,parms1);
		var jsonstr = JSON.stringify(chaincodequeryresult);
		res.send(chaincodequeryresult.toString('utf8'));
		// for(let i=0;i<chaincodequeryresult.length;i++){
		// 	res.send(chaincodequeryresult[i].toString('utf8'));
		// }
	}).catch((err)=>{
		res.send(err);
	})
});


//加工车间相关操作

app.get('/machining',function(req,res){

	co(function*(){
		var parms= req.query;
		cc_name="machining";
		func=parms.command;
		delete parms.command;
		var parms1=[];
	   for(var k in parms)
	   {
		   parms1.push(parms[k]);
	   }
		var parm1;

		console.info(parms1);
		var chaincodequeryresult = yield fabricservice.sendTransaction(cc_name,func,parms1);
		var jsonstr = JSON.stringify(chaincodequeryresult);
		res.send(chaincodequeryresult.toString('utf8'));
		// for(let i=0;i<chaincodequeryresult.length;i++){
		// 	res.send(chaincodequeryresult[i].toString('utf8'));
		// }
	}).catch((err)=>{
		res.send(err);
	})
});

//销售终端相关操作

app.get('/salesterminal',function(req,res){
	co(function*(){
		var parms= req.query;
		cc_name="salesterminal";
		func=parms.command;
		delete parms.command;
		var parms1=[];
	   for(var k in parms)
	   {
		   parms1.push(parms[k]);
	   }
		var parm1;

		console.info(parms1);
		var chaincodequeryresult = yield fabricservice.sendTransaction(cc_name,func,parms1);
		var jsonstr = JSON.stringify(chaincodequeryresult);
		res.send(chaincodequeryresult.toString('utf8'));
		// for(let i=0;i<chaincodequeryresult.length;i++){
		// 	res.send(chaincodequeryresult[i].toString('utf8'));
		// }
	}).catch((err)=>{
		res.send(err);
	})
});


//客户端查询牛奶的历史


app.get('/getmilkhistory',function(req,res){
	co(function*(){
		
		var chaincodequeryresult = yield fabricservice.queryCc(milkbottle_cc_name,"invoke",["getmilkhistory",milk_bottle,"a"]);

		for (let i = 0;i<chaincodequeryresult.length;i++){
			res.send(chaincodequeryresult[i].toString('utf8'));
		}
		var jsonstr = JSON.stringify(chaincodequeryresult);
		res.send(jsonstr);
	}).catch((err)=>{
		res.send(err);
	})
});

//启动服务
var server = app.listen(3000,function(){
	var host = server.address().address;
	var port = server.address().port;


	console.log('cow app listening at http://%s:%s',host,port);
});


//注册异常处理器

process.on('unhandledRejection',function(err){
	console.error(err.stack);
});

process.on('uncaughtException',console.error);
