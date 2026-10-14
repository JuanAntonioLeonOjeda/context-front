/**
 * Every user-facing string of the app, in Spanish. Keys are `feature.screen.element`.
 * Texts name facts and sources; none evaluates a party or a government
 * (.claude/rules/project-policies.md, neutrality in the UI).
 */
export const es = {
  app: {
    shell: {
      name: "Contexto autonómico",
      description: "Noticias políticas de las comunidades autónomas, con su contexto.",
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
