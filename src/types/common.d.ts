type KeysWithValueType<T, ValueType> = {
  [K in keyof T]: T[K] extends ValueType ? K : never;
}[keyof T];
