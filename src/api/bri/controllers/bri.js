// @ts
'use strict';

/**
 * bri controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');
const { empty, getFileById, getCurrentDomain, getUserMetas, getRateioBonus, pagoDentroMesAtual, removerCamposSensiveis, obterDadosFilaUnica, obterDadosModificadosRelatorio } = require('../../bri/controllers/utils');
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
    // const query = ctx.query;
    // const user = ctx.state.user;
    // const { origin, protocol } = ctx.request;
    // console.log("origin", origin);
    // const baseUrl = `${protocol}://${ctx.request.header.host}`; // BASE URL STRAPI
    // const filas = [];
    // const datas = {};
    // const fila_unica_acum = [];
    // query.qualificados // ?qualificados=true
    // // Obter todos os planos
    // const plans = await strapi.entityService.findMany("api::plan.plan", {
    //   populate: "*",
    // });

    // const currentDate = new Date();
    // const currentMonth = currentDate.getMonth();

    // let montanteFila = 0;

    // for (const plan of plans) {
    //   const { dataAtivacao, order_accession, orders_subscription, statusAtivacao } = plan;
    //   if (statusAtivacao && dataAtivacao) {
    //     const paymentDate = await pagoDentroMesAtual(plan);
    //     if (paymentDate == true) {
    //       let rateioBonusFilho = 0;
    //       console.log("pago no mês: ", paymentDate);

    //       console.log("----------------PLAN AQUI-----------------");
    //       //console.log(plan);
    //       //const maiorDataAtivacaoSubscription = await obterMaiorDataAtivacao(plan);
    //       //const object_rateios_bonus_pai = await getRateioBonusFila(plan);

    //       if (orders_subscription && orders_subscription.length > 0) {
    //         // Obter "rateios_bonus" do pedido filho com o maior ID
    //         const pedido_subscription = orders_subscription;
    //         const pedidosubscriptionMaiorId = pedido_subscription.reduce((maxOrder, currentOrder) => {
    //           return currentOrder.id > maxOrder.id ? currentOrder : maxOrder;
    //         }, pedido_subscription[0]);

    //         const object_subscription = getRateioBonus(pedidosubscriptionMaiorId, 'fila_unica');

    //         const valueSubscription = parseFloat(object_subscription?.value);
    //         if (!isNaN(valueSubscription)) {
    //           montanteFila += valueSubscription;
    //         }
    //       } else if (order_accession) {
    //         // Obter "rateios_bonus" do pedido pai usando a função
    //         const object_accession = getRateioBonus(order_accession, 'fila_unica');

    //         const valueAccession = parseFloat(object_accession?.value);
    //         if (!isNaN(valueAccession)) {
    //           montanteFila += valueAccession;
    //         }
    //       }
    //     }
    //   }
    // }


    // //total de cotas
    // let totalCotas = 0;

    // for (let i = 0; i < plans.length; i++) {
    //   if (plans[i].qualificado === true) {
    //     for (let j = i + 1; j < plans.length; j++) {
    //       if (plans[j]?.statusAtivacao === true && new Date(plans[j]?.dataAtivacao).getMonth() === currentMonth) {
    //         totalCotas++;
    //       }

    //     }
    //   }
    // }

    // console.log(totalCotas);
    // console.log(montanteFila);


    // //calcular fator
    // let fator = montanteFila / totalCotas;
    // fator = [Infinity, null, undefined].includes(fator) ? 0 : fator;

    // console.log("FILA UNICA DATAS::", fator, montanteFila, totalCotas);
    // // Continue with the rest of your code after the forEach loop.
    // if (plans && plans.length > 0) {
    //   for (let i = 0; i < plans.length; i++) {
    //     const item = plans[i];
    //     // console.log("Orders", item?.order_type);
    //     let position = i + 1;
    //     let userMetas = await getUserMetas(item?.user?.id || 0);
    //     //console.log("usermetas: ", userMetas);
    //      let avatarUrl = userMetas?.avatar?.[0]?.url || null;
    //      avatarUrl = [undefined, null, ''].includes(avatarUrl) ? "/blank-user.jpg" : avatarUrl;
    //      console.log("Avatar URL:", avatarUrl);

    //     let lastId = plans[i - 1]?.id || "";

    //     let countPaidItems = 0; // Inicializa a contagem de itens pagos abaixo do item atual
    //     // Itera sobre os itens abaixo do item atual
    //     for (let j = i + 1; j < plans.length; j++) {
    //       if (plans[j]?.statusAtivacao && new Date(plans[j]?.dataAtivacao).getMonth() === currentMonth) {
    //         countPaidItems++;
    //       }
    //     }

    //     let ganhoEstimado = 0; // Inicializa o ganho estimado como null

    //     if (item.qualificado) {
    //       ganhoEstimado = fator * countPaidItems; // Calcula o ganho estimado quando o item é qualificado
    //     }



    //     filas.push({
    //         "name": item?.user?.fullName?.split(" ")[0] || "__FULLNAME__",
    //        "imageUrl": baseUrl + avatarUrl,
    //        "area": item?.name || "--",
    //       // "profileUrl": `${baseUrl}/api/users/${item?.user?.id || 0}`,
    //       "office": item?.user?.username,//userMetas?.role?.name || "__USUARIO__",
    //       "tags": "Mi2",
    //       // "isLoggedUser": false,
    //       "positionName": String(position),
    //       "id": String(item?.id),
    //       "parentId": String(lastId),
    //       "size": "",
    //       "qualificado": item?.qualificado,
    //       "contagem_abaixo": countPaidItems,
    //       "montante_fila": montanteFila,
    //       "total_cotas": totalCotas,
    //       "fator": fator,
    //       "ganhoEstimado": ganhoEstimado,
    //     });
    //   }
    // }
    // return filas;


    //const filas = await obterDadosFilaUnica();
    const filas = await obterDadosModificadosRelatorio();
    // Retorna o resultado para o chamador da rota
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
    // @ts-ignore
    return await balanceService.balance(strapi, ctx.request.body);
  },

  /**
 * Monta a visualização em árvore da matriz.
 * @param {*} ctx
 * @method GET
 */
