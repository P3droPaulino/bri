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


module.exports = {
  empty,
  pagoDentroMesAtual,
  getRateioBonus,
  getFileById,
  getCurrentDomain,
  getUserMetas,
}