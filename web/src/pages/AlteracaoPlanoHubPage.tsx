import { Typography } from '@mui/material'
import SettingsRemoteOutlinedIcon from '@mui/icons-material/SettingsRemoteOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import { HubCatalog, type HubSection } from '../components/HubCatalog'

const ICON_SX = { fontSize: 26 } as const

export function AlteracaoPlanoHubPage() {
  const sections: HubSection[] = [
    {
      title: 'Ativo / Receptivo',
      items: [
        {
          label: 'Remoto (titular / terceiro / PJ)',
          to: '/gerar-os?demanda=alteracao-plano&slug=altplan-remoto',
          description: 'Acordo remoto com variações de titular, terceiro e PJ no próprio formulário.',
          icon: <SettingsRemoteOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Presencial (titular / terceiro)',
          to: '/gerar-os?demanda=alteracao-plano&slug=altplan-presencial',
          description: 'Atendimento presencial em loja, com variações de titular e terceiro.',
          icon: <StorefrontOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Sem troca: isento',
          to: '/gerar-os?demanda=alteracao-plano&slug=altplan-sem-troca-visita-isenta',
          description: 'Mantém o roteador atual; visita técnica sem custo.',
          icon: <RouterOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Sem troca: pago',
          to: '/gerar-os?demanda=alteracao-plano&slug=altplan-sem-troca-visita-paga',
          description: 'Mantém o roteador atual; visita técnica com custo.',
          icon: <RouterOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Com troca: isento',
          to: '/gerar-os?demanda=alteracao-plano&slug=altplan-troca-visita-isenta',
          description: 'Inclui troca de roteador; visita técnica sem custo.',
          icon: <SwapHorizOutlinedIcon sx={ICON_SX} />,
        },
        {
          label: 'Com troca: pago',
          to: '/gerar-os?demanda=alteracao-plano&slug=altplan-troca-visita-paga',
          description: 'Inclui troca de roteador; visita técnica com custo.',
          icon: <SwapHorizOutlinedIcon sx={ICON_SX} />,
        },
      ],
    },
  ]

  return (
    <HubCatalog
      overline="Demandas · Suporte"
      title="Alteração de plano"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Escolha o tipo de alteração. Os fluxos <strong>Remoto</strong> e{' '}
          <strong>Presencial</strong> abrem o gerador já no formulário — variações de titular,
          terceiro e PJ no próprio modelo. O modo <strong>ofertado</strong> está disponível como
          alternância dentro de cada formulário.
        </Typography>
      }
      backTo="/suporte"
      backLabel="Todas as categorias"
      sections={sections}
      illustration="contracts"
      illustrationAlt="Contratos e alteração de plano"
      toolbarLabel="Tipos de alteração"
    />
  )
}
