'use strict';

/**
 * webhook controller
 * @source CUSTOM CONTROLLER STRAPI <https://docs.strapi.io/developer-docs/latest/development/backend-customization/controllers.html#adding-a-new-controller>
 * @source STRAPI WEBHOOK <https://strapi.io/blog/strapi-webhooks>
 * @source How to get raw request body in Strapi controller <https://forum.strapi.io/t/how-to-get-raw-request-body-in-strapi-controller/12113/2>
 * @source Payloads <https://docs.strapi.io/developer-docs/latest/development/backend-customization/webhooks.html#payloads>
 * @source NODE WEBHOOK <https://github.com/roccomuso/node-webhooks/blob/master/example.js>
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::webhook.webhook', ({ strapi }) => ({


/**
   * Webhook PIX ASAAS
   * @path /trigger/96f50e2a8e079eb7f6c7a10b6d77cf013e7d4d58
   * @documentation <https://developers.celcoin.com.br/docs/modelos-de-webhooks-do-pix>
   */
async webhook_asaas(ctx) {
    const data = ctx.request.body;
    const query = ctx.request.query;
    const d = {};

    d['query'] = query;
    d['req'] = ctx.request;
  
    console.log("BODY RECEBIDO", JSON.stringify(data, null, 2));

    const returnResponse = [];
      const event = data?.event;
      const payment = data?.payment?.id;

      console.log(event);
  
    if (event == "PAYMENT_RECEIVED") {
      console.log("CONFIRMADO - RECEBIMENTO PIX")
      const returnResponse = [];
        const orderGET = await strapi.entityService.findMany('api::order.order', {
          filters: {
            gateway_cobranca: {
              $contains: payment
            }
          },
          populate: "*",
        });

        console.log("ORDER GET - WEBHOOK:", orderGET);


        if (orderGET && orderGET.length > 0) {
          //console.log("Pedido:", order.id);
          for (const order of orderGET) {
            //const orderwebhook = await indicacao_direta(order?.id);
            // const orderSponsor = await orderPatrocinador(order?.user?.id); // ID patrocinador MESTRE
            // const oid = await LMO(orderSponsor); // Obter ID para derramento
            // console.log("OID AQUI: ", oid)
            // const oid2 = order?.order_type == 'accession' ? oid : null;
            //const dataAtivacao_pai = order?.order_type == 'subscription' ? order?.pedido_pai?.id : null;

            if ((order?.order_type === "subscription")) {
            //   try {
            //     // Atualizar pedido pai se foi pago
            //     const orderPai = await strapi.entityService.update("api::order.order", order?.pedido_pai?.id, {
            //       data: {
            //         paid: true,
            //         statusAtivacao: true,
            //         dataAtivacao: new Date(), // Usado para filtrar na "qualificação"
            //       },
            //       populate: "*"
            //     });
            //     order_end = orderPai;
            //   } catch (e) {
            //     console.error("bodyOrderCreate::ERROR", e.message);
            //   }
              
            }

            console.log("Pedido for:", order.id);


            // const orderPUT = await strapi.entityService.update('api::order.order', order.id, {
            //   data: {
            //     paid: true,
            //     celcoin_webhook: data,
            //     dataPagamento: new Date(),
            //     dataAtivacao: new Date(),
            //     matriz_patrocinador: oid2,
            //     statusAtivacao: true,
            //   },
            // });
            // returnResponse.push(orderPUT);
            //await pagarBonusPontosMatriz(order?.id); // Pagar Pontos e Bônus
          }

        }
        return returnResponse;
    }
    return data;
  },

}));