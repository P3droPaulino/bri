const balanceService = require('../../bri/services/balance-service');


/**
 * Verificar se variável está vazia
 * @param {*} v
 * @returns { Boolean }
 */
const empty = (v) => {
  try {
    if (v !== null && v !== undefined && v !== "" && (typeof v !== "object" || Object.keys(v).length > 0) && (!Array.isArray(v) || v.length > 0)) {
      return false;
    }
    return true;
  } catch (e) {
    return true;
  }
};


/**
 * Verificar se um pedido está pago no mês atual, baseado em dataAtivacao
 * @async
 * @param { Object } plan - Object do pedido (order) para verificar
 * @return { Promise<boolean> }
 */
const pagoDentroMesAtual = async (plan) => {
  let mesPago = false;
  try {
    if (!empty(plan?.dataAtivacao)) {
      const dateToCheck = new Date(plan?.dataAtivacao); //Sem tempo de testar
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      mesPago = dateToCheck >= firstDay && dateToCheck <= lastDay;
      console.log("pagoDentroMesAtual::(", plan?.id, ")", mesPago);
    }
  } catch (e) {
    console.error("pagoDentroMesAtual::(", plan, ")", e.message);
    mesPago = false;
  }
  return mesPago;
}
/**
* Obter a ROLE de usuário por ID do usuário
* @param { Number } user_id
* @return { Promise }
*/
const getUserMetas = async (user_id = 0) => {
  if (user_id > 0) {
    try {
      const entry = await strapi.entityService.findOne("plugin::users-permissions.user", user_id, {
        // fields: ["role"],
        populate: {
          role: true,
          avatar: true,
        },
        // populate: "*"
      });
      //console.log("--------------------PEGANDO DATA-------------------");
      //console.log(entry);
      return entry;
    } catch (e) {
      console.log("E:", e);
      return {};
    }
  }
  return {};
};

/**
 * Obter o domínio atual
 * @async
 * @return { Promise<string> }
 */
const getCurrentDomain = async () => {
  try {
    const isHost = strapi.config.host || '';
    const isPort = `:${strapi.config.port}` || '';
    const currentOrigin = `//${isHost}${isPort}`;
    return currentOrigin;
  } catch (e) {
    //console.log("E:", e);
    return '';
  }
};

/**
 * Obter o arquivo por ID
 * @async
 * @param { String } id - ID do arquivo
 * @return { Promise<any> }
 */
const getFileById = async (id) => {
  const url = await getCurrentDomain();
  const defaultImage = `${url}/default-image.jpg`;
  //console.log("defaultImage", defaultImage);
  try {
    const file = await strapi.plugins.upload.services.upload.fetch({ id });
    return file;
  } catch (e) {
    return defaultImage;
  }
};


/**
* Obter Objeto de um rateio bônus de um Objeto de um pedido
* @async
* @param { Object } oobj - Order OBJect - Object de um pedido, deve estar populado com o rateio_bonus
* @return { Object }
*/
const getRateioBonus = (oobj, key) => {
  try {
    const filteredRateios = oobj?.rateios_bonus?.filter((item) => {
      return item?.key === key && item?.status === true;
    });

    return filteredRateios.length > 0
      ? { key, value: filteredRateios[0].value, status: true }
      : { key, value: '0', status: false };
  } catch (e) {
    return {
      key,
      value: '0',
      status: false,
      error: `Objecto do pedido ${oobj?.id} não tem 'rateios_bonus' para extração!`,
      error_msg: e.message,
    };
  }
};

/**
* Obter Objeto de um rateio bônus de um Objeto de um pedido
* @async
* @param { Object } oobj - Order OBJect - Object de um pedido, deve estar populado com o rateio_bonus
* @return { Object }
*/
const getRateioMatriz = (oobj, key) => {
  try {
    const filteredRateios = oobj?.rateios_unilevel?.filter((item) => {
      return item?.key === key && item?.status === true;
    });

    return filteredRateios.length > 0
      ? { key, value: filteredRateios[0].value, status: true }
      : { key, value: '0', status: false };
  } catch (e) {
    return {
      key,
      value: '0',
      status: false,
      error: `Objecto do pedido ${oobj?.id} não tem 'rateios_unilevel' para extração!`,
      error_msg: e.message,
    };
  }
};

// Função para remover campos sensíveis de um plano
const removerCamposSensiveis = (plano) => {
  const camposSensiveis = [
    'password', 'passwordFinancial', 'resetPasswordToken', 'document_id',
    'documentNumber', 'document_issue_uf', 'clienteCode_asaas', 'motherName',
    'postalCode', 'marital_status', 'confirmationToken', 'birthDate', 'registrationToken'
  ];

  // Remove campos sensíveis do objeto attributes
  camposSensiveis.forEach(campo => {
    delete plano[campo];
  });

  // Remove campos sensíveis do objeto user, createdBy e updatedBy, se existirem
  ['user', 'createdBy', 'updatedBy'].forEach(relation => {
    if (plano[relation]) {
      camposSensiveis.forEach(campo => {
        delete plano[relation][campo];
      });
    }
  });

  return plano;
};


