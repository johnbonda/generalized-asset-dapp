var util = require("../utils/util.js");
var config = require("../config.json");
var SwaggerCall = require("../utils/SwaggerCall");
var SuperDappCall = require("../utils/SuperDappCall")
var TokenCall = require("../utils/TokenCall");
var register = require("../interface/register");
var registrations = require("../interface/registrations");
var authJwt = require("../interface/authController");
var mailCall = require("../utils/mailCall");
var SwaggerCall = require("../utils/SwaggerCall");
var logger = require("../utils/logger");
var locker = require("../utils/locker");
var blockWait = require("../utils/blockwait");



app.route.post('/query/employees', async function(req){
    logger.info("Entered /query/employees API");

    var total = await new Promise((resolve)=>{
        let sql = `select count(*) as count from employees where deleted = '0';`;
        app.sideChainDatabase.get(sql, [], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });
    
    var employees = await new Promise((resolve)=>{
        let sql = `select empid, name from employees where deleted = '0' limit ? offset ?;`;
        app.sideChainDatabase.all(sql, [req.query.limit, req.query.offset], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    return {
        total: total.result.count,
        employees: employees.result
    }
});

app.route.post('/query/department/assets', async function(req){
    var parameters = [];
    var queryString = 'select issues.* from issues, css, authdepts where ';
    
})

app.route.post('/query/authorizers/pendingSigns', async function(req) {
    var checkAuth = await app.model.Authorizer.findOne({
        condition:{
            aid: req.query.aid,
            deleted: '0'
        }
    });
    if(!checkAuth) return {
        message: "Invalid Authorizer",
        isSuccess: false
    }

    var total = await new Promise((resolve)=>{
        let sql = "select count(1) from issues where issues.status = 'pending' and issues.pid not in (select css.pid from css where css.aid = ?) and issues.did in (select did from authdepts where aid = ?) and issues.authLevel in (select level from authdepts where aid = ?);"
        app.sideChainDatabase.get(sql, [req.query.aid, req.query.aid, req.query.aid], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!total.isSuccess) return total;

    var result = await new Promise((resolve)=>{
        let sql = "select issues.*, employees.email as receipientEmail, employees.name as receipientName, departments.levels as totalLevels, departments.name as departmentName, issuers.email as issuerEmail from issues join employees on issues.empid = employees.empid join departments on issues.did = departments.did join issuers on issues.iid = issuers.iid where issues.status = 'pending' and issues.pid not in (select css.pid from css where css.aid = ?) and issues.did in (select did from authdepts where aid = ?) and issues.authLevel in (select level from authdepts where aid = ?) limit ? offset ?;"
        app.sideChainDatabase.all(sql, [req.query.aid, req.query.aid, req.query.aid, req.query.limit || 100, req.query.offset || 0], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!result.isSuccess) return result;

    return {
        isSuccess: true,
        total: total.result['count(1)'],
        result: result.result
    }
})

app.route.post('/query/superuser/statistic/pendingIssues', async function(req){
    var total = await new Promise((resolve)=>{
        let sql = "select count(1) as total from issudepts where issudepts.deleted = '0';"
        app.sideChainDatabase.get(sql, [], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!total.isSuccess) return total;

    var result = await new Promise((resolve)=>{
        let sql = "select issuers.email as issuerEmail, departments.name as department, count(issues.pid) as count from issuers join issudepts on issuers.iid = issudepts.iid join departments on issudepts.did = departments.did left join issues on issues.iid = issuers.iid and issues.status = 'authorized' where issuers.deleted = '0' and issudepts.deleted = '0' group by 1,2 order by 3 desc limit ? offset ?;"
        app.sideChainDatabase.all(sql, [req.query.limit || 100, req.query.offset || 0], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!result.isSuccess) return result;

    return {
        isSuccess: true,
        total: total.result.total,
        result: result.result
    }
})


app.route.post('/query/superuser/statistic/rejectedIssues', async function(req){
    var total = await new Promise((resolve)=>{
        let sql = "select count(1) as total from authdepts where authdepts.deleted = '0';"
        app.sideChainDatabase.get(sql, [], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!total.isSuccess) return total;

    var result = await new Promise((resolve)=>{
        let sql = "select authorizers.email as authorizerEmail, departments.name as department, count(rejecteds.pid) as count from authdepts join authorizers on authdepts.aid = authorizers.aid join departments on authdepts.did = departments.did left join issues on issues.did = authdepts.did left join rejecteds on authdepts.aid = rejecteds.aid and rejecteds.pid = issues.pid where authdepts.deleted = '0' group by authorizers.email, departments.name limit ? offset ?;"
        app.sideChainDatabase.all(sql, [req.query.limit || 100, req.query.offset || 0], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!result.isSuccess) return result;

    return {
        isSuccess: true,
        total: total.result.total,
        result: result.result
    }
})

app.route.post('/query/superuser/statistic/pendingAuthorization', async function(req){
    var total = await new Promise((resolve)=>{
        let sql = "select count(1) as total from authdepts where authdepts.deleted = '0';"
        app.sideChainDatabase.get(sql, [], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!total.isSuccess) return total;

    var result = await new Promise((resolve)=>{
        let sql = "select authorizers.email as authorizerEmail, departments.name as department, count(issues.pid) as count from authdepts join authorizers on authdepts.aid = authorizers.aid join departments on authdepts.did = departments.did left join issues on issues.authLevel = authdepts.level and authdepts.did = issues.did and issues.status = 'pending' and issues.pid where authdepts.deleted = '0' group by authorizers.email, departments.name limit ? offset ?;"
        app.sideChainDatabase.all(sql, [req.query.limit || 100, req.query.offset || 0], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!result.isSuccess) return result;

    return {
        isSuccess: true,
        total: total.result.total,
        result: result.result
    }
})

app.route.post('/query/departments/topIssued', async function(req){
    
    var timespan = util.getMilliSecondLimits(req.query.month || new Date().getMonth() + 1, req.query.year || new Date().getFullYear());
    var result = await new Promise((resolve)=>{
        let sql = "select departments.name as department, count(issues.pid) as count from departments left join issues on issues.did = departments.did and issues.status = 'issued' and timestampp between ? and ? group by departments.name order by 2 desc limit ?;"
        app.sideChainDatabase.all(sql, [timespan.first, timespan.last, req.query.limit || 5], (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!result.isSuccess) return result;

    return {
        isSuccess: true,
        result: result.result
    }
})


app.route.post('/query/department/assets', async function(req){
    var inputs = [];
    var conditionString = " from issues where";
    var departmentCheck = await app.model.Department.exists({
        did: req.query.did
    });
    if(!departmentCheck) return {
        isSuccess: false,
        message: "Invalid Department"
    }
    conditionString += " issues.did = ?";
    inputs.push(req.query.did);
    if(req.query.status){
        conditionString += " and issues.status = ?";
        inputs.push(req.query.status);
    }
    if(req.query.month || req.query.year){
        var limits = {};
        if(req.query.month && req.query.year){
            limits = util.getMilliSecondLimits(req.query.month, req.query.year);
        }
        else if(req.query.month){
            limits = util.getMilliSecondLimits(req.query.month, new Date().getFullYear());
        }
        else{
            limits.first = util.getMilliSecondLimits(1, req.query.year).first;
            limits.last = util.getMilliSecondLimits(12, req.query.year).last;                                              
        }
        conditionString += " and issues.timestampp between ? and ?";
        inputs.push(limits.first, limits.last);
    }
    if(req.query.iid){
        conditionString += " and issues.iid = ?";
        inputs.push(req.query.iid);
    }
    if(req.query.aid){
        conditionString += " and (issues.pid in (select css.pid from css where css.aid = ?) or issues.pid in (select issues.pid from issues join authdepts on authdepts.level = issues.authLevel and authdepts.did = issues.did and authdepts.aid = ?))";
        inputs.push(req.query.aid, req.query.aid);
    }


    var total = await new Promise((resolve)=>{
        let sql = "select count(1) as total" + conditionString + ";";
        app.sideChainDatabase.get(sql, inputs, (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!total.isSuccess) return total;

    var result = await new Promise((resolve)=>{
        let sql = "select issues.*" + conditionString +" limit ? offset ?;"
        inputs.push(req.query.limit || 100, req.query.offset || 0);
        app.sideChainDatabase.all(sql, inputs, (err, row)=>{
            if(err) resolve({
                isSuccess: false,
                message: JSON.stringify(err),
                result: {}
            });
            resolve({
                isSuccess: true,
                result: row
            });
        });
    });

    if(!result.isSuccess) return result;

    return {
        isSuccess: true,
        total: total.result.total,
        result: result.result
    }
})