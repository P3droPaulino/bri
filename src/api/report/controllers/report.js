'use strict';

/**
 * report controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::report.report', ({ strapi }) => ({
    async obterFila(ctx) {
        try {
            const { mes, qualificado } = ctx.query;

            console.log(mes, qualificado);
            const dataAtual = new Date();
let ano = dataAtual.getFullYear();
let mesIndex = mes ? parseInt(mes, 10) - 1 : dataAtual.getMonth(); // Usa o mês atual se nenhum for fornecido

// Ajusta para o fuso horário GMT-3
const inicioDoMes = new Date(Date.UTC(ano, mesIndex, 1, 3, 0, 0));
const fimDoMes = new Date(Date.UTC(ano, mesIndex + 1, 0, 3, 0, 0));

// Constrói os filtros baseados nos parâmetros da query
let filters = {
    type: "Construção Fila",
    date: {
        $gte: inicioDoMes,
        $lte: fimDoMes
    }
};

const relatorios = await strapi.entityService.findMany("api::report.report", {
    filters,
    sort: { date: 'desc' },
    populate: "*",
});

if (relatorios.length > 0) {
    const primeiroRelatorioId = relatorios[0].id;
    const relatorioup = await strapi.entityService.findOne("api::report.report", primeiroRelatorioId, { populate: "*" });
    const fila = relatorioup.dados || []; // Garante que fila seja um array

    const dadosFiltrados = fila.filter(item => qualificado !== 'true' || item.qualificado === true);

    return dadosFiltrados;
} else {
    console.log("Nenhum relatório encontrado.");
    return null; // Ou qualquer outra coisa que indique ausência de relatórios
}
               
        } catch (error) {
            ctx.throw(500, error);
        }
    },
}));