async function atribuirPontosVME(idPlano, pontos, order, idPlanoInicial, idEquipe = null) {
  const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "matriz_patrocinador" });

  console.log("ENTREI NO VME");
  //console.log(plano);

  if (!plano) return;

  // Se idPlanoInicial não for fornecido, usa o idPlano atual como inicial
  if (!idPlanoInicial) {
    idPlanoInicial = idPlano;
  }

  // Se idEquipe não for fornecido, usa o idPlanoInicial como equipe
  if (!idEquipe) {
    idEquipe = idPlanoInicial;
  } else {
    // Na primeira chamada recursiva, idEquipe será definido como idPlano atual
    idEquipe = idPlano;
  }

  // Criar ou atualizar registro de pontos VME para este plano
  await criarRegistroPontosVME(plano, pontos, order, idPlanoInicial, idEquipe);

  // Se existir um patrocinador na matriz, continuar subindo
  if (plano?.matriz_patrocinador) {
    console.log("ENTREI NO VME 2")
    await atribuirPontosVME(plano?.matriz_patrocinador?.id, pontos, order, idPlanoInicial, idPlano);
  }
}

async function criarRegistroPontosVME(plano, pontos, order, idPlanoInicial, idEquipe) {
  const dadosPontosVME = {
    quantidadePontos: pontos,
    order: order,
    plan_generator: idPlanoInicial,
    plan_team: idEquipe,
    plan_receiver: plano?.matriz_patrocinador?.id

  };

  // Substitua isso pela lógica de criação ou atualização dos pontos VME no seu Strapi
  await strapi.entityService.create('api::vme-point.vme-point', { data: dadosPontosVME });
}

const updateOrderStatus = async (orderId, isPaid) => {
  return await strapi.entityService.update("api::order.order", orderId, {
    data: {
      paid: isPaid,
      dataPagamento: isPaid ? new Date() : null,
    },
    populate: "*"
  });
};

const handleSubscriptionOrder = async (mode, orderCreated, data, product, userWithBuyer) => {

  if (mode === "saldo") {
    const userBalance = await debitUserBalance(orderCreated, data, product, "Assinatura");
    if (!userBalance?.status) {
      return { status: false, error: "Falha no débito do saldo" };
    }
  }
  const updatedOrder = await updateOrderStatus(orderCreated.id, true);
  // Outras operações necessárias para 'subscription'
  // ...

  console.log("UPDATE NESSE ORDER AQUI:");
  console.log(updatedOrder);

  const planAtivacao = await strapi.entityService.update("api::plan.plan", updatedOrder?.plan_subscription?.id, {
    data: {
      statusAtivacao: true,
      dataAtivacao: new Date(),
    },
  });


  //lembrar de distribuir pontos apenas se a opção estiver true no produto, alterar o 10 pelo valor.
  const pontosGraduacao = await getRateioBonus(orderCreated, 'pontos_graduacao');


  if (pontosGraduacao.status) {
    const VME = await atribuirPontosVME(planAtivacao?.id, pontosGraduacao?.value, orderCreated.id);
  }

  const VMEBonus = await atribuirBonusMatriz(planAtivacao?.id, orderCreated);

  //Qualificar
  console.log("Indo qualificar agora---------------------------------")
  const qualificar = await qualificacaoplan(planAtivacao.id);




  return updatedOrder;
};

// const handleAccessionOrder = async (orderCreated, data, product, planSponsor, userWithBuyer) => {
//     const userBalance = await debitUserBalance(orderCreated, data, product, "Adesão");
//     if (!userBalance?.status) {
//         return { status: false, error: "Falha no débito do saldo" };
//     }


//     const updatedOrder = await updateOrderStatus(orderCreated.id, true);
//     // Outras operações necessárias para 'accession'
//     // ...

//     console.log("FOII");
//     console.log(orderCreated);
//     if (userBalance.status) {
//         const planoData = {
//             user: userWithBuyer, 
//             dataAtivacao: new Date().toISOString(),
//             statusAtivacao: true,
//             patrocinador: planSponsor,
//             //matriz_patrocinador: "ID ou string relevante", // Substitua com o valor adequado
//             Vencimento: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
//             order_accession: orderCreated.id
//         };

//         await strapi.entityService.create("api::plan.plan", {
//             data: planoData
//         });
//     }
//     return updatedOrder;
// };


