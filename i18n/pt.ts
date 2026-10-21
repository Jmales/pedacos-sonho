/** Portuguese copy — source of truth for translation keys. */
export const pt = {
  // Document / SEO
  doc_title: 'Sereno Gatherings | Pedaços de Sonho • Eventos',
  meta_description:
    'Sereno Gatherings (Pedaços de Sonho), a 40 minutos de Lisboa. O espaço no campo perfeito para casamentos exclusivos, festas infantis, convívios e eventos de empresa.',
  og_description:
    'O cenário idílico a 40 minutos de Lisboa para casamentos, festas infantis e eventos corporate na natureza.',

  // Nav
  nav_espaco: 'O Espaço',
  nav_eventos: 'Eventos',
  nav_galeria: 'Galeria',
  nav_faq: 'Perguntas Frequentes',
  nav_contactos: 'Contactos',
  nav_reservas: 'Reservas & Orçamentos',
  nav_reservar: 'Reservar',
  nav_inicio: 'Início',
  nav_reservas_short: 'Reservas & Preços',

  // Hero
  hero_eyebrow: 'Sereno Gatherings • Grande Lisboa & Ribatejo',
  hero_title: 'Natureza, espaço e <br/>muita imaginação',
  hero_sub:
    'Apenas a 40 minutos de Lisboa, descubra o cenário perfeito para celebrar casamentos com alma, aniversários infantis e encontros corporativos memoráveis.',
  hero_cta1: 'Explorar Eventos',
  hero_cta2: 'Consultar Valores e Reservar',

  // Feature strip
  feat_kids: 'Festas Infantis',
  feat_weddings: 'Casamentos & Batizados',
  feat_corporate: 'Empresas & Corporate',
  feat_other: 'Outros Encontros',

  // Espaço
  espaco_title: 'Um retiro com alma ribatejana',
  espaco_p1:
    'Situada na Azambuja e com rápido acesso a partir de Lisboa, a Sereno Gatherings junta a tranquilidade do campo à autenticidade da arquitetura tradicional portuguesa.',
  espaco_p2:
    'Contamos com extensos jardins, área de piscina, pinhal privativo, zona de animais da quinta e salões com luz natural, garantindo conforto em qualquer estação do ano.',
  espaco_li1: 'Salões com luz natural e vista para o jardim',
  espaco_li2: 'Zona exterior ampla com piscina, pinhal e relvado',
  espaco_li3:
    'Experiências pedagógicas e passeios de pónei para os mais novos (conforme disponibilidade)',
  img_jardim_alt: 'Sereno Gatherings — jardim e piscina',

  // Serviços
  servicos_eyebrow: 'Modalidades',
  servicos_title: 'Espaços e Experiências à Sua Medida',
  servicos_sub: 'Desde festas intimistas em família até celebrações de grande escala.',
  card_kids_title: 'Festas Infantis',
  card_kids_desc:
    'Aniversários ao ar livre com insufláveis, póneis e contacto direto com a natureza. Packs a partir de 120 €.',
  card_kids_cta: 'Ver Packs <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>',
  card_kids_alt: 'Festas infantis e quinta pedagógica',
  card_wed_title: 'Casamentos & Batizados',
  card_wed_desc:
    'Cerimónias e celebrações intimistas com exclusividade do espaço e liberdade de catering.',
  card_wed_cta: 'Pedir Proposta <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>',
  card_wed_alt: 'Casamentos e batizados',
  card_corp_title: 'Empresas & Corporate',
  card_corp_desc:
    'Teambuilding, reuniões com luz natural e almoços de empresa fora da rotina do escritório.',
  card_corp_cta: 'Simular Aluguer <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>',
  card_corp_alt: 'Eventos corporativos e teambuilding',
  card_other_title: 'Outros Encontros',
  card_other_desc:
    'Bodas de prata, piqueniques familiares, noites de fados, gravações, workshops ou convívios privados ao ar livre.',
  card_other_cta: 'Consultar Opções <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>',
  card_other_alt: 'Almoços e encontros familiares',
  sob_consulta: 'Sob Consulta',
  portfolio_cta: 'Ver portfólio de eventos anteriores',

  // FAQ
  faq_eyebrow: 'Esclarecimentos',
  faq_title: 'Perguntas Frequentes',
  faq_q1: 'O espaço fica próximo de Lisboa?',
  faq_a1:
    'Sim. A Sereno Gatherings (Pedaços de Sonho) situa-se em Casais de Baixo, concelho de Azambuja, a cerca de 40 minutos do centro e do aeroporto de Lisboa, com acesso rápido pelas principais vias rápidas e autoestradas.',
  faq_q2: 'Como funcionam os orçamentos para Casamentos e Batizados?',
  faq_a2:
    'Para casamentos e batizados, o valor é <strong>sob consulta</strong>. Ajustamos a duração, o número de convidados, a exclusividade do espaço e eventuais serviços adicionais para garantir que a celebração decorre exatamente ao vosso ritmo.',
  faq_q3: 'Podemos levar o nosso próprio catering e decoração?',
  faq_a3:
    'Sim. Dispomos de packs próprios, mas damos total flexibilidade para trazerem o vosso catering de eleição, bolo, animação ou decoração exterior.',

  // CTA
  cta_title: 'Pronto para planear a sua celebração?',
  cta_sub:
    'Consulte os turnos de aluguer, selecione os extras pretendidos e receba uma confirmação de disponibilidade rápida.',
  cta_btn: 'Ver Tabela e Fazer Pedido',

  // Footer
  footer_tagline: 'Celebrações com simplicidade, ar puro e elegância.',
  footer_nav: 'Navegação',
  footer_contactos: 'Contactos',
  footer_copy: '© 2026 Pedaços de Sonho - Sereno Gatherings. Todos os direitos reservados.',
  footer_address: 'Sereno Gatherings, Casais de Baixo, Azambuja',
} as const;

export type MessageKey = keyof typeof pt;
export type Messages = { [K in MessageKey]: string };
