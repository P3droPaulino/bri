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
const { handleSubscriptionOrder, handleAccessionOrder, handleOtherOrderTypes } = require('../../bri/controllers/utils');
const { planPatrocinador } = require('../../order/controllers/utils');

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

         // @ts-ignore

         console.log("solicitando plano sponsor:");
         




         if (orderGET && orderGET.length > 0) {
            //console.log("Pedido:", order.id);
            for (const order of orderGET) {

               const data = {
                  user: order?.user?.id,
                  product: order?.product?.id,
                  modoPagamento: order?.modoPagamento
               };


               console.log(order?.user?.id);
               // @ts-ignore
               const planSponsor = await planPatrocinador(order?.user?.id); // ID patrocinador MESTRE
               


               if (order?.order_type === 'subscription') {
                  // Se o tipo de pedido for 'subscription' e pagamento com saldo
                  const assinatura = handleSubscriptionOrder("pix", order, data, order?.product, order?.user?.id);
               } else if (order?.order_type === 'accession') {
                  // Se o tipo de pedido for 'accession' e pagamento com saldo
                  const adesao = handleAccessionOrder("pix", order, data, order?.product, planSponsor, order?.user?.id);
               } else {
                  // Para outros tipos de pedidos e pagamento com saldo
                  const loja = handleOtherOrderTypes("pix", order, data, order?.product, order?.user?.id);
               }



               console.log("Pedido for:", order.id);
            }

         }
         return returnResponse;
      }
      return data;
   },
   

     /**
      * Webhook PIX ASAAS PAYMENT
      * @path /trigger/138b03e982db54637202f75e59c9b745d2b986ae
      * @documentation <https://developers.celcoin.com.br/docs/modelos-de-webhooks-do-pix>
      */
     async webhook_asaas_payment(ctx) {
      const data = ctx.request.body;
      const query = ctx.request.query;
      const d = {};

      d['query'] = query;
      d['req'] = ctx.request;

      console.log("BODY RECEBIDO", JSON.stringify(data, null, 2));

      const returnResponse = [];
      const event = data?.type;
      const payment = data?.transfer?.id;
      const webhookValue = data?.transfer?.value;

      console.log(event);

      if (event == "TRANSFER") {
         console.log("CONFIRMADO - RECEBIMENTO WEBHOOK TRANSFER")
         const returnResponse = [];
         const matchingWithdraws = await strapi.entityService.findMany('api::withdraw.withdraw', {
            filters: {
               responseCreate: {
                  $contains: payment
               }
            },
            populate: "*",
         });

       // Verifica se encontrou saques correspondentes e se o valor é igual
       if (matchingWithdraws.length > 0) {
         const matchingWithdraw = matchingWithdraws.find(withdraw => withdraw.value === webhookValue);
         if (matchingWithdraw) {
             console.log("Saques correspondentes encontrados, valor compatível.");
             return { status: "APPROVED" }; // Saque encontrado e valor compatível
         } else {
             console.log("Saques correspondentes encontrados, mas o valor é incompatível.");
             return { 
                 status: "REFUSED", 
                 refuseReason: "Valor da transferência incompatível com o saque registrado." 
             }; // Saque encontrado, mas valor incompatível
         }
     } else {
         console.log("Nenhum saque correspondente encontrado.");
         return { 
             status: "REFUSED", 
             refuseReason: "Transferência não encontrada no nosso banco" 
         }; // Nenhum saque correspondente encontrado
     }
 }
 
 // Retorna os dados recebidos se o evento não for uma transferência
 return data;
   },
}));