export const competitionSlugs = [
	"japanese-singing",
	"article-writing",
	"presentation",
	"cosplay",
	"japanese-dictation",
	"japanese-speech",
	"japanese-quiz",
	"display-competition",
	"japanese-art",
] as const;

export type CompetitionSlug = (typeof competitionSlugs)[number];
export type CompetitionMode = "online" | "on-site" | "physical-submission";

export interface CompetitionDate {
	startDate: string;
	endDate?: string;
	displayDate: string;
}

export interface Competition {
	slug: CompetitionSlug;
	title: string;
	shortTitle: string;
	mode: CompetitionMode;
	modeLabel: string;
	dates: CompetitionDate;
	rulesPdfUrl: string;
	submissionFormUrl: string | null;
	location?: string;
	summary: string;
	submissionNote: string;
}

export interface CompetitionModeMeta {
	label: string;
	description: string;
}

export const competitionModeMeta = {
	online: {
		label: "Online submission",
		description: "Entries are submitted via Google Forms",
	},
	"on-site": {
		label: "On-site",
		description: "Competitors attend D. S. Senanayake College on the 15th of October",
	},
	"physical-submission": {
		label: "Physical submission",
		description: "Completed work is delivered to the school main gate",
	},
} as const satisfies Record<CompetitionMode, CompetitionModeMeta>;

const ONLINE_DATES = {
	startDate: "2026-09-28",
	endDate: "2026-10-19",
	displayDate: "28 September to 19 October 2026",
} as const satisfies CompetitionDate;

const ON_SITE_DATE = {
	startDate: "2026-10-15",
	displayDate: "15 October 2026",
} as const satisfies CompetitionDate;

const ART_DATES = {
	startDate: "2026-09-28",
	endDate: "2026-10-19",
	displayDate: "28 September to 19 October 2026",
} as const satisfies CompetitionDate;

const ONLINE_SUBMISSION_NOTE =
	"After their school registers, participants submit entries through the Google Form for their competition.";

export const competitions = [
	{
		slug: "japanese-singing",
		title: "Japanese Singing Competition",
		shortTitle: "Japanese Singing",
		mode: "online",
		modeLabel: "Online submission",
		dates: ONLINE_DATES,
		rulesPdfUrl: "/rules/japanese-singing-rules.pdf",
		submissionFormUrl: "https://forms.gle/5oNgXTj2eFVgSHSJA",
		summary: "Students can submit a Japanese song performance for this inter-school competition.",
		submissionNote: ONLINE_SUBMISSION_NOTE,
	},
	{
		slug: "article-writing",
		title: "Article Writing Competition",
		shortTitle: "Article Writing",
		mode: "online",
		modeLabel: "Online submission",
		dates: ONLINE_DATES,
		rulesPdfUrl: "/rules/article-writing-rules.pdf",
		submissionFormUrl: "https://forms.gle/pGzwuD9uAXgXDp8NA",
		summary: "Students can submit an original article for this inter-school writing competition.",
		submissionNote: ONLINE_SUBMISSION_NOTE,
	},
	{
		slug: "presentation",
		title: "Video Presentation Competition",
		shortTitle: "Video Presentation",
		mode: "online",
		modeLabel: "Online submission",
		dates: ONLINE_DATES,
		rulesPdfUrl: "/rules/video-presentation-rules.pdf",
		submissionFormUrl: null,
		summary: "Students can submit a video presentation for this inter-school competition.",
		submissionNote: ONLINE_SUBMISSION_NOTE,
	},
	{
		slug: "cosplay",
		title: "Cosplay Competition",
		shortTitle: "Cosplay",
		mode: "online",
		modeLabel: "Online submission",
		dates: ONLINE_DATES,
		rulesPdfUrl: "/rules/cosplay-rules.pdf",
		submissionFormUrl: null,
		summary: "Students can submit a cosplay entry for this inter-school competition.",
		submissionNote: ONLINE_SUBMISSION_NOTE,
	},
	{
		slug: "japanese-dictation",
		title: "Japanese Dictation",
		shortTitle: "Japanese Dictation",
		mode: "on-site",
		modeLabel: "On-site",
		dates: ON_SITE_DATE,
		rulesPdfUrl: "/rules/japanese-dictation-rules.pdf",
		submissionFormUrl: null,
		location: "D. S. Senanayake College, Colombo 07",
		summary: "Students will take part in a Japanese dictation competition at the college.",
		submissionNote:
			"This competition is planned to take place at D. S. Senanayake College on 15 October 2026.",
	},
	{
		slug: "japanese-speech",
		title: "Japanese Speech",
		shortTitle: "Japanese Speech",
		mode: "on-site",
		modeLabel: "On-site",
		dates: ON_SITE_DATE,
		rulesPdfUrl: "/rules/japanese-speech-rules.pdf",
		submissionFormUrl: null,
		location: "D. S. Senanayake College, Colombo 07",
		summary: "Students will deliver Japanese speeches in an on-site inter-school competition.",
		submissionNote:
			"This competition is planned to take place at D. S. Senanayake College on 15 October 2026.",
	},
	{
		slug: "japanese-quiz",
		title: "Japanese Quiz",
		shortTitle: "Japanese Quiz",
		mode: "on-site",
		modeLabel: "On-site",
		dates: ON_SITE_DATE,
		rulesPdfUrl: "/rules/japanese-quiz-rules.pdf",
		submissionFormUrl: null,
		location: "D. S. Senanayake College, Colombo 07",
		summary: "Students will test their knowledge in an on-site inter-school Japanese quiz.",
		submissionNote:
			"This competition is planned to take place at D. S. Senanayake College on 15 October 2026.",
	},
	{
		slug: "display-competition",
		title: "Japanese Display Competition",
		shortTitle: "Japanese display",
		mode: "physical-submission",
		modeLabel: "Physical submission",
		dates: ART_DATES,
		rulesPdfUrl: "/rules/japanese-display-rules.pdf",
		submissionFormUrl: null,
		location: "D. S. Senanayake College, Colombo 07",
		summary:
			"Students can enter their Japanese themed displays through a physical submission to the college.",
		submissionNote:
			"Completed displays will be delivered to the main gate of D. S. Senanayake College according to the official hand-in instructions.",
	},
	{
		slug: "japanese-art",
		title: "Japanese Art Competition",
		shortTitle: "Japanese Art",
		mode: "physical-submission",
		modeLabel: "Physical submission",
		dates: ART_DATES,
		rulesPdfUrl: "/rules/japanese-art-rules.pdf",
		submissionFormUrl: null,
		location: "Main gate, D. S. Senanayake College, Colombo 07",
		summary: "Students can enter original artwork through a physical submission to the college.",
		submissionNote:
			"Completed artwork will be delivered to the main gate of D. S. Senanayake College according to the official hand-in instructions.",
	},
] as const satisfies readonly Competition[];

export const competitionsByMode = {
	online: competitions.filter((competition) => competition.mode === "online"),
	"on-site": competitions.filter((competition) => competition.mode === "on-site"),
	"physical-submission": competitions.filter(
		(competition) => competition.mode === "physical-submission",
	),
} as const satisfies Record<CompetitionMode, readonly Competition[]>;

export function getCompetition(slug: string): Competition | undefined {
	return competitions.find((competition) => competition.slug === slug);
}

/** Accept only secure Google Forms links for registration and submissions. */
export function isGoogleFormUrl(value: string | null): value is string {
	if (!value) return false;

	try {
		const url = new URL(value);
		if (url.protocol !== "https:") return false;
		if (url.hostname === "forms.gle") return true;
		return url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/");
	} catch {
		return false;
	}
}
