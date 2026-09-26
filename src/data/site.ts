export const SITE_NAME = "Japanese Club of D. S. Senanayake College";
export const SCHOOL_NAME = "D. S. Senanayake College";

export interface PublicTimelineItem {
	id: string;
	label: string;
	startDate: string;
	endDate?: string;
	displayDate: string;
	description: string;
}

export interface CeremonyHighlight {
	title: string;
	description: string;
}

export const club = {
	name: SITE_NAME,
	school: SCHOOL_NAME,
	introduction:
		"The Japanese Club of D. S. Senanayake College creates opportunities for students to explore Japanese language, arts, and traditions through cultural and educational activities. Through MUSUBI, the club invites school communities across Sri Lanka to connect, create, and celebrate their shared interest in Japan.",
	vision:
		"To build a bridge of friendship and understanding between Sri Lanka and Japan by nurturing students who embody discipline, respect, and cultural harmony, while fostering a lifelong appreciation for Japanese language and culture.",
	mission:
		"To promote understanding and appreciation of Japanese language, art, and traditions among students while developing leadership, teamwork, and communication skills through cultural and educational activities that strengthen international friendship and nurture globally minded individuals who value harmony, respect, and learning.",
} as const;

export const event = {
	name: "MUSUBI 2026",
	japaneseName: "むすび",
	fullName: "むすび | MUSUBI 2026",
	year: 2026,
	meaning: "connection, union, and the bringing together of people",
	introduction:
		"At this event, むすび (Musubi) means connection, union, and bringing people together. MUSUBI 2026 gives schools and students a shared programme of Japanese language, culture, and creativity before Japanese Day and the awards ceremony.",
	type: "Inter-school Japanese language and cultural competition programme and awards ceremony",
	organizer: SITE_NAME,
	date: "2026-11-03",
	dateLabel: "3 November 2026",
	venue: "Main Hall, D. S. Senanayake College, Colombo 07",
	audience: "Students, teachers, invited guests, organizers, and other participants",
	theme:
		"Japanese language and traditional culture presented alongside contemporary Japanese influences such as music, art, technology, fashion, anime culture, and urban Japan.",
} as const;

export const registration = {
	startDate: "2026-09-22",
	endDate: "2026-09-27",
	displayDate: "22 to 27 September 2026",
	schoolRegistrationFormUrl: null,
	linkLabel: "School registration form coming soon",
	description:
		"A school representative registers the school first. Students from registered schools can then submit entries through the Google Form for each online competition.",
} as const;

export const publicTimeline = [
	{
		id: "school-registration",
		label: "School registration",
		startDate: "2026-09-22",
		endDate: "2026-09-27",
		displayDate: "22 to 27 September 2026",
		description:
			"Participating schools register and nominate one representative for official updates.",
	},
	{
		id: "competition-window",
		label: "Competition programme and submissions",
		startDate: "2026-09-28",
		endDate: "2026-10-19",
		displayDate: "28 September to 19 October 2026",
		description: "The programme and submission window for inter-school competition entries.",
	},
	{
		id: "on-site-competitions",
		label: "On-site competitions",
		startDate: "2026-10-15",
		displayDate: "15 October 2026",
		description: "Dictation, speech, and quiz competitions take place at D. S. Senanayake College.",
	},
	{
		id: "submission-deadline",
		label: "Submission deadline",
		startDate: "2026-10-19",
		displayDate: "19 October 2026",
		description: "Closing date for online entries and physical artwork submissions.",
	},
	{
		id: "judging",
		label: "Judging and evaluation",
		startDate: "2026-10-20",
		endDate: "2026-10-25",
		displayDate: "20 to 25 October 2026",
		description: "Competition entries are evaluated ahead of the final ceremony.",
	},
	{
		id: "programme-preparation",
		label: "Awards and programme preparation",
		startDate: "2026-10-26",
		endDate: "2026-10-29",
		displayDate: "26 to 29 October 2026",
		description: "Results, certificates, prizes, and the Japanese Day programme are prepared.",
	},
	{
		id: "venue-preparation",
		label: "Venue preparation and rehearsals",
		startDate: "2026-10-30",
		endDate: "2026-11-02",
		displayDate: "30 October to 2 November 2026",
		description: "Final venue preparation and technical rehearsals take place.",
	},
	{
		id: "japanese-day",
		label: "MUSUBI 2026 Japanese Day",
		startDate: "2026-11-03",
		displayDate: "3 November 2026",
		description: "The inter-school awards ceremony and celebration of Japanese culture.",
	},
] as const satisfies readonly PublicTimelineItem[];

export const ceremonyHighlights = [
	{
		title: "Welcome and opening",
		description: "Japanese Day begins with the opening ceremony and welcome address.",
	},
	{
		title: "Participating schools",
		description: "The programme introduces and thanks the schools taking part in MUSUBI.",
	},
	{
		title: "Awards, certificates, and prizes",
		description: "Students receive the awards, certificates, and prizes for the competitions.",
	},
	{
		title: "Culture and entertainment",
		description:
			"The programme includes selected performances and Japanese cultural presentations.",
	},
	{
		title: "Contemporary Japan",
		description:
			"Visual presentations introduce selected themes from contemporary Japanese culture.",
	},
	{
		title: "Closing and photographs",
		description: "The day ends with the closing ceremony and group photographs.",
	},
] as const satisfies readonly CeremonyHighlight[];
