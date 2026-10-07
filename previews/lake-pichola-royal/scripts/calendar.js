// scripts/calendar.js — Google Calendar links + .ics downloads.
// Formats match the original build exactly (UTC stamps, 4h for a ceremony,
// 5h for the wedding day).

function pad(n) {
	return String(n).padStart(2, "0");
}

// "YYYY-MM-DDTHH:MM:SSZ" — the compact stamp Google Calendar and .ics want.
function utcStamp(date) {
	return (
		date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
	);
}

// .ics text escaping (commas, semicolons, backslashes must be escaped)
function icsEscape(text) {
	return String(text)
		.replace(/\\/g, "\\\\")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;");
}

function downloadIcs(filename, lines) {
	const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function pad2(n) {
	return String(n).padStart(2, "0");
}

/* --------------------------------------------------------- whole wedding */

export function weddingGoogleUrl(d) {
	const text = `${d.groom} & ${d.bride} — Royal Wedding Celebration`;
	const start = new Date(d.date);
	const end = new Date(start.getTime() + 5 * 3600 * 1000);
	const details = `Cordially invited to celebrate the royal wedding of ${d.groom} & ${d.bride}. ${d.hashtag}`;
	return (
		"https://calendar.google.com/calendar/render?action=TEMPLATE" +
		`&text=${encodeURIComponent(text)}` +
		`&dates=${utcStamp(start)}/${utcStamp(end)}` +
		`&location=${encodeURIComponent(d.venue)}` +
		`&details=${encodeURIComponent(details)}`
	);
}

export function downloadWeddingIcs(d) {
	const start = new Date(d.date);
	const end = new Date(start.getTime() + 5 * 3600 * 1000);
	downloadIcs("royal-wedding.ics", [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//RoyalIvoryGold//Wedding//EN",
		"BEGIN:VEVENT",
		`UID:${Date.now()}@lake-pichola-wedding`,
		`DTSTAMP:${utcStamp(new Date())}`,
		`DTSTART:${utcStamp(start)}`,
		`DTEND:${utcStamp(end)}`,
		`SUMMARY:${icsEscape(`${d.groom} & ${d.bride} — Royal Wedding Celebration`)}`,
		`LOCATION:${icsEscape(d.venue)}`,
		`DESCRIPTION:${icsEscape(`Warmly invited to the royal wedding celebration of ${d.groom} & ${d.bride} at Lake Pichola, Udaipur. ${d.hashtag}`)}`,
		"END:VEVENT",
		"END:VCALENDAR",
	]);
}

/* ------------------------------------------------------------- one event */

export function eventGoogleUrl(d, ev) {
	const start = new Date(ev.isoDate);
	const end = new Date(start.getTime() + 4 * 3600 * 1000);
	const text = `${ev.title} — ${d.groom} & ${d.bride}`;
	const location = `${ev.venue}, Udaipur`;
	const details = `${ev.description}\nDress Code: ${ev.dressCode}`;
	return (
		"https://calendar.google.com/calendar/render?action=TEMPLATE" +
		`&text=${encodeURIComponent(text)}` +
		`&dates=${utcStamp(start)}/${utcStamp(end)}` +
		`&location=${encodeURIComponent(location)}` +
		`&details=${encodeURIComponent(details)}`
	);
}

export function downloadEventIcs(d, ev) {
	const start = new Date(ev.isoDate);
	const end = new Date(start.getTime() + 4 * 3600 * 1000);
	downloadIcs(`${ev.id}-celebration.ics`, [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//RoyalIvoryGold//Wedding//EN",
		"BEGIN:VEVENT",
		`UID:${ev.id}-${Date.now()}@lake-pichola-wedding`,
		`DTSTAMP:${utcStamp(new Date())}`,
		`DTSTART:${utcStamp(start)}`,
		`DTEND:${utcStamp(end)}`,
		`SUMMARY:${ev.title} — ${d.groom} & ${d.bride} Wedding`,
		`LOCATION:${ev.venue}, Udaipur`,
		`DESCRIPTION:${ev.description} | Dress Code: ${ev.dressCode}`,
		"END:VEVENT",
		"END:VCALENDAR",
	]);
}
