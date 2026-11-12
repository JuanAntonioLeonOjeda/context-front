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
      nav: { label: "Principal", map: "Mapa", project: "El proyecto" },
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
      sectors: {
        education: "Educación",
        health: "Sanidad",
        housing: "Vivienda",
        justice: "Justicia",
        work: "Trabajo",
      },
      range: {
        legend: "Fechas",
        from: "Desde",
        to: "Hasta",
        reset: "Última semana",
        note: "Se muestra la última semana. Puedes elegir otras fechas, hasta 31 días seguidos.",
      },
      method:
        "El sector de cada noticia lo asigna un modelo propio, y la comunidad y el nivel de gobierno, reglas automáticas. Pueden contener errores.",
      indicator: {
        label: "Dato oficial de {sector}",
        period: " · {period}",
        source: "Fuente:",
      },
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
  voters: {
    band: {
      name: "Tramo {number} de {total}",
      withEnd: "{name} · {end}",
      size: "{municipalities} · {census}",
      lowest: "rentas más bajas",
      highest: "rentas más altas",
      incomeRange: "De {min} a {max} € por persona",
      incomeSingle: "{value} € por persona",
      municipalities: "{count} municipios",
      municipality: "1 municipio",
      censusShare: "{percent} del censo",
      blank: "Voto en blanco: {percent}",
      empty: "Ningún municipio cae en este tramo.",
    },
    profile: {
      others: "Otras",
      percent: "{value} %",
    },
    section: {
      title: "Cómo votaron los municipios según su renta media",
      intro:
        "Cómo votaron los municipios de la comunidad en las elecciones generales del {date}, agrupados en tramos según su renta media por persona de {year}.",
      introNoIncome:
        "Cómo votaron los municipios de la comunidad en las elecciones generales del {date}.",
      loading: "Cargando el perfil de voto…",
      error: "No hemos podido cargar el perfil de voto.",
      retry: "Volver a intentarlo",
      barsOf: "Voto en el {band}",
      withoutIncome: "Municipios sin dato de renta, que quedan fuera de los tramos: {count}.",
    },
    reasons: {
      no_results: "No hay resultados de esta elección para la comunidad.",
      too_few_municipalities:
        "Hacen falta al menos dos municipios con dato de renta para formar tramos, y esta comunidad no los tiene.",
    },
    table: {
      open: "Ver los datos en tabla",
      caption: "Porcentaje del voto válido de cada tramo de renta",
      band: "Tramo",
      size: "Municipios y censo",
      scroll: "Tabla de datos, se desplaza en horizontal",
      noValue: "Sin dato",
    },
    method: {
      title: "Cómo leerlo",
      bands:
        "Cada tramo reúne municipios enteros, ordenados por su renta neta media por persona de {year}, de modo que los tramos sumen un censo parecido. Un municipio grande puede dejar un tramo casi vacío; por eso se indica qué parte del censo reúne cada uno. La renta es la del año de la elección.",
      shares:
        "Los porcentajes son sobre el voto válido de cada tramo. Se muestran las candidaturas con al menos el 3 % del voto válido de la comunidad, y el resto se suma en «Otras».",
      areas:
        "El perfil describe zonas, no personas: en un municipio de cualquier tramo vota gente de todas las rentas.",
      sources: "Fuentes:",
      election: "resultados por municipio, Ministerio del Interior",
      income: "renta por municipio, INE (Atlas de distribución de renta de los hogares)",
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
  project: {
    page: {
      title: "El proyecto",
      chapterCount: "Capítulo {n} de {total}",
      crumb: "El proyecto · Capítulo {n}",
      chaptersLabel: "Capítulos",
      pagerLabel: "Capítulo anterior y siguiente",
      previous: "← Anterior",
      next: "Siguiente →",
      after: "Y ahora →",
      afterLink: "Ver el mapa",
    },
    chapters: [
      {
        slug: "como-funciona",
        title: "Cómo funciona",
        summary:
          "De dónde salen los datos, qué se publica, cómo se cuida la neutralidad y qué no hace todavía.",
        blocks: [],
      },
      {
        slug: "la-idea",
        title: "La idea: contexto antes que opinión",
        summary:
          "Qué quiere enseñar InContext para cada comunidad autónoma y qué deja fuera a propósito.",
        blocks: [
          {
            kind: "p",
            text: "Una noticia sobre vivienda en Canarias se entiende mejor si al lado se ve quién gobierna en Canarias, cómo ha evolucionado el precio de la vivienda allí y cómo la han contado otros medios. InContext reúne esas piezas para cada comunidad autónoma y cada sector.",
          },
          { kind: "h2", text: "Qué muestra" },
          {
            kind: "list",
            items: [
              "Un mapa con el partido o los partidos que gobiernan cada comunidad en una fecha, con el decreto que lo acredita.",
              "Para cada comunidad, indicadores oficiales del INE y las noticias recientes de varios medios, filtradas por sector.",
              "Las noticias de distintos medios que cuentan lo mismo, agrupadas en una historia.",
              "Las historias anteriores de las que viene cada una, en forma de árbol.",
            ],
          },
          { kind: "h2", text: "Qué deja fuera" },
          {
            kind: "list",
            items: [
              "No atribuye una noticia a un partido ni a un gobierno responsable: se descartó porque no se podía hacer con garantías (ADR-0018).",
              "No resume ni reescribe las noticias: enlaza al medio.",
              "No ordena por audiencia ni por relevancia: las noticias van por fecha y los partidos por nombre.",
            ],
          },
          {
            kind: "callout",
            title: "Idea clave",
            text: "El orden de trabajo fue primero el contexto (agregar, contrastar y trazar) y después cualquier valoración. Cada dato que se muestra enlaza a su fuente.",
          },
        ],
      },
      {
        slug: "las-noticias",
        title: "Las noticias: qué se recoge y qué no",
        summary: "Qué medios se leen, cómo se recogen sus noticias y qué se guarda de cada una.",
        blocks: [
          {
            kind: "stats",
            items: [
              { value: "14", label: "medios", detail: "9 nacionales y 5 regionales" },
              { value: "cada 3 h", label: "recogida", detail: "desde el 13 de octubre de 2026" },
              {
                value: "29.561",
                label: "noticias",
                detail: "en la base de datos el 6 de noviembre de 2026",
              },
            ],
          },
          { kind: "h2", text: "Los medios" },
          {
            kind: "table",
            head: ["Ámbito", "Medios", "Por qué"],
            rows: [
              [
                "Nacional",
                "El Español, El Mundo, El País, ABC, El Confidencial, OKdiario, La Razón, La Vanguardia",
                "Los más leídos según GfK DAM",
              ],
              ["Nacional", "RTVE", "Radiotelevisión pública"],
              [
                "Canarias",
                "Radio Televisión Canaria, Canarias7, Diario de Avisos",
                "Pública autonómica y los privados más leídos de cada provincia",
              ],
              ["Madrid", "Telemadrid", "Pública autonómica"],
              ["Cataluña", "3Cat", "Pública autonómica"],
            ],
          },
          { kind: "h2", text: "Cómo se recogen" },
          {
            kind: "p",
            text: "Un recolector lee cada tres horas los canales públicos de cada medio: sus RSS, sus mapas de noticias y algunas páginas de sección. Se respeta el robots.txt de cada sitio y nunca se esquiva una protección contra bots.",
          },
          { kind: "h2", text: "Qué se guarda" },
          {
            kind: "list",
            items: [
              "El titular, la entradilla, la fecha, el enlace y las etiquetas que el propio medio pone a la noticia.",
              "El cuerpo de la noticia nunca se guarda. Solo se lee, para sacar etiquetas, en los sitios que lo permiten: los que no bloquean a los rastreadores de IA ni reservan sus textos frente a la minería de datos (ADR-0019).",
              "La entradilla se usa para clasificar y agrupar, pero nunca se publica: la web solo muestra el titular, el medio, la fecha y el enlace.",
            ],
          },
        ],
      },
      {
        slug: "gobiernos-y-datos",
        title: "Quién gobierna y qué dicen los datos",
        summary: "Los gobiernos desde 2020 con su fuente oficial y cinco indicadores del INE.",
        blocks: [
          { kind: "h2", text: "Gobiernos" },
          {
            kind: "p",
            text: "Un conjunto de datos propio recoge quién gobernó el Estado y cada comunidad desde el 1 de enero de 2020: cada mandato con sus fechas, sus partidos y el decreto del BOE o del boletín autonómico que lo acredita. Los gobiernos en funciones también están, como el que abre la convocatoria de elecciones generales del 29 de noviembre de 2026.",
          },
          { kind: "h2", text: "Indicadores" },
          {
            kind: "table",
            head: ["Indicador", "Tabla del INE", "Frecuencia"],
            rows: [
              ["Población", "56940, Estadística Continua de Población", "Trimestral"],
              [
                "Tasa de riesgo de pobreza o exclusión (AROPE)",
                "60264, Encuesta de Condiciones de Vida",
                "Anual",
              ],
              [
                "Población de 16 años o más con educación superior",
                "65289, Encuesta de Población Activa",
                "Trimestral",
              ],
              ["Tasa de paro", "14506, Encuesta de Población Activa", "Trimestral"],
              ["Índice de Precios de Vivienda", "80270", "Trimestral"],
            ],
          },
          {
            kind: "list",
            items: [
              "La serie de cada comunidad se elige por los metadatos que publica el INE, no por su nombre.",
              "Cada valor se guarda tal como lo publicó el INE, con la descarga de la que salió. Una revisión es una fila nueva: nada se sobrescribe.",
              "Si no hay dato, no se inventa: la web dice que falta.",
            ],
          },
        ],
      },
      {
        slug: "las-reglas",
        title: "Clasificar una noticia: las reglas",
        summary: "Comunidad, nivel de gobierno y sector, asignados por reglas escritas como datos.",
        blocks: [
          {
            kind: "p",
            text: "Cada noticia recibe tres etiquetas: la comunidad de la que habla, el nivel de gobierno que actúa (Estado, comunidad o local) y el sector. El primer clasificador son reglas: listas de lugares, términos de nivel y términos de sector guardadas en ficheros CSV.",
          },
          {
            kind: "list",
            items: [
              "Las reglas son datos, no código: su versión es una huella de los ficheros, y cada clasificación guarda con qué versión se hizo.",
              "El medio nunca es una entrada del clasificador, y ninguna regla nombra a un partido ni a un político (ADR-0015).",
              "Las clasificaciones no se sobrescriben: una versión nueva añade filas nuevas.",
            ],
          },
          { kind: "h2", text: "Los sectores" },
          {
            kind: "p",
            text: "La taxonomía son los 12 temas con los que elcongresoentumano.es clasifica las leyes, para que en una fase posterior las noticias y las votaciones del Congreso hablen de los mismos temas. Hoy hay cinco activos: educación, sanidad, vivienda, justicia y trabajo. Un sector se activa cuando hay noticias etiquetadas suficientes para medirlo.",
          },
        ],
      },
      {
        slug: "el-modelo",
        title: "Un modelo propio para el sector",
        summary:
          "Etiquetado a mano, un clasificador entrenado con SetFit y un criterio de promoción fijado antes de ver resultados.",
        blocks: [
          {
            kind: "p",
            text: "Las reglas fallan cuando una noticia habla de un tema sin usar sus palabras. Para el sector se entrena un modelo propio con noticias etiquetadas a mano; ningún modelo de lenguaje externo interviene en la clasificación.",
          },
          { kind: "h2", text: "Los datos" },
          {
            kind: "list",
            items: [
              "Las noticias se etiquetan a mano en Label Studio siguiendo una guía escrita.",
              "Un conjunto ciego de 200 noticias, la mitad al azar y la mitad enriquecida por sector, se etiquetó antes de entrenar y nunca se usa para entrenar.",
              "El conjunto de entrenamiento actual tiene 800 noticias.",
            ],
          },
          { kind: "h2", text: "El modelo" },
          {
            kind: "p",
            text: "SetFit sobre paraphrase-multilingual-mpnet-base-v2, un codificador multilingüe que entiende castellano y catalán. Lee el titular, las etiquetas del medio y la entradilla. El último entrenamiento tardó 24 minutos en una GPU de Google Colab, frente a más de 12 horas en el portátil.",
          },
          { kind: "h2", text: "Cuándo sustituye a las reglas" },
          {
            kind: "p",
            text: "El criterio se fijó antes de entrenar: el modelo debe mejorar al menos 5 puntos el macro-F1 de las reglas en la mitad aleatoria del conjunto ciego, y no acertar más de 2 noticias menos que las reglas en ningún medio.",
          },
          {
            kind: "table",
            head: ["Modelo", "Familia", "Reglas", "Modelo", "Resultado"],
            rows: [
              ["26 oct, 3 sectores", "Sector", "0,524", "0,584", "+6,0: sustituye a las reglas"],
              ["26 oct, 3 sectores", "Nivel", "0,403", "0,308", "−9,5: se quedan las reglas"],
              [
                "6 nov, 5 sectores",
                "Sector",
                "0,639",
                "0,671",
                "+3,2: sustituye a las reglas por excepción",
              ],
              ["6 nov, 5 sectores", "Nivel", "0,403", "0,389", "−1,3: se quedan las reglas"],
            ],
          },
          {
            kind: "callout",
            title: "Ojo",
            text: "La mejora de +3,2 puntos tiene un intervalo de confianza del 95 % de −9,4 a +20,6: con 102 noticias no se puede afirmar que el modelo acierte más que las reglas. Se aceptó como excepción, escrita en el ADR-0016, porque acierta igual o más en los 14 medios y es el único que conoce los cinco sectores. Ampliar el conjunto ciego cerrará la duda.",
          },
          {
            kind: "p",
            text: "El modelo clasifica cada hora en el ordenador del autor (ADR-0022): pone el sector, y las reglas ponen la comunidad y el nivel.",
          },
        ],
      },
      {
        slug: "historias",
        title: "Historias y árboles",
        summary:
          "Cómo se agrupan las noticias de varios medios sobre lo mismo y cómo se enlaza cada historia con la anterior.",
        blocks: [
          { kind: "h2", text: "Una historia, varios medios" },
          {
            kind: "p",
            text: "Cada noticia se convierte en un vector con el mismo codificador del modelo. Dos noticias son la misma historia si su similitud del coseno es de al menos 0,88 y se publicaron con 3 días de diferencia como mucho; una historia necesita al menos dos medios. Los cálculos se hacen en PostgreSQL con pgvector (ADR-0020).",
          },
          { kind: "h2", text: "De dónde viene cada historia" },
          {
            kind: "p",
            text: "Cada historia se enlaza con la historia anterior más parecida que empezó antes, dentro de 14 días y con una similitud de al menos 0,75 entre sus centros. Cada historia tiene como mucho un padre, así que el resultado es un bosque de árboles (ADR-0021).",
          },
          {
            kind: "callout",
            title: "Contexto",
            text: "Los umbrales son provisionales: se fijaron leyendo grupos y árboles reales. Cada ejecución guarda el codificador, el umbral y la ventana que usó, así que un cambio de umbral no reescribe el pasado.",
          },
        ],
      },
      {
        slug: "arquitectura",
        title: "Arquitectura y despliegue",
        summary:
          "Dos repositorios, una base de datos y un despliegue público alimentado por una copia diaria.",
        blocks: [
          {
            kind: "table",
            head: ["Parte", "Tecnología"],
            rows: [
              ["Backend y datos", "Python, FastAPI, PostgreSQL con pgvector"],
              ["Web", "React, Vite y React Router"],
              ["Clasificador propio", "SetFit sobre Sentence Transformers"],
              ["Local", "Docker Compose: base de datos, API, recolector y web"],
              ["Público", "Un Space de Hugging Face"],
            ],
          },
          { kind: "h2", text: "Decisiones de diseño" },
          {
            kind: "list",
            items: [
              "Puertos y adaptadores: la lógica no depende de la base de datos ni de los modelos, que se pueden cambiar sin tocarla.",
              "La API es de solo lectura y nunca llama a una fuente externa ni a un modelo mientras responde.",
              "Las clasificaciones y las observaciones estadísticas se añaden, nunca se sobrescriben.",
              "Cada decisión de arquitectura está razonada en un ADR del repositorio del backend.",
            ],
          },
          { kind: "h2", text: "El despliegue público" },
          {
            kind: "p",
            text: "La web pública es un solo contenedor con PostgreSQL, la API y la web detrás de nginx. Cada mañana el ordenador del autor publica una copia privada de la base de datos sin entradillas, y el Space la carga al reiniciarse, así que las noticias tienen como mucho un día de retraso. Cada cambio que llega a la rama principal se despliega solo (ADR-0023).",
          },
        ],
      },
      {
        slug: "siguientes-pasos",
        title: "Límites y siguientes pasos",
        summary: "Lo que aún no está resuelto y por dónde sigue el proyecto.",
        blocks: [
          { kind: "h2", text: "Límites" },
          {
            kind: "list",
            items: [
              "El conjunto ciego es pequeño: las diferencias de unos pocos puntos entre el modelo y las reglas no son concluyentes.",
              "Muchas noticias no nombran ningún gobierno, así que su nivel queda sin determinar.",
              "Los gobiernos locales, como ayuntamientos y cabildos, no se modelan.",
              "Los medios regionales cubren tres comunidades: Canarias, Madrid y Cataluña.",
            ],
          },
          { kind: "h2", text: "Siguientes pasos" },
          {
            kind: "list",
            items: [
              "Ampliar el conjunto ciego para evaluar el modelo con más precisión.",
              "Poner los indicadores del sector junto a cada historia, y perfiles de votantes por municipio.",
              "Mostrar las leyes relacionadas con una noticia y cómo votó cada grupo, empezando por los datos abiertos del Congreso.",
              "Decidir cómo se produce un resumen común de cada historia.",
            ],
          },
        ],
      },
    ],
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
