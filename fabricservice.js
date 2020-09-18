var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var EventHub = require('fabric-client/lib/ChannelEventHub.js');
var User = require('fabric-client/lib/User.js');
var crypto = require('crypto');
var FabricCAService = require('fabric-ca-client');

//
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = "debug";

//var channelid = "cha2";
var channelid = "mychannel";
var tempdir = "./fabric-client-kvs";

let client = new hfc();
var channel = client.newChannel(channelid);
var ordertls=fs.readFileSync("/home/gopath/src/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem",'utf8')
var order = client.newOrderer('grpcs://127.0.0.1:7050',{'ssl-target-name-override':'orderer.example.com',pem:ordertls});
channel.addOrderer(order);
var org1tls=fs.readFileSync("/home/gopath/src/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt",'utf8')
var org2tls=fs.readFileSync("/home/gopath/src/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt",'utf8')
var peer1 = client.newPeer('grpcs://127.0.0.1:7051',{'ssl-target-name-override':'peer0.org1.example.com',pem:org1tls})
var peer2 = client.newPeer('grpcs://127.0.0.1:9051',{'ssl-target-name-override':'peer0.org2.example.com',pem:org2tls})
//var peer2 = client.newPeer('grpc://127.0.0.1:8051')
//var peer3 = client.newPeer('grpcs://127.0.0.1:9051')
channel.addPeer(peer1);
channel.addPeer(peer2);
//channel.addPeer(peer3);

var queryCc = function (chaincodeid,func,chaincode_args) {
	return getOrgUser4Local().then((user)=>{
		
		tx_id = client.newTransactionID();
		
		var request = {

			chaincodeId: chaincodeid,
			fcn: func,
			args: chaincode_args,
			txId: tx_id
		};
		console.log("success before request second");
		console.log(request);
		console.log("success before second");
		return channel.queryByChaincode(request,peer1);

	},(err)=>{
		console.log("failure");
		console.log('error',e);

	}).then((sendtransresult)=>{
		console.log("success");
		console.log(sendtransresult);
		return sendtransresult;

	},(err)=>{
		console.log('error',e);
	});
}

var sendTransaction = function (chaincodeid,func,chaincode_args){
	
	var tx_id = null;
		
	return getOrgUser4Local().then((user)=>{
		console.info(user);

		tx_id = client.newTransactionID();	
		var request = {
			chaincodeId: chaincodeid,
			fcn: func,
			args: chaincode_args,
			chainId: channelid,
			txId: tx_id
		};

		console.log(request);
		console.log(tx_id);
		console.log("before promise");
		return channel.sendTransactionProposal(request);
	},(err)=>{
		console.log("promise failure");
		console.log('error',e);
	}).then((chaincodeinvokresult)=>{
		var proposalResponses = chaincodeinvokresult[0];
		var proposal = chaincodeinvokresult[1];
		var header = chaincodeinvokresult[2];
		var all_good = true;
		console.log("promise success");
		for(var i in proposalResponses) {
			let one_good = false;
			console.log(proposalResponses);
			if(proposalResponses && proposalResponses[0].response&&proposalResponses[0].response.status == 200){
				one_good = true;
				console.info('transaction proposal was good');

			}else{
				console.error('transaction proposal was bad');
			}
			all_good = all_good&one_good;
		}
		if(all_good){
				var info=util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s,message - "%s",metadata - "%s",endorsement signature:%s',
				proposalResponses[0].response.status,proposalResponses[0].response.message,
				proposalResponses[0].response.payload,
				proposalResponses[0].endorsement.signature);

			var request = {
				proposalResponses: proposalResponses,
				proposal: proposal,
				header: header
			};
			
			var transactionID = tx_id.getTransactionID();
			//return channel.sendTransaction(request);
			channel.sendTransaction(request);
			return info;
		}
	},(err)=>{
		console.log('error',e);
	}).then((sendtransresult)=>{
		return sendtransresult;
	},(err)=>{
		console.log('error',e);
	});
}

function getOrgUser4Local(){
	
	var keyPath = "/home/gopath/src/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk";
	var keyPEM = Buffer.from(readAllFiles(keyPath)).toString();
	var certPath = "/home/gopath/src/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem";
	var certPEM = readAllFiles(certPath).toString();

	console.log(keyPEM);
	console.log(certPEM);
	var useropt = {
		username: 'user87',
		mspid: 'Org1MSP',
		cryptoContent: {
			privateKeyPEM: keyPEM,
			signedCertPEM: certPEM
		}
	}
	return hfc.newDefaultKeyValueStore({
		path:tempdir
	}).then((store)=>{
		 client.setStateStore(store); 
		return client.createUser(useropt);

	});
};

function readAllFiles(dir) {
	//console.info(dir);
	//var files = fs.readdirSync(dir);
	 var certs ;
	// files.forEach(file_name=>{
	// 	let file_path = path.join(dir.file_name);
	// 	let data = fs.readFileSync(file_path);
	// 	certs.push(data);
	// });
	certs=fs.readFileSync(dir);
	return certs; 
}

exports.sendTransaction = sendTransaction;
exports.queryCc = queryCc;