async matrizview(ctx) {
  const { id } = ctx.params; // ID do plano fornecido na requisição
  const { protocol } = ctx.request;
  const baseUrl = `${protocol}://${ctx.request.header.host}`; // BASE URL STRAPI

  // Função para buscar recursivamente os patrocinados e montar a árvore
  async function buscarPatrocinados(idPlano, matriz) {
      const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "*" });
      if (!plano) return;

      // @ts-ignore
      let userMetas = await getUserMetas(plano?.user?.id || 0);
      let avatarUrl = userMetas?.avatar?.[0]?.url || null;
      avatarUrl = [undefined, null, ''].includes(avatarUrl) ? "/blank-use" : avatarUrl;

      // Adiciona o plano atual à matriz
      matriz.push({
          "name": plano?.user?.fullName?.split(" ")[0] || "__FULLNAME__",
          "imageUrl": baseUrl + avatarUrl,
          "area": plano?.name,
          //"profileUrl": "http://localhost:1337/api/users/4",
          //"office": "Administrador",
          "tags": plano?.statusAtivacao,
          //"positionName": "6",
          "id": String(plano?.id),
          "parentId": plano?.matriz_patrocinador ? String(plano?.matriz_patrocinador?.id) : null,
          //"size": "",
          //"qualificado": "",
          //"contagem_abaixo": ""
          // Outros campos conforme necessário
      });

      // Busca recursiva pelos patrocinados
      for (const patrocinado of plano?.matriz_patrocinados) {
          await buscarPatrocinados(patrocinado.id, matriz);
      }
  }

  const matriz = [];
  await buscarPatrocinados(id, matriz);

  return matriz;
},


/**
 * Monta a visualização em árvore da matriz.
 * @param {*} ctx
 * @method GET
 */
