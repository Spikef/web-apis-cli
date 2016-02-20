/**
 * Usage: 辅助方法类
 * Author: Spikef < Spikef@Foxmail.com >
 * Copyright: Envirs Team < http://envirs.com >
 */

exports.compareVersion = function(v1, v2) {
    var marks = {
        equal: '=',
        larger: '>',
        smaller: '<'
    };

    if ( v1 == v2 ) {
        return marks.equal;
    } else {
        v1 = String(v1).replace(/[^\d\.]/g, '').split('.');
        v2 = String(v2).replace(/[^\d\.]/g, '').split('.');

        for (var i=0;i<v1.length;i++) {
            var uv1 = Number(v1[i]) || 0;
            var uv2 = Number(v2[i]) || 0;

            if ( uv1 > uv2 ) {
                return marks.larger;
            }

            if ( uv1 < uv2 ) {
                return marks.smaller;
            }
        }

        return marks.equal;
    }
};