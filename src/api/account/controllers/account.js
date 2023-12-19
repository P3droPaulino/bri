'use strict';

/**
 * account controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::account.account', ({ strapi }) => ({

/**
   * Obter Account de um usuário específico (Usuário Logado)
   * @source Query Example <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
   * @method GET
   */
async me(ctx) {
    const me = ctx.state.user;
    const query = ctx.query; //Funcionando
    const hasFilters = query && query.filters ? true : false;
    // console.log("[hasFilters]", query, hasFilters);
    const filters = {
      filters: {
        user: {
          id: { $eq: me.id },
        },
      },
      populate: {
        user: true,
      },
    };

    try {
      if (hasFilters) {
        const oe = Object.entries(query.filters)
        for (const a in oe) {
          const key = oe[a][0];
          const val = oe[a][1];
          console.log(key, val);
          filters.filters[key] = ["true", "false"].includes(val) ? JSON.parse(oe[a][1]) : oe[a][1]
        }
      }
      // console.log("FILTERS", filters, JSON.stringify(filters, null, 2));
    } catch (e) {
      console.log();
    }
    let accounts = await strapi.entityService.findMany('api::account.account', filters);
    // @ts-ignore
    accounts = accounts?.length > 0 ? accounts[0] : [];
    delete  accounts["user"]["password"];
    delete  accounts["user"]["resetPasswordToken"];
    delete  accounts["user"]["confirmationToken"];
    delete  accounts["user"]["passwordFinancial"];
    return accounts;
  },

// /*
//   /**
//    * Criar Cobrança PIX
//    * @method POST
//    * @param {*} ctx
//    * @return { Object }
//    */
//   async createPIX(ctx) {
//     const body = ctx.request.body;
//     const hasError = [];
//     const env = process.env;
//     const urlAsaas = process.env.URL_asaas;
//     const keyAsaas = process.env.API_key;
//     let clienteAsaas;
//     // Gerar mensagem de erro, se houver
//     if (typeof body.id !== 'number') hasError.push("campo 'user' deve ser um Inteiro");



//     const orderUpdate = await strapi.entityService.findOne("api::order.order", body.id, { populate: "*" });
//     const userUpdate = await strapi.entityService.findOne("plugin::users-permissions.user", orderUpdate?.user?.id, { populate: "*" });

//     //console.log(userUpdate);
//     try {
//       if (!userUpdate?.clienteCode_asaas || userUpdate?.clienteCode_asaas === null || userUpdate?.clienteCode_asaas === 0) {
//         console.log("Não existe conta celcoin, criando...");

//         // Primeira requisição para criar o cliente no Asaas
//         const customerData = {
//           name: userUpdate?.fullName,
//           email: userUpdate?.email,
//           phone: userUpdate?.phoneNumber.slice(3),
//           mobilePhone: userUpdate?.phoneNumber_2.slice(3),
//           cpfCnpj: userUpdate?.documentNumber,
//           postalCode: userUpdate?.postalCode,
//           address: userUpdate?.street,
//           addressNumber: userUpdate?.number,
//           complement: userUpdate?.addressComplement,
//           province: userUpdate?.neighborhood,
//           notificationDisabled: true,
//         };

//         const customerResponse = await axios.post(urlAsaas + '/v3/customers', customerData, {
//           headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             access_token: keyAsaas,
//           },
//         });

//         const clienteAsaas = customerResponse.data;
//         console.log(clienteAsaas);

//         console.log("atualizar usuário: ", orderUpdate?.user?.id, "com ID: ", clienteAsaas?.id);

//         const clienteAsaasof = await strapi.entityService.update("plugin::users-permissions.user", orderUpdate?.user?.id, {
//           data: {
//             clienteCode_asaas: clienteAsaas?.id
//           },
//         });

//         console.log("Dados do Pedido: ", orderUpdate);

//         const daysToAdd = 2; // Exemplo: adicionar 7 dias
//         const dueDate = new Date();
//         dueDate.setDate(dueDate.getDate() + daysToAdd);

//         // Agora você pode formatar a data para o formato desejado (por exemplo, 'YYYY-MM-DD')
//         const formattedDueDate = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}-${dueDate.getDate().toString().padStart(2, '0')}`;


//         const paymentData = {
//           billingType: 'PIX',
//           customer: clienteAsaas?.id,
//           dueDate: formattedDueDate,
//           value: orderUpdate?.total,
//           description: orderUpdate?.produto?.name,
//           postalService: false,
//         };

//         const paymentResponse = await axios.post(urlAsaas + '/v3/payments', paymentData, {
//           headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             access_token: keyAsaas,
//           },
//         });

//         console.log(paymentResponse.data);

//         const responseAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
//           data: {
//             celcoin_cobranca: paymentResponse.data
//           },
//         });

//         console.log("DADOS QR: ", urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode')
//         const paymentQR = await axios.get(urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode', {
//           headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             access_token: keyAsaas,
//           },
//         });


//         const responseQRAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
//           data: {
//             celcoin_base64: paymentQR.data
//           },
//         });

//         console.log(paymentQR.data);

//         return paymentQR.data;


//       } else if (userUpdate?.clienteCode_asaas && (!orderUpdate?.celcoin_cobranca || orderUpdate?.celcoin_cobranca === null || orderUpdate?.celcoin_cobranca === 0)) {

//         const daysToAdd = 2; // Exemplo: adicionar 7 dias
//         const dueDate = new Date();
//         dueDate.setDate(dueDate.getDate() + daysToAdd);

//         // Agora você pode formatar a data para o formato desejado (por exemplo, 'YYYY-MM-DD')
//         const formattedDueDate = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}-${dueDate.getDate().toString().padStart(2, '0')}`;


//         const paymentData = {
//           billingType: 'PIX',
//           customer: userUpdate?.clienteCode_asaas,
//           dueDate: formattedDueDate,
//           value: orderUpdate?.total,
//           description: orderUpdate?.produto?.name,
//           postalService: false,
//         };

//         const paymentResponse = await axios.post(urlAsaas + '/v3/payments', paymentData, {
//           headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             access_token: keyAsaas,
//           },
//         });

//         console.log(paymentResponse.data);

//         const responseAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
//           data: {
//             celcoin_cobranca: paymentResponse.data
//           },
//         });

//         console.log("DADOS QR: ", urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode')
//         const paymentQR = await axios.get(urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode', {
//           headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             access_token: keyAsaas,
//           },
//         });


//         const responseQRAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
//           data: {
//             celcoin_base64: paymentQR.data
//           },
//         });

//         console.log(paymentQR.data);

//         return paymentQR.data;

//       }else if (userUpdate?.clienteCode_asaas && orderUpdate?.celcoin_cobranca){

//         const paymentQR = await axios.get(urlAsaas + '/v3/payments/' + orderUpdate?.celcoin_cobranca?.id + '/pixQrCode', {
//           headers: {
//             accept: 'application/json',
//             'content-type': 'application/json',
//             access_token: keyAsaas,
//           },
//         });


//         const responseQRAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
//           data: {
//             celcoin_base64: paymentQR.data
//           },
//         });

//         console.log(paymentQR.data);

//         return paymentQR.data;


//       }
//     } catch (error) {
//       console.error(error);
//     }
//   },
}));

