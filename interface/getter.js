

app.route.post('/issuer/statistic/counts', async function(req){
    var pendingIssuesCount = await app.model.Issue.count({
        iid: req.query.iid,
        status: 'authorized'
    });
    var rejectedIssuesCount = await app.model.Rejected.count({
        iid: req.query.iid
    });
    var issuedIssuesCount = await app.model.Issue.count({
        iid: req.query.iid,
        status: 'issued'
    });
    return {
        isSuccess: true,
        pendingIssuesCount: pendingIssuesCount,
        rejectedIssuesCount: rejectedIssuesCount,
        issuedIssuesCount: issuedIssuesCount
    }
})

app.route.post('/issuer/statistic/pendingIssues', async function(req){
    var condition = {
        iid: req.query.iid,
        status: 'authorized'
    }
    var total = await app.model.Issue.count(condition);
    var pendingIssues = await app.model.Issue.findAll({
        condition: condition,
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });

    // Just mapping code of departments and issuers
    var departments = await app.model.Department.findAll();
    var departmentsMapping = {};
    for(let i in departments){
        departmentsMapping[departments[i].did] = {
            name: departments[i].name,
            levels: departments[i].levels
        }
    }

    var issuers = await app.model.Issuer.findAll({
        fields: ['iid', 'email']
    })
    var issuerMapping = {};
    for(let i in issuers){
        issuerMapping[issuers[i].iid] = issuers[i].email
    }
    // Just mapping code of departments and issuers

    for(let i in pendingIssues){
       var employee = await app.model.Employee.findOne({
           condition: {
               empid: pendingIssues[i].empid
           }
       });
       pendingIssues[i].receipientEmail = employee.email;
       pendingIssues[i].receipientName = employee.name;
       pendingIssues[i].totalLevels = departmentsMapping[pendingIssues[i].did].levels;
       pendingIssues[i].departmentName = departmentsMapping[pendingIssues[i].did].name;
       pendingIssues[i].issuerEmail = issuerMapping[pendingIssues[i].iid];
    }

    return {
        isSuccess: true,
        total: total,
        pendingIssues: pendingIssues
    }
});

app.route.post('/issuer/statistic/rejectedIssues', async function(req){
    var condition = {
        iid: req.query.iid
    }
    var total = await app.model.Rejected.count(condition);
    var rejectedIssues = await app.model.Rejected.findAll({
        condition: condition,
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });

    // Just mapping code of departments and issuers
    var departments = await app.model.Department.findAll();
    var departmentsMapping = {};
    for(let i in departments){
        departmentsMapping[departments[i].did] = {
            name: departments[i].name,
            levels: departments[i].levels
        }
    }

    var issuers = await app.model.Issuer.findAll({
        fields: ['iid', 'email']
    })
    var issuerMapping = {};
    for(let i in issuers){
        issuerMapping[issuers[i].iid] = issuers[i].email
    }
    // Just mapping code of departments and issuers

    for(let i in rejectedIssues){
        var issue = await app.model.Issue.findOne({
            condition: {
                pid: rejectedIssues[i].pid
            }
        });
       var employee = await app.model.Employee.findOne({
           condition: {
               empid: issue.empid
           }
       });
       rejectedIssues[i].receipientEmail = employee.email;
       rejectedIssues[i].receipientName = employee.name;
       rejectedIssues[i].authLevel = issue.authLevel;
       rejectedIssues[i].did = issue.did;
       rejectedIssues[i].totalLevels = departmentsMapping[issue.did].levels;
       rejectedIssues[i].departmentName = departmentsMapping[issue.did].name;
       rejectedIssues[i].issuerEmail = issuerMapping[rejectedIssues[i].iid];
    }

    return {
        isSuccess: true,
        total: total,
        rejectedIssues: rejectedIssues
    }
});

