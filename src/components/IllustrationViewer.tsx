import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Illustration } from "../chapters";

// @ts-ignore
import imgTarelAguaPortada from "../assets/images/tarel_agua/portada.jpg";
// @ts-ignore
import imgCartografiaEcoP1 from "../assets/images/cartografia_eco/pagina1.jpg";
// @ts-ignore
import imgPoemasPintoresP1 from "../assets/images/poemas_pintores/pagina1.jpg";
// @ts-ignore
import imgPoemasPintoresP2 from "../assets/images/poemas_pintores/pagina2.jpg";
// @ts-ignore
import imgPoemasPintoresP3 from "../assets/images/poemas_pintores/pagina3.jpg";
// @ts-ignore
import imgPoemasPintoresP4 from "../assets/images/poemas_pintores/pagina4.jpg";
// @ts-ignore
import imgPoemasPintoresP5 from "../assets/images/poemas_pintores/pagina5.jpg";
// @ts-ignore
import imgPoemasPintoresP6 from "../assets/images/poemas_pintores/pagina6.jpg";
// @ts-ignore
import imgPoemasPintoresP7 from "../assets/images/poemas_pintores/pagina7.jpg";
// @ts-ignore
import imgPoemasPintoresP8 from "../assets/images/poemas_pintores/pagina8.jpg";
// @ts-ignore
import imgTarelAguaP1 from "../assets/images/tarel_agua/pagina1.jpg";
// @ts-ignore
import imgTarelAguaP2 from "../assets/images/tarel_agua/pagina2.jpg";
// @ts-ignore
import imgTarelAguaP3 from "../assets/images/tarel_agua/pagina3.jpg";
// @ts-ignore
import imgTarelAguaP4 from "../assets/images/tarel_agua/pagina4.jpg";
// @ts-ignore
import imgTarelAguaP5 from "../assets/images/tarel_agua/pagina5.jpg";
// @ts-ignore
import imgTarelAguaP6 from "../assets/images/tarel_agua/pagina6.jpg";
// @ts-ignore
import imgTarelAguaP7 from "../assets/images/tarel_agua/pagina7.jpg";

// Import all PNG illustrations
// @ts-ignore
import img01 from "../assets/images/ilustracion_01.png";
// @ts-ignore
import img02 from "../assets/images/ilustracion_02.png";
// @ts-ignore
import imgPrologo from "../assets/images/ilustracion_03.png";
// @ts-ignore
import imgTarel from "../assets/images/ilustracion_agua_retira.png";
// @ts-ignore
import img04 from "../assets/images/ilustracion_04.png";
// @ts-ignore
import img05 from "../assets/images/ilustracion_05.png";
// @ts-ignore
import img05_5 from "../assets/images/ilustracion_05_5.png";
// @ts-ignore
import img06 from "../assets/images/ilustracion_06.png";
// @ts-ignore
import img07 from "../assets/images/ilustracion_07.png";
// @ts-ignore
import img08 from "../assets/images/ilustracion_08.png";
// @ts-ignore
import imgInt from "../assets/images/ilustracion_int.png";
// @ts-ignore
import img09 from "../assets/images/ilustracion_09.png";
// @ts-ignore
import img09_5 from "../assets/images/ilustracion_09_5.png";
// @ts-ignore
import img10 from "../assets/images/ilustracion_10.png";
// @ts-ignore
import img11 from "../assets/images/ilustracion_11.png";
// @ts-ignore
import img12 from "../assets/images/ilustracion_12.png";
// @ts-ignore
import img12_5 from "../assets/images/ilustracion_12_5.png";
// @ts-ignore
import img13 from "../assets/images/ilustracion_13.png";
// @ts-ignore
import img14 from "../assets/images/ilustracion_14.png";
// @ts-ignore
import img15 from "../assets/images/ilustracion_15.png";
// @ts-ignore
import img16 from "../assets/images/ilustracion_16.png";
// @ts-ignore
import img17 from "../assets/images/ilustracion_17.png";
// @ts-ignore
import img18 from "../assets/images/ilustracion_18.png";
// @ts-ignore
import img19 from "../assets/images/ilustracion_19.png";
// @ts-ignore
import img23 from "../assets/images/ilustracion_23.png";
// @ts-ignore
import imgAlzheimer from "../assets/images/ilustracion_24.png";
// @ts-ignore
import imgParkinson from "../assets/images/ilustracion_25.png";
// @ts-ignore
import imgHerido from "../assets/images/ilustracion_26.png";
// @ts-ignore
import imgMascotas from "../assets/images/ilustracion_27.png";
// @ts-ignore
import imgInanimado from "../assets/images/ilustracion_17_5.png";
// @ts-ignore
import imgClon from "../assets/images/ilustracion_17_6.png";
// @ts-ignore
import imgIa from "../assets/images/ilustracion_28.png";
// @ts-ignore
import imgElQueQueda from "../assets/images/ilustracion_eq.png";
// @ts-ignore
import imgMapaYTerritorio from "../assets/images/ilustracion_19.png";
// @ts-ignore
import imgPractica from "../assets/images/ilustracion_20.png";
// @ts-ignore
import imgOrilla from "../assets/images/ilustracion_21.png";
// @ts-ignore
import imgNotas from "../assets/images/ilustracion_22.png";
// @ts-ignore
import imgM87 from "../assets/images/ilustracion_m87.png";
// @ts-ignore
import imgMaquinaTiempo from "../assets/images/ilustracion_maquina_tiempo.jpg";
// @ts-ignore
import imgHorizonteEscritor from "../assets/images/ilustracion_horizonte_escritor.jpg";
// @ts-ignore
import imgOceanoOlas from "../assets/images/ilustracion_oceano_olas.png";
// @ts-ignore
import imgTp from "../assets/images/ilustracion_tp.png";
// @ts-ignore
import imgTxiki from "../assets/images/ilustracion_txiki.png";
// @ts-ignore
import imgEpilogo from "../assets/images/epilogo.jpg";
// @ts-ignore
import imgPortada from "../assets/images/portada.png";

