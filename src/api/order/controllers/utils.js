const { empty } = require('../../bri/controllers/utils');
const balanceService = require('../../bri/services/balance-service');
const { atribuirPontosVME } = require('../../bri/controllers/utils');


// /**
//  * @param { Object } body
//  * @property { Object } product - Objeto de produtos
//  * @property { Objet } data - Objeto de dados BODY recebido da requisição (de onde é chamado a função)
//  * @property { Number } oid - ID do Pedido ( Order ID ), para criar "matriz_patrocinador", apenas para adesões (accession)
//  * @property { Number } planSponsor - Pedido Patrocinador
//  */
// const bodyOrderCreate = async (body) => {
//     const product = body["product"];
//     const data = body["data"];
//     //const oid = product?.type == 'accession' ? body["oid"] : null;
//     const planSponsor = product?.type == 'accession' ? body["planSponsor"] : null;
//     // console.log("CRIAR PEDIDO:", product?.type);
//     const BODY_ORDER = {
//         "total": product?.regular_price,
//         "dataCompra": new Date(),
//         "detalhes_pedidos": data?.detalhes_pedidos,
//         "user": data?.user,
//         "quantidade": data?.quantidade,
//         "order_type": product?.type,
//         "pedido_pai": data?.pedido_pai,
//         "plan_patrocinador": planSponsor, //atribui patrocinador
//         "product": data?.product,
//         "modoPagamento": data?.modoPagamento,
//         "rateios_admin": product?.rateios_admins,
//         "rateios_bonus": product?.rateios_bonus,
//         "rateios_unilevel": product?.rateios_unilevel
//     }

//     if (product?.type == 'subscription') {
//         return {
//             id: 0,
//             message: "Para criar uma assinatura vincule a um produto principal"
//         }
//     }
//     const orderCreated = await strapi.entityService.create("api::order.order", { data: BODY_ORDER });



//     // Debitar ou creditar
//     if (data.modoPagamento == "saldo" && orderCreated?.id) {

//         console.log("entrou aqui, modo saldo");
//         if (orderCreated?.order_type === 'subscription') {
//         const userBalance = await balanceService.balance(strapi, {
//             user: data.user,
//             mode: "D",
//             amount: product?.regular_price,
//             to: "total",
//             description: "Compra do Pedido: " + orderCreated?.id,
//             type: "Assinatura",
//             plan: data.plan
//         });
//          let order_end;
//         if (userBalance?.status) {
//             console.log("ID Usuário Pagante: ", data?.user)
//             const att_aff = await updateaffOrder(data?.user);
//             const planSponsor = await planPatrocinador(data?.user); // ID patrocinador MESTRE

//             //Atualizar pedido se for pago com saldo da conta
//             const ordr = await strapi.entityService.update("api::order.order", orderCreated?.id, {
//                 data: {
//                     paid: userBalance?.status,
//                     dataPagamento: new Date(),
//                 },
//                 populate: "*"
//             });


//             //console.log("bodyOrderCreate::ordr?.pedido_pai", ordr?.pedido_pai?.id);
//             //await pagarBonusPontosMatriz(orderCreated?.id); // Pagar Pontos e Bônus

//         }
//     }  else if (product?.type === 'accession') {
//         const userBalance = await balanceService.balance(strapi, {
//             user: data.user,
//             mode: "D",
//             amount: product?.regular_price,
//             to: "total",
//             description: "Compra do Pedido: " + orderCreated?.id,
//             type: "Adesão",
//             plan: orderCreated?.id
//         });
//          let order_end;
//         if (userBalance?.status) {
//             console.log("ID Usuário Pagante: ", data?.user)
//             const att_aff = await updateaffOrder(data?.user);
//             const planSponsor = await planPatrocinador(data?.user); // ID patrocinador MESTRE

//             //Atualizar pedido se for pago com saldo da conta
//             const ordr = await strapi.entityService.update("api::order.order", orderCreated?.id, {
//                 data: {
//                     paid: userBalance?.status,
//                     dataPagamento: new Date(),
//                 },
//                 populate: "*"
//             });

//     }
// } else {

//     const userBalance = await balanceService.balance(strapi, {
//         user: data.user,
//         mode: "D",
//         amount: product?.regular_price,
//         to: "total",
//         description: "Compra do Pedido: " + orderCreated?.id,
//         type: "Loja Virtual",
//         plan: data.plan
//     });
//      let order_end;
//     if (userBalance?.status) {
//         console.log("ID Usuário Pagante: ", data?.user)
//         const att_aff = await updateaffOrder(data?.user);
//         const planSponsor = await planPatrocinador(data?.user); // ID patrocinador MESTRE

