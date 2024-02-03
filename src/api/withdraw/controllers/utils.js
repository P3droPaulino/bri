const balanceService = require('../../bri/services/balance-service');


const debitUserWithdraw = async (user, data, type) => {
    console.log("user");
    console.log(user);
    console.log("type");
    console.log(type);
    console.log("data");
    console.log(data);
    
    const balanceResult = await balanceService.balance(strapi, {
      user: user?.id,
      mode: "D",
      amount: data?.value,
      to: "available",
      description: "Saque para chave pix: " + data.chavePix,
      type: type,
    });
  
    return balanceResult;
  };



module.exports = {
debitUserWithdraw,
   
}