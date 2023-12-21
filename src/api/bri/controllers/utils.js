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

}