//         //Atualizar pedido se for pago com saldo da conta
//         const ordr = await strapi.entityService.update("api::order.order", orderCreated?.id, {
//             data: {
//                 paid: userBalance?.status,
//                 dataPagamento: new Date(),
//             },
//             populate: "*"
//         });
// }
//          return order_end;
//     }
//     return orderCreated;
// };


/**
 * @param { Object } body
 * @property { Object } product - Objeto de produtos
 * @property { Objet } data - Objeto de dados BODY recebido da requisição (de onde é chamado a função)
 * @property { Number } oid - ID do Pedido ( Order ID ), para criar "matriz_patrocinador", apenas para adesões (accession)
 * @property { Number } planSponsor - Pedido Patrocinador
 */
const bodyOrderCreate = async (body) => {
    const product = body["product"];
    const data = body["data"];
    const planSponsor = body["planSponsor"]

    const BODY_ORDER = {
        "total": product?.regular_price,
        "dataCompra": new Date(),
        "detalhes_pedidos": data?.detalhes_pedidos,
        "user": data?.user,
        "quantidade": data?.quantidade,
        "order_type": product?.type,
        "pedido_pai": data?.pedido_pai,
        "plan_patrocinador": planSponsor, //atribui patrocinador
        "product": data?.product,
        "modoPagamento": data?.modoPagamento,
        "rateios_admin": product?.rateios_admins,
        "rateios_bonus": product?.rateios_bonus,
        "rateios_unilevel": product?.rateios_unilevel
    };

    const orderCreated = await strapi.entityService.create("api::order.order", { data: BODY_ORDER });
    const userWithBuyer = data?.user;

    if (data.modoPagamento === "saldo") {
        if (product?.type === 'subscription') {
            // Se o tipo de pedido for 'subscription' e pagamento com saldo
            return handleSubscriptionOrder(orderCreated, data, product, userWithBuyer);
        } else if (product?.type === 'accession') {
            // Se o tipo de pedido for 'accession' e pagamento com saldo
            return handleAccessionOrder(orderCreated, data, product, planSponsor, userWithBuyer);
        } else {
            // Para outros tipos de pedidos e pagamento com saldo
            return handleOtherOrderTypes(orderCreated, data, product, userWithBuyer);
        }
    }

    // Para pedidos com pagamento diferente de saldo
    return orderCreated;
};


const updateOrderStatus = async (orderId, isPaid) => {
    return await strapi.entityService.update("api::order.order", orderId, {
        data: {
            paid: isPaid,
            dataPagamento: isPaid ? new Date() : null,
        },
        populate: "*"
    });
};

