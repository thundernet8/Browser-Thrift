import { TApplicationExceptionType } from "./thrift-type"
import { inherits } from "util"

// export class InputBufferUnderrunError extends Error {
//     constructor (message?: string) {
//         super(message)
//         this.name = InputBufferUnderrunError.name
//     }
// }

export function InputBufferUnderrunError(message?: string) {
    Error.call(this)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
}

inherits(InputBufferUnderrunError, Error)

export class TApplicationException extends Error {
    type: TApplicationExceptionType;
    constructor (type?: TApplicationExceptionType, message?: string) {
        super(message)
        this.name = TApplicationException.name
        this.type = TApplicationExceptionType.UNKNOWN
    }
}
