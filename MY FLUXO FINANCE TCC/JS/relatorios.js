// Configuração do Firebase usando configuração central
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Função para mostrar mensagens
function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

async function carregarDados(dataInicio, dataFim) {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const inicioStr = formatarDataFirebase(dataInicio);
    const fimStr = formatarDataFirebase(dataFim);
    
    try {
        const q = query(
            collection(db, "usuarios", user.uid, "transacoes"),
            where("data", ">=", inicioStr),
            where("data", "<=", fimStr)
        );
        
        const querySnapshot = await getDocs(q);
        const transacoes = [];
        let totalReceitas = 0;
        let totalDespesas = 0;
        const gastosPorCategoria = {};
        
        querySnapshot.forEach((doc) => {
            const transacao = doc.data();
            transacoes.push(transacao);
            
            const valor = parseFloat(transacao.valor);
            if (valor > 0) {
                totalReceitas += valor;
            } else {
                totalDespesas += Math.abs(valor);
            }
            
            if (transacao.categoria) {
                gastosPorCategoria[transacao.categoria] = 
                    (gastosPorCategoria[transacao.categoria] || 0) + Math.abs(valor);
            }
        });
        
        document.getElementById('total-receitas').textContent = formatarMoeda(totalReceitas);
        document.getElementById('total-despesas').textContent = formatarMoeda(totalDespesas);
        document.getElementById('saldo-total').textContent = formatarMoeda(totalReceitas - totalDespesas);
        
        atualizarTransacoesRecentes(transacoes);
        atualizarGraficoCategorias(gastosPorCategoria);
        atualizarGraficoMensal(transacoes, dataInicio, dataFim);
        
    } catch (error) {
        console.error("Erro ao carregar transações:", error);
        showMessage('Erro ao carregar dados. Tente novamente.', 'error');
    }
}

// Adicione o observador de autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        carregarDados(primeiroDiaMes, ultimoDiaMes);
    } else {
        window.location.href = 'login.html';
    }
});

// Variáveis globais para os gráficos
let categoriaChart, mensalChart;

// Função principal quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configura os eventos dos filtros
    setupFilters();
    
    // Carrega os dados iniciais (mês atual)
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    carregarDados(primeiroDiaMes, ultimoDiaMes);
});

function setupFilters() {
    const periodoSelect = document.getElementById('periodo');
    const customDates = document.querySelector('.custom-dates');
    
    periodoSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDates.style.display = 'flex';
        } else {
            customDates.style.display = 'none';
        }
    });
    
    document.getElementById('aplicar-filtro').addEventListener('click', function() {
        aplicarFiltros();
    });
}

function aplicarFiltros() {
    const periodo = document.getElementById('periodo').value;
    const hoje = new Date();
    let dataInicio, dataFim;
    
    switch(periodo) {
        case 'mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            break;
        case 'trimestre':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            break;
        case 'semestre':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear(), 0, 1);
            dataFim = new Date(hoje.getFullYear(), 11, 31);
            break;
        case 'custom':
            const inicioInput = document.getElementById('data-inicio').value;
            const fimInput = document.getElementById('data-fim').value;
            
            if (!inicioInput || !fimInput) {
                alert('Por favor, selecione ambas as datas para o período personalizado.');
                return;
            }
            
            dataInicio = new Date(inicioInput);
            dataFim = new Date(fimInput);
            break;
    }
    
    carregarDados(dataInicio, dataFim);
}

function carregarDados(dataInicio, dataFim) {
    // Formata as datas para o formato YYYY-MM-DD para comparação
    const inicioStr = formatarDataFirebase(dataInicio);
    const fimStr = formatarDataFirebase(dataFim);
    
    // Referência para as transações no Firebase
    const transacoesRef = database.ref('transacoes');
    
    transacoesRef.once('value').then((snapshot) => {
        const transacoes = [];
        let totalReceitas = 0;
        let totalDespesas = 0;
        const gastosPorCategoria = {};
        
        snapshot.forEach((childSnapshot) => {
            const transacao = childSnapshot.val();
            const transacaoData = transacao.data;
            
            // Verifica se a transação está dentro do período selecionado
            if (transacaoData >= inicioStr && transacaoData <= fimStr) {
                transacoes.push(transacao);
                
                // Calcula totais
                const valor = parseFloat(transacao.valor);
                if (valor > 0) {
                    totalReceitas += valor;
                } else {
                    totalDespesas += Math.abs(valor);
                }
                
                // Agrupa por categoria
                if (transacao.categoria) {
                    if (!gastosPorCategoria[transacao.categoria]) {
                        gastosPorCategoria[transacao.categoria] = 0;
                    }
                    gastosPorCategoria[transacao.categoria] += Math.abs(valor);
                }
            }
        });
        
        // Atualiza os totais na interface
        document.getElementById('total-receitas').textContent = formatarMoeda(totalReceitas);
        document.getElementById('total-despesas').textContent = formatarMoeda(totalDespesas);
        document.getElementById('saldo-total').textContent = formatarMoeda(totalReceitas - totalDespesas);
        
        // Atualiza a lista de transações recentes
        atualizarTransacoesRecentes(transacoes);
        
        // Cria/atualiza os gráficos
        atualizarGraficoCategorias(gastosPorCategoria);
        atualizarGraficoMensal(transacoes, dataInicio, dataFim);
    });
}

