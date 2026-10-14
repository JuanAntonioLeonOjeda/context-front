/**
 * Every user-facing string of the app, in Spanish. Keys are `feature.screen.element`.
 * Texts name facts and sources; none evaluates a party or a government
 * (.claude/rules/project-policies.md, neutrality in the UI).
 */
export const es = {
  app: {
    shell: {
      name: "Contexto autonómico",
      skipToContent: "Saltar al contenido",
      nav: { label: "Principal", map: "Mapa", about: "Cómo funciona" },
      theme: {
        label: "Tema de color: {current}. Pulsa para cambiar a {next}.",
        system: "según el sistema",
        light: "claro",
        dark: "oscuro",
      },
    },
    footer: {
      sources: {
        title: "Datos y fuentes",
        items: [
          "Indicadores: tablas del INE, enlazadas en cada dato.",
          "Gobiernos: decretos del BOE y de los boletines autonómicos, con la fuente de cada dato.",
          "Límites de las comunidades: IGN, licencia CC BY 4.0.",
          "Colores de los partidos: Wikidata.",
        ],
      },
      method: {
        title: "Cómo se hace",
        items: [
          "Las noticias se clasifican con reglas automáticas todavía sin medir, y pueden contener errores.",
          "De cada noticia solo se publican el titular y el enlace al medio.",
          "El responsable se deriva de una regla única, igual para todos los partidos.",
        ],
        link: "Leer cómo funciona",
      },
      project: {
        title: "Proyecto",
        about: "Proyecto personal de portfolio, desarrollado con asistencia de Claude Code.",
        back: "Código del backend",
        front: "Código de la web",
      },
    },
  },
  map: {
    community: {
      // "{community}" and "{parties}" are filled by formatMessage; parties come as a list.
      governedBy: "{community}: gobierna {parties}",
      governedByCoalition: "{community}: gobiernan {parties}",
      caretaker: "{label} (en funciones)",
      noData: "{community}: sin datos de gobierno en esta fecha",
    },
    legend: {
      title: "Partidos que gobiernan",
      coalition: "Las franjas indican un gobierno de coalición, con un color por partido.",
      noData: "Sin datos de gobierno",
    },
    list: {
      title: "Comunidades",
    },
    hero: {
      title: "Quién gobierna cada comunidad y qué cuentan los medios de ella",
      lead: "El mapa de los gobiernos autonómicos, los datos del INE y las noticias de cada comunidad, con quién es responsable de lo que se cuenta y por qué.",
      select: {
        label: "Ir a una comunidad",
        placeholder: "Elige una comunidad",
        submit: "Ver comunidad",
      },
      facts: {
        label: "El mapa en cifras",
        communities: { one: "comunidad", other: "comunidades" },
        parties: { one: "partido en algún gobierno", other: "partidos en algún gobierno" },
        coalitions: { one: "gobierno de coalición", other: "gobiernos de coalición" },
      },
    },
    panel: {
      title: "Quién gobierna hoy",
      hint: "Elige un partido para resaltar en el mapa las comunidades donde gobierna.",
      row: "{party}: gobierna en {communities}",
      communities: { one: "{count} comunidad", other: "{count} comunidades" },
      coalitions: "{coalitions} de {total} gobiernos son de coalición.",
      caretakers: "{caretakers} en funciones.",
    },
    figure: {
      caption: "Gobiernos autonómicos a {date}",
      boundaries: "Límites: {attribution}",
    },
    state: {
      loading: "Cargando el mapa…",
      error: "No hemos podido cargar el mapa.",
      retry: "Volver a intentarlo",
    },
  },
  community: {
    page: {
      back: "Volver al mapa",
      notFound: "No existe esa comunidad.",
    },
    government: {
      title: "Gobierno",
      president: "Presidencia: {name}",
      since: "Desde el {date}",
      caretaker: "Gobierno en funciones.",
      governing: "Partidos que gobiernan",
      support: "Partidos que apoyaron la investidura sin entrar en el gobierno",
      source: "Fuente",
      sourceOf: "Fuente: {party}",
      sourceOfTerm: "Fuente del nombramiento",
    },
    indicators: {
      title: "Datos del INE",
      caption: "Indicadores de {community}, con el periodo y la fuente de cada dato",
      columns: { indicator: "Indicador", value: "Valor", period: "Periodo", source: "Fuente" },
      chartLabel: "Evolución de {name} entre {from} y {to}: de {first} a {last}.",
      range: "Entre {from} y {to}: el valor más bajo fue {low} y el más alto, {high}.",
      axes: { time: "Año (un punto por trimestre)", timeAnnual: "Año (un punto por año)" },
      viewData: "Ver los datos de la gráfica",
      noValue: "Sin dato",
      noPeriod: "—",
      sourceLink: "Tabla {id} del INE",
      downloaded: "Descargado el {date}.",
      quarter: "{quarter}.º trimestre de {year}",
      units: {
        persons: "personas",
        "%": "%",
        "index (2025 = 100)": "(base 2025 = 100)",
      },
    },
    state: {
      loading: "Cargando la comunidad…",
      error: "No hemos podido cargar esta comunidad.",
      retry: "Volver a intentarlo",
    },
    locator: { caption: "Dónde está {community}" },
    views: { nav: "Qué ver de la comunidad", data: "Datos", news: "Noticias" },
    news: {
      title: "Noticias",
      sectorNav: "Sector de las noticias",
      sectors: { education: "Educación", health: "Sanidad", housing: "Vivienda" },
      window: "Noticias desde el {date}: hasta 5 por medio, de la más reciente a la más antigua.",
      method:
        "Las noticias se clasifican con reglas automáticas que todavía no se han medido, y pueden contener errores.",
      sharedCompetences:
        "En educación, sanidad y vivienda las competencias están repartidas entre el Estado, la comunidad y los ayuntamientos: si una noticia no nombra un gobierno, no podemos decir cuál es el responsable.",
      empty: "No hay noticias de {sector} en este periodo.",
      loading: "Cargando las noticias…",
      error: "No hemos podido cargar las noticias.",
      retry: "Volver a intentarlo",
      outletAndTime: "{outlet}, {time}",
      responsible: "Responsable: {government}, {parties}",
      caretaker: "en funciones",
      confidence: "Confianza: {confidence}",
      confidenceWords: { high: "Alta", medium: "Media", not_determined: "Sin determinar" },
      basis: "Base de la atribución",
      levels: {
        state: "Gobierno de España",
        ccaa: "Gobierno autonómico",
        local: "Gobierno local",
      },
      reasons: {
        no_level_named: "la noticia no nombra ningún gobierno",
        no_competence: "la noticia nombra un gobierno sin competencias en este sector",
        local_not_modelled: "la noticia nombra un gobierno local, que todavía no recogemos",
        no_government_on_date: "no hay datos de gobierno en la fecha de la noticia",
      },
    },
  },
  about: {
    page: {
      title: "Cómo funciona",
      intro:
        "Contexto autonómico reúne, para cada comunidad autónoma, quién gobierna, datos oficiales del INE y las noticias recientes de 14 medios, y dice quién es responsable de lo que cuenta cada noticia, con su base y su confianza.",
    },
    responsible: {
      title: "Quién es el responsable de una noticia",
      steps: [
        "Cada noticia se clasifica por comunidad, por sector (educación, sanidad o vivienda) y por los gobiernos que nombra: el del Estado, el de la comunidad o uno local.",
        "El responsable no lo decide un modelo ni se escribe a mano: sale de una regla única, la misma para todos los partidos y todos los medios.",
        "Si la noticia nombra un gobierno y ese nivel tiene alguna competencia en el sector, son responsables los partidos que gobernaban ese nivel el día de la publicación, en hora de España. Los partidos que solo apoyaron la investidura no cuentan.",
        "Si no se cumple, la noticia aparece como «Sin determinar» y se dice por qué.",
      ],
      reasonsTitle: "Por qué una noticia puede quedar sin determinar",
      reasons: [
        "No nombra ningún gobierno, y en educación, sanidad y vivienda las competencias están repartidas entre el Estado, la comunidad y los ayuntamientos.",
        "Nombra un gobierno que no tiene competencias en ese sector.",
        "Nombra un gobierno local (ayuntamiento, cabildo), que todavía no recogemos.",
        "No hay datos del gobierno en la fecha de la noticia.",
      ],
      confidenceTitle: "La confianza",
      confidence: [
        ["Alta", "la noticia nombra un gobierno con competencias en el sector."],
        ["Media", "todavía no se usa."],
        ["Sin determinar", "no se puede decir quién es responsable, con el motivo."],
      ],
    },
    data: {
      title: "De dónde salen los datos",
      items: [
        "Indicadores: tablas del INE. Cada dato enlaza a su tabla y dice cuándo se descargó.",
        "Gobiernos: decretos del BOE y de los boletines autonómicos. Cada gobierno y cada partido enlaza a su fuente.",
        "Competencias: la Constitución, los estatutos de autonomía y las leyes. La base legal se ve en las noticias que tienen un responsable.",
        "Límites de las comunidades: Instituto Geográfico Nacional, licencia CC BY 4.0.",
        "Colores de los partidos: Wikidata.",
        "Noticias: los canales públicos (RSS, mapas de noticias y secciones) de 14 medios nacionales y regionales, respetando sus normas de acceso.",
      ],
    },
    published: {
      title: "Qué se publica y qué no",
      text: "De cada noticia solo se muestran el titular, el medio, la fecha y el enlace a su página. La entradilla se usa en el servidor para clasificar y nunca se muestra.",
    },
    neutrality: {
      title: "Neutralidad",
      items: [
        "Todos los partidos pasan por el mismo código: no hay reglas para un partido concreto.",
        "Los partidos se ordenan alfabéticamente por su nombre, nunca por su tamaño.",
        "Las noticias se ordenan por fecha de publicación, no por audiencia ni por línea editorial.",
        "Los textos describen hechos y fuentes: no valoran a ningún partido, gobierno o medio.",
      ],
    },
    limits: {
      title: "Qué no hace todavía",
      items: [
        "Las reglas que clasifican las noticias aún no se han medido con un conjunto de prueba: pueden equivocarse, por ejemplo tomando por política una noticia que no lo es.",
        "Muchas noticias salen «Sin determinar», porque pocas nombran un gobierno.",
        "Los gobiernos locales, como ayuntamientos y cabildos, todavía no se modelan.",
      ],
    },
    project: {
      title: "Cómo se ha hecho",
      text: "Proyecto personal de portfolio, desarrollado con asistencia de Claude Code. El código de las dos partes es público y las decisiones de diseño están razonadas en el repositorio del backend.",
      back: "Código del backend",
      front: "Código de la web",
    },
  },
  health: {
    status: {
      checking: "Comprobando la conexión con los datos…",
      up: "Datos disponibles",
      down: "No podemos conectar con los datos ahora mismo.",
    },
  },
  errors: {
    boundary: {
      title: "Algo ha fallado",
      message: "No hemos podido mostrar esta página. Vuelve a intentarlo en unos minutos.",
      retry: "Reintentar",
    },
    notFound: {
      title: "Página no encontrada",
      message: "La dirección no existe. Vuelve al inicio.",
      home: "Ir al inicio",
    },
  },
} as const;
