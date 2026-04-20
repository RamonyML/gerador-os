import jsPDF from 'jspdf'

export type ComissaoOperadorPdf = {
  operadorId: string
  operadorNome: string
  upgradesAtivos: number
  upgradesReceptivos: number
  valorComissaoAtivos: number
  valorComissaoReceptivos: number
  valorTotalComissao: number
}

type Options = {
  comissoes: ComissaoOperadorPdf[]
  mesAno: string
  totalComissoes: number
  totalOperadores: number
  mediaComissoes: number
  emailOperador?: string
}

export async function gerarRelatorioComissoesPdf(
  options: Options,
): Promise<void> {
  const {
    comissoes,
    mesAno,
    totalComissoes,
    totalOperadores,
    mediaComissoes,
    emailOperador,
  } = options

  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20
  let currentY = margin

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
      return true
    }
    return false
  }

  const checkSpaceForRules = () => {
    const rulesHeight = 80
    if (currentY + rulesHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
      return true
    }
    return false
  }

  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Relatório de Comissões ${mesAno}`, pageWidth / 2, currentY, {
    align: 'center',
  })
  currentY += 15

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const dataGeracao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  pdf.text(`Gerado em: ${dataGeracao}`, pageWidth - margin, currentY, {
    align: 'right',
  })
  currentY += 7
  if (emailOperador) {
    pdf.text(`por: ${emailOperador}`, pageWidth - margin, currentY, {
      align: 'right',
    })
    currentY += 12
  } else {
    currentY += 10
  }

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Resumo Executivo', margin, currentY)
  currentY += 8
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`• Total de Operadores: ${totalOperadores}`, margin, currentY)
  currentY += 6
  pdf.text(`• Total de Comissões: ${formatCurrency(totalComissoes)}`, margin, currentY)
  currentY += 6
  pdf.text(`• Média por Operador: ${formatCurrency(mediaComissoes)}`, margin, currentY)
  currentY += 12

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Ranking de Comissões', margin, currentY)
  currentY += 10

  const colWidths = [10, 40, 18, 18, 26, 26, 30]
  const colPositions: number[] = [margin]
  for (let i = 1; i < colWidths.length; i++) {
    colPositions.push(colPositions[i - 1]! + colWidths[i - 1]!)
  }

  pdf.setFillColor(41, 98, 255)
  pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  const headers = [
    'Pos.',
    'Operador',
    'Ativos',
    'Receptivos',
    'Com. Ativos',
    'Com. Receptivos',
    'Total',
  ]
  headers.forEach((header, index) => {
    pdf.text(header, colPositions[index]! + 2, currentY + 5.5)
  })
  currentY += 8
  pdf.setTextColor(0, 0, 0)

  const drawTableHeader = () => {
    pdf.setFillColor(41, 98, 255)
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    headers.forEach((header, index) => {
      pdf.text(header, colPositions[index]! + 2, currentY + 5.5)
    })
    currentY += 8
    pdf.setTextColor(0, 0, 0)
  }

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)

  comissoes.forEach((c, index) => {
    if (checkPageBreak(8)) drawTableHeader()
    if (index % 2 === 0) {
      pdf.setFillColor(248, 249, 250)
      pdf.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F')
    }
    const nome =
      c.operadorNome.length > 20
        ? `${c.operadorNome.substring(0, 17)}...`
        : c.operadorNome
    const rowData = [
      `${index + 1}º`,
      nome,
      String(c.upgradesAtivos),
      String(c.upgradesReceptivos),
      formatCurrency(c.valorComissaoAtivos),
      formatCurrency(c.valorComissaoReceptivos),
      formatCurrency(c.valorTotalComissao),
    ]
    rowData.forEach((data, colIndex) => {
      const align =
        colIndex === 0 ? 'center' : colIndex >= 2 ? 'right' : 'left'
      const xPos =
        align === 'right'
          ? colPositions[colIndex]! + colWidths[colIndex]! - 2
          : align === 'center'
            ? colPositions[colIndex]! + colWidths[colIndex]! / 2
            : colPositions[colIndex]! + 2
      pdf.text(data, xPos, currentY + 5.5, { align: align as 'left' | 'right' | 'center' })
    })
    currentY += 8
  })

  currentY += 5
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  checkSpaceForRules()
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Regras de Comissão', margin, currentY)
  currentY += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
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
    '• Valor fixo: R$ 9,00 por upgrade',
  ]

  regras.forEach((regra) => {
    if (regra === 'Upgrades Ativos:' || regra === 'Upgrades Receptivos:') {
      pdf.setFont('helvetica', 'bold')
    } else {
      pdf.setFont('helvetica', 'normal')
    }
    if (regra !== '') {
      pdf.text(regra, margin, currentY)
      currentY += 5
    } else {
      currentY += 3
    }
  })

  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    })
  }

  const nomeArquivo = `relatorio-comissoes-${mesAno.replace(/\//g, '-')}.pdf`
  pdf.save(nomeArquivo)
}
