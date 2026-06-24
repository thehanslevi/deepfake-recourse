// Instrument library.
//
// Structured data, not hardcoded conditionals. Triage reads from this; it does
// not assert legal facts from model memory. Each statute entry carries its
// citation, the specific elements that must be met, and an official source URL.
// New statutes and the future federal lane (NO FAKES) are added here as data,
// not as code changes.
//
// Statute details were verified against current law (see source URLs). Every
// entry also carries `verifyNote` because the law is in flux; user-facing copy
// must always invite verification rather than assert a conclusion.

export interface StatuteEntry {
  jurisdiction: string; // two-letter state code
  name: string; // statute common name
  citation: string; // formal citation
  provision: string; // the specific provision(s) relied on
  enacted: string; // plain-language status / effective date
  coversVoice: boolean;
  coversImage: boolean;
  coversDigitalReplica: boolean; // explicit AI / digital-replica coverage
  // The elements a claimant must meet. These become user-facing copy, so they
  // are written to match the statute, not paraphrased loosely.
  elements: string[];
  sourceUrl: string;
  verifyNote: string;
}

// Keyed by jurisdiction for the v1 covered set.
export const STATUTES: Record<string, StatuteEntry> = {
  TN: {
    jurisdiction: "TN",
    name: "Tennessee Personal Rights Protection Act, as amended by the ELVIS Act",
    citation: "Tenn. Code Ann. § 47-25-1101 et seq.",
    provision:
      "§ 47-25-1105 (unauthorized use of name, photograph, likeness, or voice), as amended by the 2024 ELVIS Act to add voice",
    enacted: "ELVIS Act amendments effective July 1, 2024",
    coversVoice: true,
    coversImage: true,
    coversDigitalReplica: true,
    elements: [
      "The claimant is an individual with rights in their name, photograph, likeness, or voice.",
      "The defendant used, or made available, that voice or likeness, including a simulation of the voice, whether or not it is the actual voice.",
      "The use was without the individual's authorization.",
      "No statutory fair-use or expressive-work exception applies (for example news, commentary, or a protected creative work).",
    ],
    sourceUrl: "https://rightofpublicityroadmap.com/state_page/tennessee/",
    verifyNote:
      "The ELVIS Act is new and its exceptions are being interpreted by courts. Verify current law.",
  },
  CA: {
    jurisdiction: "CA",
    name: "California right of publicity (statutory)",
    citation: "Cal. Civ. Code § 3344",
    provision:
      "§ 3344(a) (knowing commercial use of name, voice, signature, photograph, or likeness); 'voice' and 'likeness' extended to digital replicas by SB 683",
    enacted:
      "Section 3344 long-standing; SB 683 digital-replica and injunctive-relief amendments effective January 1, 2026",
    coversVoice: true,
    coversImage: true,
    coversDigitalReplica: true,
    elements: [
      "The defendant knowingly used the claimant's name, voice, signature, photograph, or likeness (including a digital replica).",
      "The use was for advertising, selling, or soliciting the purchase of products, goods, or services.",
      "There was a direct connection between the use and the commercial purpose.",
      "The use was without the claimant's prior consent.",
      "The claimant was injured as a result.",
    ],
    sourceUrl:
      "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=3344.",
    verifyNote:
      "Section 3344 covers living persons; deceased persons fall under § 3344.1. SB 683 is recent. Verify current law.",
  },
  NY: {
    jurisdiction: "NY",
    name: "New York right of privacy / publicity",
    citation: "N.Y. Civ. Rights Law §§ 50, 51",
    provision:
      "§ 50 (use without written consent) and § 51 (civil action) for use of a living person's name, portrait, picture, or voice for advertising or trade",
    enacted:
      "Sections 50 and 51 long-standing; § 50-f separately covers deceased performers' digital replicas",
    coversVoice: true,
    coversImage: true,
    coversDigitalReplica: false,
    elements: [
      "The defendant used the claimant's name, portrait, picture, or voice.",
      "The use was for purposes of advertising or trade.",
      "The use occurred within New York State.",
      "The claimant did not give written consent.",
    ],
    sourceUrl: "https://rightofpublicityroadmap.com/state_page/new-york/",
    verifyNote:
      "Sections 50 and 51 cover living persons and require advertising or trade use; AI digital replicas of the living are not yet squarely covered. Deceased performers fall under § 50-f. Verify current law.",
  },
  WA: {
    jurisdiction: "WA",
    name: "Washington Personality Rights Act, as amended for forged digital likenesses",
    citation: "Wash. Rev. Code ch. 63.60 RCW",
    provision:
      "§ 63.60.050 (use of name, voice, signature, photograph, likeness, or forged digital likeness), as amended by SB 5886",
    enacted:
      "Personality Rights Act long-standing; SB 5886 forged-digital-likeness amendments effective June 10, 2026",
    coversVoice: true,
    coversImage: true,
    coversDigitalReplica: true,
    elements: [
      "The claimant is an actual, identifiable individual (fame and domicile are not required).",
      "The defendant used the claimant's name, voice, signature, photograph, or likeness, or a forged digital likeness, for a commercial or advertising purpose.",
      "For a forged digital likeness: it was digitally created or altered to be indistinguishable from genuine, misrepresents the individual's appearance, speech, or conduct, and is likely to deceive a reasonable person.",
      "The use was without the individual's written or otherwise valid consent.",
      "No statutory exception applies (for example fine art, news, or protected expressive works).",
    ],
    sourceUrl: "https://app.leg.wa.gov/rcw/default.aspx?cite=63.60&full=true",
    verifyNote:
      "The forged-digital-likeness amendments take effect June 10, 2026. Confirm the effective date applies to your facts and verify current law.",
  },
};

