export type Locale = 'de' | 'en';

export type Os = 'mac' | 'windows';
export type Agent = 'claude' | 'codex';
export type Installed = 'yes' | 'no' | 'unsure';
export type Domain = 'have' | 'want' | 'later';

/** Where the visitor stands. `null` = not answered yet. */
export interface Situation {
  os: Os | null;
  agent: Agent | null;
  installed: Installed | null;
  domain: Domain | null;
}

/** What step 1 (set up the AI) needs. Shared by every guide. */
export interface AgentSetup {
  os: Os;
  agent: Agent;
  installed: Installed;
}

/** A fully answered situation — every prompt builder needs one. */
export interface Answered extends AgentSetup {
  domain: Domain;
}

export type StepId = 'start' | 'agent' | 'accounts' | 'build' | 'preview' | 'launch';

export interface SavedGuide {
  version: 3;
  situation: Situation;
  step: StepId;
  done: StepId[];
}

/* ---------- Guide 2: Google Search Console & SEO ---------- */

/** Which website goes on Google: the one from guide 1, or any other. */
export type SeoSite = 'diy' | 'other';
/** What the "other" website is built with. `code` = own code / a framework; `unknown` = the AI finds out. */
export type Platform = 'wordpress' | 'wix' | 'squarespace' | 'shopify' | 'jimdo' | 'webflow' | 'code' | 'unknown';

export interface SeoSituation {
  os: Os | null;
  agent: Agent | null;
  installed: Installed | null;
  site: SeoSite | null;
  /** Only asked (and required) when site = 'other'. */
  platform: Platform | null;
}

export interface SeoAnswered extends AgentSetup {
  site: SeoSite;
  /** `null` for the DIY website. */
  platform: Platform | null;
}

export type SeoStepId = 'start' | 'agent' | 'console' | 'seo' | 'keep';

export interface SavedSeoGuide {
  version: 1;
  situation: SeoSituation;
  step: SeoStepId;
  done: SeoStepId[];
}
