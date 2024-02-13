const webPush = require('web-push');

// Definindo as chaves VAPID
const vapidPublicKey = 'BDzn4S6hblNAmGSLuq1fOmsOlwGXp3NtTUst36siVBZTPmE_IauyQLlqqLD-7klwYOlu7Dgfn_dtOiq4bTpWY-o';
const vapidPrivateKey = 'njSBKNRUZIZPlUKF42bgcDV8UptquBw9Z6CrmGMUf_U';

webPush.setVapidDetails(
  'mailto:pedropaulinop3@gmail.com',
  vapidPublicKey,
  vapidPrivateKey
);

// Função assíncrona para enviar notificações
async function enviarNotificacao(titulo, corpo, usuarioId) {
  try {
    // Buscar a inscrição do usuário usando o ID
    const usuario = await strapi.entityService.findOne("plugin::users-permissions.user", usuarioId, {
      fields: ['notificacoesCliente'], // Ajuste isso conforme a estrutura do seu banco de dados
    });

    // Verificar se o usuário tem uma inscrição válida
    if (!usuario || !usuario.notificacoesCliente) {
      console.log("Inscrição de notificação não encontrada para o usuário:", usuarioId);
      return;
    }

    // Objeto de inscrição do usuário
    const subscription = usuario.notificacoesCliente;

    // Preparar o payload da notificação
    const payload = JSON.stringify({
      title: titulo,
      body: corpo,
      icon: "https://topinfinit.com.br/media/my-app/icon.png",
      badge: "https://topinfinit.com.br/media/my-app/badge.png"
    });

    // Enviar a notificação
    const response = await webPush.sendNotification(subscription, payload);
    console.log("Notificação enviada com sucesso:", response);
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
}

module.exports = {
    enviarNotificacao,
}