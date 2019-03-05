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