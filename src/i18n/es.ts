/**
 * Every user-facing string of the app, in Spanish. Keys are `feature.screen.element`.
 * Texts name facts and sources; none evaluates a party or a government
 * (.claude/rules/project-policies.md, neutrality in the UI).
 */
export const es = {
  app: {
    shell: {
      name: "InContext",
      skipToContent: "Saltar al contenido",
      nav: { label: "Principal", map: "Mapa", about: "Cómo funciona" },
      theme: {
        label: "Tema de color: {current}. Pulsa para cambiar a {next}.",
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
          "Banderas de las comunidades y logos de los partidos: Wikimedia Commons.",
        ],
      },
      method: {
        title: "Cómo se hace",
        items: [
          "El sector de cada noticia lo asigna un modelo propio, y la comunidad y el nivel de gobierno, reglas automáticas. Pueden contener errores.",
          "De cada noticia solo se publican el titular y el enlace al medio.",
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
      lead: "El mapa de los gobiernos autonómicos, los datos del INE y las noticias recientes de cada comunidad.",
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
      notFound: "No existe esa comunidad.",
      flag: "Bandera de {name}",
    },
    government: {
      title: "Gobierno",
      president: "Presidencia: {name}",
      since: "Desde el {date}",
      caretaker: "Gobierno en funciones.",
      governing: "Partidos que gobiernan",
      support: "Partidos que apoyaron la investidura sin entrar en el gobierno",
      sourceOf: "Fuente de {party}",
      partiesOf: "{title}: {parties}",
    },
    indicators: {
      title: "Datos del INE",
      caption: "Indicadores de {community}, con el periodo y la fuente de cada dato",
      columns: { indicator: "Indicador", value: "Valor", period: "Periodo", source: "Fuente" },
      chartLabel: "Evolución de {name} entre {from} y {to}: de {first} a {last}.",
      range: "Entre {from} y {to}: el valor más bajo fue {low} y el más alto, {high}.",
      axes: { time: "Año (un punto por trimestre)", timeAnnual: "Año (un punto por año)" },
      carousel: {
        label: "Indicadores de {community}",
        previous: "Indicadores anteriores",
        next: "Indicadores siguientes",
      },
      viewData: "Ver los datos de la gráfica",
      dataTitle: "Datos: {name}",
      close: "Cerrar",
      noValue: "Sin dato",
      noPeriod: "—",
      sourceLink: "Tabla {id} del INE",
      downloaded: "Descargado el {date}.",
      quarter: "{quarter}.º trimestre de {year}",
      units: {
        persons: "personas",
        "%": "%",
        "index (2025 = 100)": "puntos",
      },
      // The base of an index goes with its name ("… (base 2025 = 100)"), not with each value.
      bases: { "index (2025 = 100)": "base 2025 = 100" },
    },
    state: {
      loading: "Cargando la comunidad…",
      error: "No hemos podido cargar esta comunidad.",
      retry: "Volver a intentarlo",
    },
    filters: { legend: "Filtros" },
    trees: {
      title: "Árbol de noticias",
      sectorNav: "Sector del árbol de noticias",
      note: "Cada elemento es un árbol de noticias relacionadas y muestra la más reciente de esta comunidad en el sector. Pulsa sobre ella para ver el árbol completo.",
      empty: "No hay árboles de noticias de {sector} en esta comunidad.",
      loading: "Cargando los árboles…",
      error: "No hemos podido cargar los árboles de noticias.",
      retry: "Volver a intentarlo",
      carousel: { label: "Árboles de noticias del {date}, se desplazan en horizontal" },
      search: {
        label: "Buscar",
        placeholder: "Escribe un titular o un medio",
        noMatch: "Ningún árbol de noticias de {sector} coincide con «{query}».",
      },
      panelLabel: "Árbol de noticias relacionadas con «{headline}»",
    },
    news: {
      title: "Noticias",
      search: {
        label: "Buscar",
        placeholder: "Escribe un titular o un medio",
        noMatch: "Ninguna noticia de {sector} de estas fechas coincide con «{query}».",
      },
      sectorNav: "Sector de las noticias",
      sectors: { education: "Educación", health: "Sanidad", housing: "Vivienda" },
      range: {
        legend: "Fechas",
        from: "Desde",
        to: "Hasta",
        reset: "Última semana",
        note: "Se muestra la última semana. Puedes elegir otras fechas, hasta 31 días seguidos.",
      },
      method:
        "El sector de cada noticia lo asigna un modelo propio, y la comunidad y el nivel de gobierno, reglas automáticas. Pueden contener errores.",
      empty: "No hay noticias de {sector} en este periodo.",
      loading: "Cargando las noticias…",
      error: "No hemos podido cargar las noticias.",
      retry: "Volver a intentarlo",
      outletAndTime: "{outlet}, {time}",
      source: "Ver fuente",
      sourceOf: "Ver fuente de «{headline}» (se abre en otra pestaña)",
      tree: "Ver árbol",
      treeOf: "Ver árbol de noticias relacionadas con «{headline}»",
      carousel: {
        label: "Noticias del {date}",
        previous: "Noticias anteriores",
        next: "Noticias siguientes",
      },
    },
  },
  stories: {
    tree: {
      title: "Noticias relacionadas",
      back: "Volver",
      reading:
        "Cada tarjeta es una historia: muestra el titular de la primera noticia publicada y, al desplegarla, los de los demás medios que cuentan el mismo suceso. El tiempo avanza de izquierda a derecha: cada rama continúa la historia anterior a la que se parece más.",
      method:
        "Las historias y las relaciones las calcula un modelo de similitud de textos, con un umbral provisional (similitud mínima {threshold} y hasta {days} días entre una historia y la siguiente). Pueden contener errores. Una relación solo dice «parecida y posterior», no su causa.",
      regionLabel: "Árbol de historias relacionadas, se desplaza en horizontal",
      more: "{count} medios más",
      moreOne: "1 medio más",
      sameOutlet: "{count} noticias más de este medio",
      sameOutletOne: "1 noticia más de este medio",
      unfold: "Desplegar ({more})",
      fold: "Plegar",
      moreHint: "Pulsa «Desplegar» en una tarjeta para ver el titular de los demás medios.",
      started: "Desde el {date}, {time}",
      similarity: "Relación con la anterior: {value}",
      loading: "Cargando el árbol…",
      error: "No hemos podido cargar el árbol.",
      retry: "Volver a intentarlo",
      notFound: "Esta noticia no tiene noticias relacionadas.",
    },
  },
  about: {
    page: {
      title: "Cómo funciona",
      intro:
        "InContext reúne, para cada comunidad autónoma, quién gobierna, datos oficiales del INE y las noticias recientes de medios nacionales y regionales, clasificadas por sector.",
    },
    data: {
      title: "De dónde salen los datos",
      items: [
        "Indicadores: tablas del INE. Cada dato enlaza a su tabla y dice cuándo se descargó.",
        "Gobiernos: decretos del BOE y de los boletines autonómicos. Cada gobierno y cada partido enlaza a su fuente.",
        "Límites de las comunidades: Instituto Geográfico Nacional, licencia CC BY 4.0.",
        "Colores de los partidos: Wikidata.",
        "Banderas de las comunidades y logos de los partidos: Wikimedia Commons.",
        "Noticias: los canales públicos (RSS, mapas de noticias y secciones) de los medios nacionales y regionales seleccionados, respetando sus normas de acceso.",
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
        "El sector lo asigna un modelo propio y la comunidad y el nivel de gobierno, reglas automáticas. Se midieron con 200 noticias etiquetadas a mano que nunca se usaron para entrenar, y pueden equivocarse, por ejemplo tomando por política una noticia que no lo es. Con esa muestra no se puede afirmar que el modelo acierte más que las reglas en el sector.",
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