async qualificacaocount(ctx) {
  const { id } = ctx.params; // ID do plano fornecido na requisição
  const { protocol } = ctx.request;
  const baseUrl = `${protocol}://${ctx.request.header.host}`; // BASE URL STRAPI

  console.log("entrou aqui crl");
  const plano = await strapi.entityService.findOne("api::plan.plan", id, { populate: "*" });

  // Filtrar patrocinados com statusAtivacao true
  const patrocinadosAtivos = plano.patrocinados.filter(item => item.statusAtivacao);

  // Contar quantidade de patrocinados com statusAtivacao true
  const countPatrocinadosAtivos = patrocinadosAtivos.length;

  // Calcular percentual em relação ao objetivo de 5
  let percentual = (countPatrocinadosAtivos / 5) * 100;

  // Limitar a 100% se ultrapassar
  percentual = percentual > 100 ? 100 : percentual;

  // Criar um novo objeto com apenas os campos desejados
  const planoResumido = {
    id: plano.id,
    dataAtivacao: plano.dataAtivacao,
    statusAtivacao: plano.statusAtivacao,
    qualificado: plano.qualificado,
    vencimento: plano.vencimento,
    createdAt: plano.createdAt,
    updatedAt: plano.updatedAt,
    name: plano.name,
    user: {
      id: plano.user.id,
      username: plano.user.username,
      email: plano.user.email,
      // Outros campos do usuário podem ser adicionados aqui se necessário
    }
    // Outros campos podem ser adicionados aqui se necessário
  };

  console.log(planoResumido);

  // Retornar os dados resumidos do plano, a contagem e o percentual
  return {
    planoResumido,
    countPatrocinadosAtivos,
    percentual
  };
},



async contagemPlanos(ctx) {
  const { id } = ctx.params; // O ID do plano inicial

  async function contarPlanos(idPlano, nivelAtual, resultado, nivelMaximo) {
      if (nivelAtual > nivelMaximo) return resultado;

      // Inicializa o resultado para o nível atual, se ainda não foi inicializado
      if (!resultado[nivelAtual]) {
          resultado[nivelAtual] = { total: 0, ativos: 0 };
      }

      // Somente buscar e contar planos se não estiver no nível 0
      if (nivelAtual > 0) {
          const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "*" });
          if (!plano) return resultado;

          resultado[nivelAtual].total += 1;
          if (plano?.statusAtivacao) {
              resultado[nivelAtual].ativos += 1;
          }
      }

      // Busca os planos do nível seguinte
      if (nivelAtual === 0) {
          const planoRaiz = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "*" });
          for (const patrocinado of planoRaiz?.matriz_patrocinados) {
              await contarPlanos(patrocinado.id, nivelAtual + 1, resultado, nivelMaximo);
          }
      } else {
          const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "*" });
          for (const patrocinado of plano?.matriz_patrocinados) {
              await contarPlanos(patrocinado.id, nivelAtual + 1, resultado, nivelMaximo);
          }
      }

      return resultado;
  }

  // Inicializa o objeto de resultado com todos os níveis como zero
  const resultadoInicial = {};
  for (let i = 0; i <= 7; i++) {
      resultadoInicial[i] = { total: 0, ativos: 0 };
  }

  const resultadoFinal = await contarPlanos(id, 0, resultadoInicial, 7); // 7 é o número máximo de níveis
  return resultadoFinal;
},

// async detalhesPlanosGET(ctx) {
//   const { id, nivel, status } = ctx.params; // ID do plano e parâmetros opcionais

//   async function buscarDetalhesPlanos(idPlano, nivelAtual, nivelFiltrado, detalhes, statusFiltro) {
//       if (nivelAtual > nivelFiltrado) return;

//       const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "*" });
//       if (!plano) return;

//       // Adiciona detalhes do plano se estiver no nível filtrado
//       if (nivelAtual === nivelFiltrado) {
//           if (!detalhes[nivelAtual]) detalhes[nivelAtual] = [];

//           // Filtra pelo status, se necessário
//           if (statusFiltro === 'ativos' && !plano.data.attributes.statusAtivacao) return;
//           if (statusFiltro === 'inativos' && plano.data.attributes.statusAtivacao) return;

//           detalhes[nivelAtual].push(plano);
//       }