// Manga pages (Edición Joven)
// @ts-ignore
import mangaCap1P1 from "../assets/images/manga/manga_cap1_p1.jpg";
// @ts-ignore
import mangaCap1P2 from "../assets/images/manga/manga_cap1_p2.jpg";
// @ts-ignore
import mangaCap2P3 from "../assets/images/manga/manga_cap2_p3.jpg";
// @ts-ignore
import mangaCap2P4 from "../assets/images/manga/manga_cap2_p4.jpg";
// @ts-ignore
import mangaCap3P5 from "../assets/images/manga/manga_cap3_p5.jpg";
// @ts-ignore
import mangaCap3P6 from "../assets/images/manga/manga_cap3_p6.jpg";
// @ts-ignore
import mangaCap4P7 from "../assets/images/manga/manga_cap4_p7.jpg";
// @ts-ignore
import mangaCap4P8 from "../assets/images/manga/manga_cap4_p8.jpg";
// @ts-ignore
import mangaCap5P9 from "../assets/images/manga/manga_cap5_p9.jpg";
// @ts-ignore
import mangaCap5P10 from "../assets/images/manga/manga_cap5_p10.jpg";
// @ts-ignore
import mangaCap6P11 from "../assets/images/manga/manga_cap6_p11.jpg";
// @ts-ignore
import mangaCap6P12 from "../assets/images/manga/manga_cap6_p12.jpg";
// @ts-ignore
import mangaCap7P13 from "../assets/images/manga/manga_cap7_p13.jpg";
// @ts-ignore
import mangaCap7P14 from "../assets/images/manga/manga_cap7_p14.jpg";