function atualizarTransacoesRecentes(transacoes) {
    const listaTransacoes = document.getElementById('transacoes-recentes');
    listaTransacoes.innerHTML = '';
    
    // Ordena as transações por data (mais recente primeiro)
    transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Limita a 5 transações
    const transacoesExibir = transacoes.slice(0, 5);
    
    transacoesExibir.forEach(transacao => {
        const valor = parseFloat(transacao.valor);
        const isReceita = valor > 0;
        
        const li = document.createElement('li');
        li.className = 'transaction';
        
        li.innerHTML = `
            <div class="transaction-icon ${isReceita ? 'income' : 'expense'}">
                <i class="fas ${isReceita ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            </div>
            <div class="transaction-info">
                <span class="transaction-title">${transacao.nome || 'Transação sem nome'}</span>
                <span class="transaction-category">${transacao.categoria || 'Sem categoria'}</span>
            </div>
            <div class="transaction-amount ${isReceita ? 'income' : 'expense'}">
                ${isReceita ? '+' : '-'} ${formatarMoeda(Math.abs(valor))}
            </div>
        `;
        
        listaTransacoes.appendChild(li);
    });
}

function atualizarGraficoCategorias(gastosPorCategoria) {
    const ctx = document.getElementById('categoriaChart').getContext('2d');
    
    // Ordena as categorias por valor (maior para menor)
    const categoriasOrdenadas = Object.entries(gastosPorCategoria)
        .sort((a, b) => b[1] - a[1]);
    
    const labels = categoriasOrdenadas.map(item => item[0]);
    const data = categoriasOrdenadas.map(item => item[1]);
    
    // Cores para as categorias
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(255, 99, 255, 0.7)',
        'rgba(99, 255, 132, 0.7)'
    ];
    
    // Se já existe um gráfico, destrua antes de criar um novo
    if (categoriaChart) {
        categoriaChart.destroy();
    }
    
    categoriaChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function atualizarGraficoMensal(transacoes, dataInicio, dataFim) {
    const ctx = document.getElementById('mensalChart').getContext('2d');
    
    // Agrupa as transações por mês
    const meses = {};
    const todasDatas = [];
    
    // Cria um array com todos os meses no intervalo
    let dataAtual = new Date(dataInicio);
    dataAtual.setDate(1); // Garante que começamos no primeiro dia do mês
    
    while (dataAtual <= dataFim) {
        const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
        const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'short' });
        
        if (!meses[mesAno]) {
            meses[mesAno] = {
                nome: nomeMes,
                receitas: 0,
                despesas: 0
            };
            todasDatas.push(mesAno);
        }
        
        // Avança para o próximo mês
        dataAtual.setMonth(dataAtual.getMonth() + 1);
    }
    
    // Calcula receitas e despesas por mês
    transacoes.forEach(transacao => {
        const transacaoData = new Date(transacao.data);
        const mesAno = `${transacaoData.getFullYear()}-${String(transacaoData.getMonth() + 1).padStart(2, '0')}`;
        const valor = parseFloat(transacao.valor);
        
        if (meses[mesAno]) {
            if (valor > 0) {
                meses[mesAno].receitas += valor;
            } else {
                meses[mesAno].despesas += Math.abs(valor);
            }
        }
    });
    
    // Prepara os dados para o gráfico
    const labels = todasDatas.map(data => {
        const [ano, mes] = data.split('-');
        return `${meses[data].nome} ${ano}`;
    });
    
    const receitasData = todasDatas.map(data => meses[data].receitas);
    const despesasData = todasDatas.map(data => meses[data].despesas);
    
    // Se já existe um gráfico, destrua antes de criar um novo
    if (mensalChart) {
        mensalChart.destroy();
    }
    
    mensalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasData,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: despesasData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatarMoeda(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Funções auxiliares
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarDataFirebase(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}