var POW_8 = Math.pow(2, 8);
var POW_16 = Math.pow(2, 16);
var POW_24 = Math.pow(2, 24);
var POW_32 = Math.pow(2, 32);
var POW_40 = Math.pow(2, 40);
var POW_48 = Math.pow(2, 48);
var POW_52 = Math.pow(2, 52);
var POW_1022 = Math.pow(2, 1022);
export var readByte = function (b) {
    return b > 127 ? b - 256 : b;
};
export var readI16 = function (buf, offset) {
    offset = offset || 0;
    var v = buf[offset + 1];
    v += buf[offset] << 8;
    if (buf[offset] & 128) {
        v -= POW_16;
    }
    return v;
};
export var readI32 = function (buf, offset) {
    offset = offset || 0;
    var v = buf[offset + 3];
    v += buf[offset + 2] << 8;
    v += buf[offset + 1] << 16;
    v += buf[offset] * POW_24;
    if (buf[offset] & 0x80) {
        v -= POW_32;
    }
    return v;
};
export var writeI16 = function (buf, v) {
    buf[1] = v & 0xff;
    v >>= 8;
    buf[0] = v & 0xff;
    return buf;
};
export var writeI32 = function (buf, v) {
    buf[3] = v & 0xff;
    v >>= 8;
    buf[2] = v & 0xff;
    v >>= 8;
    buf[1] = v & 0xff;
    v >>= 8;
    buf[0] = v & 0xff;
    return buf;
};
export var readDouble = function (buf, offset) {
    offset = offset || 0;
    var signed = buf[offset] & 0x80;
    var e = (buf[offset + 1] & 0xF0) >> 4;
    e += (buf[offset] & 0x7F) << 4;
    var m = buf[offset + 7];
    m += buf[offset + 6] << 8;
    m += buf[offset + 5] << 16;
    m += buf[offset + 4] * POW_24;
    m += buf[offset + 3] * POW_32;
    m += buf[offset + 2] * POW_40;
    m += (buf[offset + 1] & 0x0F) * POW_48;
    switch (e) {
        case 0:
            e = -1022;
            break;
        case 2047:
            return m ? NaN : (signed ? -Infinity : Infinity);
        default:
            m += POW_52;
            e -= 1023;
    }
    if (signed) {
        m *= -1;
    }
    return m * Math.pow(2, e - 52);
};
export var writeDouble = function (buf, v) {
    var m, e, c;
    buf[0] = (v < 0 ? 0x80 : 0x00);
    v = Math.abs(v);
    if (v !== v) {
        m = 2251799813685248;
        e = 2047;
    }
    else if (v === Infinity) {
        m = 0;
        e = 2047;
    }
    else {
        e = Math.floor(Math.log(v) / Math.LN2);
        c = Math.pow(2, -e);
        if (v * c < 1) {
            e--;
            c *= 2;
        }
        if (e + 1023 >= 2047) {
            m = 0;
            e = 2047;
        }
        else if (e + 1023 >= 1) {
            m = (v * c - 1) * POW_52;
            e += 1023;
        }
        else {
            m = (v * POW_1022) * POW_52;
            e = 0;
        }
    }
    buf[1] = (e << 4) & 0xf0;
    buf[0] |= (e >> 4) & 0x7f;
    buf[7] = m & 0xff;
    m = Math.floor(m / POW_8);
    buf[6] = m & 0xff;
    m = Math.floor(m / POW_8);
    buf[5] = m & 0xff;
    m = Math.floor(m / POW_8);
    buf[4] = m & 0xff;
    m >>= 8;
    buf[3] = m & 0xff;
    m >>= 8;
    buf[2] = m & 0xff;
    m >>= 8;
    buf[1] |= m & 0x0f;
    return buf;
};