// @ts-ignore
import imgLadron from "../assets/images/ilustracion_ladron.png";
// @ts-ignore
import imgLuthier from "../assets/images/ilustracion_luthier.png";
// @ts-ignore
import img13_5 from "../assets/images/ilustracion_os_sufrimiento.png";
// @ts-ignore
import img18_6 from "../assets/images/ilustracion_ego_inconsciente.png";
// @ts-ignore
import img18_7 from "../assets/images/ilustracion_testigo_exclusion.png";
// @ts-ignore
import img17_7_alien from "../assets/images/ilustracion_alien.png";
// @ts-ignore
import img17_8_cosmic from "../assets/images/ilustracion_cosmic.png";
// @ts-ignore
import imgMatrix from "../assets/images/ilustracion_matrix.jpg";
// @ts-ignore
import imgRunner from "../assets/images/ilustracion_runner.jpg";
// @ts-ignore
import imgThreeBody from "../assets/images/ilustracion_trescuerpos.jpg";
// @ts-ignore
import imgSingularidades from "../assets/images/ilustracion_singularidades.png";
// @ts-ignore
import imgTraductor from "../assets/images/ilustracion_traductor.png";
// @ts-ignore
import imgMujerRojo from "../assets/images/ilustracion_mujer_rojo.png";
// @ts-ignore
import imgIdempotencia from "../assets/images/ilustracion_idempotencia.jpg";
// @ts-ignore
import imgPoemaSintonizadores from "../assets/images/ilustracion_poema_sintonizadores.jpg";
// @ts-ignore
import img23_1 from "../assets/images/ilustracion_23_1.jpg";
// @ts-ignore
import imgCalibracion from "../assets/images/ilustracion_calibracion.png";

// Import Cuentos illustrations
// @ts-ignore
import cuento01 from "../assets/images/cuentos/01_tarel_inicio.png";
// @ts-ignore
import cuentoAguaRetira from "../assets/images/cuentos/02_tarel_mitad.png";
// @ts-ignore
import cuento02 from "../assets/images/cuentos/03_burbuja.png";
// @ts-ignore
import cuento03 from "../assets/images/cuentos/04_nino.png";
// @ts-ignore
import cuento04 from "../assets/images/cuentos/05_red_nombres.png";
// @ts-ignore
import cuento05 from "../assets/images/cuentos/06_casa_respiraba.png";
// @ts-ignore
import cuento06 from "../assets/images/cuentos/07_maquina.png";
// @ts-ignore
import cuento07 from "../assets/images/cuentos/08_huesped.png";
// @ts-ignore
import cuento08 from "../assets/images/cuentos/09_puentes.png";
// @ts-ignore
import cuentoInt from "../assets/images/cuentos/10_borde_interludio.png";
// @ts-ignore
import cuento09 from "../assets/images/cuentos/11_musica.png";
// @ts-ignore
import cuento10 from "../assets/images/cuentos/12_cuerda.png";
// @ts-ignore
import cuento11 from "../assets/images/cuentos/13_ciudad.png";
// @ts-ignore
import cuentoSegundoCuaderno from "../assets/images/cuentos/segundo_cuaderno.png";
// @ts-ignore
import cuento12 from "../assets/images/cuentos/14_reloj.png";
// @ts-ignore
import cuento13 from "../assets/images/cuentos/15_sala.png";
// @ts-ignore
import cuento14 from "../assets/images/cuentos/16_perros.png";
// @ts-ignore
import cuentoEq from "../assets/images/cuentos/17_el_que_queda.png";
// @ts-ignore
import cuentoTxiki from "../assets/images/cuentos/18_txiki_cierre.png";
// @ts-ignore
// @ts-ignore
import cuentoM87 from "../assets/images/cuentos/19_M87_puente.png";
// @ts-ignore
import cuentoMussara from "../assets/images/cuentos/ilustracion_mussara.png";
// @ts-ignore
import cuentoSintonizadores from "../assets/images/cuentos/20_sintonizadores.png";

// Poemas background images
// @ts-ignore
import poemaElArchivista from "../assets/images/poemas/el_archivista.png";
// @ts-ignore
import poemaElRelojero from "../assets/images/poemas/el_relojero.png";
// @ts-ignore
import poemaElLuthier from "../assets/images/poemas/el_luthier.png";
// @ts-ignore
import poemaLaCancion from "../assets/images/poemas/la_cancion.png";
// @ts-ignore
import poemaArq1 from "../assets/images/poemas/clean_poema_arq1.png";
// @ts-ignore
import poemaArq2 from "../assets/images/poemas/clean_poema_arq2.png";
// @ts-ignore
import poemaArq3 from "../assets/images/poemas/clean_poema_arq3.png";
// @ts-ignore
import poemaArq4 from "../assets/images/poemas/clean_poema_arq4.png";
// @ts-ignore
import poemaGlosario from "../assets/images/poemas/clean_poema_glosario.png";
// @ts-ignore
import poemaFrialdad1 from "../assets/images/poemas/clean_frialdad_eco.jpg";
// @ts-ignore
import poemaFrialdad2 from "../assets/images/poemas/clean_frialdad_muerte.jpg";
// @ts-ignore
import poemaFrialdad3 from "../assets/images/poemas/clean_frialdad_vuelta.jpg";
// @ts-ignore
import poemaFrialdad4 from "../assets/images/poemas/clean_frialdad_ciber.jpg";
// @ts-ignore
import poemaFrialdad5 from "../assets/images/poemas/clean_frialdad_salida.jpg";
// @ts-ignore
import poemaFrialdad6 from "../assets/images/poemas/clean_frialdad_montse.jpg";

