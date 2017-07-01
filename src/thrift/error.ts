import { TApplicationExceptionType } from "./thrift-type"

export class InputBufferUnderrunError extends Error {
    constructor (message?: string) {
        super(message)
    }
}

export class TApplicationException extends Error {
    type: TApplicationExceptionType;
    constructor (type?: TApplicationExceptionType, message?: string) {
        super(message)
        this.name = TApplicationException.name
        this.type = TApplicationExceptionType.UNKNOWN
    }
}