//       // Recursão para os planos patrocinados
//       for (const patrocinado of plano.data.attributes.matriz_patrocinados.data) {
//           await buscarDetalhesPlanos(patrocinado.id, nivelAtual + 1, nivelFiltrado, detalhes, statusFiltro);
//       }
//   }

//   const nivelFiltrado = nivel ? parseInt(nivel) : 7; // Usa o nível especificado ou 7 por padrão
//   const detalhes = {};
//   await buscarDetalhesPlanos(id, 0, nivelFiltrado, detalhes, status); // Começa a busca a partir do nível 0

//   return detalhes[nivelFiltrado] || []; // Retorna apenas os detalhes do nível filtrado
// },


async detalhesPlanos(ctx) {
  const { id, nivel, status } = ctx.params; // ID do plano e parâmetros opcionais

  async function buscarDetalhesPlanos(idPlano, nivelAtual, nivelFiltrado, detalhes, statusFiltro) {
      if (nivelAtual > nivelFiltrado) return;

      const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "*" });
      if (!plano) return;

      // Adiciona detalhes do plano se estiver no nível filtrado
      if (nivelAtual === nivelFiltrado) {
          if (!detalhes[nivelAtual]) detalhes[nivelAtual] = [];

          // Filtra pelo status, se necessário
          if (statusFiltro === 'ativos' && !plano?.statusAtivacao) return;
          if (statusFiltro === 'inativos' && plano?.statusAtivacao) return;

          const planoFiltrado = removerCamposSensiveis(plano);
          detalhes[nivelAtual].push(planoFiltrado);
      }

      // Recursão para os planos patrocinados
      for (const patrocinado of plano?.matriz_patrocinados) {
          await buscarDetalhesPlanos(patrocinado.id, nivelAtual + 1, nivelFiltrado, detalhes, statusFiltro);
      }
  }

  const nivelFiltrado = nivel ? parseInt(nivel) : 7; // Usa o nível especificado ou 7 por padrão
  const detalhes = {};
  await buscarDetalhesPlanos(id, 0, nivelFiltrado, detalhes, status); // Começa a busca a partir do nível 0

  return detalhes[nivelFiltrado] || []; // Retorna apenas os detalhes do nível filtrado
},


async meusDiretos(ctx) {
  const user = ctx.state.user;
  const baseUrl = `${ctx.request.protocol}://${ctx.request.header.host}`; // Base URL para avatar

  const plans = await strapi.entityService.findMany('api::plan.plan', {
      filters: { user: { id: { $eq: user.id } } },
      populate: { patrocinados: { populate: { user: true, matriz_patrocinador: true } } }
  });

  const usersPatrocinados = new Map();

  for (const plan of plans) {
      for (const patrocinado of plan.patrocinados) {
          const userId = patrocinado.user.id;
          // @ts-ignore
          let userMeta = await getUserMetas(userId);
          userMeta.avatarUrl = userMeta.avatar && userMeta.avatar.length > 0 ? baseUrl + userMeta.avatar[0].url : null;
          
          // Aplicar a função para remover campos sensíveis
          const userInfo = removerCamposSensiveis({ ...patrocinado.user, avatarUrl: userMeta.avatarUrl });
          const planoInfo = removerCamposSensiveis(patrocinado);
          const planoPatrocinadorInfo = removerCamposSensiveis(plan);

          if (!usersPatrocinados.has(userId)) {
              usersPatrocinados.set(userId, { 
                  userInfo: userInfo, 
                  plans: [] 
              });
          }
          usersPatrocinados.get(userId).plans.push({
              planoInfo: planoInfo,
              planoPatrocinador: planoPatrocinadorInfo
          });
      }
  }

  // Converter o Map em uma estrutura adequada para a resposta
  const response = Array.from(usersPatrocinados.values()).map(userPatrocinado => ({
      id: userPatrocinado.userInfo.id,
      user: userPatrocinado.userInfo,
      patrocinados: userPatrocinado.plans.map(p => ({
          plano: p.planoInfo,
          patrocinador: p.planoPatrocinador
      }))
  }));

  return response; // Retorna diretamente a resposta como JSON
},


