interface ObjectConstructor {
  entries<T extends Record<PropertyKey, any>>(obj: T): [keyof T, T[keyof T]][];
}