const handleAccessionOrder = async (mode, orderCreated, data, product, planSponsor, userWithBuyer) => {
  console.log("Entrei na config ADESÃO")

  if (mode === "saldo") {
    const userBalance = await debitUserBalance(orderCreated, data, product, "Adesão");

    if (!userBalance?.status) {
      return { status: false, error: "Falha no débito do saldo" };
    }
  }

  // Função para encontrar vaga na rede
  async function encontrarVagaNaRede(idRaiz) {
    let fila = [idRaiz];

    while (fila.length > 0) {
      let idAtual = fila.shift();
      let planAtual = await strapi.entityService.findOne("api::plan.plan", idAtual, { populate: "*" });

      if (planAtual?.matriz_patrocinados.length < 5) {
        return planAtual;  // Retorna o plan que possui vaga
      }

      let idsPatrocinados = planAtual.matriz_patrocinados.map(patrocinado => patrocinado.id);
      fila.push(...idsPatrocinados);
    }

    throw new Error("A rede está cheia, não há vagas disponíveis.");
  }


  const updatedOrder = await updateOrderStatus(orderCreated.id, true);

  // Encontrar vaga na rede para o novo plan
  try {

    if (updatedOrder?.paid) {
      const vagaDisponivel = await encontrarVagaNaRede(planSponsor);
      const planoData = {
        user: userWithBuyer,
        dataAtivacao: new Date().toISOString(),
        statusAtivacao: true,
        patrocinador: planSponsor,
        matriz_patrocinador: vagaDisponivel?.id,
        Vencimento: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        order_accession: orderCreated.id
      };

      const plan = await strapi.entityService.create("api::plan.plan", {
        data: planoData
      });


      //pagar bônus indicação direta
      console.log("Chamando função de pagamento do BONÛS DE INDICAÇÃO")
      const bonusIndicacao = await paidAcessionBonus(plan.id, orderCreated)


      //lembrar de distribuir pontos apenas se a opção estiver true no produto, alterar o 10 pelo valor.
      const pontosGraduacao = await getRateioBonus(orderCreated, 'pontos_graduacao');


      if (pontosGraduacao.status) {
        const VME = await atribuirPontosVME(plan?.id, pontosGraduacao?.value, orderCreated.id);
      }

      const VMEBonus = await atribuirBonusMatriz(plan?.id, orderCreated);

      console.log("aqui vai os dados do plano criado:");
      console.log(plan);
      const qualificar = await qualificacaoplan(plan?.id);
    }
  } catch (error) {
    console.error(error.message);
    return { status: false, error: error.message };
  }

  return updatedOrder;
};

//Operações quando for vendido na loja geral
const handleOtherOrderTypes = async (mode, orderCreated, data, product, userWithBuyer) => {

  if (mode === "saldo") {
    const userBalance = await debitUserBalance(orderCreated, data, product, "Loja Virtual");
    if (!userBalance?.status) {
      return { status: false, error: "Falha no débito do saldo" };
    }
  }

  const updatedOrder = await updateOrderStatus(orderCreated.id, true);

  const pontosGraduacao = await getRateioBonus(orderCreated, 'pontos_graduacao');

  if (pontosGraduacao.status) {
    const VME = await atribuirPontosVME(orderCreated?.plan?.id, pontosGraduacao?.value, orderCreated.id);
  }

  const VMEBonus = await atribuirBonusMatriz(orderCreated?.plan?.id, orderCreated);




  return updatedOrder;
};

const debitUserBalance = async (orderCreated, data, product, type) => {
  return await balanceService.balance(strapi, {
    user: data.user,
    mode: "D",
    amount: product?.regular_price,
    to: "total",
    description: "Compra do Pedido: " + orderCreated?.id,
    type: type,
    plan: data.plan
  });
};



const paidAcessionBonus = async (idPlano, order) => {

  const planoCreated = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: { patrocinador: true, user: true } });
  console.log("Pagando Bonus de Adesão");
  console.log(planoCreated);

  const bonusAcession = await getRateioBonus(order, 'indicacao_direta');


  if (bonusAcession.status) {

    const planoPatrocinador = await strapi.entityService.findOne("api::plan.plan", planoCreated?.patrocinador?.id, { populate: "user" });
    console.log("patrocinador aqui");
    console.log(planoPatrocinador);


    const creditUserBalance = await balanceService.balance(strapi, {
      user: planoPatrocinador?.user?.id,
      mode: "C",
      amount: parseFloat(bonusAcession.value),
      to: "available",
      description: "Indicação " + planoCreated?.user?.username + "(" + planoCreated?.id + ")",
      type: "Indicação Direta",
      plan: planoPatrocinador.id
    });

  }
  else {
    console.log("Status do bônus de adesão é falso. Não será creditado.");

  }
}