interface IllustrationViewerProps {
  illustration?: Illustration;
  variant?: "default" | "background";
  language?: "es" | "en";
}

const imageMap: Record<string, string> = {
  tarel_agua_portada: imgTarelAguaPortada,
  cartografia_eco_p1: imgCartografiaEcoP1,
  poemas_pintores_p1: imgPoemasPintoresP1,
  poemas_pintores_p2: imgPoemasPintoresP2,
  poemas_pintores_p3: imgPoemasPintoresP3,
  poemas_pintores_p4: imgPoemasPintoresP4,
  poemas_pintores_p5: imgPoemasPintoresP5,
  poemas_pintores_p6: imgPoemasPintoresP6,
  poemas_pintores_p7: imgPoemasPintoresP7,
  poemas_pintores_p8: imgPoemasPintoresP8,
  tarel_agua_p1: imgTarelAguaP1,
  tarel_agua_p2: imgTarelAguaP2,
  tarel_agua_p3: imgTarelAguaP3,
  tarel_agua_p4: imgTarelAguaP4,
  tarel_agua_p5: imgTarelAguaP5,
  tarel_agua_p6: imgTarelAguaP6,
  tarel_agua_p7: imgTarelAguaP7,
  il01: img01,
  il02: img02,
  il_prologo: imgPrologo,
  il_tarel: imgTarel,
  il04: img04,
  il05: img05,
  il05_5: img05_5,
  il06: img06,
  il07: img07,
  il08: img08,
  il_int: imgInt,
  il09: img09,
  il09_5: img09_5,
  il10: img10,
  il11: img11,
  il12: img12,
  il12_5: img12_5,
  il13: img13,
  il14: img14,
  il15: img15,
  il16: img16,
  il17: img17,
  il18: img18,
  il19: img19,
  il23: img23,
  il_alzheimer: imgAlzheimer,
  il_parkinson: imgParkinson,
  il_herido: imgHerido,
  il_mascotas: imgMascotas,
  il_inanimado: imgInanimado,
  il_clon: imgClon,
  il_ia: imgIa,
  il_el_que_queda: imgElQueQueda,
  il_mapayterritorio: img18, // Matches "El límite del experimento" description (ilustracion_18)
  il_practica: imgPractica,
  il_orilla: imgOrilla,
  il_notas: imgNotas,
  il_m87: imgM87,
  il_maquina_tiempo: imgMaquinaTiempo,
  il_horizonte_escritor: imgHorizonteEscritor,
  il_oceano_olas: imgOceanoOlas,
  il_tp: imgTp,
  il_txiki: imgTxiki,
  il_epilogo: imgEpilogo,
  il_portada: imgPortada,
  manga_cap1_p1: mangaCap1P1,
  manga_cap1_p2: mangaCap1P2,
  manga_cap2_p3: mangaCap2P3,
  manga_cap2_p4: mangaCap2P4,
  manga_cap3_p5: mangaCap3P5,
  manga_cap3_p6: mangaCap3P6,
  manga_cap4_p7: mangaCap4P7,
  manga_cap4_p8: mangaCap4P8,
  manga_cap5_p9: mangaCap5P9,
  manga_cap5_p10: mangaCap5P10,
  manga_cap6_p11: mangaCap6P11,
  manga_cap6_p12: mangaCap6P12,
  manga_cap7_p13: mangaCap7P13,
  manga_cap7_p14: mangaCap7P14,
  il_ladron: imgLadron,
  cuento_ladron: imgLadron,
  il_luthier: imgLuthier,
  cuento_luthier: imgLuthier,
  il13_5: img13_5,
  il18_6: img18_6,
  il18_7: img18_7,
  il17_7_alien: img17_7_alien,
  il17_8_cosmic: img17_8_cosmic,
  il_matrix: imgMatrix,
  il_runner: imgRunner,
  il_threebody: imgThreeBody,
  il_singularidades: imgSingularidades,
  il_traductor: imgTraductor,
  il_mujer_rojo: imgMujerRojo,
  il22_1: imgIdempotencia,
  poema_sintonizadores: imgPoemaSintonizadores,
  il23_1: img23_1,
  il_calibracion: imgCalibracion,

  // "Cartografía de tres singularidades" — public reference images of the
  // actual paintings discussed (hotlinked from Wikipedia/Wikimedia Commons)
  cart_guernica: "https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg",
  cart_construccion: "https://upload.wikimedia.org/wikipedia/en/8/89/SalvadorDali-SoftConstructionWithBeans.jpg",
  cart_narciso: "https://upload.wikimedia.org/wikipedia/en/2/21/Metamorphosis_of_Narcissus.jpg",
  cart_relojes: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
  cart_desintegracion: "https://upload.wikimedia.org/wikipedia/en/7/7c/DisintegrationofPersistence.jpg",
  cart_corpus: "https://upload.wikimedia.org/wikipedia/en/0/09/Dali_Crucifixion_hypercube.jpg",
  cart_avignon: "https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg",
  cart_llorona: "https://upload.wikimedia.org/wikipedia/en/1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg",
  cart_meninas: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/1280px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg",
  cart_masia: "https://upload.wikimedia.org/wikipedia/en/3/33/TheFarmMiro21to22.jpg",
  cart_constelaciones: "https://upload.wikimedia.org/wikipedia/en/3/39/MiroMorningStar.JPG",

  // "Historia de un relevo" — real news photos of the 2026 World Cup final
  // goal and the 2007 Messi/Yamal charity-calendar photo
  cart_ferran_gol: "https://d3i6fh83elv35t.cloudfront.net/static/2026/07/2026-07-19T215113Z_1479842861_UP1EM7J1OPCXN_RTRMADP_3_SOCCER-WORLDCUP-ESP-ARG-1024x706.jpg",
  cart_messi_yamal: "https://i.abcnewsfe.com/a/098c18d3-8236-4244-8a8a-85a58d51d9ed/messi-yamal-3-ap-gmh-260717_1784294935058_hpMain_4x3.jpg",

  // "El traductor" — real 1865 chalk portrait of George Eliot by Frederic
  // William Burton, public domain (NPG 669), hotlinked from Wikimedia Commons
  cart_eliot: "https://upload.wikimedia.org/wikipedia/commons/1/1b/George_Eliot_(1865)_by_Frederick_William_Burton.jpg",

  // Cuentos illustrations mapping
  cuento_01: cuento01,
  cuento_agua_retira: cuentoAguaRetira,
  cuento_02: cuento02,
  cuento_03: cuento03,
  cuento_04: cuento04,
  cuento_05: cuento05,
  cuento_06: cuento06,
  cuento_07: cuento07,
  cuento_08: cuento08,
  cuento_int: cuentoInt,
  cuento_09: cuento09,
  cuento_10: cuento10,
  cuento_11: cuento11,
  cuento_segundo_cuaderno: cuentoSegundoCuaderno,
  cuento_12: cuento12,
  cuento_13: cuento13,
  cuento_14: cuento14,
  cuento_eq: cuentoEq,
  cuento_txiki: cuentoTxiki,
  cuento_m87: cuentoM87,
  cuento_mussara: cuentoMussara,
  cuento_sintonizadores: cuentoSintonizadores,

  // Poem backgrounds mapping
  poema_arq1: poemaElArchivista,
  poema_arq2: poemaElRelojero,
  poema_arq3: poemaElLuthier,
  poema_arq4: poemaLaCancion,
  poema_arq5: poemaArq1,
  poema_arq6: poemaArq2,
  poema_arq7: poemaArq3,
  poema_arq8: poemaArq4,
  poema_glosario: poemaGlosario,
  poema_frialdad1: poemaFrialdad1,
  poema_frialdad2: poemaFrialdad2,
  poema_frialdad3: poemaFrialdad3,
  poema_frialdad4: poemaFrialdad4,
  poema_frialdad5: poemaFrialdad5,
  poema_frialdad6: poemaFrialdad6,
};

