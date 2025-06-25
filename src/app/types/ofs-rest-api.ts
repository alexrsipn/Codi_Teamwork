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
  XA_CLIENTSIGN_RATING: number
}
