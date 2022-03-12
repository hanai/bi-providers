interface LeveledLogMethod {
  (message: string, ...meta: any[]): any
  (message: any): any
  (infoObject: object): any
}

export interface Logger {
  info: LeveledLogMethod
  error: LeveledLogMethod
  warn: LeveledLogMethod
}
