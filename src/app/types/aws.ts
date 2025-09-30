export interface awsTokenResponse {
  status: number,
  detail: string,
  token: string,
  refreshToken: string,
  expires: number
}

export interface tecnicosAdicionalesRequest {
  apptnumber: string,
  technician: tecnicosAdicionales[]
}

export interface tecnicosAdicionales {
  idtecnico: string,
  nombre: string
}

export interface tecnicosAdicionalesResponse {
  status: number,
  detail: string
}
