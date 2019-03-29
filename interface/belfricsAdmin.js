var BKVSCall = require('../utils/BKVSCall.js');
var SuperDappCall = require("../utils/SuperDappCall");
var DappCall = require("../utils/DappCall");
var SwaggerCall = require('../utils/SwaggerCall.js');
var logger = require("../utils/logger");
var locker = require("../utils/locker");
var blockWait = require("../utils/blockwait");
var util = require("../utils/util");

app.route.post('/admin/workDetails', async function(req){
    var issuersCount = await app.model.Issuer.count({
        deleted: '0'
    });
    var authorizersCount = await app.model.Authorizer.count({
        deleted: '0'
    });
    var recepientsCount = await app.model.Employee.count({
        deleted: '0'
    });
    var issuesCount = await app.model.Issue.count({
        status: 'issued'
    });
    return {
        isSuccess: true,
        issuersCount: issuersCount,
        authorizersCount: authorizersCount,
        recepientsCount: recepientsCount,
        issuesCount: issuesCount
    }
})