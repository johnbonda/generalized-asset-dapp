var mysqlite3 = require('sqlite3');
var path = require('path');

module.exports = async function () {
  console.log('enter dapp init')

  app.registerContract(1000, 'domain.register')
  app.registerContract(1001, 'domain.set_ip')
  app.registerContract(1003, 'payroll.issuePaySlip')
  app.registerContract(1004, 'payroll.verify')
  app.registerContract(1006, 'temp.insertIntoEmployees')
  app.registerContract(1007, 'payroll.registerEmployee')
  app.registerContract(1008, 'payroll.authorize')
  app.registerContract(1009, 'payroll.registerUser')
  app.registerContract(1010, 'temp.saveTransactionId')
  //app.registerContract(1005, 'payroll.pay')
  //app.registerFee(1005, '0', 'BEL')
  app.registerFee(1003, '0', 'BEL')
  app.registerFee(1004, '0', 'BEL')
  app.registerFee(1006, '0', 'BEL')
  app.registerFee(1007, '0', 'BEL')
  app.registerFee(1008, '0', 'BEL')
  app.registerFee(1009, '0', 'BEL')
  app.registerFee(1010, '0', 'BEL')

  console.log("Came herer?: " + __dirname);
  
  app.events.on('newBlock', (block) => {
    console.log('new block received', block.height)
  })

  app.sideChainDatabase = new mysqlite3.Database(path.join(__dirname, "blockchain.db"), (err) => {
    if (err) {
      throw err;
    }
    console.log('Connected to the blockchain database');
  });
}