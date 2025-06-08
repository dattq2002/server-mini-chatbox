interface ResponseAnyTypes {
  status: number
  message: string
  data?: any
}
export class ResponseAny {
  status: number
  message: string
  data: any
  constructor(type: ResponseAnyTypes) {
    this.status = type.status
    this.message = type.message
    this.data = type.data
  }
}
interface ResponseGenericTypes<T> {
  status: number
  message: string
  data: T | null
}
export class ResponseGeneric<T> {
  status: number
  message: string
  data: T | null
  constructor(type: ResponseGenericTypes<T>) {
    this.status = type.status
    this.message = type.message
    this.data = type.data
  }
}