async function atribuirBonusMatriz(idPlano, order, planoInicial, idPlanoInicial, idEquipe = null, nivelAtual = 0) {

  console.log("Entrou nos bonus matriz")
  // Parar a recursividade após 7 níveis
  if (nivelAtual > 7) return;

  const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: { matriz_patrocinador: true, user: true } });
  if (!plano) return;

  if (!idPlanoInicial) {
    idPlanoInicial = idPlano;
    planoInicial = await strapi.entityService.findOne("api::plan.plan", idPlanoInicial, { populate: { matriz_patrocinador: true, user: true } });
  }


  if (nivelAtual === 1) {
    idEquipe = idPlanoInicial;
  }


  const bonusMatriz = await getRateioMatriz(order, String(nivelAtual));

  // Chamada à função balanceService.balance
  if (nivelAtual > 0 && bonusMatriz.status) {
    //console.log("bonusMatriz");
    console.log(bonusMatriz);
    const creditUserBalance = await balanceService.balance(strapi, {
      user: plano?.user.id,
      mode: "C",
      amount: parseFloat(bonusMatriz?.value),
      to: "available",
      description: "Bônus do " + nivelAtual + "º Nível - " + planoInicial?.user?.username + "(" + planoInicial?.id + ")",
      type: "Rede",
      plan: plano?.id
    });
  }
  // Continuar subindo na matriz patrocinadora
  if (plano?.matriz_patrocinador) {
    await atribuirBonusMatriz(plano?.matriz_patrocinador?.id, order, planoInicial, idPlanoInicial, idPlano, nivelAtual + 1);
  }
}

// Assumindo que planoInicial é o plano que gerou os pontos e está disponível no contexto


async function qualificacaoplan(id) {

  // Contar patrocinados qualificados
  let countIndicacaoPatrocinador = 0;
  let countIndicacao = 0;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // Mês atual, de 0 a 11
  const currentYear = currentDate.getFullYear(); // Ano atual


  const planOrder = await strapi.entityService.findOne("api::plan.plan", id, { populate: { patrocinador: true, patrocinados: true } });

  planOrder.patrocinados.forEach(patrocinado => {
    const dataAtivacao = new Date(patrocinado.dataAtivacao);
    if (patrocinado.statusAtivacao && dataAtivacao.getMonth() === currentMonth && dataAtivacao.getFullYear() === currentYear) {
      countIndicacao++;
    }
  });


  if (countIndicacao >= 5 && !planOrder.qualificado) {
    console.log("-------------------- PLANO QUALIFICADO (" + planOrder.id + ") --------------------");
    const qualificado = await strapi.entityService.update("api::plan.plan", planOrder.id, {
      data: {
        qualificado: true,
        dataQualificacao: new Date(),
      },
    });
  }


  if (planOrder.statusAtivacao) {
    const planPatrocinador = await strapi.entityService.findOne("api::plan.plan", planOrder.patrocinador.id, {
      populate: { patrocinador: true, patrocinados: true }
    });


    console.log("PLAN PATROCINADOR AQUI -------------------------------------------")
    console.log(planPatrocinador);
    const dataAtivacaoPatrocinador = new Date(planPatrocinador.dataAtivacao);
    if (planPatrocinador.statusAtivacao && dataAtivacaoPatrocinador.getMonth() === currentMonth && dataAtivacaoPatrocinador.getFullYear() === currentYear) 

      planPatrocinador.patrocinados.forEach(patrocinado => {
        const dataAtivacao = new Date(patrocinado.dataAtivacao);
        if (patrocinado.statusAtivacao && dataAtivacao.getMonth() === currentMonth && dataAtivacao.getFullYear() === currentYear) {
          countIndicacaoPatrocinador++;
        } else {
          console.log("Patrocinador não atingiu a quantidade de ativos do mês");
        }
      });
    // Marcar qualificação como verdadeira se houver pelo menos 5 qualificados
    if (countIndicacaoPatrocinador >= 5 && !planPatrocinador.qualificado) {
      console.log("-------------------- PATROCINADOR QUALIFICADO (" + planPatrocinador.id + ") --------------------");
      const qualificado = await strapi.entityService.update("api::plan.plan", planPatrocinador.id, {
        data: {
          qualificado: true,
          dataQualificacao: new Date(),
        },
      });
    } else {
      console.log("Patrocinador já qualificado ou inativo!");
    }
  } else{
    console.log("Patrocinador não está ativo no mês atual");
  }
}




module.exports = {
  empty,
  pagoDentroMesAtual,
  getRateioBonus,
  getFileById,
  getCurrentDomain,
  getUserMetas,
  removerCamposSensiveis,
  atribuirPontosVME,
  criarRegistroPontosVME,
  handleOtherOrderTypes,
  handleAccessionOrder,
  handleSubscriptionOrder,
  updateOrderStatus,
  debitUserBalance,
  paidAcessionBonus,
  getRateioMatriz,
  atribuirBonusMatriz,
  qualificacaoplan,
}