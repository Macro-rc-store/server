export default interface module {
  import(moduleName: string): any;
  export(moduleName: string, module: any): void;
}