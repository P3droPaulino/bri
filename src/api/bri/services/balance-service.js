module.exports = {
    async balance(strapi, params) {
      const { user, amount, mode, to, description, type, plan } = params;
      const returner = {};
      const hasError = [];
  
      // Validações
      if (typeof user !== 'number') hasError.push("campo 'user' deve ser um Inteiro");
      if (typeof amount !== 'number' || amount <= 0) hasError.push("campo 'amount' deve ser um Inteiro ou Decimal maior que 0");
      if (typeof description !== 'string') hasError.push("campo 'description' deve ser uma string");
      if (typeof type !== 'string') hasError.push("campo 'type' deve ser uma string");
      if (typeof mode !== 'string' || !['D', 'C'].includes(mode)) hasError.push("campo 'mode' deve ser 'D' ou 'C'");
      if (typeof to !== 'string' || !['available', 'blocked', 'total'].includes(to)) hasError.push("campo 'to' deve ser 'available', 'blocked' ou 'total'");
  
      if (hasError.length === 0) {
        try {
          const filters = {
            filters: {
              users: {
                id: { $eq: user },
              },
            },
            populate: {
              users: true,
            },
          };
  
          let wallet = await strapi.entityService.findMany('api::balance.balance', filters);
  
          if (!wallet || wallet.length === 0) {
            wallet = await strapi.entityService.create("api::balance.balance", {
              data: {
                balance_available: 0,
                balance_blocked: 0,
                users: user
              },
            });
          } else {
            wallet = wallet[0];
          }
  
          let { balance_available, balance_blocked } = wallet;
  
          // Lógica de atualização do saldo
          if (mode === 'D') {
            const totalBalance = balance_available + balance_blocked;
            if (amount > totalBalance) {
              throw new Error("Saldo insuficiente para a operação");
            }
  
            if (to === 'total') {
              let totalAmount = amount;
              if (balance_blocked >= totalAmount) {
                balance_blocked -= totalAmount;
              } else {
                totalAmount -= balance_blocked;
                balance_blocked = 0;
                balance_available = Math.max(balance_available - totalAmount, 0);
              }
            } else if (to === 'available') {
              balance_available = Math.max(balance_available - amount, 0);
            } else if (to === 'blocked') {
              balance_blocked = Math.max(balance_blocked - amount, 0);
            }
          } else if (mode === 'C') {
            if (to === 'available') {
              balance_available += amount;
            } else if (to === 'blocked') {
              balance_blocked += amount;
            }
          }
  
          // Atualizar saldo na carteira
          await strapi.entityService.update('api::balance.balance', wallet.id, {
            data: {
              balance_available,
              balance_blocked,
            },
          });
  
          // Criar registro de extrato
          const extractData = {
            data: new Date(), // Data atual
            type,
            status: mode === 'C' ? 'Crédito' : 'Débito',
            user,
            description,
            value: amount,
            plan
          };
    
          await strapi.entityService.create('api::extract.extract', {
            data: extractData
          });
  
          returner["message"] = "Processado com sucesso!";
          returner["status"] = true;
        } catch (error) {
          hasError.push("Falha ao processar: " + error.message);
          returner["status"] = false;
        }
      }
  
      if (hasError.length > 0) {
        returner["message"] = hasError.join(";");
        returner["status"] = false;
      }
  
      return returner;
    },
  };
  