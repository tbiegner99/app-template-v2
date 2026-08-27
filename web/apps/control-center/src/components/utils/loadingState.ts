export enum LoadingStateEnum {
  Unloaded = 'unloaded',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

export class LoadingState<T> {
  private constructor(
    public readonly state: LoadingStateEnum,
    public readonly data: T | null = null,
    public readonly error?: Error
  ) {}

  static unloaded<T>(): LoadingState<T> {
    return new LoadingState<T>(LoadingStateEnum.Unloaded);
  }

  static loading<T>(value?: T): LoadingState<T> {
    return new LoadingState<T>(LoadingStateEnum.Loading, value);
  }

  static loaded<T>(data: T): LoadingState<T> {
    return new LoadingState<T>(LoadingStateEnum.Loaded, data);
  }

  static error<T>(error: Error): LoadingState<T> {
    return new LoadingState<T>(LoadingStateEnum.Error, null, error);
  }

  get value(): T {
    if (this.data === null) {
      throw new Error('Cannot access value when not in loaded state');
    }
    return this.data;
  }

  hasValue(): boolean {
    return this.data !== null;
  }

  isUnloaded(): boolean {
    return this.state === LoadingStateEnum.Unloaded;
  }
  isLoading(): boolean {
    return this.state === LoadingStateEnum.Loading;
  }
  isLoaded(): boolean {
    return this.state === LoadingStateEnum.Loaded;
  }
  isError(): boolean {
    return this.state === LoadingStateEnum.Error;
  }
}
