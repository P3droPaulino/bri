const balanceService = require('../../bri/services/balance-service');

async function verificarEManipularFilaUnica() {
    const inicioDoMesAtual = new Date();
    inicioDoMesAtual.setDate(1);
    inicioDoMesAtual.setHours(0, 0, 0, 0);

    const fimDoMesAtual = new Date(inicioDoMesAtual.getFullYear(), inicioDoMesAtual.getMonth() + 1, 0, 23, 59, 59, 999);

    // Verifica se existe um item com type "Fila Única" no mês atual
    const itensExistentes = await strapi.entityService.findMany("api::cron.cron", {
        filters: {
            type: "Fila Única",
            date: {
                $gte: inicioDoMesAtual,
                $lte: fimDoMesAtual
            }
        }
    });

    if (itensExistentes && itensExistentes.length > 0) {
        console.log("Já existe um item com type 'Fila Única' no mês atual.");
        return; // Encerra a função se um item já existir
    }

    // Calcula o início e o fim do mês anterior
    const inicioDoMesAnterior = new Date(inicioDoMesAtual.getFullYear(), inicioDoMesAtual.getMonth() - 1, 1);
    const fimDoMesAnterior = new Date(inicioDoMesAtual.getFullYear(), inicioDoMesAtual.getMonth(), 0, 23, 59, 59, 999);

    // Acessa o endpoint report.report para ler o item do mês anterior
    const itemMesAnterior = await strapi.entityService.findMany("api::report.report", {
        filters: {
            type: "Construção Fila",
            date: {
                $gte: inicioDoMesAnterior,
                $lte: fimDoMesAnterior
            }
        },
        sort: { date: 'desc' },
        limit: 1
    });

    if (itemMesAnterior && itemMesAnterior.length > 0) {
        const itemSalvo = itemMesAnterior[0]; // Supondo que queremos o item mais recente do mês anterior

        // Supondo que itemSalvo.dados contém os dados mencionados na sua pergunta
        const dadosFiltrados = itemSalvo.dados.filter(item => item.qualificado === true);

        // Se necessário, prepare os dados filtrados de acordo com a estrutura desejada para salvar no endpoint cron.cron
        const dadosParaSalvar = {
            report: itemSalvo,
            qualificados: dadosFiltrados,
            type: "Fila Única",
            date: new Date()
        };

        // Agora, você salvaria dadosParaSalvar no endpoint cron.cron
        // Você precisará adaptar este código para se adequar à lógica específica e aos métodos do seu projeto Strapi
        if (dadosFiltrados.length > 0) {
            // Se existem itens qualificados, salva no endpoint cron.cron
            const resultadoSalvo = await strapi.entityService.create("api::cron.cron", {
                data: dadosParaSalvar
            });
            console.log("Itens qualificados salvos com sucesso:", resultadoSalvo);

            // Calculando a soma do ganho estimado com arredondamento para 2 casas decimais
            const somaGanhoEstimado = dadosFiltrados.reduce((acc, item) => acc + item.ganhoEstimado, 0);
            const somaGanhoEstimadoArredondado = Math.round(somaGanhoEstimado * 100) / 100;

            const itensProcessados = new Set(); // Para rastrear os IDs dos itens já processados

            for (const dado of dadosFiltrados) {
                console.log("Processando item com ID:", dado.id);

                // Verifica se o item já foi processado
                if (itensProcessados.has(dado.id)) {
                    console.log(`Item com ID ${dado.id} já foi processado.`);
                    continue; // Pula para o próximo item no loop
                }

                // Supondo que você precisa do ID do plano associado a cada item
                const idPlano = dado.id;
                if (!idPlano) {
                    console.error(`Plano ID não encontrado para o item com ID: ${idPlano}`);
                    continue;
                }

                try {
                    console.log("Chamando plano:", idPlano);
                    const plano = await strapi.entityService.findOne("api::plan.plan", idPlano, { populate: "user" });
                    if (!plano || !plano.user) {
                        console.error(`Plano ou usuário não encontrado para o plano ID: ${idPlano}`);
                        continue;
                    }

                    // Processamento do item, incluindo atualização do saldo do usuário
                    const valorArredondado = Math.round(dado.ganhoEstimado * 100) / 100;
                    await balanceService.balance(strapi, {
                        user: plano.user.id,
                        mode: "C",
                        amount: valorArredondado,
                        to: "available",
                        description: `Bônus de Fila Única: ${dado.contagem_abaixo} Cotas`,
                        type: "Qualificação (Fila única)",
                        plan: plano.id
                    });

                    // Marca o item como processado
                    itensProcessados.add(dado.id);
                    console.log(`Item com ID ${dado.id} processado com sucesso.`);
                } catch (error) {
                    console.error(`Erro ao processar o item com ID ${dado.id}:`, error);
                }
            }

            console.log(`Soma do ganho estimado (arredondado): ${somaGanhoEstimadoArredondado}`);
        } else {
            console.log("Nenhum item qualificado para salvar.");
        }
        console.log("Item do mês anterior foi salvo:");
    } else {
        console.log("Não foi encontrado um item do mês anterior.");
    }
}




async function verificarEManipularInativacoes() {
    const inicioDoMesAtual = new Date();
    inicioDoMesAtual.setDate(1);
    inicioDoMesAtual.setHours(0, 0, 0, 0);

    const fimDoMesAtual = new Date(inicioDoMesAtual.getFullYear(), inicioDoMesAtual.getMonth() + 1, 0, 23, 59, 59, 999);

    // Verifica se existe um item com type "Inativação" no mês atual
    const itensExistentes = await strapi.entityService.findMany("api::cron.cron", {
        filters: {
            type: "Inativação",
            date: {
                $gte: inicioDoMesAtual,
                $lte: fimDoMesAtual
            }
        }
    });

    if (itensExistentes && itensExistentes.length > 0) {
        console.log("Já existe um item com type 'Inativação' no mês atual.");
        return; // Encerra a função se um item já existir
    }

    // Atualiza todos os plans para statusAtivacao = false
    await strapi.db.query('api::plan.plan').updateMany({
        data: { statusAtivacao: false },
    });

    // Atualiza todos os usuários para active = false
    await strapi.db.query('plugin::users-permissions.user').updateMany({
        data: { active: false },
    });

    const report = "Atualizações de inativação processadas para todos os plans e usuários.";

    // Salva o novo registro no endpoint cron.cron com o report
    await strapi.entityService.create("api::cron.cron", {
        data: {
            report: report,
            type: "Inativação",
            date: new Date()
        }
    });

    console.log("Inativações processadas e registradas com sucesso.");
}


module.exports = {
    verificarEManipularFilaUnica,
    verificarEManipularInativacoes,
}