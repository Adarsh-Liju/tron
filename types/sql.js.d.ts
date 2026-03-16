declare module 'sql.js' {
  export interface Database {
    exec(sql: string, options?: { [key: string]: any }): any[]
    run(sql: string, params?: any[]): void
    prepare(sql: string, params?: any[]): Statement
    export(): Uint8Array
    close(): void
  }

  export interface Statement {
    step(): boolean
    get(): any[]
    getColumnNames(): string[]
    bind(values: any[]): void
    reset(): void
    free(): void
  }

  export interface InitSqlJs {
    (config?: {
      locateFile?: (file: string) => string
    }): Promise<InitSqlJs>
    Database: new (data?: Uint8Array) => Database
  }

  const initSqlJs: InitSqlJs
  export default initSqlJs
  export { Database }
}
