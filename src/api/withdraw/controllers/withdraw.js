'use strict';

/**
 * withdraw controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { debitUserWithdraw } = require('../../withdraw/controllers/utils');
const axios = require('axios');


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
            sort: { createdAt: 'desc' },
            populate: '*',

        });

        // Calcula o total de registros para a paginação
        const total = await strapi.entityService.count('api::withdraw.withdraw', { filters: filterConditions });


        // Ajusta os resultados para o formato desejado
        const adjustedResults = results.map(item => ({
            id: item.id,
            attributes: {
                ...item,
                user: {
                    data: {
                        id: item.user.id,
                        attributes: { ...item.user }
                    }
                }
            }
        }));

        // Remover as propriedades não desejadas de cada item
        adjustedResults.forEach(item => {
            delete item.attributes.user.id;
            delete item.attributes.id;
        });

        // Formata a resposta
        return {
            data: adjustedResults,
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
    },

    /**
   * Criar Cobrança PIX
   * @method POST
   * @param {*} ctx
   * @return { Promise<any> }
   */
    async createPayment(ctx) {
        const body = ctx.request.body;
        const hasError = [];
        const env = process.env;
        const urlAsaas = process.env.URL_asaas;
        const keyAsaas = process.env.API_key;

        // Gerar mensagem de erro, se houver
        if (typeof body.id !== 'number') hasError.push("campo 'id' deve ser um Inteiro");


        //console.log(userUpdate);
        try {

            const withdraw = await strapi.entityService.findOne("api::withdraw.withdraw", body.id, { populate: "*" });

            let pixAddressKey = withdraw?.chavePix;
            if (['cpf_cnpj', 'celular'].includes(withdraw?.typePix)) {
                // Remove todos os caracteres não-numéricos
                pixAddressKey = pixAddressKey.replace(/\D/g, '');
            }

            // Depois, determinamos se é um CPF ou CNPJ baseado na quantidade de dígitos
            let pixAddressKeyType = "";
            if (withdraw?.typePix === 'cpf_cnpj') {
                // Verifica a quantidade de dígitos para determinar se é CPF ou CNPJ
                pixAddressKeyType = pixAddressKey.length === 11 ? 'CPF' : 'CNPJ';
            }

            if (withdraw?.typePix === 'email') {
                // Verifica a quantidade de dígitos para determinar se é CPF ou CNPJ
                pixAddressKeyType = "EMAIL";
            }

            if (withdraw?.typePix === 'celular') {
                // Verifica a quantidade de dígitos para determinar se é CPF ou CNPJ
                pixAddressKeyType = "PHONE";
            }

            if (withdraw?.typePix === 'aleatoria') {
                // Verifica a quantidade de dígitos para determinar se é CPF ou CNPJ
                pixAddressKeyType = "EVP";
            }

            //console.log("SAQUE AQUI")
            //console.log(withdraw);
            const customerData = {
                value: withdraw?.value,
                operationType: 'PIX',
                pixAddressKey: pixAddressKey,
                pixAddressKeyType: pixAddressKeyType,
                description: 'Saque'
            };
            console.log("chamando paymentResponse");
            const paymentResponse = await axios.post(urlAsaas + '/v3/transfers', customerData, {
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    access_token: keyAsaas,
                },
            });

            const paymentAsaas = paymentResponse.data;

            await strapi.entityService.update("api::withdraw.withdraw", body.id, {
                data: {
                    aprovado: true,
                    responseCreate: paymentAsaas,
                    status: "Criada",
                    dataPagamento: new Date(),
                },
            });

            ctx.send({ message: 'Pagamento realizado e registro atualizado com sucesso.', data: paymentAsaas }, 200);

        } catch {
            // Tratamento de erros, incluindo falhas na API de pagamentos e na atualização do registro
            console.error('Erro ao processar pagamento ou atualizar registro:', error);
            ctx.throw(500, 'Erro ao processar pagamento ou atualizar registro.', { error: error.message });
        }
    }






}));