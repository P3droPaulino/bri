const crypto = require('crypto');
const balanceService = require('../../bri/services/balance-service');

function generateCodeFromHash(userId, planId, orderId) {
    const hash = crypto.createHash('sha256').update(`${userId}${planId}${orderId}${Date.now()}`).digest('hex');
    return `TOP-${hash.substr(-6)}`; // Pega os últimos 6 dígitos do hash
}

async function createQuotas(strapi, userId, planId, orderId, quantity) {
    for (let i = 0; i < quantity; i++) {
        const uniqueCode = generateCodeFromHash(userId, planId, orderId);

        const now = new Date();

        try {
            await strapi.entityService.create('api::daily-spin-quota.daily-spin-quota', {
                data: {
                    user: userId,
                    plan: planId,
                    order: orderId,
                    date: now,
                    level: 1,
                    cod: uniqueCode
                }
            });
            console.log(`Cota criada com sucesso: ${uniqueCode}`);
        } catch (error) {
            console.error('Erro ao criar a cota:', error);
            // Tratar o erro
        }

        // Aguarda um curto período antes de criar a próxima cota para garantir um timestamp diferente
        await new Promise(resolve => setTimeout(resolve, 1));
    }

    await updateWaitL1(quantity);
}


async function getDailySpinSetting() {
    // Busca o registro do singleType 'daily-spin-setting', populando todos os campos relacionados

    console.log("Buscando settings no strapi");
    const setting = await strapi.db.query('api::daily-spin-setting.daily-spin-setting').findOne({
        populate: true, // Isso garante que todos os campos relacionados sejam populados
    });
    console.log("settings da função");
    console.log(setting);
    return setting;
}




async function updateWaitL1(totalCotasCriadas) {
    // Primeiro, obtém as configurações atuais usando a função getDailySpinSetting
    const setting = await getDailySpinSetting();

    if (setting && setting.Wait) {
        // Calcula o novo valor para Wait.L1
        const updatedWaitL1 = setting.Wait.L1 + totalCotasCriadas;

        // Atualiza o registro usando strapi.entityService.update
        await strapi.entityService.update('api::daily-spin-setting.daily-spin-setting', setting.id, {
            data: {
                Wait: {
                    ...setting.Wait, // Preserva outros campos de Wait inalterados
                    L1: updatedWaitL1, // Atualiza apenas L1
                }
            }
        });
    }
}


// @ts-ignore
async function verificarGiroDiario() {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0); // Define o início do dia atual

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999); // Define o fim do dia atual

    // Verifica se existe um item com type "Giro Diário" no dia atual
    const itensExistentes = await strapi.entityService.findMany("api::cron.cron", {
        filters: {
            // @ts-ignore
            type: "Giro Diário",
            date: {
                $gte: inicioDoDia,
                $lte: fimDoDia
            }
        }
    });

    if (itensExistentes && itensExistentes.length > 0) {
        console.log("Já existe um item com type 'Giro Diário' no dia atual.");
    } else {
        console.log("Não existe um item com type 'Giro Diário' no dia atual.");
    }
}

  
async function updateCurrentLevel(currentLevel, totalCotasCriadas, mod) {
    const setting = await getDailySpinSetting(); // Assume que getDailySpinSetting já está definida

    

    if (setting && setting.Wait) {
        const currentLevelKey = `L${currentLevel}`;
        if (setting.Wait.hasOwnProperty(currentLevelKey)) {

            let updatedCurrentLevel = setting.Wait[currentLevelKey];
            
           

            if (mod === 'C') { // Para "Crédito"
                updatedCurrentLevel += totalCotasCriadas;
            } else if (mod === 'D') { // Para "Débito"
                updatedCurrentLevel = totalCotasCriadas;
                // Garante que updatedCurrentLevel não fique negativo
                updatedCurrentLevel = Math.max(0, updatedCurrentLevel);
            }


            await strapi.entityService.update('api::daily-spin-setting.daily-spin-setting', setting.id, {
                data: {
                    Wait: {
                        ...setting.Wait,
                        [currentLevelKey]: updatedCurrentLevel,
                    }
                }
            });
            console.log(`O nível ${currentLevelKey} foi atualizado com sucesso.`);
            return true; // Retorna true para indicar sucesso
        } else {
            console.log(`O nível ${currentLevelKey} não existe.`);
            return false; // Retorna false caso o nível não exista
        }
    } else {
        console.log("Configurações não encontradas ou inválidas.");
        return false; // Retorna false se as configurações não forem válidas ou não existirem
    }
}

