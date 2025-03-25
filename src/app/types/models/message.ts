export interface Message {
  method: | 'init' | 'open' | 'error' | 'wakeup' | 'callProcedureResult' | 'updateResult' | 'ready' | 'initEnd' | 'close' | 'sleep' | 'callProcedure' | 'update';
  apiVersion: number;
  // method: string;
  entity: string;
  user: User;
  resource: Resource;
  team: Team;
  queue: Queue;
  activity: any;
  activityList: any[];
  inventoryList: any[];
  buttonId: string;
  securedData: SecuredData;
  openParams: any;
  allowedProcedures: AllowedProcedures;
  sendMessageAsJsObject?: boolean;
  sendInitData?: boolean;
}

export interface Format {
  date: string;
  long_date: string;
  time: string;
  datetime: string;
}

export interface User {
  allow_desktop_notification: number;
  allow_vibration: number;
  design_theme: number;
  providers: number[];
  format: Format;
  sound_theme: number;
  su_zid: number;
  uid: number;
  ulanguage: number;
  ulogin: string;
  uname: string;
  week_start: number;
  languageCode: string;
}

export interface Resource {
  external_id: string;
  pid: number;
  currentTime: string;
  deviceUTCDiffSeconds: number;
  timeZoneDiffSeconds: number;
}

export interface TeamMembers { }

export interface AssistingTo { }

export interface Team {
  teamMembers: TeamMembers;
  assistingTo: AssistingTo;
  assistingMe: any[];
}

export interface Queue {
  date: string;
  status: string;
  isActual: boolean;
}

export interface SecuredData {
  ofscRestClientId: string;
  ofscRestSecretId: string;
  urlOFSC: string;
}

export interface AllowedProcedures {
  openLink: boolean;
  searchParts: boolean;
  searchPartsContinue: boolean;
  getParts: boolean;
  getPartsCatalogsStructure: boolean;
  print: boolean;
  share: boolean;
  updateIconData: boolean;
  updateButtonsIconData: boolean;
  getAccessToken: boolean;
}
