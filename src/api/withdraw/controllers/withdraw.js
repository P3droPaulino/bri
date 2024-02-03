'use strict';

/**
 * withdraw controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { debitUserWithdraw } = require('../../withdraw/controllers/utils');


module.exports = createCoreController('api::withdraw.withdraw', ({ strapi }) => ({

    /**
       * Obter Saques de um usuário específico (Usuário Logado)
       * @source Query Example <https://docs.strapi.io/dev-docs/backend-customization/controllers#adding-a-new-controller>
       * @method GET
       */
    async me(ctx) {
        const me = ctx.state.user;
        const { filters, pagination } = ctx.query;

        // Configurações de paginação
        const page = pagination && pagination.page ? parseInt(pagination.page) : 1;
        const pageSize = pagination && pagination.pageSize ? parseInt(pagination.pageSize) : 10;

        // Inicializando os filtros com um filtro para o usuário
        const filterConditions = {
            user: {
                id: { $eq: me.id },
            },
        };

        // Processar filtros adicionais
        if (filters) {
            for (const field in filters) {
                filterConditions[field] = filters[field];
            }
        }

        // Calcula o início com base na página e no tamanho da página
        const start = (page - 1) * pageSize;

        // Executa a consulta com paginação e filtros
        const results = await strapi.entityService.findMany('api::withdraw.withdraw', {
            filters: filterConditions,
            start,
            limit: pageSize,
            populate: '*',
        });

        // Calcula o total de registros para a paginação
        const total = await strapi.entityService.count('api::withdraw.withdraw', { filters: filterConditions });

        // Formata a resposta
        return {
            data: results,
            meta: {
                pagination: {
                    page,
                    pageSize,
                    pageCount: Math.ceil(total / pageSize),
                    total,
                },
            },
        };
    },


    /**
       * CRIAR SAQUE
       * @param {*} ctx
       * @property { Object } ctx.data - Objecto DATA
       * @property { Object } data - Objecto de BODY do pedido
       * @return { Promise<any> }
       */
    async create(ctx) {
        const me = ctx.state.user;
        const data = ctx.request.body;

        console.log("Entrou aqui")
        console.log(data);


        try {
            console.log("Antes de tentar o débito")
            const userWithdraw = await debitUserWithdraw(me, data, "Saque");
            console.log("Já tentou o débito")
            if (!userWithdraw?.status) {
                // Retorna um erro 400 (Bad Request) se não conseguir debitar o saque
                console.log("Não tem saldo")
                ctx.response.status = 400; // Define o status da resposta como 400
                ctx.body = { message: 'Falha no débito do saldo' }; // Define a mensagem de erro no corpo da resposta

                return; // Encerra a execução do controlador aqui
            }

            // Se o saque for bem-sucedido, registra no banco de dados usando strapi.entityService
            const entity = await strapi.entityService.create('api::withdraw.withdraw', {
                data: {
                    typePix: data.typePix,
                    chavePix: data.chavePix,
                    user: me.id, // Supondo que 'me' é um objeto de usuário com 'id'
                    value: data.value,
                    dataSolicitacao: new Date(), // Data e hora atual
                }
            });

            // Retorna a entidade criada como resposta com um código 200
            ctx.send(entity, 200);
        } catch (error) {
            // Captura qualquer erro que ocorra e retorna um código de erro apropriado
            // O método ctx.throw automaticamente ajusta a resposta para um erro
            ctx.throw(500, 'Erro ao processar sua solicitação');
        }
    }











}));