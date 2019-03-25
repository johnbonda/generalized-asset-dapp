var DappCall = require("../utils/DappCall");
var mailCall = require("../utils/mailCall");
var logger = require("../utils/logger");
var locker = require("../utils/locker");
var blockWait = require("../utils/blockwait");
var util = require("../utils/util");



app.route.post("/issueTransactionCall", async function(req, res){
    await locker("issueTransactionCall@"+req.query.pid);
    logger.info("Entered /issueTransactionCall API");
    var result = await issueAsset(req);
    if(!result.isSuccess) return result;
    await blockWait();
    return result;
})

app.route.post("/issueTransactionCallMultiple", async function(req){
    await locker("issueTransactionCallMultiple@" + req.query.iid);
    logger.info("Entered /issueTransactionCallMultiple API");
    var results = [];
    for(i in req.query.pids){
        var input = {
            query: req.query
        }
        input.query.pid = req.query.pids[i];
        results.push({
            pid: req.query.pids[i],
            result: await issueAsset(input)
        });
    }

    await blockWait();

    return {
        results: results,
        isSuccess: true
    }
});

async function issueAsset(req){
    try{
    app.sdb.lock("finalIssueAsset@"+req.query.pid);
    }catch(err){
        return {
            isSuccess: false,
            message: "Same pid in a block"
        }
    }
    var transactionParams = {};
    var pid = req.query.pid;

    var issuer = await app.model.Issuer.findOne({
        condition: {
            iid: req.query.iid
        }
    });

    var issue = await app.model.Issue.findOne({
        condition: {
            pid: pid
        }
    });

    if(!issue) return {
        message: "Invalid Asset",
        isSuccess: false
    }

    if(issue.status === 'issued') return {
        message: "Asset already issued",
        isSuccess: false
    }

    if(issue.status === 'pending') return {
        message: "Asset not Authorized",
        isSuccess: false
    }

    if(issue.iid !== req.query.iid) return {
        message: "Invalid issuer",
        isSuccess: false
    }
    
    var employee = await app.model.Employee.findOne({
        condition: {
            empid: issue.empid
        }
    });
    if(!employee) return {
        message: "Invalid employee",
        isSuccess: false
    }
    
    // if(issue.status !== "authorized") return "Payslip not authorized yet";

    var array = [employee.walletAddress, "payslip", JSON.parse(issue.data), issue.pid];

    transactionParams.args = JSON.stringify(array);
    transactionParams.type = 1003;
    transactionParams.fee = req.query.fee;
    transactionParams.secret = req.query.secret;
    transactionParams.senderPublicKey = req.query.senderPublicKey;

    console.log(JSON.stringify(transactionParams));

    var response = await DappCall.call('PUT', "/unsigned", transactionParams, util.getDappID(),0);

    if(!response.success) return {
        isSuccess: false,
        message: JSON.stringify(response)
    }
    
    app.sdb.update('issue', {status: "issued"}, {pid: pid});  
    app.sdb.update('issue', {timestampp: new Date().getTime()}, {pid: pid});  

    var mailBody = {
        mailType: "sendAssetIssued",
        mailOptions: {
            to: [employee.email],
            payslip: JSON.parse(issue.data)
        }
    }

    mailCall.call("POST", "", mailBody, 0);

    var activityMessage = issuer.email + " has issued payslip " + pid;
    app.sdb.create('activity', {
        activityMessage: activityMessage,
        pid: pid,
        timestampp: new Date().getTime(),
        atype: 'payslip'
    });

    return {
        isSuccess: true,
        transactionId: response.transactionId
    }
}