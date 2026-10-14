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