const handleSubscriptionOrder = async (orderCreated, data, product, userWithBuyer) => {
    const userBalance = await debitUserBalance(orderCreated, data, product, "Assinatura");
    if (!userBalance?.status) {
        return { status: false, error: "Falha no débito do saldo" };
    }

    const updatedOrder = await updateOrderStatus(orderCreated.id, true);
    // Outras operações necessárias para 'subscription'
    // ...

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


const handleAccessionOrder = async (orderCreated, data, product, planSponsor, userWithBuyer) => {
    console.log("Entrei na config ADESÃO")
    const userBalance = await debitUserBalance(orderCreated, data, product, "Adesão");


    if (!userBalance?.status) {
        return { status: false, error: "Falha no débito do saldo" };
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

    // Outras operações necessárias para 'accession'
    // ...

    const updatedOrder = await updateOrderStatus(orderCreated.id, true);

    // Encontrar vaga na rede para o novo plan
    try {

        if (userBalance.status) {
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

        const VME = await atribuirPontosVME(plan?.id, 10, orderCreated.id);
    }
    } catch (error) {
        console.error(error.message);
        return { status: false, error: error.message };
    }

    return updatedOrder;
};


const handleOtherOrderTypes = async (orderCreated, data, product, userWithBuyer) => {
    const userBalance = await debitUserBalance(orderCreated, data, product, "Loja Virtual");
    if (!userBalance?.status) {
        return { status: false, error: "Falha no débito do saldo" };
    }

    const updatedOrder = await updateOrderStatus(orderCreated.id, true);
    // Outras operações necessárias para outros tipos de pedidos
    // ...

    return updatedOrder;
};




/**
* Obter todos os dados de um produto
* @param { Number } pid - Product ID
* @return { Promise<any> }
*/
const getProduct = async (pid) => {
    const product = await strapi.entityService.findOne("api::product.product", pid, { populate: "*" });
    return product;
}


/**
 * Obter todos os pedidos existentes
 * @return {Promise<any[]>}
 */
const allOrders = async () => {
    const orders = await strapi.entityService.findMany("api::order.order", {
        filters: { paid: true },
        populate: "*"
    });
    return orders;
}

/**
* Atualizar pedido patrocinador
* @param { Number } userId
* @return { Promise<any> }
*/
const planPatrocinador = async (userId) => {
    const usuario = await userDatas(userId); // Obter todos os dados de um usuário
    const usuarioPedidos = await ordersUser(userId);  // Obter todos os pedidos PAGOS de um usuário
    const todosPedidos = await allOrders(); // Obter todos os pedido PAGOS
    console.log("PERFIL usuário:", usuario);
    // Obter ID do PEDIDO no perfil do usuário
    if (todosPedidos && todosPedidos.length === 0) {
        console.log("Pedido Patrocinador::=> sem pedidos, não necessário nessa instância");
        return null; //Retornar null para o primeiro pedido em todo o sistema
    }
    if (todosPedidos.length > 0) {
        // Obter campo "plan_indicador" do perfil do usuário comprador
        const user_planId = usuario?.plan_indicador?.id;
        console.log("PERFIL usuário pp:", user_planId);
        if (!empty(user_planId)) {
            console.log("Pedido Patrocinador::=> perfil do usuário");
            return user_planId;
        } else if (!empty(usuarioPedidos) && usuarioPedidos.length > 0) {
            console.log("Entrou AQUI --- 0");
            // Salvar pedido no campo "plan_indicador" no perfil do usuário caso tenha um pedido
            await strapi.entityService.update("plugin::users-permissions.user", userId, { data: { plan_indicador: usuarioPedidos[0]?.id } });
            // Obter dados atualizados no perfil do usuário;
            const usuarioUpdated = await userDatas(userId);
            console.log("Pedido Patrocinador::=> perfil do usuário atualizado");
            return usuarioUpdated?.order?.id;
        } else if (empty(usuarioPedidos) && empty(user_planId)) {
            console.log("Entrou AQUI --- 1");
            if (usuario?.usernameParent?.id) {
                console.log("Entrou AQUI --- 2");
                let usuarioPatrocinador;
                usuarioPatrocinador = await userDatas(usuario?.usernameParent?.id);
                const planPatrocinador = usuarioPatrocinador?.plan_indicador?.id; // ID do pedido, mas do patrocinador
                console.log("Plan Patrocinador::=> perfil do usuário patrocinador inicial");
                //console.log(usuario);
                console.log(usuarioPatrocinador);
                console.log(planPatrocinador);
                return planPatrocinador;
            }
            console.log("Pedido Patrocinador::=> perfil do usuário patrocinador, nulo");
            return null;
        }
    }
    return null;
}

/**
 * Obter todos os pedidos de um usuário por ID
 * @param { Number } userId
 * @return { Promise<any[]> }
 */
const ordersUser = async (userId) => {
    if (userId) {
        const order_user = await strapi.entityService.findMany('api::order.order', {
            filters: {
                user: { id: { $eq: userId } },
                paid: true
            },
            populate: "*"
        });
        return order_user;
    }
    return [];
}

/**
* Obter Dados de um usuário
* @param { Number } userId
* @return { Promise<any> }
*/
const userDatas = async (userId) => {
    if (userId) {
        const plan_user = await strapi.entityService.findOne("plugin::users-permissions.user", userId, { populate: "*" });
        return plan_user;
    }
    return {};
}

const updateaffOrder = async (oid) => {
    const roles = await strapi.entityService.findMany("plugin::users-permissions.role", {
        filters: {
            type: {
                $eq: "afiliado",
            }
        }
    });

    // Atualizar ROLE para o usuário
    const updateUserRole = await strapi.entityService.update("plugin::users-permissions.user", oid, {
        data: {
            role: roles[0].id,
        },
    });
    return updateUserRole;
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


module.exports = {
    bodyOrderCreate,
    getProduct,
    allOrders,
    planPatrocinador,
    userDatas,
    ordersUser,
    updateaffOrder,
    debitUserBalance,
    handleAccessionOrder,
    handleSubscriptionOrder,
    handleOtherOrderTypes,
    updateOrderStatus,

}