/**
   * Criar Cobrança PIX
   * @method POST
   * @param {*} ctx
   * @return { Promise<any> }
   */
async createPIX(ctx) {
  const body = ctx.request.body;
  const hasError = [];
  const env = process.env;
  const urlAsaas = process.env.URL_asaas;
  const keyAsaas = process.env.API_key;
  let clienteAsaas;
  // Gerar mensagem de erro, se houver
  if (typeof body.id !== 'number') hasError.push("campo 'id' deve ser um Inteiro");



  const orderUpdate = await strapi.entityService.findOne("api::order.order", body.id, { populate: "*" });
  const userUpdate = await strapi.entityService.findOne("plugin::users-permissions.user", orderUpdate?.user?.id, { populate: "*" });

  //console.log(userUpdate);
  try {
    // @ts-ignore
    if (!userUpdate?.clienteCode_asaas || userUpdate?.clienteCode_asaas === null || userUpdate?.clienteCode_asaas === 0) {
      console.log("Não existe conta asaas, criando...");

      // Primeira requisição para criar o cliente no Asaas
      const customerData = {
        name: userUpdate?.fullName,
        email: userUpdate?.email,
        phone: userUpdate?.phoneNumber.slice(3),
        mobilePhone: userUpdate?.phoneNumber_2.slice(3),
        cpfCnpj: userUpdate?.documentNumber,
        postalCode: userUpdate?.postalCode,
        address: userUpdate?.street,
        addressNumber: userUpdate?.number,
        complement: userUpdate?.addressComplement,
        province: userUpdate?.neighborhood,
        notificationDisabled: true,
      };

      const customerResponse = await axios.post(urlAsaas + '/v3/customers', customerData, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: keyAsaas,
        },
      });

      const clienteAsaas = customerResponse.data;
      console.log(clienteAsaas);

      console.log("atualizar usuário: ", orderUpdate?.user?.id, "com ID: ", clienteAsaas?.id);

      const clienteAsaasof = await strapi.entityService.update("plugin::users-permissions.user", orderUpdate?.user?.id, {
        data: {
          clienteCode_asaas: clienteAsaas?.id
        },
      });

      console.log("Dados do Pedido: ", orderUpdate);

      const daysToAdd = 2; // Exemplo: adicionar 7 dias
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      // Agora você pode formatar a data para o formato desejado (por exemplo, 'YYYY-MM-DD')
      const formattedDueDate = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}-${dueDate.getDate().toString().padStart(2, '0')}`;


      const paymentData = {
        billingType: 'PIX',
        customer: clienteAsaas?.id,
        dueDate: formattedDueDate,
        value: orderUpdate?.total,
        description: orderUpdate?.product?.name,
        postalService: false,
      };

      const paymentResponse = await axios.post(urlAsaas + '/v3/payments', paymentData, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: keyAsaas,
        },
      });

      console.log(paymentResponse.data);

      const responseAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
        data: {
          gateway_cobranca: paymentResponse.data
        },
      });

      console.log("DADOS QR: ", urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode')
      const paymentQR = await axios.get(urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode', {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: keyAsaas,
        },
      });


      const responseQRAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
        data: {
          pix_base64: paymentQR.data
        },
      });

      console.log(paymentQR.data);

      return paymentQR.data;


    // @ts-ignore
    } else if (userUpdate?.clienteCode_asaas && (!orderUpdate?.gateway_cobranca || orderUpdate?.gateway_cobranca === null || orderUpdate?.gateway_cobranca === 0)) {

      const daysToAdd = 2; // Exemplo: adicionar 7 dias
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToAdd);

      // Agora você pode formatar a data para o formato desejado (por exemplo, 'YYYY-MM-DD')
      const formattedDueDate = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}-${dueDate.getDate().toString().padStart(2, '0')}`;


      const paymentData = {
        billingType: 'PIX',
        customer: userUpdate?.clienteCode_asaas,
        dueDate: formattedDueDate,
        value: orderUpdate?.total,
        description: orderUpdate?.product?.name,
        postalService: false,
      };

      const paymentResponse = await axios.post(urlAsaas + '/v3/payments', paymentData, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: keyAsaas,
        },
      });

      console.log(paymentResponse.data);

      const responseAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
        data: {
          gateway_cobranca: paymentResponse.data
        },
      });

      console.log("DADOS QR: ", urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode')
      const paymentQR = await axios.get(urlAsaas + '/v3/payments/' + paymentResponse.data.id + '/pixQrCode', {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: keyAsaas,
        },
      });


      const responseQRAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
        data: {
          pix_base64: paymentQR.data
        },
      });

      console.log(paymentQR.data);

      return paymentQR.data;

    }else if (userUpdate?.clienteCode_asaas && orderUpdate?.gateway_cobranca){

      // @ts-ignore
      const paymentQR = await axios.get(urlAsaas + '/v3/payments/' + orderUpdate?.gateway_cobranca?.id + '/pixQrCode', {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          access_token: keyAsaas,
        },
      });


      const responseQRAsaas = await strapi.entityService.update('api::order.order', orderUpdate?.id, {
        data: {
          pix_base64: paymentQR.data
        },
      });

      console.log(paymentQR.data);

      return paymentQR.data;


    }
  } catch (error) {
    console.error(error);
  }
},



