// @ts
'use strict';

/**
 * bri controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { empty, getFileById, getCurrentDomain, getUserMetas, getRateioBonus, pagoDentroMesAtual, removerCamposSensiveis } = require('../../bri/controllers/utils');
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
        let userMetas = await getUserMetas(item?.user?.id || 0);
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

      // Adiciona o plano atual à matriz
      matriz.push({
          "name": String(plano?.id),
          "imageUrl": "http://localhost:1337/uploads/avatar_gen1131df27cb6136df0b9cfd25d25fcc2f_a03ed69be0.jpg",
          "area": "Adesão - Plano Desconto (Fila Única Global + MI PREV)",
          "profileUrl": "http://localhost:1337/api/users/4",
          "office": "Administrador",
          "tags": "Mi2",
          "positionName": "6",
          "id": String(plano?.id),
          "parentId": plano?.matriz_patrocinador ? String(plano?.matriz_patrocinador?.id) : null,
          "size": "",
          "qualificado": "",
          "contagem_abaixo": ""
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
}




}));
