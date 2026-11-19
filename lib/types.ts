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

/** A fully answered situation — every prompt builder needs one. */
export interface Answered {
  os: Os;
  agent: Agent;
  installed: Installed;
  domain: Domain;
}

export type StepId = 'start' | 'agent' | 'accounts' | 'build' | 'preview' | 'launch';

export interface SavedGuide {
  version: 3;
  situation: Situation;
  step: StepId;
  done: StepId[];
}
