
module.exports = {
    routes: [
         {
             method: 'POST',
            path: '/trigger/b59a55e4f2bba564159abef5ce9c8c23abcdbec0',
            handler: 'webhook.webhook_asaas',
            config: {
                description: "Webhook Asaas"
            },
        },
        {
            method: 'POST',
           path: '/trigger/138b03e982db54637202f75e59c9b745d2b986ae',
           handler: 'webhook.webhook_asaas_payment',
           config: {
               description: "Webhook Asaas Payment"
           },
       },
    ],
  };