async function checkNextLevelExists(currentLevel) {
    const setting = await getDailySpinSetting(); // Assume que getDailySpinSetting já está definida

    if (setting && setting.Wait) {
        const nextLevelKey = `L${currentLevel + 1}`;
        if (setting.Wait.hasOwnProperty(nextLevelKey)) {
            console.log(`O próximo nível, ${nextLevelKey}, existe.`);
            // Aqui você pode chamar outra função futuramente, se necessário
            return true; // Retorna true para indicar que o próximo nível existe
        } else {
            console.log(`O próximo nível, ${nextLevelKey}, não existe.`);
            return false; // Retorna false caso o próximo nível não exista
        }
    } else {
        console.log("Configurações não encontradas ou inválidas.");
        return false; // Retorna false se as configurações não forem válidas ou não existirem
    }
}

async function realizarSorteio(nivel) {
    console.log("chamando setting")
    const setting = await getDailySpinSetting(); // Obtem as configurações
    console.log(setting)
    if (setting && setting.Wait && setting.Factor) {
        console.log("setting && setting.Wait && setting.Factor")
        const levelKey = `L${nivel}`;
        const waitValue = setting.Wait[levelKey];
        const factorValue = setting.Factor[levelKey];

        if (waitValue !== undefined && factorValue !== undefined) {
            // Calcula a quantidade máxima de sorteios onde o resto da divisão por factorValue é 0
            const sorteios = Math.floor(waitValue / factorValue);
            // Calcula a quantidade excedente
            const excedente = waitValue % factorValue;

            console.log(`Para o nível ${nivel}, serão realizados ${sorteios} sorteio(s) com ${excedente} excedente(s).`);

            // Aqui, você pode salvar a quantidade de sorteios e o excedente conforme necessário
            // Exemplo: await salvarResultados(strapi, nivel, sorteios, excedente);
            if (sorteios > 0) {
            // @ts-ignore
            const sorteiosRealizados = await realizarSorteioPromocao(nivel, sorteios, excedente)
            } else if (sorteios == 0){
                const inicioDoDia = new Date();
            inicioDoDia.setHours(0, 0, 0, 0); // Início do dia
        
            const fimDoDia = new Date();
            fimDoDia.setHours(23, 59, 59, 999); // Fim do dia
        
            // Coleta todos os dados de daily-spin-result que estão dentro do dia atual
            const report = await strapi.entityService.findMany('api::daily-spin-result.daily-spin-result', {
                filters: {
                    date: {
                        $gte: inicioDoDia,
                        $lte: fimDoDia
                    }
                },
                populate: "*" 
            });
        
            // Verifica se report contém dados
            if (report && report.length > 0) {
                // Prepara os dados para salvar em api::report.report
                const dadosParaSalvar = {
                    type: "Giro Diário",
                    date: new Date(), // Data atual
                    dados: report // Converte o report para string para armazenamento, se necessário
                };
        
                // Salva os dados coletados em api::report.report
                // @ts-ignore
                await strapi.entityService.create('api::report.report', { data: dadosParaSalvar });
        
                console.log("Dados de Giro Diário salvos com sucesso.");
            } else {
                console.log("Não foram encontrados resultados de Giro Diário para o dia atual.");
            }
            }
        } else {
            console.log(`O nível ${nivel} não tem valores de Wait ou Factor definidos.`);
            return null;
        }
    } else {
        console.log("Configurações não encontradas ou inválidas.");
        return null;
    }
}

