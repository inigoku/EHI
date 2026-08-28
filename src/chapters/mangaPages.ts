// @ts-ignore
import portada from "../assets/images/manga/manga_portada.jpg";
// @ts-ignore
import cap1p1 from "../assets/images/manga/manga_cap1_p1.jpg";
// @ts-ignore
import cap1p2 from "../assets/images/manga/manga_cap1_p2.jpg";
// @ts-ignore
import cap2p3 from "../assets/images/manga/manga_cap2_p3.jpg";
// @ts-ignore
import cap2p4 from "../assets/images/manga/manga_cap2_p4.jpg";
// @ts-ignore
import cap3p5 from "../assets/images/manga/manga_cap3_p5.jpg";
// @ts-ignore
import cap3p6 from "../assets/images/manga/manga_cap3_p6.jpg";
// @ts-ignore
import cap4p7 from "../assets/images/manga/manga_cap4_p7.jpg";
// @ts-ignore
import cap4p8 from "../assets/images/manga/manga_cap4_p8.jpg";
// @ts-ignore
import cap5p9 from "../assets/images/manga/manga_cap5_p9.jpg";
// @ts-ignore
import cap5p10 from "../assets/images/manga/manga_cap5_p10.jpg";
// @ts-ignore
import cap6p11 from "../assets/images/manga/manga_cap6_p11.jpg";
// @ts-ignore
import cap6p12 from "../assets/images/manga/manga_cap6_p12.jpg";
// @ts-ignore
import cap7p13 from "../assets/images/manga/manga_cap7_p13.jpg";
// @ts-ignore
import cap7p14 from "../assets/images/manga/manga_cap7_p14.jpg";

// The full page-by-page reading order of the manga (Edición Joven), independent
// of the prose chapter split — used by the full-screen manga reader to flip
// through the book "como un manga de verdad". Each page knows which prose
// chapter (joven1..joven7) it belongs to, so the reader can jump back and
// forth between manga mode and text mode without losing its place.
export interface MangaPage {
  id: string;
  chapterId: string;
  pageNumber: number;
  src: string;
  /** Optional narration caption overlaid on the page (e.g. a line of the original prose). */
  caption?: string;
}

export const mangaPages: MangaPage[] = [
  { id: "manga_portada", chapterId: "joven1", pageNumber: 0, src: portada },
  { id: "manga_cap1_p1", chapterId: "joven1", pageNumber: 1, src: cap1p1 },
  { id: "manga_cap1_p2", chapterId: "joven1", pageNumber: 2, src: cap1p2 },
  { id: "manga_cap2_p3", chapterId: "joven2", pageNumber: 3, src: cap2p3 },
  { id: "manga_cap2_p4", chapterId: "joven2", pageNumber: 4, src: cap2p4 },
  { id: "manga_cap3_p5", chapterId: "joven3", pageNumber: 5, src: cap3p5 },
  { id: "manga_cap3_p6", chapterId: "joven3", pageNumber: 6, src: cap3p6 },
  { id: "manga_cap4_p7", chapterId: "joven4", pageNumber: 7, src: cap4p7 },
  { id: "manga_cap4_p8", chapterId: "joven4", pageNumber: 8, src: cap4p8 },
  { id: "manga_cap5_p9", chapterId: "joven5", pageNumber: 9, src: cap5p9 },
  { id: "manga_cap5_p10", chapterId: "joven5", pageNumber: 10, src: cap5p10 },
  { id: "manga_cap6_p11", chapterId: "joven6", pageNumber: 11, src: cap6p11 },
  { id: "manga_cap6_p12", chapterId: "joven6", pageNumber: 12, src: cap6p12 },
  { id: "manga_cap7_p13", chapterId: "joven7", pageNumber: 13, src: cap7p13 },
  { id: "manga_cap7_p14", chapterId: "joven7", pageNumber: 14, src: cap7p14 },
];