export function getStatute(jurisdiction: string): StatuteEntry | null {
  return STATUTES[jurisdiction] ?? null;
}

// Platform Terms-of-Service reporting channels. The intake platform is free
// text, so we match on aliases and fall back to a generic channel. Reporting
// URLs change often, hence `verifyNote` on each.
export interface PlatformChannel {
  key: string;
  label: string;
  aliases: string[];
  channel: string; // what to file and where
  url: string;
  verifyNote: string;
}

export const PLATFORM_CHANNELS: PlatformChannel[] = [
  {
    key: "youtube",
    label: "YouTube",
    aliases: ["youtube", "youtu.be", "yt"],
    channel:
      "YouTube privacy / impersonation complaint. File under the privacy complaint process for use of your likeness or voice.",
    url: "https://support.google.com/youtube/answer/142443",
    verifyNote: "Confirm the current YouTube reporting lane before filing.",
  },
  {
    key: "instagram",
    label: "Instagram / Meta",
    aliases: ["instagram", "ig", "meta", "facebook", "fb"],
    channel:
      "Instagram impersonation / likeness report. Use the privacy or likeness form when your face, voice, or identifiable features are used without permission.",
    url: "https://help.instagram.com/446663175382270",
    verifyNote: "Confirm the current Meta reporting lane before filing.",
  },
  {
    key: "tiktok",
    label: "TikTok",
    aliases: ["tiktok", "tik tok"],
    channel:
      "TikTok impersonation report (filed on the website, not the app). Describe the impersonation and provide identity proof.",
    url: "https://support.tiktok.com/en/safety-hc/report-a-problem/report-an-impersonation-account",
    verifyNote: "Confirm the current TikTok reporting lane before filing.",
  },
  {
    key: "spotify",
    label: "Spotify",
    aliases: ["spotify"],
    channel:
      "Spotify legal claim for voice impersonation. Submit through Spotify's form and select Publicity / Likeness as the report type.",
    url: "https://support.spotify.com/us/artists/article/music-that-impersonates-another-artists-voice/",
    verifyNote: "Confirm the current Spotify reporting lane before filing.",
  },
  {
    key: "x",
    label: "X (Twitter)",
    aliases: ["x", "twitter", "x.com"],
    channel:
      "X impersonation report. File an impersonation or misleading-identity report for the account or post.",
    url: "https://help.x.com/en/rules-and-policies/x-impersonation-policy",
    verifyNote: "Confirm the current X reporting lane before filing.",
  },
];

const GENERIC_CHANNEL: PlatformChannel = {
  key: "generic",
  label: "Host platform",
  aliases: [],
  channel:
    "Use the host's abuse, impersonation, or intellectual-property reporting channel, named in its Terms of Service. If the host has a designated DMCA agent, that contact also applies when a copyrighted work is involved.",
  url: "",
  verifyNote:
    "Identify the host's specific reporting channel from its Terms of Service before filing.",
};

export function matchPlatformChannel(platformInput: string): PlatformChannel {
  const needle = platformInput.trim().toLowerCase();
  if (!needle) return GENERIC_CHANNEL;
  for (const channel of PLATFORM_CHANNELS) {
    if (channel.aliases.some((a) => needle.includes(a))) return channel;
  }
  return GENERIC_CHANNEL;
}

// Routing-out resources. If the facts indicate one of these, triage stops and
// names the correct external resource instead of drafting.
export interface RouteOutResource {
  category: "ncii" | "election_deepfake" | "fraud";
  label: string;
  resourceName: string;
  resourceDetail: string;
  resourceUrl: string;
}

export const ROUTE_OUT_RESOURCES: Record<
  RouteOutResource["category"],
  RouteOutResource
> = {
  ncii: {
    category: "ncii",
    label: "Nonconsensual intimate imagery",
    resourceName: "Cyber Civil Rights Initiative (CCRI)",
    resourceDetail:
      "CCRI runs a crisis helpline and the StopNCII takedown tooling for nonconsensual intimate images. The federal TAKE IT DOWN Act also requires platforms to remove this content quickly.",
    resourceUrl: "https://cybercivilrights.org/",
  },
  election_deepfake: {
    category: "election_deepfake",
    label: "Election or political deepfake",
    resourceName: "State election authority and the FEC",
    resourceDetail:
      "Election-related synthetic media is governed by election law and specific state statutes. Report to your state election office and, for federal races, the Federal Election Commission, and consult an election-law attorney.",
    resourceUrl: "https://www.fec.gov/",
  },
  fraud: {
    category: "fraud",
    label: "Fraud or scam",
    resourceName: "FTC and IC3",
    resourceDetail:
      "Impersonation used to defraud is a crime. Report to the FTC at reportfraud.ftc.gov and, for online fraud, the FBI's IC3 at ic3.gov, and contact local law enforcement.",
    resourceUrl: "https://reportfraud.ftc.gov/",
  },
};
