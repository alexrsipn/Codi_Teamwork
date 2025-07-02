export interface GetAnActivityTypeResponse {
  active: boolean,
  colors?: object,
  defaultDuration: number,
  features?: object,
  groupLabel?: string,
  label: string,
  name: string,
  segmentMaxDuration?: number,
  segmentMinDuration?: number,
  timeSlots?: any,
  translations: any
}

export interface UpdateAnActivityBodyParams {
  XA_CLIENTSIGN_RATING?: number,
  XA_STATUS_ORDER_SIEBEL?: string | null,
  XA_QUALITY_JOB?: string,
  XA_SERV_INTERNET?: number,
  XA_SERV_TV?: number,
  XA_SERV_TEL?: number,
  XA_OTHER_COMMENTS?: string
}