/**
   * Criar Cobrança PIX
   * @method POST
   * @param {*} ctx
   * @return { Promise<any> }
   */
async rateiobonus(ctx) {
  const body = ctx.request.body;
  const hasError = [];
  const env = process.env;
  const urlAsaas = process.env.URL_asaas;
  const keyAsaas = process.env.API_key;
  let clienteAsaas;
  // Gerar mensagem de erro, se houver
  if (typeof body.id !== 'number') hasError.push("campo 'id' deve ser um Inteiro");



  const order = await strapi.entityService.findOne("api::order.order", body.id, { populate: "*" });

  const object_rateio = getRateioBonus(order, body.type);

  return object_rateio


},

// /**
//    * Atualizar Mensalidade
//    * @method POST
//    * @param {*} ctx
//    * @return { Promise<any> }
//    */
// async bodyOrderUpdate(ctx) {
//   const body = ctx.request.body;
//   const hasError = [];
//   // Gerar mensagem de erro, se houver
//   if (typeof body.id !== 'number') hasError.push("campo 'user' deve ser um Inteiro");

//   console.log("Pedido AQUI: ", body)

//   const orderUpdate = await strapi.entityService.findOne("api::order.order", body.id, { populate: "*" });

//   console.log("Fazer update do pedido: ", orderUpdate);

//   if (orderUpdate?.order_type == 'subscription' && empty(orderUpdate?.pedido_pai)) {
//     return {
//       id: 0,
//       message: "Para criar uma assinatura vincule a um produto principal"
//     }
//   }

//   // Debitar ou creditar
//   if (orderUpdate?.id) {

//     console.log("entrou aqui, modo saldo");

//     const userBalance = await balance({
//       user: orderUpdate?.user.id,
//       mode: "D",
//       amount: orderUpdate?.total,
//       to: "available",
//       orderID: orderUpdate?.id
//     });

//     console.log("Balance: ", userBalance);
//     // let order_end;
//     if (userBalance?.status) {
//       console.log("ID Usuário Pagante: ", orderUpdate?.user)
//       //Atualizar pedido se for pago com saldo da conta
//       const ordr = await strapi.entityService.update("api::order.order", orderUpdate?.id, {
//         data: {
//           paid: userBalance?.status,
//           //dataAtivacao: new Date(), // Usado para filtrar na "qualificação", sei lá!
//           dataPagamento: new Date(),
//           //statusAtivacao: userBalance?.status,
//         },
//         populate: "*"
//       });

//       console.log("orderUpdate::ordr?.pedido_pai", ordr?.pedido_pai?.id);

