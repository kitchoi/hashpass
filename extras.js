"use strict";

var extras = {
  codec: {
    base64Upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    base64Lower: "abcdefghijklmnopqrstuvwxyz",
    base64Number: "0123456789",
    base64Other: "+/",
    base64Full: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    passwordSpecials: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
  },
  criteria: {},
  modify: {},
  api: {},
};


extras.codec.oneOfEach = {
    fromBits: function(a, char_sets) {
        var c = 0,
            d = "",
            f = 0,
            h = sjcl.bitArray.bitLength(a),
            chars;
        if (char_sets == null) char_sets = [extras.codec.base64Full];
        for (c = 0; 6 * d.length < h; c++) {
            chars = char_sets[d.length % char_sets.length];
            f = (sjcl.bitArray.extract(a, c, c+8)) % chars.length;
            d += chars.charAt(f);
        }
        return d
    },
}

extras.criteria.base64 = {
    chars_set: [extras.codec.base64Full],
    fromBits: function(bits) {
        return sjcl.codec.base64.fromBits(bits);
    }
}

extras.criteria.basic = {
    chars_set: [
        extras.codec.base64Upper,
        extras.codec.base64Lower,
        extras.codec.passwordSpecials,
        extras.codec.base64Number,
    ],
    fromBits: function(bits) {
        return extras.codec.oneOfEach.fromBits(bits, extras.criteria.basic.chars_set);
    }
}

// Replace a substring of string1 with string2, from a given index.
extras.modify.replace = function(string1, string2, index){
    var front = string1.slice(0, index);
    var len = Math.min(string2.length, string1.length - index);
    return front + string2.slice(0, len) + string1.slice(index+string2.length);
}

// Original behaviour of Hashpass
extras.api.base64 = function(bits, len) {
    return sjcl.codec.base64.fromBits(bits).slice(0, len);
}

// Include at least 1 upper case, 1 lower case, 1 number and 1 nonalphanumeric
extras.api.basic = function(bits, len) {
    var special = extras.criteria.basic.fromBits(bits).slice(0, 4);
    var hash = extras.criteria.base64.fromBits(bits).slice(0, len);
    var n_bits = Math.floor(Math.log(len-4)/Math.log(2));
    var i_replace = sjcl.bitArray.extract(bits, 0, n_bits);
    return extras.modify.replace(hash, special, i_replace);
}
