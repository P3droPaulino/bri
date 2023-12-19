// @ts
'use strict';

/**
 * bri controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { empty, getFileById, getCurrentDomain, getUserMetas, getRateioBonus, pagoDentroMesAtual } = require('../../bri/controllers/utils');
const balanceService = require('../services/balance-service');

module.exports = createCoreController('api::bri.bri', ({ strapi }) => ({
  /**
     * Filtrar user por nome de usuário
     * @source <https://docs.strapi.io/dev-docs/api/entity-service/crud#example-1>
     * @method GET
    */
  async sponsor(ctx) {
    const query = ctx.request.query;

    const options = {
      fields: ['id', 'username', 'fullName', 'active'],
      filters: {
        username: query.username
      },
      // populate: { category: true },
    };
    // console.log("PARAMS", query, options);
    // @ts-ignore
    const entry = await strapi.entityService.findMany('plugin::users-permissions.user', options);
    const isNot = [{
      "id": 0,
      "username": "Inexistente",
      "fullName": "Inexistente",
      "active": false,
    }];
    return entry.length > 0 ? entry[0] : isNot[0];
  },


  /**
     * Obter Object para criar Fila D3 OrgChart
     * @param {*} ctx
     * @method GET
     */
  async plansFilaUnicaGET(ctx) {
    const query = ctx.query;
    const user = ctx.state.user;
    const { origin, protocol } = ctx.request;
    console.log("origin", origin);
    const baseUrl = `${protocol}://${ctx.request.header.host}`; // BASE URL STRAPI
    const filas = [];
    const datas = {};
    const fila_unica_acum = [];
    query.qualificados // ?qualificados=true
    // Obter todos os planos
    const plans = await strapi.entityService.findMany("api::plan.plan", {
      populate: "*",
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    let montanteFila = 0;

    for (const plan of plans) {
      const { dataAtivacao, order_accession, orders_subscription, statusAtivacao } = plan;
      if (statusAtivacao && dataAtivacao) {
        const paymentDate = await pagoDentroMesAtual(plan);
        if (paymentDate == true) {
          let rateioBonusFilho = 0;

          console.log("----------------PLAN AQUI-----------------");
          //console.log(plan);
          //const maiorDataAtivacaoSubscription = await obterMaiorDataAtivacao(plan);
          //const object_rateios_bonus_pai = await getRateioBonusFila(plan);

          if (orders_subscription && orders_subscription.length > 0) {
            // Obter "rateios_bonus" do pedido filho com o maior ID
            const pedido_subscription = orders_subscription;
            const pedidosubscriptionMaiorId = pedido_subscription.reduce((maxOrder, currentOrder) => {
              return currentOrder.id > maxOrder.id ? currentOrder : maxOrder;
            }, pedido_subscription[0]);

            const object_subscription = getRateioBonus(pedidosubscriptionMaiorId, 'fila_unica');

            const valueSubscription = parseFloat(object_subscription?.value);
            if (!isNaN(valueSubscription)) {
              montanteFila += valueSubscription;
            }
          } else if (order_accession) {
            // Obter "rateios_bonus" do pedido pai usando a função
            const object_accession = getRateioBonus(order_accession, 'fila_unica');

            const valueAccession = parseFloat(object_accession?.value);
            if (!isNaN(valueAccession)) {
              montanteFila += valueAccession;
            }
          }
        }
      }
    }


    //total de cotas
    let totalCotas = 0;

    for (let i = 0; i < plans.length; i++) {
      if (plans[i].qualificado === true) {
        for (let j = i + 1; j < plans.length; j++) {
          if (plans[j]?.statusAtivacao === true && new Date(plans[j]?.dataAtivacao).getMonth() === currentMonth) {
            totalCotas++;
          }

        }
      }
    }

    console.log(totalCotas);
    console.log(montanteFila);


    //calcular fator
    let fator = montanteFila / totalCotas;
    fator = [Infinity, null, undefined].includes(fator) ? 0 : fator;

    console.log("FILA UNICA DATAS::", fator, montanteFila, totalCotas);
    // Continue with the rest of your code after the forEach loop.
    if (plans && plans.length > 0) {
      for (let i = 0; i < plans.length; i++) {
        const item = plans[i];
        // console.log("Orders", item?.order_type);
        let position = i + 1;
        //let userMetas = await getUserMetas(item?.user?.id || 0);
        // let avatarUrl = userMetas?.avatar?.[0]?.url || null;
        // avatarUrl = [undefined, null, ''].includes(avatarUrl) ? "/blank-user.jpg" : avatarUrl;
        // console.log("Avatar URL:", avatarUrl);

        let lastId = plans[i - 1]?.id || "";

        let countPaidItems = 0; // Inicializa a contagem de itens pagos abaixo do item atual
        // Itera sobre os itens abaixo do item atual
        for (let j = i + 1; j < plans.length; j++) {
          if (plans[j]?.statusAtivacao && new Date(plans[j]?.dataAtivacao).getMonth() === currentMonth) {
            countPaidItems++;
          }
        }

        let ganhoEstimado = 0; // Inicializa o ganho estimado como null

        if (item.qualificado) {
          ganhoEstimado = fator * countPaidItems; // Calcula o ganho estimado quando o item é qualificado
        }

        let nomeprodutoof;
        if (item?.pedido_filho && item.pedido_filho.length > 0) {
          //console.log("AQUI VAI O ID:", item?.pedido_filho[0]?.id);
          const nomeassinatura = await strapi.entityService.findOne('api::order.order', item?.pedido_filho[0]?.id, { populate: "*" });
          nomeprodutoof = nomeassinatura?.produto?.name;
          //console.log("NOME DA ASSINATURA", nomeprodutoof);
        } else {
          nomeprodutoof = item?.produto?.name || "__ADESAO__";
        }


        filas.push({
          //  "name": item?.user?.fullName?.split(" ")[0] || "__FULLNAME__",
          // "imageUrl": baseUrl + avatarUrl,
          // "area": nomeprodutoof,
          // "profileUrl": `${baseUrl}/api/users/${item?.user?.id || 0}`,
          //"office": item?.user?.username,//userMetas?.role?.name || "__USUARIO__",
          "tags": "Mi2",
          // "isLoggedUser": false,
          "positionName": String(position),
          "id": String(item?.id),
          "parentId": String(lastId),
          "size": "",
          "qualificado": item?.qualificado,
          "contagem_abaixo": countPaidItems,
          "montante_fila": montanteFila,
          "total_cotas": totalCotas,
          "fator": fator,
          "ganhoEstimado": ganhoEstimado,
        });
      }
    }
    return filas;
  },


  // /**
  //   * Inserir ou Debitar saldo de usuário
  //   * @source <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
  //   * @method POST
  //   */
  // async balance(ctx) {
  //   const body = ctx.request.body;
  //   const returner = {};
  //   const hasError = [];

  //   // Validar entrada
  //   if (typeof body.user !== 'number') hasError.push("campo 'user' deve ser um Inteiro");
  //   if (typeof body.amount !== 'number' || body.amount <= 0) hasError.push("campo 'amount' deve ser um Inteiro ou Decimal maior que 0");
  //   if (typeof body.description !== 'string') hasError.push("campo 'description' deve ser uma string");
  //   if (typeof body.type !== 'string') hasError.push("campo 'type' deve ser uma string");
  //   if (typeof body.mode !== 'string' || !['D', 'C'].includes(body.mode)) hasError.push("campo 'mode' deve ser 'D' ou 'C'");
  //   if (typeof body.to !== 'string' || !['available', 'blocked', 'total'].includes(body.to)) hasError.push("campo 'to' deve ser 'available', 'blocked' ou 'total'");

  //   // Processar lógica
  //   if (hasError.length == 0) {
  //     try {
  //       const filters = {
  //         filters: {
  //           users: {
  //             id: { $eq: body?.user },
  //           },
  //         },
  //         populate: {
  //           users: true,
  //         },
  //       };

  //       let wallet = await strapi.entityService.findMany('api::balance.balance', filters);

  //       if (!wallet || wallet.length === 0) {
  //         wallet = await strapi.entityService.create("api::balance.balance", {
  //           data: {
  //             balance_available: 0,
  //             balance_blocked: 0,
  //             users: body.user
  //           },
  //         });
  //       } else {
  //         wallet = wallet[0];
  //       }

  //       let { balance_available, balance_blocked } = wallet;

  //       // Verificar se há saldo suficiente para débito
  //       if (body.mode === 'D') {
  //         const totalBalance = balance_available + balance_blocked;
  //         if (body.amount > totalBalance) {
  //           throw new Error("Saldo insuficiente para a operação");
  //         }

  //         if (body.to === 'total') {
  //           let totalAmount = body.amount;
  //           if (balance_blocked >= totalAmount) {
  //             balance_blocked -= totalAmount;
  //           } else {
  //             totalAmount -= balance_blocked;
  //             balance_blocked = 0;
  //             balance_available = Math.max(balance_available - totalAmount, 0);
  //           }
  //         } else if (body.to === 'available') {
  //           balance_available = Math.max(balance_available - body.amount, 0);
  //         } else if (body.to === 'blocked') {
  //           balance_blocked = Math.max(balance_blocked - body.amount, 0);
  //         }
  //       } else if (body.mode === 'C') {
  //         if (body.to === 'available') {
  //           balance_available += body.amount;
  //         } else if (body.to === 'blocked') {
  //           balance_blocked += body.amount;
  //         }
  //       }

  //       // Atualizar saldo na carteira
  //       await strapi.entityService.update('api::balance.balance', wallet.id, {
  //         data: {
  //           balance_available,
  //           balance_blocked,
  //         },
  //       });

  //       console.info("Saldo Atualizado: ", { balance_available, balance_blocked });


  //       const extractData = {
  //         data: new Date(), // Data atual
  //         type: body.type,
  //         status: body.mode === 'C' ? 'Crédito' : 'Débito',
  //         user: body.user,
  //         description: body.description,
  //         value: body.amount,
  //         plan: body?.plan
  //       };
  
  //       await strapi.entityService.create('api::extract.extract', {
  //         data: extractData
  //       });
  
  //       console.info("Extrato criado: ", extractData);
  //       returner["message"] = "Processado com sucesso!";
  //       returner["status"] = true;
  //     } catch (error) {
  //       hasError.push("Falha ao processar: " + error.message);
  //       returner["status"] = false;
  //     }
  //   }

  //   if (hasError.length > 0) {
  //     returner["message"] = hasError.join(";");
  //     returner["status"] = false;
  //   }

  //   ctx.send(returner);
  // },


  /**
   * Método para debitar ou creditar saldo de um usuário.
   */
  async balance(ctx) {
    return await balanceService.balance(strapi, ctx.request.body);
  },


}));