/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const POW_8 = Math.pow(2, 8)
const POW_16 = Math.pow(2, 16)
const POW_24 = Math.pow(2, 24)
const POW_32 = Math.pow(2, 32)
const POW_40 = Math.pow(2, 40)
const POW_48 = Math.pow(2, 48)
const POW_52 = Math.pow(2, 52)
const POW_1022 = Math.pow(2, 1022)

export const readByte = (b: number) => {
    return b > 127 ? b - 256 : b
}

export const readI16 = (buf: Buffer, offset?: number) => {
    offset = offset || 0
    let v = buf[offset + 1]
    v += buf[offset] << 8
    if (buf[offset] & 128) {
        v -= POW_16
    }
    return v
}

export const readI32 = (buf: Buffer, offset?: number) => {
    offset = offset || 0
    let v = buf[offset + 3]
    v += buf[offset + 2] << 8
    v += buf[offset + 1] << 16
    v += buf[offset] * POW_24
    if (buf[offset] & 0x80) {
        v -= POW_32
    }
    return v
}

export const writeI16 = (buf: Buffer, v: number) => {
    buf[1] = v & 0xff
    v >>= 8
    buf[0] = v & 0xff
    return buf
}

export const writeI32 = (buf: Buffer, v: number) => {
    buf[3] = v & 0xff
    v >>= 8
    buf[2] = v & 0xff
    v >>= 8;
    buf[1] = v & 0xff
    v >>= 8
    buf[0] = v & 0xff
    return buf
}

export const readDouble = (buf: Buffer, offset?: number) => {
    offset = offset || 0
    let signed = buf[offset] & 0x80
    let e = (buf[offset + 1] & 0xF0) >> 4
    e += (buf[offset] & 0x7F) << 4

    let m = buf[offset + 7]
    m += buf[offset + 6] << 8
    m += buf[offset + 5] << 16
    m += buf[offset + 4] * POW_24
    m += buf[offset + 3] * POW_32
    m += buf[offset + 2] * POW_40
    m += (buf[offset + 1] & 0x0F) * POW_48

    switch (e) {
        case 0:
            e = -1022
            break
        case 2047:
            return m ? NaN : (signed ? -Infinity : Infinity)
        default:
            m += POW_52
            e -= 1023
    }

    if (signed) {
        m *= -1
    }

    return m * Math.pow(2, e - 52)
}

/*
 * Based on code from the jspack module:
 * http://code.google.com/p/jspack/
 */
export const writeDouble = (buf: Buffer, v: number) => {
    let m, e, c

    buf[0] = (v < 0 ? 0x80 : 0x00)

    v = Math.abs(v)
    if (v !== v) {
        // NaN, use QNaN IEEE format
        m = 2251799813685248
        e = 2047
    } else if (v === Infinity) {
        m = 0
        e = 2047
    } else {
        e = Math.floor(Math.log(v) / Math.LN2)
        c = Math.pow(2, -e)
        if (v * c < 1) {
            e--
            c *= 2
        }

        if (e + 1023 >= 2047) {
            // Overflow
            m = 0
            e = 2047
        }
        else if (e + 1023 >= 1) {
            // Normalized - term order matters, as Math.pow(2, 52-e) and v*Math.pow(2, 52) can overflow
            m = (v * c - 1) * POW_52
            e += 1023
        }
        else {
            // Denormalized - also catches the '0' case, somewhat by chance
            m = (v * POW_1022) * POW_52
            e = 0;
        }
    }

    buf[1] = (e << 4) & 0xf0
    buf[0] |= (e >> 4) & 0x7f

    buf[7] = m & 0xff
    m = Math.floor(m / POW_8)
    buf[6] = m & 0xff
    m = Math.floor(m / POW_8)
    buf[5] = m & 0xff
    m = Math.floor(m / POW_8)
    buf[4] = m & 0xff
    m >>= 8
    buf[3] = m & 0xff
    m >>= 8
    buf[2] = m & 0xff
    m >>= 8
    buf[1] |= m & 0x0f

    return buf
}
