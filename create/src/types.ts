export interface Metadata {
  size?: number
  mime?: string
  deletionCode?: string
  timezone?: string
  time?: number
  type?: 'url' | 'file'
  embedData?: string
}

export interface Domain {
  name: string
  real: boolean
}