app.route.post('/issuer/statistic/issuedIssues', async function(req){
    var condition = {
        iid: req.query.iid,
        status: 'issued'
    }
    var total = await app.model.Issue.count(condition);
    var issuedIssues = await app.model.Issue.findAll({
        condition: condition,
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });

    // Just mapping code of departments and issuers
    var departments = await app.model.Department.findAll();
    var departmentsMapping = {};
    for(let i in departments){
        departmentsMapping[departments[i].did] = {
            name: departments[i].name,
            levels: departments[i].levels
        }
    }

    var issuers = await app.model.Issuer.findAll({
        fields: ['iid', 'email']
    })
    var issuerMapping = {};
    for(let i in issuers){
        issuerMapping[issuers[i].iid] = issuers[i].email
    }
    // Just mapping code of departments and issuers

    for(let i in issuedIssues){
       var employee = await app.model.Employee.findOne({
           condition: {
               empid: issuedIssues[i].empid
           }
       });
       issuedIssues[i].receipientEmail = employee.email;
       issuedIssues[i].receipientName = employee.name;
       issuedIssues[i].totalLevels = departmentsMapping[issuedIssues[i].did].levels;
       issuedIssues[i].departmentName = departmentsMapping[issuedIssues[i].did].name;
       issuedIssues[i].issuerEmail = issuerMapping[issuedIssues[i].iid];
    }
    return {
        isSuccess: true,
        total: total,
        issuedIssues: issuedIssues
    }
});

app.route.post('/authorizer/statistic/counts', async function(req){

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

    var signCount = await app.model.Cs.count({
        aid: req.query.aid
    });

    var rejectedCount = await app.model.Rejected.count({
        aid: req.query.aid
    })

    var pendingCount = 0

    var authdepts = await app.model.Authdept.findAll({
        condition: {
            aid: checkAuth.aid,
            deleted: '0'
        }
    });

    for(let i in authdepts){
        var issues = await app.model.Issue.findAll({
            condition: {
                status: "pending",
                did: authdepts[i].did,
                authlevel: authdepts[i].level
            }
        });

        for(let j in issues){
            var signed = await app.model.Cs.exists({
                aid: checkAuth.aid,
                pid: issues[j].pid
            });
            if(!signed){
                pendingCount++;
            }
        }
    }

    return {
        isSuccess: true,
        signCount: signCount,
        rejectedCount: rejectedCount,
        pendingCount: pendingCount
    } 
});

app.route.post('/authorizer/statistic/signedIssues', async function(req){
    var authorizer = await app.model.Authorizer.findOne({
        condition: {
            aid: req.query.aid
        }
    });
    if(!authorizer) return {
        message: "Invalid Authorizer",
        isSuccess: false
    }
    var count = await app.model.Cs.count({
        aid: req.query.aid
    })
    var signed = await app.model.Cs.findAll({
        condition: {
            aid: req.query.aid
        },
        limit: req.query.limit,
        offset: req.query.offset,
        fields: ['pid']
    });
    var signedArray = [];
    for(i in signed){
        signedArray.push(signed[i].pid);
    }
    var signedIssues = await app.model.Issue.findAll({
        condition: {
            pid: {
                $in: signedArray
            }
        }
    });

     // Just mapping code of departments and issuers
     var departments = await app.model.Department.findAll();
     var departmentsMapping = {};
     for(let i in departments){
         departmentsMapping[departments[i].did] = {
             name: departments[i].name,
             levels: departments[i].levels
         }
     }

     var issuers = await app.model.Issuer.findAll({
         fields: ['iid', 'email']
     })
     var issuerMapping = {};
     for(let i in issuers){
         issuerMapping[issuers[i].iid] = issuers[i].email
     }
     // Just mapping code of departments and issuers

     for(let i in signedIssues){
        var employee = await app.model.Employee.findOne({
            condition: {
                empid: signedIssues[i].empid
            }
        });
        signedIssues[i].receipientEmail = employee.email;
        signedIssues[i].receipientName = employee.name;
        signedIssues[i].totalLevels = departmentsMapping[signedIssues[i].did].levels;
        signedIssues[i].departmentName = departmentsMapping[signedIssues[i].did].name;
        signedIssues[i].issuerEmail = issuerMapping[signedIssues[i].iid];
     }
    return {
        signedIssues: signedIssues,
        total: count,
        isSuccess: true
    }
});