//       if ((!empty(ordr?.order_type) && ordr?.order_type === "subscription") && !empty(ordr?.pedido_pai)) {
//         try {
//           // Atualizar pedido pai se foi pago ou não
//           const ordrPai = await strapi.entityService.update("api::order.order", ordr?.pedido_pai?.id, {
//             data: {
//               paid: userBalance?.status,
//               dataAtivacao: new Date(), // Usado para filtrar na "qualificação"
//               dataPagamento: new Date(),
//               statusAtivacao: userBalance?.status,
//               modoPagamento: "saldo",
//             },
//             populate: "*"
//           });
//           order_end = ordrPai;
//         } catch (e) {
//           console.error("orderUpdate::ERROR", e.message);
//         }
//       }
//       //await pagarBonusPontosMatriz(orderUpdate?.id); // Pagar Pontos e Bônus

//     }
//     // return order_end;
//   }
//   return orderUpdate;
// },



/**
 * Monta o relatório de pontos por equipe.
 * @param {*} ctx
 * @method GET
 */
async pontosMatriz(ctx) {
  const { id } = ctx.params;

  const pontos = await strapi.entityService.findMany('api::vme-point.vme-point', {
    filters: { plan_receiver: { id: { $eq: id } } },
    populate: { plan_receiver: { populate: { user: true } }, plan_generator: { populate: { user: true } }, plan_team: { populate: { user: true } } }
  });

  const plano = await strapi.entityService.findOne('api::plan.plan', id, {
    populate: {
      user: true, 
      graduation: {
        populate: { icon: true }
      }
    }
  });
  


  let relatorioPorEquipe = {};
  let somaTotalPontos = 0; // Variável para armazenar a soma total de pontos

  const planoFiltrado = removerCamposSensiveis(plano);

  pontos.forEach(ponto => {
    ponto.plan_receiver = removerCamposSensiveis(ponto.plan_receiver);
    ponto.plan_generator = removerCamposSensiveis(ponto.plan_generator);
    ponto.plan_team = removerCamposSensiveis(ponto.plan_team);

    const equipeId = ponto.plan_team.id;
    const pontosEquipe = ponto.quantidadePontos;

    somaTotalPontos += pontosEquipe; // Adiciona os pontos à soma total

    if (!relatorioPorEquipe[equipeId]) {
      relatorioPorEquipe[equipeId] = {
        detalhesEquipe: ponto.plan_team,
        totalPontos: 0
      };
    }

    relatorioPorEquipe[equipeId].totalPontos += pontosEquipe;
  });

  const relatorioFinal = {
    plano: planoFiltrado,
    pontos: pontos,
    meta: Object.values(relatorioPorEquipe),
    totalPontosTodosTimes: somaTotalPontos // Adiciona a soma total ao relatório
  };

  console.log("Relatório de pontos com total geral:", relatorioFinal);

  return relatorioFinal;
},


/**
 * Recupera pedidos com base no intervalo de datas de pagamento e com o status 'paid' como true.
 * @param {*} ctx
 * @method GET
 */
