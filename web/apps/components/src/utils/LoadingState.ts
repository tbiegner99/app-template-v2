export enum LoadingStateStatus {
  Unloaded = 'unloaded',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

export class LoadingState<T> {
  readonly status: LoadingStateStatus;
  readonly data: T | null;
  readonly error?: Error;

  private constructor(status: LoadingStateStatus, data: T | null = null, error?: Error) {
    this.status = status;
    this.data = data;
    this.error = error;
  }

  get value(): T {
    if (this.data === null) {
      throw new Error('Cannot access value when not in loaded state');
    }
    return this.data;
  }

  isUnloaded(): boolean { return this.status === LoadingStateStatus.Unloaded; }
  isLoading(): boolean { return this.status === LoadingStateStatus.Loading; }
  isLoaded(): boolean { return this.status === LoadingStateStatus.Loaded; }
  isError(): boolean { return this.status === LoadingStateStatus.Error; }
  hasValue(): boolean { return this.data !== null; }
  /** @deprecated use hasValue() */
  hasData(): boolean { return this.hasValue(); }

  static unloaded<U>(): LoadingState<U> {
    return new LoadingState<U>(LoadingStateStatus.Unloaded);
  }
  /** @deprecated use unloaded() */
  static notLoaded<U>(): LoadingState<U> {
    return LoadingState.unloaded<U>();
  }
  static loading<U>(data?: U): LoadingState<U> {
    return new LoadingState<U>(LoadingStateStatus.Loading, data ?? null);
  }
  static loaded<U>(data: U): LoadingState<U> {
    return new LoadingState<U>(LoadingStateStatus.Loaded, data);
  }
  static error<U>(error: Error): LoadingState<U> {
    return new LoadingState<U>(LoadingStateStatus.Error, null, error);
  }
}
