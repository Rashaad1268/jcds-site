import type { CompetitionSlug } from "./competitions";

export interface CompetitionMedia {
	src: string;
	width: number;
	height: number;
	alt: string;
	caption: string;
	sourceUrl: string;
	credit: string;
	objectPosition?: string;
}

const origata: CompetitionMedia = {
	src: "/assets/images/origata-tehon.webp",
	width: 1200,
	height: 1600,
	alt: "A bound 1697 Japanese manual with an ivory paper cover and vertical handwritten label.",
	caption:
		"A historical reference: Models of Paper Folding (Origata Tehon), Japan, 1697. Origata concerns formal gift wrapping and is not a modern recreational-origami manual.",
	sourceUrl:
		"https://commons.wikimedia.org/wiki/File:%E6%8A%98%E5%BD%A2%E6%89%8B%E6%9C%AC-Models_of_Paper_Folding_%28Origata_tehon%29_MET_DP702086.jpg",
	credit: "The Metropolitan Museum of Art · CC0",
};

const forum: CompetitionMedia = {
	src: "/assets/images/tokyo-forum.webp",
	width: 1000,
	height: 1400,
	alt: "Curving steel trusses and suspended walkways inside the Tokyo International Forum.",
	caption:
		"Interior, Tokyo International Forum. A documentary view of contemporary Japanese civic architecture.",
	sourceUrl:
		"https://commons.wikimedia.org/wiki/File:Interior,_Tokyo_International_Forum_(11919754043).jpg",
	credit: "Stephen Kelly · CC BY 2.0 · Cropped and colour-adjusted",
	objectPosition: "50% 30%",
};

export const competitionMedia: Record<CompetitionSlug, CompetitionMedia> = {
	"japanese-singing": {
		src: "/assets/images/friendship-concert.webp",
		width: 1600,
		height: 1000,
		alt: "A student chorus performing together on a concert stage.",
		caption:
			"A documentary photograph from a 2026 U.S. and Japan Friendship Concert. The performers pictured are not MUSUBI participants.",
		sourceUrl: "https://commons.wikimedia.org/wiki/File:2026_Friendship_Concert_%289573199%29.jpg",
		credit: "U.S. Navy photo by Raquell Williams · Public Domain · Cropped",
	},
	"article-writing": origata,
	presentation: forum,
	cosplay: {
		src: "/assets/images/shinjuku-lanterns.webp",
		width: 1000,
		height: 1250,
		alt: "Warm lanterns reflected in the dark glass of a Shinjuku restaurant.",
		caption: "Shinjuku after dark, photographed as part of everyday contemporary Japan.",
		sourceUrl: "https://commons.wikimedia.org/wiki/File:Shinjuku_Lanterns_(11918417485).jpg",
		credit: "Stephen Kelly · CC BY 2.0 · Cropped and colour-adjusted",
		objectPosition: "62% 52%",
	},
	"japanese-dictation": origata,
	"japanese-speech": forum,
	"japanese-quiz": {
		src: "/assets/images/tokyo-station-night.webp",
		width: 1800,
		height: 1125,
		alt: "Tokyo Station’s illuminated red-brick Marunouchi building against the modern night skyline.",
		caption: "Tokyo Station at night: historical fabric and contemporary city life in one view.",
		sourceUrl: "https://commons.wikimedia.org/wiki/File:Tokyo-Station-Night.jpg",
		credit: "MaedaAkihiko · CC BY-SA 4.0 · Cropped and colour-adjusted",
		objectPosition: "46% 68%",
	},
	origami: origata,
	"japanese-art": {
		src: "/assets/images/rough-waves.webp",
		width: 1800,
		height: 1605,
		alt: "Rhythmic ink waves rolling across a gold-toned Japanese folding screen.",
		caption:
			"Ogata Kōrin, Rough Waves, early 18th century. A historical work from Japanese visual culture.",
		sourceUrl:
			"https://commons.wikimedia.org/wiki/File:%E6%B3%A2%E6%BF%A4%E5%9B%B3%E5%B1%8F%E9%A2%A8-Rough_Waves_MET_DT1615.jpg",
		credit: "The Metropolitan Museum of Art · CC0",
	},
};