export const IllustrationViewer: React.FC<IllustrationViewerProps> = ({ illustration, variant = "default", language = "es" }) => {
  if (!illustration) return null;

  const zoomHint = language === "en" ? "Double click to enlarge" : "Doble clic para ampliar";
  const closeLabel = language === "en" ? "Close enlarged view" : "Cerrar ampliación";

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const imgSrc = imageMap[illustration.id];

  if (variant === "background") {
    if (!imgSrc) return null;
    return (
      <motion.img
        src={imgSrc}
        alt={illustration.title}
        className="w-full h-full object-cover select-none pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        referrerPolicy="no-referrer"
      />
    );
  }

  if (!imgSrc) {
    return (
      <div className="w-full aspect-square max-w-[280px] sm:max-w-[340px] mx-auto bg-slate-950/40 border border-amber-500/10 rounded-2xl p-4 flex items-center justify-center relative shadow-lg shadow-amber-500/2 overflow-hidden group">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/30" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/30" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/30" />
        <div className="w-full h-full flex flex-col items-center justify-center border border-amber-500/10 rounded-xl bg-amber-500/5 p-6 text-center">
          <span className="text-amber-500 font-display text-sm font-semibold mb-2">{illustration.title}</span>
          <span className="text-gray-400 font-sans text-xs max-w-xs">{illustration.description}</span>
        </div>
      </div>
    );
  }

  const isMangaPage = illustration.id.startsWith("manga_");

  const isOriginalFormat =
    isMangaPage ||
    illustration.id.includes("txiki") ||
    illustration.id.includes("epilogo") ||
    illustration.id.includes("sintonizadores") ||
    illustration.id === "il_mujer_rojo";

  return (
    <>
      <div
        className={`flex flex-col items-center gap-2.5 mx-auto w-full ${
          isMangaPage ? "max-w-[420px] sm:max-w-[520px] md:max-w-[620px]" : "max-w-[280px] sm:max-w-[340px] md:max-w-[480px]"
        }`}
      >
      <div
        onDoubleClick={() => setIsOpen(true)}
        className={`w-full ${isOriginalFormat ? "" : "aspect-square"} bg-slate-950/40 border border-amber-500/10 rounded-2xl p-4 flex items-center justify-center relative shadow-lg shadow-amber-500/2 overflow-hidden group cursor-zoom-in select-none`}
        title={zoomHint}
      >
        {/* Absolute corner designs */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/30" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/30" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/30" />

        <motion.img
          src={imgSrc}
          alt={illustration.title}
          className={`rounded-xl transition-transform duration-300 group-hover:scale-[1.02] ${isOriginalFormat ? "w-full h-auto object-contain" : "w-full h-full object-cover"}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          referrerPolicy="no-referrer"
        />

        {/* Hover zoom badge */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-amber-500/20 text-amber-500/70 p-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none text-[10px] font-sans font-medium tracking-wide">
          {zoomHint}
        </div>
      </div>
      {isOriginalFormat && illustration.description && (
        <p className="text-[11px] sm:text-xs text-gray-400 font-sans italic max-w-[260px] sm:max-w-[400px] text-center leading-snug">
          {illustration.description}
        </p>
      )}
    </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-900 border border-amber-500/20 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer hover:border-amber-500/40 shadow-lg"
              aria-label={closeLabel}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title and description in modal bottom */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute bottom-6 left-5 right-5 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xl w-auto bg-slate-900/90 border border-amber-500/20 rounded-xl p-4 text-center backdrop-blur-sm pointer-events-none shadow-2xl"
            >
              <h4 className="font-display font-semibold text-amber-500 text-sm">
                {illustration.title}
              </h4>
              <p className="text-xs text-gray-400 font-sans mt-1.5 leading-relaxed">
                {illustration.description}
              </p>
            </motion.div>

            {/* Zoomed Image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              src={imgSrc}
              alt={illustration.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-amber-500/10 pointer-events-auto select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