app.route.post('/authorizer/statistic/rejectedIssues', async function(req){
    var authorizer = await app.model.Authorizer.findOne({
        condition: {
            aid: req.query.aid
        }
    });
    if(!authorizer) return {
        message: "Invalid Authorizer",
        isSuccess: false
    }
    var count = await app.model.Rejected.count({
        aid: req.query.aid
    })
    var rejected = await app.model.Rejected.findAll({
        condition: {
            aid: req.query.aid
        },
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });

    // Just mapping code of departments and issuers
    var departments = await app.model.Department.findAll();
    var departmentsMapping = {};
    for(let i in departments){
        departmentsMapping[departments[i].did] = {
            name: departments[i].name,
            levels: departments[i].levels
        }
    }

    var issuers = await app.model.Issuer.findAll({
        fields: ['iid', 'email']
    })
    var issuerMapping = {};
    for(let i in issuers){
        issuerMapping[issuers[i].iid] = issuers[i].email
    }
    // Just mapping code of departments and issuers

    for(let i in rejected){
        var issue = await app.model.Issue.findOne({
            condition: {
                pid: rejected[i].pid
            }
        });
       var employee = await app.model.Employee.findOne({
           condition: {
               empid: issue.empid
           }
       });
       rejected[i].receipientEmail = employee.email;
       rejected[i].receipientName = employee.name;
       rejected[i].authLevel = issue.authLevel;
       rejected[i].did = issue.did;
       rejected[i].totalLevels = departmentsMapping[issue.did].levels;
       rejected[i].departmentName = departmentsMapping[issue.did].name;
       rejected[i].issuerEmail = issuerMapping[rejected[i].iid];
    }

    return {
        rejectedIssues: rejected,
        total: count,
        isSuccess: true
    }
});

app.route.post('/superuser/statistic/counts', async function(req){
    var pendingIssuesCount = await app.model.Issue.count({
        status: 'authorized'
    });
    var pendingAuthorizationCount = await app.model.Issue.count({
        status: 'pending'
    });
    var rejectedIssuesCount = await app.model.Rejected.count({});
    return{
        isSuccess: true,
        pendingIssuesCount: pendingIssuesCount,
        pendingAuthorizationCount: pendingAuthorizationCount,
        rejectedIssuesCount: rejectedIssuesCount
    }
});

app.route.post('/superuser/statistic/pendingIssues', async function(req){
    var condition = {
        status: 'authorized'
    }
    var total = await app.model.Issue.count(condition);
    var pendingIssues = await app.model.Issue.findAll({
        condition: condition,
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });
    return {
        isSuccess: true,
        total: total,
        pendingIssues: pendingIssues
    }
});

app.route.post('/superuser/statistic/pendingAuthorization', async function(req){
    var condition = {
        status: 'pending'
    }
    var total = await app.model.Issue.count(condition);
    var pendingAuthorization = await app.model.Issue.findAll({
        condition: condition,
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });
    return {
        isSuccess: true,
        total: total,
        pendingAuthorization: pendingAuthorization
    }
});

app.route.post('/superuser/statistic/rejectedIssues', async function(req){

    var total = await app.model.Rejected.count({});
    var pendingAuthorization = await app.model.Rejected.findAll({
        limit: req.query.limit,
        offset: req.query.offset,
        sort: {
            timestampp: -1
        }
    });
    return {
        isSuccess: true,
        total: total,
        pendingAuthorization: pendingAuthorization
    }
});

app.route.post('/receipient/email/exists', async function(req){
    var receipient = await app.model.Employee.findOne({
        condition: {
            email: req.query.email
        }
    });
    if(!receipient) return {
        exists: false
    }
    return {
        exists: true,
        data: receipient
    }
})