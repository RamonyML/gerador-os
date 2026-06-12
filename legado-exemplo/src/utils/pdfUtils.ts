import jsPDF from 'jspdf';

interface ComissaoOperador {
  operadorId: string;
  operadorNome: string;
  upgradesAtivos: number;
  upgradesReceptivos: number;
  valorComissaoAtivos: number;
  valorComissaoReceptivos: number;
  valorTotalComissao: number;
}

interface RelatorioOptions {
  comissoes: ComissaoOperador[];
  mesAno: string;
  totalComissoes: number;
  totalOperadores: number;
  mediaComissoes: number;
  emailOperador?: string;
}

export const gerarRelatorioComissoesPDF = async (options: RelatorioOptions): Promise<void> => {
  const { comissoes, mesAno, totalComissoes, totalOperadores, mediaComissoes, emailOperador } = options;
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let currentY = margin;

  // Função para formatação de moeda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para adicionar nova página se necessário
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Função específica para garantir espaço para as regras
  const checkSpaceForRules = () => {
    const rulesHeight = 80; // Altura estimada para as regras de comissão
    if (currentY + rulesHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  try {
    // Começar direto no topo para economizar espaço
    currentY = margin;

    // Título do relatório
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Relatório de Comissões ${mesAno}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Data de geração e operador
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const dataGeracao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    pdf.text(`Gerado em: ${dataGeracao}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 7;
    
    if (emailOperador) {
      pdf.text(`por: ${emailOperador}`, pageWidth - margin, currentY, { align: 'right' });
      currentY += 12;
    } else {
      currentY += 10;
    }

    // Resumo executivo
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumo Executivo', margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`• Total de Operadores: ${totalOperadores}`, margin, currentY);
    currentY += 6;
    pdf.text(`• Total de Comissões: ${formatCurrency(totalComissoes)}`, margin, currentY);
    currentY += 6;
    pdf.text(`• Média por Operador: ${formatCurrency(mediaComissoes)}`, margin, currentY);
    currentY += 12;

    // Tabela de comissões
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ranking de Comissões', margin, currentY);
    currentY += 10;
    // Ajustar larguras das colunas para caber melhor na página (total ~170)
    const colWidths = [10, 40, 18, 18, 26, 26, 30];
    const colPositions = [margin];
    
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i - 1] + colWidths[i - 1]);
    }

    // Desenhar cabeçalho
    pdf.setFillColor(41, 98, 255); // Cor azul
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
    
    pdf.setTextColor(255, 255, 255); // Texto branco
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    
    const headers = ['Pos.', 'Operador', 'Ativos', 'Receptivos', 'Com. Ativos', 'Com. Receptivos', 'Total'];
    headers.forEach((header, index) => {
      pdf.text(header, colPositions[index] + 2, currentY + 5.5);
    });
    
    currentY += 8;
    pdf.setTextColor(0, 0, 0); // Voltar ao preto

    // Função para desenhar cabeçalho da tabela
    const drawTableHeader = () => {
      pdf.setFillColor(41, 98, 255); // Cor azul
      pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
      
      pdf.setTextColor(255, 255, 255); // Texto branco
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      const headers = ['Pos.', 'Operador', 'Ativos', 'Receptivos', 'Com. Ativos', 'Com. Receptivos', 'Total'];
      headers.forEach((header, index) => {
        pdf.text(header, colPositions[index] + 2, currentY + 5.5);
      });
      
      currentY += 8;
      pdf.setTextColor(0, 0, 0); // Voltar ao preto
    };

    // Dados da tabela
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    comissoes.forEach((comissao, index) => {
      // Verificar se precisa de nova página
      if (checkPageBreak(8)) {
        // Se mudou de página, redesenhar cabeçalho
        drawTableHeader();
      }
      
      // Alternar cor de fundo das linhas
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
      }
      
      const rowData = [
        `${index + 1}º`,
        comissao.operadorNome.length > 20 ? comissao.operadorNome.substring(0, 17) + '...' : comissao.operadorNome,
        comissao.upgradesAtivos.toString(),
        comissao.upgradesReceptivos.toString(),
        formatCurrency(comissao.valorComissaoAtivos),
        formatCurrency(comissao.valorComissaoReceptivos),
        formatCurrency(comissao.valorTotalComissao)
      ];
      
      rowData.forEach((data, colIndex) => {
        const align = colIndex === 0 ? 'center' : (colIndex >= 2 ? 'right' : 'left');
        const xPos = align === 'right' ? colPositions[colIndex] + colWidths[colIndex] - 2 : 
                    align === 'center' ? colPositions[colIndex] + colWidths[colIndex] / 2 : 
                    colPositions[colIndex] + 2;
        
        pdf.text(data, xPos, currentY + 5.5, { align: align as any });
      });
      
      currentY += 8;
    });

    // Linha de separação
    currentY += 5;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Regras de comissão - garantir que caibam completas
    checkSpaceForRules();
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Regras de Comissão', margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const regras = [
      'Upgrades Ativos:',
      '• 1-49 upgrades: R$ 11,00 cada',
      '• 50-59 upgrades: R$ 13,00 cada',
      '• 60-69 upgrades: R$ 15,00 cada',
      '• 70-79 upgrades: R$ 18,00 cada',
      '• 80-89 upgrades: R$ 21,00 cada',
      '• 90-99 upgrades: R$ 24,00 cada',
      '• 100+ upgrades: R$ 28,00 cada',
      '',
      'Upgrades Receptivos:',
      '• Valor fixo: R$ 9,00 por upgrade'
    ];

    regras.forEach((regra) => {
      if (regra === 'Upgrades Ativos:' || regra === 'Upgrades Receptivos:') {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      if (regra !== '') {
        pdf.text(regra, margin, currentY);
        currentY += 5;
      } else {
        currentY += 3;
      }
    });

    // Rodapé
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Salvar o PDF
    const nomeArquivo = `relatorio-comissoes-${mesAno.replace('/', '-')}.pdf`;
    pdf.save(nomeArquivo);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF');
  }
};