async function realizarSorteioPromocao(nivelSorteio, quantidadeSorteios, excedente) {
    try {
        // Passo 1: Obter todos os itens do nível especificado

        console.log("realizando sorteio");
        const itensNivel = await strapi.entityService.findMany('api::daily-spin-quota.daily-spin-quota', {
            filters: { level: nivelSorteio },
            populate: "*", // Ajuste conforme a necessidade de populamento
        });

        // Passo 2: Selecionar aleatoriamente a quantidade especificada de itens
        const itensSelecionados = [];
        for (let i = 0; i < quantidadeSorteios; i++) {
            if (itensNivel.length === 0) break; // Evita erro se houver menos itens do que a quantidade de sorteios
            const indexAleatorio = Math.floor(Math.random() * itensNivel.length);
            itensSelecionados.push(itensNivel.splice(indexAleatorio, 1)[0]); // Remove o item selecionado de itensNivel
        }

        // Passo 3: Promover os itens selecionados para o próximo nível
        for (const item of itensSelecionados) {

            await strapi.entityService.create('api::daily-spin-result.daily-spin-result',{
                data: { 
                    date: new Date(),
                    level:nivelSorteio,
                    daily_spin_quota: item.id
                 },
            });

            await strapi.entityService.update('api::daily-spin-quota.daily-spin-quota', item.id, {
                data: { level: item.level + 1 },
            });


            await processarBonusPorNivel(item.id, nivelSorteio)

        }

        const sorteados = itensSelecionados.length;
        const proxNivel = nivelSorteio + 1
        // @ts-ignore
        const updateLevelAtual = await updateCurrentLevel(nivelSorteio, excedente, 'D');


        const checkLevel = await checkNextLevelExists(nivelSorteio)

        if (checkLevel) {
            // @ts-ignore
            const updateLevelProx = await updateCurrentLevel(proxNivel, sorteados, 'C');
            
            // Define um tempo de espera em milissegundos (por exemplo, 5000 milissegundos = 5 segundos)
            const tempoDeEspera = 5000; 
        
            setTimeout(async () => {
                // Após a espera, chama a função realizarSorteio com proxNivel
                await realizarSorteio(proxNivel);
            }, tempoDeEspera);
        }
        

        if (!checkLevel) {
            // Define o início e o fim do dia atual
            const inicioDoDia = new Date();
            inicioDoDia.setHours(0, 0, 0, 0); // Início do dia
        
            const fimDoDia = new Date();
            fimDoDia.setHours(23, 59, 59, 999); // Fim do dia
        
            // Coleta todos os dados de daily-spin-result que estão dentro do dia atual
            const report = await strapi.entityService.findMany('api::daily-spin-result.daily-spin-result', {
                filters: {
                    date: {
                        $gte: inicioDoDia,
                        $lte: fimDoDia
                    }
                },
                populate: "*" 
            });
        
            // Verifica se report contém dados
            if (report && report.length > 0) {
                // Prepara os dados para salvar em api::report.report
                const dadosParaSalvar = {
                    type: "Giro Diário",
                    date: new Date(), // Data atual
                    dados: report // Converte o report para string para armazenamento, se necessário
                };
        
                // Salva os dados coletados em api::report.report
                // @ts-ignore
                await strapi.entityService.create('api::report.report', { data: dadosParaSalvar });
        
                console.log("Dados de Giro Diário salvos com sucesso.");
            } else {
                console.log("Não foram encontrados resultados de Giro Diário para o dia atual.");
            }
        }
        
    
        console.log(`${itensSelecionados.length} itens foram promovidos ao próximo nível.`);
        return itensSelecionados.length; // Retorna a quantidade de itens promovidos
    } catch (error) {
        console.error('Erro ao realizar sorteio e promoção:', error);
        throw error; // Propaga o erro para ser tratado por quem chamou a função
    }
}


const processarBonusPorNivel = async (idCota, nivel) => {
    // Primeiro, obtém as configurações gerais chamando getDailySpinSetting
    const setting = await getDailySpinSetting();
    console.log("Configurações obtidas:", setting);
  
    // Verifica se existe configuração para o nível especificado e se a cota existe
    if (setting && setting.Award && setting.Award[`L${nivel}`] && idCota) {
      const valorDoBonus = setting.Award[`L${nivel}`];
      console.log(`Valor do bônus para o nível L${nivel}:`, valorDoBonus);
  
      // Obtém os dados da cota especificada
      const cota = await strapi.entityService.findOne("api::daily-spin-quota.daily-spin-quota", idCota, {
        populate: "*" // Supondo que você quer os dados do usuário associado à cota
      });
  
      if (cota) {
        console.log("Dados da cota obtidos:", cota);
  
        // Supondo que você tenha um serviço de balance como no exemplo anterior
        // e queira creditar o bônus ao usuário associado à cota
        const resultadoDoCredito = await balanceService.balance(strapi, {
          user: cota.user.id,
          mode: "C",
          amount: parseFloat(valorDoBonus),
          to: "available",
          description: `Bônus do Nível ${nivel}, cota ${cota.cod}`,
          type: "Giro Diário",
          plan: cota.plan.id // Supondo que o campo 'plan' se refere ao ID da cota
        });
  
        console.log("Resultado do crédito:", resultadoDoCredito);
      } else {
        console.log("Cota não encontrada.");
      }
    } else {
      console.log(`Configurações para o nível L${nivel} não encontradas ou cota inválida.`);
    }
  };
  


module.exports = {
    createQuotas,
    realizarSorteio,
};