async rateio(ctx) {
  const { dataInicial, dataFinal } = ctx.query;

  let filters = { paid: true }; // Filtrar por pedidos pagos

  if (dataInicial) {
    filters.dataPagamento = { $gte: new Date(dataInicial) };

    if (dataFinal) {
      filters.dataPagamento.$lte = new Date(dataFinal);
    } else {
      filters.dataPagamento.$lte = new Date(); // Até a data de hoje
    }
  }

  const pedidos = await strapi.entityService.findMany('api::order.order', {
    filters: filters,
    populate:{
      // @ts-ignore
      rateios_admin: true,
      rateios_bonus: true,
      rateios_unilevel: true
    } // Popula todas as relações associadas
  });

  let faturamento = 0;
  let bonus = {};
  let matriz = {};
  let administracao = {};

  pedidos.forEach(pedido => {
    // 1 - Somar o total de todos os pedidos
    faturamento += pedido.total;

    // 2 - Processar rateios_bonus
    if (Array.isArray(pedido.rateios_bonus)) {
      pedido.rateios_bonus.forEach(item => {
        if (item.status && item.name !== "Pontos Graduação") {
          const valor = parseFloat(item.value) || 0;
          bonus[item.name] = (bonus[item.name] || 0) + valor;
        }
      });
    }

    // 3 - Processar rateios_unilevel
    if (Array.isArray(pedido.rateios_unilevel)) {
      pedido.rateios_unilevel.forEach(item => {
        if (item.status) {
          const valor = parseFloat(item.value) || 0;
          matriz[item.name] = (matriz[item.name] || 0) + valor;
        }
      });
    }

    // 4 - Processar rateios_admin
    if (Array.isArray(pedido.rateios_admin)) {
      pedido.rateios_admin.forEach(item => {
        if (item.status) {
          const valor = parseFloat(item.value) || 0;
          administracao[item.name] = (administracao[item.name] || 0) + valor;
        }
      });
    }
  });

  // Ordenar e formatar os valores
  const ordenarEFormatar = (objeto) => {
    const chavesOrdenadas = Object.keys(objeto).sort();
    const objetoOrdenado = {};
    chavesOrdenadas.forEach(chave => {
      if (objeto[chave] > 0) {
        objetoOrdenado[chave] = `${objeto[chave].toFixed(2).replace('.', ',')}`;
      }
    });
    return objetoOrdenado;
  };

  const bonusOrdenado = ordenarEFormatar(bonus);
  const matrizOrdenada = ordenarEFormatar(matriz);
  const administracaoOrdenada = ordenarEFormatar(administracao);
  const faturamentoFormatado = `${faturamento.toFixed(2).replace('.', ',')}`;

  return {
    Bônus: bonusOrdenado,
    Matriz: matrizOrdenada,
    Administração: administracaoOrdenada,
    Faturamento: faturamentoFormatado
  };
},

/**
 * Retorna os dados filtrados por id.
 * @param {*} ctx
 * @method GET
 */
async filaFiltradaPorId(ctx) {
  const { id } = ctx.params; // Pega o id passado na URL

  // Supondo que esta função retorne o array de dados que você mostrou
  const dados = await obterDadosModificadosRelatorio();

  // Filtra para retornar apenas os dados que correspondem ao id
  const dadosFiltrados = dados.filter(dado => dado.id === id);

  if (dadosFiltrados.length === 0) {
    // Se não encontrar dados para o id fornecido, retorna um erro ou mensagem apropriada
    ctx.throw(404, 'Nenhum dado encontrado para o ID fornecido.');
  }

  return dadosFiltrados[0]; // Retorna o primeiro elemento do array filtrado
},

/**
   * Filtrar user por nome de usuário
   * @source <https://docs.strapi.io/dev-docs/api/entity-service/crud#example-1>
   * @method GET
  */
async getUserBy(ctx) {
  const { username } = ctx.request.query;
  const usernameCleaned = username ? username.replaceAll("/", "") : "";
  const options = {
    fields: ['id', 'username', 'email', 'fullName', 'active'],
    filters: {
      username: {
        $eqi: usernameCleaned,
      },
    },
    // populate: { category: true },
  };
  // console.log("PARAMS", query, options);
  const entry = await strapi.entityService.findMany('plugin::users-permissions.user', options);
  const isNot = [{
    "id": 0,
    "username": "Inexistente",
    "fullName": "Inexistente",
    "active": false,
  }];
  console.log("entry User", usernameCleaned, entry);
  return entry.length > 0 ? entry[0] : isNot[0];
},
/**
 * Filtrar user por nome de usuário
 * @source <https://docs.strapi.io/dev-docs/api/entity-service/crud#example-1>
 * @method GET
*/
async getUserByEmail(ctx) {
  const { email } = ctx.request.query;
  const emailCleaned = email ? email.replaceAll("/", "") : "";

  const options = {
    fields: ['id', 'username', 'email', 'fullName', 'active'],
    filters: {
      email: {
        $eqi: emailCleaned,
      },
    },
    // populate: { category: true },
  };
  // console.log("PARAMS", query, options);
  const entry = await strapi.entityService.findMany('plugin::users-permissions.user', options);
  const isNot = [{
    "id": 0,
    "username": "Inexistente",
    "fullName": "Inexistente",
    "active": false,
  }];
  console.log("entry Email", emailCleaned, entry);
  return entry.length > 0 ? entry[0] : isNot[0];
},

}));
