/* Paiement Décrypté – le poulpe, mascotte.
   Dessin paramétrique en SVG (aucune image) : un seul fichier pour le site,
   le prototype d'animation et la génération des images fixes.
   Repère : 400 x 400. Carte à gauche, terminal à droite, l'écran porte l'état du paiement. */
(function (root) {
  'use strict';

  var C = {
    body: '#1F4FD8', shadow: '#173FB0', suck: '#7C9BEE', ink: '#0E1B2C', mint: '#17B587',
    coral: '#E85C4A', screen: '#DCE5FB', key: '#5A6B85', num: '#8FA9F0', white: '#FFFFFF'
  };

  /* ---------- géométrie ---------- */
  function bz(p0, c1, c2, p3, t) {
    var u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1]];
  }
  function bezPts(a, b, c, d, n) { var r = []; for (var i = 0; i <= n; i++) r.push(bz(a, b, c, d, i / n)); return r; }
  function spiral(Cn, r0, a0, dir, sw, rE, m) {
    var a = [];
    for (var j = 1; j <= m; j++) {
      var t = j / m, an = a0 + dir * sw * t, r = r0 + (rE - r0) * t;
      a.push([Cn[0] + r * Math.cos(an), Cn[1] + r * Math.sin(an)]);
    }
    return a;
  }
  function wAt(i, n, w0, w1) { return w0 + (w1 - w0) * Math.pow(i / (n - 1), 0.75); }
  function band(c, w0, w1) {
    var n = c.length, L = [], R = [], nE, tE, wE;
    for (var i = 0; i < n; i++) {
      var a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
      var tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
      tx /= l; ty /= l;
      var w = wAt(i, n, w0, w1) / 2;
      L.push([c[i][0] - ty * w, c[i][1] + tx * w]);
      R.push([c[i][0] + ty * w, c[i][1] - tx * w]);
      nE = [-ty, tx]; tE = [tx, ty]; wE = w;
    }
    var cp = [], p = c[n - 1];
    for (var k = 1; k < 12; k++) {
      var an = Math.PI * k / 12;
      cp.push([p[0] + wE * (nE[0] * Math.cos(an) + tE[0] * Math.sin(an)), p[1] + wE * (nE[1] * Math.cos(an) + tE[1] * Math.sin(an))]);
    }
    return L.concat(cp, R.reverse());
  }
  /* Une tentacule : courbe de Bézier B→S, puis spirale autour de Cn. */
  function def(B, c1, c2, Cn, r0, dir, w0, w1, a0) {
    if (a0 == null) a0 = Math.PI / 2;
    return { B: B, c1: c1, c2: c2, C: Cn, r0: r0, dir: dir, w0: w0, w1: w1, a0: a0 };
  }
  function S(d) { return [d.C[0] + d.r0 * Math.cos(d.a0), d.C[1] + d.r0 * Math.sin(d.a0)]; }
  function mx(p) { return [400 - p[0], p[1]]; }
  function mir(d) { return def(mx(d.B), mx(d.c1), mx(d.c2), mx(d.C), d.r0, -d.dir, d.w0, d.w1, Math.PI - d.a0); }
  var NB = 22;
  function cline(d) { return bezPts(d.B, d.c1, d.c2, S(d), NB).concat(spiral(d.C, d.r0, d.a0, d.dir, 1.25 * Math.PI, d.r0 * 0.55, 20)); }
  function anchor(d, t) { return bz(d.B, d.c1, d.c2, S(d), t); }
  function mantle(cx, top, bottom, W) {
    var H = bottom - top, bw = 0.33, pts = [];
    var segs = [
      [[cx - W * bw, bottom], [cx - W * 0.66, bottom - H * 0.40], [cx - W * 0.52, top], [cx, top]],
      [[cx, top], [cx + W * 0.52, top], [cx + W * 0.66, bottom - H * 0.40], [cx + W * bw, bottom]],
      [[cx + W * bw, bottom], [cx + W * 0.15, bottom + H * 0.08], [cx - W * 0.15, bottom + H * 0.08], [cx - W * bw, bottom]]
    ];
    segs.forEach(function (s) { for (var i = 0; i < 30; i++) pts.push(bz(s[0], s[1], s[2], s[3], i / 30)); });
    return pts;
  }
  function fanPts(anchors, center) {
    var pts = [];
    for (var i = 0; i < anchors.length - 1; i++) {
      var a = anchors[i], b = anchors[i + 1], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      var c = [m[0] + (center[0] - m[0]) * 0.22, m[1] + (center[1] - m[1]) * 0.22];
      for (var k = 0; k < 14; k++) {
        var t = k / 14, u = 1 - t;
        pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
      }
    }
    pts.push(anchors[anchors.length - 1]); pts.push(center);
    return pts;
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function d(pts) { return 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z'; }
  function cub(p) { return 'M' + f(p[0][0]) + ' ' + f(p[0][1]) + 'C' + [p[1], p[2], p[3]].map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' '); }
  function path(dd, fill, extra) { return '<path d="' + dd + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function ell(cx, cy, w, h, fill, extra) { return '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(w / 2) + '" ry="' + f(h / 2) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function stroke(p, w, col) { return '<path d="' + cub(p) + '" fill="none" stroke="' + (col || C.ink) + '" stroke-width="' + w + '" stroke-linecap="round"/>'; }

  /* ---------- poses, expressions, écrans ---------- */
  var LL = def([142, 212], [132, 268], [108, 318], [70, 302], 16, 1, 42, 9);
  var SL = def([178, 220], [176, 292], [134, 362], [164, 350], 12, -1, 36, 8);
  var LOWER = [LL, SL, mir(SL), mir(LL)];

  function pose(L, R, card, term) { return { L: L, R: R || mir(L), card: card, term: term }; }
  var POSES = {
    hold: pose(def([134, 194], [98, 222], [62, 206], [52, 164], 10, -1, 34, 10, 0), null, [50, 130, -12], [350, 114, 8]),
    up:   pose(def([134, 194], [96, 214], [58, 176], [48, 134], 10, -1, 34, 10, 0), null, [48, 98, -18], [352, 86, 14]),
    down: pose(def([134, 198], [110, 240], [70, 268], [60, 236], 10, -1, 34, 10, 0), null, [60, 204, 6], [340, 190, -6]),
    tap:  pose(def([134, 196], [118, 268], [178, 324], [190, 296], 10, -1, 34, 10, 0),
               def([266, 196], [268, 300], [306, 364], [310, 338], 10, 1, 34, 10, Math.PI),
               [194, 258, -10], [284, 270, 6])
  };
  function mouth(pts, open) { return { pts: pts, open: open }; }
  var M = {
    smile: mouth([[-14, 0], [-8, 11], [8, 11], [14, 0]], 0),
    open:  mouth([[-17, 0], [-6, -3], [6, -3], [17, 0]], 1),
    o:     mouth([[-7, 2], [-3, -1], [3, -1], [7, 2]], 0.62),
    frown: mouth([[-12, 10], [-6, 2], [6, 2], [12, 10]], 0),
    flat:  mouth([[-10, 6], [-3, 7], [4, 5], [11, 3]], 0),
    smirk: mouth([[-12, 4], [-2, 10], [8, 8], [15, -2]], 0)
  };
  function ex(o) {
    return { eL: o.eL == null ? 1 : o.eL, eR: o.eR == null ? 1 : o.eR, pdx: o.pdx || 0, pdy: o.pdy || 0,
             ps: o.ps || 1, ss: o.ss || 1, brow: o.brow || [0, 0, 0, 0], mouth: o.mouth || M.smile, ch: o.ch == null ? 0.35 : o.ch };
  }
  var EXPR = {
    neutre:    ex({}),
    accueil:   ex({ brow: [-4, -2, -4, -2], mouth: M.open, ch: 0.4 }),
    content:   ex({ eL: 0, eR: 0, brow: [-6, -3, -6, -3], mouth: M.open, ch: 0.5 }),
    surpris:   ex({ ps: 0.75, ss: 1.08, brow: [-12, -9, -12, -9], mouth: M.o }),
    reflechit: ex({ pdx: -5, pdy: -7, brow: [0, 1, -11, -5], mouth: M.flat, ch: 0.3 }),
    malicieux: ex({ eL: 0, pdx: 2, brow: [3, 0, -10, -3], mouth: M.smirk, ch: 0.4 }),
    triste:    ex({ pdy: 6, brow: [-10, 2, -10, 2], mouth: M.frown, ch: 0.2 }),
    focus:     ex({ pdx: 2, pdy: 7, brow: [-3, -5, -3, -5], mouth: M.smile }),
    attente:   ex({ pdx: 6, pdy: -6, brow: [-6, -3, -6, -3], mouth: M.flat, ch: 0.3 })
  };
  var SCREEN = {
    montant: { bg: C.screen, text: '12,50', col: C.ink, size: 14, label: 'Montant affiché : 12,50 €' },
    attente: { bg: C.screen, dots: true, label: 'Paiement en cours' },
    ok:      { bg: C.mint, text: '00', col: C.white, size: 18, label: 'Paiement approuvé, code 00' },
    ko:      { bg: C.coral, text: '05', col: C.white, size: 18, label: 'Paiement refusé, code 05' }
  };

  function state(poseName, exprName, screenName, fx) {
    var p = POSES[poseName];
    return { L: p.L, R: p.R, card: p.card, term: p.term, face: EXPR[exprName], screen: screenName,
             fx: Object.assign({ waves: 0, sparkles: 0, receipt: 0 }, fx || {}) };
  }

  /* ---------- interpolation ---------- */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpAny(a, b, t) {
    if (typeof a === 'number') return lerp(a, b, t);
    if (Array.isArray(a)) return a.map(function (v, i) { return lerpAny(v, b[i], t); });
    if (a && typeof a === 'object') { var o = {}; for (var k in a) o[k] = (k in b) ? lerpAny(a[k], b[k], t) : a[k]; return o; }
    return t < 0.5 ? a : b;
  }
  function mix(a, b, t) {
    var s = lerpAny(a, b, t);
    s.screen = t < 0.35 ? a.screen : b.screen;
    return s;
  }

  /* ---------- rendu ---------- */
  function rotPt(p, deg) { var r = deg * Math.PI / 180; return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)]; }
  function cardSVG(c) {
    var s = '<g transform="translate(' + f(c[0]) + ' ' + f(c[1]) + ') rotate(' + f(c[2]) + ')">' +
      '<rect x="-48" y="-30" width="96" height="60" rx="10" fill="' + C.ink + '"/>' +
      '<rect x="-36" y="-17" width="18" height="14" rx="3" fill="' + C.mint + '"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="' + (-36 + i * 19) + '" y="10" width="13" height="4" rx="2" fill="' + C.num + '"/>';
    return s + '</g>';
  }
  function termSVG(t, sc, time) {
    var s = '<g transform="translate(' + f(t[0]) + ' ' + f(t[1]) + ') rotate(' + f(t[2]) + ')">' +
      '<rect x="-33" y="-54" width="66" height="108" rx="14" fill="' + C.ink + '"/>' +
      '<rect x="-25" y="-45" width="50" height="36" rx="7" fill="' + sc.bg + '"/>';
    if (sc.dots) {
      for (var i = 0; i < 3; i++) {
        var on = Math.floor((time || 0) * 3) % 3 === i;
        s += '<circle cx="' + (-11 + i * 11) + '" cy="-27" r="3.6" fill="' + C.ink + '" opacity="' + (on ? 1 : 0.3) + '"/>';
      }
    } else {
      s += '<text x="0" y="-27" text-anchor="middle" dominant-baseline="central" font-family="\'JetBrains Mono\',ui-monospace,monospace" font-weight="700" font-size="' + sc.size + '" fill="' + sc.col + '">' + sc.text + '</text>';
    }
    for (var k = 0; k < 9; k++) s += '<circle cx="' + (-16 + (k % 3) * 16) + '" cy="' + (6 + Math.floor(k / 3) * 14) + '" r="4" fill="' + (k === 8 ? C.mint : C.key) + '"/>';
    return s + '</g>';
  }
  function receiptSVG(t, p) {
    if (p <= 0.01) return '';
    var off = rotPt([0, -54 - 16 * p], t[2]);
    var cx = t[0] + off[0], cy = t[1] + off[1];
    return '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(t[2]) + ')" opacity="' + f(Math.min(1, p * 2)) + '">' +
      '<rect x="-18" y="-17" width="36" height="34" rx="3" fill="' + C.white + '"/>' +
      '<rect x="-11" y="-11" width="22" height="3.5" rx="1.75" fill="#C9D2E3"/><rect x="-11" y="-4" width="22" height="3.5" rx="1.75" fill="#C9D2E3"/>' +
      '<rect x="-11" y="3" width="14" height="3.5" rx="1.75" fill="' + C.mint + '"/></g>';
  }
  function star(cx, cy, r, col, o) {
    var pts = [];
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * 0.32 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    return path(d(pts), col, ' opacity="' + f(o) + '"');
  }
  function arc(cx, cy, r, a1, a2) {
    a1 *= Math.PI / 180; a2 *= Math.PI / 180;
    return '<path d="M' + f(cx + r * Math.cos(a1)) + ' ' + f(cy + r * Math.sin(a1)) + 'A' + r + ' ' + r + ' 0 0 1 ' + f(cx + r * Math.cos(a2)) + ' ' + f(cy + r * Math.sin(a2)) + '" fill="none" stroke="' + C.mint + '" stroke-width="4" stroke-linecap="round"/>';
  }
  function tentacle(dd, suck) {
    var c = cline(dd), s = path(d(band(c, dd.w0, dd.w1)), C.body);
    if (suck) {
      var n = c.length;
      for (var j = NB + 2; j < n - 2; j += 3) {
        var q = c[j], vx = dd.C[0] - q[0], vy = dd.C[1] - q[1], l = Math.hypot(vx, vy) || 1, w = wAt(j, n, dd.w0, dd.w1), r = Math.max(2.2, w * 0.17);
        s += ell(q[0] + vx / l * w * 0.24, q[1] + vy / l * w * 0.24, r * 2, r * 2, C.suck);
      }
    }
    return s;
  }
  function sway(dd, t, i, amp) {
    if (!amp) return dd;
    var dx = amp * 3 * Math.sin(t * 1.6 + i * 1.3), dy = amp * 2 * Math.sin(t * 1.25 + i * 0.7);
    return def(dd.B, dd.c1, [dd.c2[0] + dx, dd.c2[1] + dy], [dd.C[0] + dx, dd.C[1] + dy], dd.r0, dd.dir, dd.w0, dd.w1, dd.a0);
  }
  function faceSVG(fc, blink, look) {
    var s = '', eyeY = 150, cx = 200;
    [-1, 1].forEach(function (side) {
      var ex = cx + side * 38, open = (side < 0 ? fc.eL : fc.eR) * (1 - blink);
      var sy = Math.max(0.06, open);
      if (open > 0.04) {
        var px = ex - side * 4 + fc.pdx + look[0], py = eyeY + 5 + fc.pdy + look[1], ps = fc.ps, ss = fc.ss;
        s += '<g transform="translate(0 ' + f(eyeY) + ') scale(1 ' + f(sy) + ') translate(0 ' + f(-eyeY) + ')">' +
          ell(ex, eyeY, 46 * ss, 54 * ss, C.white) + ell(px, py, 27 * ps, 33 * ps, C.ink) +
          ell(px - 5 * ps, py - 8 * ps, 11 * ps, 11 * ps, C.white) + ell(px + 6 * ps, py + 7 * ps, 5 * ps, 5 * ps, C.white) + '</g>';
      }
      var closedO = 1 - (side < 0 ? fc.eL : fc.eR);
      if (closedO > 0.04) s += '<g opacity="' + f(closedO) + '">' + stroke([[ex - 14, eyeY + 5], [ex - 8, eyeY - 12], [ex + 8, eyeY - 12], [ex + 14, eyeY + 5]], 5.5) + '</g>';
      var by = eyeY - 38, bi = side < 0 ? fc.brow[0] : fc.brow[2], bo = side < 0 ? fc.brow[1] : fc.brow[3];
      var o = [ex + side * 13, by + bo], i = [ex - side * 13, by + bi];
      s += stroke([o, [o[0] + (i[0] - o[0]) / 3, o[1] + (i[1] - o[1]) / 3 - 4], [o[0] + 2 * (i[0] - o[0]) / 3, o[1] + 2 * (i[1] - o[1]) / 3 - 4], i], 4.5);
      s += ell(cx + side * 66, eyeY + 34, 28, 15, C.coral, ' opacity="' + f(fc.ch) + '"');
    });
    var my = eyeY + 40, mp = fc.mouth.pts.map(function (p) { return [cx + p[0], my + p[1]]; }), op = fc.mouth.open;
    if (op > 0.05 && mp[3][0] - mp[0][0] < 20) {
      s += ell(cx, my + 25 * op * 0.3, mp[3][0] - mp[0][0] + 1, 25 * op * 0.85, C.ink);
    } else if (op > 0.05) {
      var h = 25 * op, a = mp[0], b = mp[3];
      var dd = cub(mp) + 'C' + f(b[0] - 5) + ' ' + f(b[1] + h) + ' ' + f(a[0] + 5) + ' ' + f(a[1] + h) + ' ' + f(a[0]) + ' ' + f(a[1]) + 'Z';
      s += path(dd, C.ink);
      if (op > 0.8) s += ell(cx, my + 13 * op, 15 * Math.min(1, (b[0] - a[0]) / 30), 8, C.coral);
    } else {
      s += stroke(mp, 5);
    }
    return s;
  }

  /* opts : { t (secondes), live (0..1 : respiration et ondulation), blink (0..1), look [dx,dy] } */
  function render(st, opts) {
    opts = opts || {};
    var t = opts.t || 0, live = opts.live || 0, blink = opts.blink || 0, look = opts.look || [0, 0];
    var sc = SCREEN[st.screen];
    var lower = LOWER.map(function (dd, i) { return sway(dd, t, i, live); });
    var L = sway(st.L, t, 5, live * 0.4), R = sway(st.R, t, 6, live * 0.4);
    var breathe = 1 + 0.012 * live * Math.sin(t * 2.1);
    var head = 'translate(200 226) scale(1 ' + f(breathe * 1000) / 1000 + ') translate(-200 -226)';
    var s = ell(200, 378, 240, 22, C.ink, ' opacity="0.07"');
    lower.forEach(function (dd) { s += tentacle(dd, true); });
    s += path(d(fanPts([[92, 150], anchor(L, 0.12), anchor(lower[0], 0.16), anchor(lower[1], 0.18), anchor(lower[2], 0.18), anchor(lower[3], 0.16), anchor(R, 0.12), [308, 150]], [200, 168])), C.body);
    s += '<g transform="' + head + '">' + path(d(mantle(200, 53, 235, 236)), C.shadow);
    var hp = mantle(200, 44, 226, 236);
    s += path(d(hp), C.body);
    var O = [], I = [], ctr = [200, 135];
    for (var i = 9; i <= 36; i++) {
      var q = hp[i], vx = ctr[0] - q[0], vy = ctr[1] - q[1], l = Math.hypot(vx, vy), u = (i - 9) / 27, th = Math.sin(Math.PI * u) * 9.4;
      vx /= l; vy /= l; O.push([q[0] + vx * 11.8, q[1] + vy * 11.8]); I.push([q[0] + vx * (11.8 + th), q[1] + vy * (11.8 + th)]);
    }
    s += path(d(O.concat(I.reverse())), C.white, ' opacity="0.28"') + '</g>';
    s += receiptSVG(st.term, st.fx.receipt);
    var tapping = st.card[0] > 120;
    if (tapping) s += tentacle(R, false);
    s += cardSVG(st.card) + termSVG(st.term, sc, t);
    s += tentacle(L, false);
    if (!tapping) s += tentacle(R, false);
    if (st.fx.waves > 0.02) {
      var wv = '';
      for (var k = 0; k < 3; k++) wv += arc(st.term[0] + 30, st.term[1] - 20, 14 + k * 11, -55, 25);
      s += '<g opacity="' + f(st.fx.waves) + '">' + wv + '</g>';
    }
    s += '<g transform="' + head + '">' + faceSVG(st.face, blink, look) + '</g>';
    if (st.fx.sparkles > 0.02) {
      var sp = st.fx.sparkles, tw = 0.75 + 0.25 * Math.sin(t * 6);
      s += star(116, 36, 11 * sp * tw, C.mint, sp) + star(262, 24, 8 * sp, C.body, sp) + star(30, 40, 7 * sp * tw, C.mint, sp) + star(300, 160, 6 * sp, C.mint, sp);
    }
    return s;
  }
  function svg(st, opts, attrs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"' + (attrs || '') + '>' + render(st, opts) + '</svg>';
  }

  /* ---------- mark (tête seule) : 128 x 128 ---------- */
  function markInner() {
    var s = '';
    [[[40, 92], [34, 108], [18, 112], [14, 122]], [[64, 98], [64, 112], [62, 118], [61, 126]], [[88, 92], [94, 108], [110, 112], [114, 122]]].forEach(function (p) {
      s += path(d(band(bezPts(p[0], p[1], p[2], p[3], 16), 26, 12)), C.body);
    });
    s += path(d(mantle(64, 10, 102, 116)), C.body);
    [-1, 1].forEach(function (side) {
      var ex = 64 + side * 23;
      s += ell(ex, 58, 29, 34, C.white) + ell(ex - side * 2.5, 61, 17, 21, C.ink) + ell(ex - side * 2.5 - 3, 56, 7, 7, C.white);
    });
    s += stroke([[55, 81], [59, 88], [69, 88], [73, 81]], 4.2);
    return s;
  }
  function markSVG(attrs) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"' + (attrs || '') + '>' + markInner() + '</svg>'; }
  function tileSVG(bg) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="' + (bg || C.white) + '"/>' +
      '<g transform="translate(9 9) scale(0.86)">' + markInner() + '</g></svg>';
  }

  /* ---------- animation dans la page ---------- */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function Poulpe(el, o) {
    o = o || {};
    var self = this;
    this.el = el;
    this.reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.cur = state(o.pose || 'hold', o.expr || 'accueil', o.screen || 'montant');
    this.from = this.cur; this.to = this.cur; this.t0 = 0; this.dur = 0;
    this.poseName = o.pose || 'hold'; this.exprName = o.expr || 'accueil';
    this.follow = o.follow !== false;
    this.look = [0, 0]; this.lookTarget = [0, 0];
    this.blinkAt = 2; this.busy = false;
    this.onScreen = o.onScreen || null;
    this.onStep = o.onStep || null;
    this.speed = o.speed || 1;
    this.label = o.label || 'Le poulpe, mascotte de Paiement Décrypté';
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="' + this.label + '"></svg>';
    this.svg = el.firstChild;
    this.start = performance.now();
    this.visible = true; this.dirty = true;
    if (root.IntersectionObserver) {
      new root.IntersectionObserver(function (en) { self.visible = en[0].isIntersecting; }).observe(el);
    }
    if (this.follow) {
      root.addEventListener('pointermove', function (e) {
        var r = self.svg.getBoundingClientRect(), sx = r.left + r.width / 2, sy = r.top + r.height * 0.37;
        var dx = (e.clientX - sx) / 60, dy = (e.clientY - sy) / 60;
        self.lookTarget = [Math.max(-5, Math.min(5, dx)), Math.max(-5, Math.min(5, dy))];
      }, { passive: true });
    }
    var loop = function (now) {
      root.requestAnimationFrame(loop);
      if (!self.visible) return;
      if (self.reduced && self.dur === 0 && !self.dirty) return;
      self.dirty = false;
      var t = (now - self.start) / 1000;
      if (self.dur > 0) {
        var k = Math.min(1, (t - self.t0) / self.dur);
        self.cur = mix(self.from, self.to, ease(k));
        if (k >= 1) self.dur = 0;
      }
      var blink = 0;
      if (!self.reduced) {
        if (t >= self.blinkAt) { self.blinkStart = t; self.blinkAt = t + 2.5 + Math.random() * 3; }
        var b = self.blinkStart == null ? 10 : t - self.blinkStart;
        blink = b < 0.16 ? Math.sin(Math.PI * b / 0.16) : 0;
        self.look = [lerp(self.look[0], self.lookTarget[0], 0.08), lerp(self.look[1], self.lookTarget[1], 0.08)];
      }
      self.svg.innerHTML = render(self.cur, { t: t, live: self.reduced ? 0 : 1, blink: blink, look: self.follow ? self.look : [0, 0] });
    };
    root.requestAnimationFrame(loop);
  }
  Poulpe.prototype.go = function (poseName, exprName, screenName, fx, dur) {
    var to = state(poseName, exprName, screenName, fx);
    this.poseName = poseName; this.exprName = exprName;
    this.from = this.cur; this.to = to;
    this.t0 = (performance.now() - this.start) / 1000;
    this.dur = this.reduced ? 0.001 : (dur == null ? 0.6 : dur) / this.speed;
    this.dirty = true;
    if (this.onScreen) this.onScreen(SCREEN[screenName].label, screenName);
  };
  Poulpe.prototype.expr = function (name, dur) {
    this.go(this.poseName || 'hold', name, this.to.screen, this.to.fx, dur == null ? 0.35 : dur);
  };
  Poulpe.prototype.set = function (o, dur) {
    var n = Object.assign({ pose: this.poseName || 'hold', expr: this.exprName || 'accueil', screen: this.to.screen, fx: this.to.fx }, o);
    this.go(n.pose, n.expr, n.screen, n.fx, dur);
  };
  /* Scénario de paiement. result : 'ok', 'ko' ou rien (tirage, 3 fois sur 4 approuvé). */
  Poulpe.prototype.pay = function (result) {
    if (this.busy) return Promise.resolve();
    var self = this; this.busy = true;
    var res = result || (Math.random() < 0.75 ? 'ok' : 'ko');
    var wait = function (s) { return new Promise(function (r) { setTimeout(r, (self.reduced ? Math.max(400, s * 600) : s * 1000) / self.speed); }); };
    var step = function (n) { if (self.onStep) self.onStep(n); };
    step('montant'); self.go('hold', 'neutre', 'montant', null, 0.4);
    return wait(0.6)
      .then(function () { step('tap'); self.go('tap', 'focus', 'montant', { waves: 1 }, 0.7); return wait(1.6); })
      .then(function () { step('attente'); self.go('hold', 'attente', 'attente', null, 0.6); return wait(1.8); })
      .then(function () {
        step(res);
        if (res === 'ok') self.go('up', 'content', 'ok', { sparkles: 1, receipt: 1 }, 0.55);
        else self.go('down', 'triste', 'ko', null, 0.7);
        return wait(2.4);
      })
      .then(function () { step('retour'); self.go('hold', 'accueil', 'montant', null, 0.8); return wait(0.8); })
      .then(function () { self.busy = false; return res; });
  };

  var api = { render: render, svg: svg, state: state, markSVG: markSVG, tileSVG: tileSVG, POSES: POSES, EXPR: EXPR, SCREEN: SCREEN, Poulpe: Poulpe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PD_Poulpe = api;
})(typeof window !== 'undefined' ? window : globalThis);
