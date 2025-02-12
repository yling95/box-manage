var createAiMarkModule = (() => {
  var _scriptDir = import.meta.url

  return function (createAiMarkModule = {}) {
    var g
    g || (g = typeof createAiMarkModule !== 'undefined' ? createAiMarkModule : {})
    var aa, ba
    g.ready = new Promise(function (a, b) {
      aa = a
      ba = b
    })
    g.canvas = document.getElementById('gxAiMarkCanvas')
    var ca = Object.assign({}, g),
      da = './this.program',
      ea = (a, b) => {
        throw b
      },
      fa = 'object' == typeof window,
      ha = 'function' == typeof importScripts,
      n = '',
      ia
    if (fa || ha)
      ha
        ? (n = self.location.href)
        : 'undefined' != typeof document && document.currentScript && (n = document.currentScript.src),
        _scriptDir && (n = _scriptDir),
        0 !== n.indexOf('blob:') ? (n = n.substr(0, n.replace(/[?#].*/, '').lastIndexOf('/') + 1)) : (n = ''),
        ha &&
          (ia = (a) => {
            var b = new XMLHttpRequest()
            b.open('GET', a, !1)
            b.responseType = 'arraybuffer'
            b.send(null)
            return new Uint8Array(b.response)
          })
    var ja = g.print || console.log.bind(console),
      q = g.printErr || console.warn.bind(console)
    Object.assign(g, ca)
    ca = null
    g.thisProgram && (da = g.thisProgram)
    g.quit && (ea = g.quit)
    var ka
    g.wasmBinary && (ka = g.wasmBinary)
    var noExitRuntime = g.noExitRuntime || !0
    'object' != typeof WebAssembly && u('no native wasm support detected')
    var la,
      ma = !1,
      na,
      oa = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
    function pa(a, b, c) {
      var d = b + c
      for (c = b; a[c] && !(c >= d); ) ++c
      if (16 < c - b && a.buffer && oa) return oa.decode(a.subarray(b, c))
      for (d = ''; b < c; ) {
        var e = a[b++]
        if (e & 128) {
          var f = a[b++] & 63
          if (192 == (e & 224)) d += String.fromCharCode(((e & 31) << 6) | f)
          else {
            var h = a[b++] & 63
            e =
              224 == (e & 240)
                ? ((e & 15) << 12) | (f << 6) | h
                : ((e & 7) << 18) | (f << 12) | (h << 6) | (a[b++] & 63)
            65536 > e
              ? (d += String.fromCharCode(e))
              : ((e -= 65536), (d += String.fromCharCode(55296 | (e >> 10), 56320 | (e & 1023))))
          }
        } else d += String.fromCharCode(e)
      }
      return d
    }
    function ra(a, b) {
      return a ? pa(w, a, b) : ''
    }
    function sa(a, b, c, d) {
      if (!(0 < d)) return 0
      var e = c
      d = c + d - 1
      for (var f = 0; f < a.length; ++f) {
        var h = a.charCodeAt(f)
        if (55296 <= h && 57343 >= h) {
          var k = a.charCodeAt(++f)
          h = (65536 + ((h & 1023) << 10)) | (k & 1023)
        }
        if (127 >= h) {
          if (c >= d) break
          b[c++] = h
        } else {
          if (2047 >= h) {
            if (c + 1 >= d) break
            b[c++] = 192 | (h >> 6)
          } else {
            if (65535 >= h) {
              if (c + 2 >= d) break
              b[c++] = 224 | (h >> 12)
            } else {
              if (c + 3 >= d) break
              b[c++] = 240 | (h >> 18)
              b[c++] = 128 | ((h >> 12) & 63)
            }
            b[c++] = 128 | ((h >> 6) & 63)
          }
          b[c++] = 128 | (h & 63)
        }
      }
      b[c] = 0
      return c - e
    }
    function ta(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c)
        127 >= d ? b++ : 2047 >= d ? (b += 2) : 55296 <= d && 57343 >= d ? ((b += 4), ++c) : (b += 3)
      }
      return b
    }
    var z, w, ua, va, A, B, C, wa
    function xa() {
      var a = la.buffer
      g.HEAP8 = z = new Int8Array(a)
      g.HEAP16 = ua = new Int16Array(a)
      g.HEAP32 = A = new Int32Array(a)
      g.HEAPU8 = w = new Uint8Array(a)
      g.HEAPU16 = va = new Uint16Array(a)
      g.HEAPU32 = B = new Uint32Array(a)
      g.HEAPF32 = C = new Float32Array(a)
      g.HEAPF64 = wa = new Float64Array(a)
    }
    var ya,
      za = [],
      Aa = [],
      Ba = [],
      Ca = []
    function Da() {
      var a = g.preRun.shift()
      za.unshift(a)
    }
    var Ea = 0,
      Fa = null,
      Ga = null
    function u(a) {
      if (g.onAbort) g.onAbort(a)
      a = 'Aborted(' + a + ')'
      q(a)
      ma = !0
      na = 1
      a = new WebAssembly.RuntimeError(a + '. Build with -sASSERTIONS for more info.')
      ba(a)
      throw a
    }
    function Ha(a) {
      return a.startsWith('data:application/octet-stream;base64,')
    }
    var Ia
    if (g.locateFile) {
      if (((Ia = 'edge-box-ai-mark-agent.wasm'), !Ha(Ia))) {
        var Ja = Ia
        Ia = g.locateFile ? g.locateFile(Ja, n) : n + Ja
      }
    } else Ia = new URL('edge-box-ai-mark-agent.wasm', import.meta.url).href
    function Ka(a) {
      try {
        if (a == Ia && ka) return new Uint8Array(ka)
        if (ia) return ia(a)
        throw 'both async and sync fetching of the wasm failed'
      } catch (b) {
        u(b)
      }
    }
    function La(a) {
      return ka || (!fa && !ha) || 'function' != typeof fetch
        ? Promise.resolve().then(function () {
            return Ka(a)
          })
        : fetch(a, { credentials: 'same-origin' })
            .then(function (b) {
              if (!b.ok) throw "failed to load wasm binary file at '" + a + "'"
              return b.arrayBuffer()
            })
            .catch(function () {
              return Ka(a)
            })
    }
    function Ma(a, b, c) {
      return La(a)
        .then(function (d) {
          return WebAssembly.instantiate(d, b)
        })
        .then(function (d) {
          return d
        })
        .then(c, function (d) {
          q('failed to asynchronously prepare wasm: ' + d)
          u(d)
        })
    }
    function Na(a, b) {
      var c = Ia
      return ka || 'function' != typeof WebAssembly.instantiateStreaming || Ha(c) || 'function' != typeof fetch
        ? Ma(c, a, b)
        : fetch(c, { credentials: 'same-origin' }).then(function (d) {
            return WebAssembly.instantiateStreaming(d, a).then(b, function (e) {
              q('wasm streaming compile failed: ' + e)
              q('falling back to ArrayBuffer instantiation')
              return Ma(c, a, b)
            })
          })
    }
    function Oa(a) {
      this.name = 'ExitStatus'
      this.message = 'Program terminated with exit(' + a + ')'
      this.status = a
    }
    function Pa(a) {
      for (; 0 < a.length; ) a.shift()(g)
    }
    var Qa = [],
      Ra = 0,
      Sa = 0,
      Ta = []
    function D(a) {
      var b = Ta[a]
      b || (a >= Ta.length && (Ta.length = a + 1), (Ta[a] = b = ya.get(a)))
      return b
    }
    function Ua(a) {
      this.Zb = a
      this.Nb = a - 24
      this.Yc = function (b) {
        B[(this.Nb + 4) >> 2] = b
      }
      this.Xb = function () {
        return B[(this.Nb + 4) >> 2]
      }
      this.Wc = function (b) {
        B[(this.Nb + 8) >> 2] = b
      }
      this.bd = function () {
        return B[(this.Nb + 8) >> 2]
      }
      this.Xc = function () {
        A[this.Nb >> 2] = 0
      }
      this.sc = function (b) {
        z[(this.Nb + 12) >> 0] = b ? 1 : 0
      }
      this.Tc = function () {
        return 0 != z[(this.Nb + 12) >> 0]
      }
      this.tc = function (b) {
        z[(this.Nb + 13) >> 0] = b ? 1 : 0
      }
      this.Bc = function () {
        return 0 != z[(this.Nb + 13) >> 0]
      }
      this.Vc = function (b, c) {
        this.xc(0)
        this.Yc(b)
        this.Wc(c)
        this.Xc()
        this.sc(!1)
        this.tc(!1)
      }
      this.Rc = function () {
        A[this.Nb >> 2] += 1
      }
      this.jd = function () {
        var b = A[this.Nb >> 2]
        A[this.Nb >> 2] = b - 1
        return 1 === b
      }
      this.xc = function (b) {
        B[(this.Nb + 16) >> 2] = b
      }
      this.Sc = function () {
        return B[(this.Nb + 16) >> 2]
      }
      this.Uc = function () {
        if (Va(this.Xb())) return B[this.Zb >> 2]
        var b = this.Sc()
        return 0 !== b ? b : this.Zb
      }
    }
    function Wa() {
      var a = Sa
      if (!a) return Xa(0), 0
      var b = new Ua(a)
      b.xc(a)
      var c = b.Xb()
      if (!c) return Xa(0), a
      for (var d = 0; d < arguments.length; d++) {
        var e = arguments[d]
        if (0 === e || e === c) break
        if (Ya(e, c, b.Nb + 16)) return Xa(e), a
      }
      Xa(c)
      return a
    }
    function Za(a) {
      switch (a) {
        case 1:
          return 0
        case 2:
          return 1
        case 4:
          return 2
        case 8:
          return 3
        default:
          throw new TypeError('Unknown type size: ' + a)
      }
    }
    var $a = void 0
    function E(a) {
      for (var b = ''; w[a]; ) b += $a[w[a++]]
      return b
    }
    var ab = {},
      bb = {},
      cb = {}
    function db(a) {
      if (void 0 === a) return '_unknown'
      a = a.replace(/[^a-zA-Z0-9_]/g, '$')
      var b = a.charCodeAt(0)
      return 48 <= b && 57 >= b ? '_' + a : a
    }
    function eb(a, b) {
      a = db(a)
      return {
        [a]: function () {
          return b.apply(this, arguments)
        },
      }[a]
    }
    function fb(a) {
      var b = Error,
        c = eb(a, function (d) {
          this.name = a
          this.message = d
          d = Error(d).stack
          void 0 !== d && (this.stack = this.toString() + '\n' + d.replace(/^Error(:[^\n]*)?\n/, ''))
        })
      c.prototype = Object.create(b.prototype)
      c.prototype.constructor = c
      c.prototype.toString = function () {
        return void 0 === this.message ? this.name : this.name + ': ' + this.message
      }
      return c
    }
    var gb = void 0
    function F(a) {
      throw new gb(a)
    }
    var hb = void 0
    function ib(a, b) {
      function c(k) {
        k = b(k)
        if (k.length !== d.length) throw new hb('Mismatched type converter count')
        for (var m = 0; m < d.length; ++m) H(d[m], k[m])
      }
      var d = []
      d.forEach(function (k) {
        cb[k] = a
      })
      var e = Array(a.length),
        f = [],
        h = 0
      a.forEach((k, m) => {
        bb.hasOwnProperty(k)
          ? (e[m] = bb[k])
          : (f.push(k),
            ab.hasOwnProperty(k) || (ab[k] = []),
            ab[k].push(() => {
              e[m] = bb[k]
              ++h
              h === f.length && c(e)
            }))
      })
      0 === f.length && c(e)
    }
    function H(a, b, c = {}) {
      if (!('argPackAdvance' in b)) throw new TypeError('registerType registeredInstance requires argPackAdvance')
      var d = b.name
      a || F('type "' + d + '" must have a positive integer typeid pointer')
      if (bb.hasOwnProperty(a)) {
        if (c.dd) return
        F("Cannot register type '" + d + "' twice")
      }
      bb[a] = b
      delete cb[a]
      ab.hasOwnProperty(a) && ((b = ab[a]), delete ab[a], b.forEach((e) => e()))
    }
    var jb = [],
      I = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }]
    function kb(a) {
      4 < a && 0 === --I[a].rc && ((I[a] = void 0), jb.push(a))
    }
    var J = (a) => {
        a || F('Cannot use deleted val. handle = ' + a)
        return I[a].value
      },
      K = (a) => {
        switch (a) {
          case void 0:
            return 1
          case null:
            return 2
          case !0:
            return 3
          case !1:
            return 4
          default:
            var b = jb.length ? jb.pop() : I.length
            I[b] = { rc: 1, value: a }
            return b
        }
      }
    function lb(a) {
      return this.fromWireType(A[a >> 2])
    }
    function mb(a, b) {
      switch (b) {
        case 2:
          return function (c) {
            return this.fromWireType(C[c >> 2])
          }
        case 3:
          return function (c) {
            return this.fromWireType(wa[c >> 3])
          }
        default:
          throw new TypeError('Unknown float type: ' + a)
      }
    }
    function nb(a) {
      var b = Function
      if (!(b instanceof Function))
        throw new TypeError('new_ called with constructor type ' + typeof b + ' which is not a function')
      var c = eb(b.name || 'unknownFunctionName', function () {})
      c.prototype = b.prototype
      c = new c()
      a = b.apply(c, a)
      return a instanceof Object ? a : c
    }
    function ob(a) {
      for (; a.length; ) {
        var b = a.pop()
        a.pop()(b)
      }
    }
    function pb(a, b) {
      var c = g
      if (void 0 === c[a].Ob) {
        var d = c[a]
        c[a] = function () {
          c[a].Ob.hasOwnProperty(arguments.length) ||
            F(
              "Function '" +
                b +
                "' called with an invalid number of arguments (" +
                arguments.length +
                ') - expects one of (' +
                c[a].Ob +
                ')!',
            )
          return c[a].Ob[arguments.length].apply(this, arguments)
        }
        c[a].Ob = []
        c[a].Ob[d.Zc] = d
      }
    }
    function qb(a, b, c) {
      g.hasOwnProperty(a)
        ? ((void 0 === c || (void 0 !== g[a].Ob && void 0 !== g[a].Ob[c])) &&
            F("Cannot register public name '" + a + "' twice"),
          pb(a, a),
          g.hasOwnProperty(c) &&
            F('Cannot register multiple overloads of a function with the same number of arguments (' + c + ')!'),
          (g[a].Ob[c] = b))
        : ((g[a] = b), void 0 !== c && (g[a].Ed = c))
    }
    function rb(a, b) {
      for (var c = [], d = 0; d < a; d++) c.push(B[(b + 4 * d) >> 2])
      return c
    }
    function sb(a, b) {
      var c = []
      return function () {
        c.length = 0
        Object.assign(c, arguments)
        if (a.includes('j')) {
          var d = g['dynCall_' + a]
          d = c && c.length ? d.apply(null, [b].concat(c)) : d.call(null, b)
        } else d = D(b).apply(null, c)
        return d
      }
    }
    function tb(a, b) {
      a = E(a)
      var c = a.includes('j') ? sb(a, b) : D(b)
      'function' != typeof c && F('unknown function pointer with signature ' + a + ': ' + b)
      return c
    }
    var ub = void 0
    function vb(a) {
      a = wb(a)
      var b = E(a)
      L(a)
      return b
    }
    function xb(a, b) {
      function c(f) {
        e[f] || bb[f] || (cb[f] ? cb[f].forEach(c) : (d.push(f), (e[f] = !0)))
      }
      var d = [],
        e = {}
      b.forEach(c)
      throw new ub(a + ': ' + d.map(vb).join([', ']))
    }
    function yb(a, b, c) {
      switch (b) {
        case 0:
          return c
            ? function (d) {
                return z[d]
              }
            : function (d) {
                return w[d]
              }
        case 1:
          return c
            ? function (d) {
                return ua[d >> 1]
              }
            : function (d) {
                return va[d >> 1]
              }
        case 2:
          return c
            ? function (d) {
                return A[d >> 2]
              }
            : function (d) {
                return B[d >> 2]
              }
        default:
          throw new TypeError('Unknown integer type: ' + a)
      }
    }
    var zb = 'undefined' != typeof TextDecoder ? new TextDecoder('utf-16le') : void 0
    function Ab(a, b) {
      var c = a >> 1
      for (var d = c + b / 2; !(c >= d) && va[c]; ) ++c
      c <<= 1
      if (32 < c - a && zb) return zb.decode(w.subarray(a, c))
      c = ''
      for (d = 0; !(d >= b / 2); ++d) {
        var e = ua[(a + 2 * d) >> 1]
        if (0 == e) break
        c += String.fromCharCode(e)
      }
      return c
    }
    function Bb(a, b, c) {
      void 0 === c && (c = 2147483647)
      if (2 > c) return 0
      c -= 2
      var d = b
      c = c < 2 * a.length ? c / 2 : a.length
      for (var e = 0; e < c; ++e) (ua[b >> 1] = a.charCodeAt(e)), (b += 2)
      ua[b >> 1] = 0
      return b - d
    }
    function Cb(a) {
      return 2 * a.length
    }
    function Db(a, b) {
      for (var c = 0, d = ''; !(c >= b / 4); ) {
        var e = A[(a + 4 * c) >> 2]
        if (0 == e) break
        ++c
        65536 <= e
          ? ((e -= 65536), (d += String.fromCharCode(55296 | (e >> 10), 56320 | (e & 1023))))
          : (d += String.fromCharCode(e))
      }
      return d
    }
    function Eb(a, b, c) {
      void 0 === c && (c = 2147483647)
      if (4 > c) return 0
      var d = b
      c = d + c - 4
      for (var e = 0; e < a.length; ++e) {
        var f = a.charCodeAt(e)
        if (55296 <= f && 57343 >= f) {
          var h = a.charCodeAt(++e)
          f = (65536 + ((f & 1023) << 10)) | (h & 1023)
        }
        A[b >> 2] = f
        b += 4
        if (b + 4 > c) break
      }
      A[b >> 2] = 0
      return b - d
    }
    function Fb(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c)
        55296 <= d && 57343 >= d && ++c
        b += 4
      }
      return b
    }
    function Gb(a, b) {
      var c = bb[a]
      void 0 === c && F(b + ' has unknown type ' + vb(a))
      return c
    }
    var Hb = {}
    function Ib(a) {
      var b = Hb[a]
      return void 0 === b ? E(a) : b
    }
    var Jb = []
    function Kb() {
      return 'object' == typeof globalThis ? globalThis : Function('return this')()
    }
    function Lb(a) {
      var b = Jb.length
      Jb.push(a)
      return b
    }
    function Mb(a, b) {
      for (var c = Array(a), d = 0; d < a; ++d) c[d] = Gb(B[(b + 4 * d) >> 2], 'parameter ' + d)
      return c
    }
    var Nb = []
    function Ob(a) {
      for (var b = '', c = 0; c < a; ++c) b += (0 !== c ? ', ' : '') + 'arg' + c
      var d = 'return function emval_allocator_' + a + '(constructor, argTypes, args) {\n  var HEAPU32 = getMemory();\n'
      for (c = 0; c < a; ++c)
        d +=
          'var argType' +
          c +
          " = requireRegisteredType(HEAPU32[((argTypes)>>2)], 'parameter " +
          c +
          "');\nvar arg" +
          c +
          ' = argType' +
          c +
          '.readValueFromPointer(args);\nargs += argType' +
          c +
          "['argPackAdvance'];\nargTypes += 4;\n"
      return new Function(
        'requireRegisteredType',
        'Module',
        'valueToHandle',
        'getMemory',
        d + ('var obj = new constructor(' + b + ');\nreturn valueToHandle(obj);\n}\n'),
      )(Gb, g, K, () => B)
    }
    var Pb = {}
    function Qb(a, b) {
      Rb = a
      Sb = b
      if (Tb)
        if ((Ub || (Ub = !0), 0 == a))
          M = function () {
            var d = Math.max(0, Vb + b - Wb()) | 0
            setTimeout(Xb, d)
          }
        else if (1 == a)
          M = function () {
            Yb(Xb)
          }
        else if (2 == a) {
          if ('undefined' == typeof setImmediate) {
            var c = []
            addEventListener(
              'message',
              (d) => {
                if ('setimmediate' === d.data || 'setimmediate' === d.data.target) d.stopPropagation(), c.shift()()
              },
              !0,
            )
            setImmediate = function (d) {
              c.push(d)
              ha
                ? (void 0 === g.setImmediates && (g.setImmediates = []),
                  g.setImmediates.push(d),
                  postMessage({ target: 'setimmediate' }))
                : postMessage('setimmediate', '*')
            }
          }
          M = function () {
            setImmediate(Xb)
          }
        }
    }
    var Wb
    Wb = () => performance.now()
    function Zb(a, b, c, d, e) {
      !Tb ||
        u(
          'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.',
        )
      Tb = a
      $b = d
      var f = ac
      Ub = !1
      Xb = function () {
        if (!ma)
          if (0 < bc.length) {
            var h = Date.now(),
              k = bc.shift()
            k.yd(k.sd)
            if (cc) {
              var m = cc,
                p = 0 == m % 1 ? m - 1 : Math.floor(m)
              cc = k.vd ? p : (8 * m + (p + 0.5)) / 9
            }
            ja('main loop blocker "' + k.name + '" took ' + (Date.now() - h) + ' ms')
            g.setStatus &&
              ((h = g.statusMessage || 'Please wait...'),
              (k = cc),
              (m = dc.xd),
              k ? (k < m ? g.setStatus(h + ' (' + (m - k) + '/' + m + ')') : g.setStatus(h)) : g.setStatus(''))
            f < ac || setTimeout(Xb, 0)
          } else if (!(f < ac))
            if (((ec = (ec + 1) | 0), 1 == Rb && 1 < Sb && 0 != ec % Sb)) M()
            else {
              0 == Rb && (Vb = Wb())
              if (O)
                for (
                  h = O.Wb, O.Wb = O.$b, O.$b = h, h = O.Rb, O.Rb = O.kc, O.kc = h, h = fc(2097152), k = 0;
                  k <= h;
                  ++k
                )
                  O.Rb[k] = 0
              ma || (g.preMainLoop && !1 === g.preMainLoop()) || (gc(a), g.postMainLoop && g.postMainLoop())
              f < ac || ('object' == typeof SDL && SDL.audio && SDL.audio.hd && SDL.audio.hd(), M())
            }
      }
      e || (b && 0 < b ? Qb(0, 1e3 / b) : Qb(1, 1), M())
      if (c) throw 'unwind'
    }
    function hc(a) {
      a instanceof Oa || 'unwind' == a || ea(1, a)
    }
    function ic(a) {
      na = a
      if (!noExitRuntime) {
        if (g.onExit) g.onExit(a)
        ma = !0
      }
      ea(a, new Oa(a))
    }
    function gc(a) {
      if (!ma)
        try {
          if ((a(), !noExitRuntime))
            try {
              ;(na = a = na), ic(a)
            } catch (b) {
              hc(b)
            }
        } catch (b) {
          hc(b)
        }
    }
    function jc(a) {
      setTimeout(function () {
        gc(a)
      }, 1e4)
    }
    function kc(a) {
      lc || (lc = {})
      lc[a] || ((lc[a] = 1), q(a))
    }
    var lc,
      Ub = !1,
      M = null,
      ac = 0,
      Tb = null,
      $b = 0,
      Rb = 0,
      Sb = 0,
      ec = 0,
      bc = [],
      dc = {},
      Vb,
      Xb,
      cc,
      mc = !1,
      nc = !1,
      oc = []
    function pc() {
      function a() {
        nc =
          document.pointerLockElement === g.canvas ||
          document.mozPointerLockElement === g.canvas ||
          document.webkitPointerLockElement === g.canvas ||
          document.msPointerLockElement === g.canvas
      }
      g.preloadPlugins || (g.preloadPlugins = [])
      if (!qc) {
        qc = !0
        try {
          rc = !0
        } catch (c) {
          ;(rc = !1), q('warning: no blob constructor, cannot create blobs with mimetypes')
        }
        sc =
          'undefined' != typeof MozBlobBuilder
            ? MozBlobBuilder
            : 'undefined' != typeof WebKitBlobBuilder
            ? WebKitBlobBuilder
            : rc
            ? null
            : q('warning: no BlobBuilder')
        tc = 'undefined' != typeof window ? (window.URL ? window.URL : window.webkitURL) : void 0
        g.Fc ||
          'undefined' != typeof tc ||
          (q(
            'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.',
          ),
          (g.Fc = !0))
        g.preloadPlugins.push({
          canHandle: function (c) {
            return !g.Fc && /\.(jpg|jpeg|png|bmp)$/i.test(c)
          },
          handle: function (c, d, e, f) {
            var h = null
            if (rc)
              try {
                ;(h = new Blob([c], { type: uc(d) })),
                  h.size !== c.length && (h = new Blob([new Uint8Array(c).buffer], { type: uc(d) }))
              } catch (p) {
                kc('Blob constructor present but fails: ' + p + '; falling back to blob builder')
              }
            h || ((h = new sc()), h.append(new Uint8Array(c).buffer), (h = h.getBlob()))
            var k = tc.createObjectURL(h),
              m = new Image()
            m.onload = () => {
              m.complete || u('Image ' + d + ' could not be decoded')
              var p = document.createElement('canvas')
              p.width = m.width
              p.height = m.height
              p.getContext('2d').drawImage(m, 0, 0)
              tc.revokeObjectURL(k)
              e && e(c)
            }
            m.onerror = () => {
              ja('Image ' + k + ' could not be decoded')
              f && f()
            }
            m.src = k
          },
        })
        g.preloadPlugins.push({
          canHandle: function (c) {
            return !g.Dd && c.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 }
          },
          handle: function (c, d, e, f) {
            function h() {
              m || ((m = !0), e && e(c))
            }
            function k() {
              m || ((m = !0), new Audio(), f && f())
            }
            var m = !1
            if (rc) {
              try {
                var p = new Blob([c], { type: uc(d) })
              } catch (x) {
                return k()
              }
              p = tc.createObjectURL(p)
              var r = new Audio()
              r.addEventListener('canplaythrough', () => h(r), !1)
              r.onerror = function () {
                if (!m) {
                  q('warning: browser could not fully decode audio ' + d + ', trying slower base64 approach')
                  for (var x = '', y = 0, l = 0, v = 0; v < c.length; v++)
                    for (y = (y << 8) | c[v], l += 8; 6 <= l; ) {
                      var t = (y >> (l - 6)) & 63
                      l -= 6
                      x += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[t]
                    }
                  2 == l
                    ? ((x += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[(y & 3) << 4]),
                      (x += '=='))
                    : 4 == l &&
                      ((x += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[(y & 15) << 2]),
                      (x += '='))
                  r.src = 'data:audio/x-' + d.substr(-3) + ';base64,' + x
                  h(r)
                }
              }
              r.src = p
              jc(function () {
                h(r)
              })
            } else return k()
          },
        })
        var b = g.canvas
        b &&
          ((b.requestPointerLock =
            b.requestPointerLock ||
            b.mozRequestPointerLock ||
            b.webkitRequestPointerLock ||
            b.msRequestPointerLock ||
            (() => {})),
          (b.exitPointerLock =
            document.exitPointerLock ||
            document.mozExitPointerLock ||
            document.webkitExitPointerLock ||
            document.msExitPointerLock ||
            (() => {})),
          (b.exitPointerLock = b.exitPointerLock.bind(document)),
          document.addEventListener('pointerlockchange', a, !1),
          document.addEventListener('mozpointerlockchange', a, !1),
          document.addEventListener('webkitpointerlockchange', a, !1),
          document.addEventListener('mspointerlockchange', a, !1),
          g.elementPointerLock &&
            b.addEventListener(
              'click',
              (c) => {
                !nc && g.canvas.requestPointerLock && (g.canvas.requestPointerLock(), c.preventDefault())
              },
              !1,
            ))
      }
    }
    function vc(a, b, c, d) {
      if (b && g.Ub && a == g.canvas) return g.Ub
      var e
      if (b) {
        var f = { antialias: !1, alpha: !1, gd: 1 }
        if (d) for (var h in d) f[h] = d[h]
        if ('undefined' != typeof wc && (e = xc(a, f))) var k = yc[e].bc
      } else k = a.getContext('2d')
      if (!k) return null
      c &&
        (b ||
          'undefined' == typeof P ||
          u('cannot set in module if GLctx is used, but we are a non-GL context that would replace it'),
        (g.Ub = k),
        b && ((O = yc[e]), (g.Ub = P = O && O.bc)),
        (g.Gd = b),
        oc.forEach(function (m) {
          m()
        }),
        pc())
      return k
    }
    var zc = !1,
      Ac = void 0,
      Bc = void 0
    function Cc(a, b) {
      function c() {
        mc = !1
        var f = d.parentNode
        ;(document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement ||
          document.webkitFullscreenElement ||
          document.webkitCurrentFullScreenElement) === f
          ? ((d.exitFullscreen = Dc),
            Ac && d.requestPointerLock(),
            (mc = !0),
            Bc
              ? ('undefined' != typeof SDL && (A[SDL.screen >> 2] = B[SDL.screen >> 2] | 8388608), Ec(g.canvas), Fc())
              : Ec(d))
          : (f.parentNode.insertBefore(d, f),
            f.parentNode.removeChild(f),
            Bc
              ? ('undefined' != typeof SDL && (A[SDL.screen >> 2] = B[SDL.screen >> 2] & -8388609), Ec(g.canvas), Fc())
              : Ec(d))
        if (g.onFullScreen) g.onFullScreen(mc)
        if (g.onFullscreen) g.onFullscreen(mc)
      }
      Ac = a
      Bc = b
      'undefined' == typeof Ac && (Ac = !0)
      'undefined' == typeof Bc && (Bc = !1)
      var d = g.canvas
      zc ||
        ((zc = !0),
        document.addEventListener('fullscreenchange', c, !1),
        document.addEventListener('mozfullscreenchange', c, !1),
        document.addEventListener('webkitfullscreenchange', c, !1),
        document.addEventListener('MSFullscreenChange', c, !1))
      var e = document.createElement('div')
      d.parentNode.insertBefore(e, d)
      e.appendChild(d)
      e.requestFullscreen =
        e.requestFullscreen ||
        e.mozRequestFullScreen ||
        e.msRequestFullscreen ||
        (e.webkitRequestFullscreen ? () => e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) : null) ||
        (e.webkitRequestFullScreen ? () => e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : null)
      e.requestFullscreen()
    }
    function Dc() {
      if (!mc) return !1
      ;(
        document.exitFullscreen ||
        document.cancelFullScreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen ||
        document.webkitCancelFullScreen ||
        function () {}
      ).apply(document, [])
      return !0
    }
    var Gc = 0
    function Yb(a) {
      if ('function' == typeof requestAnimationFrame) requestAnimationFrame(a)
      else {
        var b = Date.now()
        if (0 === Gc) Gc = b + 1e3 / 60
        else for (; b + 2 >= Gc; ) Gc += 1e3 / 60
        setTimeout(a, Math.max(Gc - b, 0))
      }
    }
    function uc(a) {
      return {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        bmp: 'image/bmp',
        ogg: 'audio/ogg',
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
      }[a.substr(a.lastIndexOf('.') + 1)]
    }
    var Hc = 0,
      Ic = 0,
      Jc = 0,
      Kc = 0
    function Lc(a) {
      if (nc)
        'mousemove' != a.type && 'mozMovementX' in a
          ? (Jc = Kc = 0)
          : ((Jc = a.movementX || a.mozMovementX || a.webkitMovementX || 0),
            (Kc = a.movementY || a.mozMovementY || a.webkitMovementY || 0)),
          'undefined' != typeof SDL ? ((Hc = SDL.Ad + Jc), (Ic = SDL.Bd + Kc)) : ((Hc += Jc), (Ic += Kc))
      else {
        var b = g.canvas.getBoundingClientRect(),
          c = g.canvas.width,
          d = g.canvas.height,
          e = 'undefined' != typeof window.scrollX ? window.scrollX : window.pageXOffset,
          f = 'undefined' != typeof window.scrollY ? window.scrollY : window.pageYOffset
        'touchstart' !== a.type &&
          'touchend' !== a.type &&
          'touchmove' !== a.type &&
          ((e = a.pageX - (e + b.left)),
          (a = a.pageY - (f + b.top)),
          (e *= c / b.width),
          (a *= d / b.height),
          (Jc = e - Hc),
          (Kc = a - Ic),
          (Hc = e),
          (Ic = a))
      }
    }
    var Mc = []
    function Fc() {
      var a = g.canvas
      Mc.forEach(function (b) {
        b(a.width, a.height)
      })
    }
    function Nc(a, b, c) {
      Ec(g.canvas, a, b)
      c || Fc()
    }
    function Ec(a, b, c) {
      b && c ? ((a.pd = b), (a.cd = c)) : ((b = a.pd), (c = a.cd))
      var d = b,
        e = c
      g.forcedAspectRatio &&
        0 < g.forcedAspectRatio &&
        (d / e < g.forcedAspectRatio
          ? (d = Math.round(e * g.forcedAspectRatio))
          : (e = Math.round(d / g.forcedAspectRatio)))
      if (
        (document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement ||
          document.webkitFullscreenElement ||
          document.webkitCurrentFullScreenElement) === a.parentNode &&
        'undefined' != typeof screen
      ) {
        var f = Math.min(screen.width / d, screen.height / e)
        d = Math.round(d * f)
        e = Math.round(e * f)
      }
      Bc
        ? (a.width != d && (a.width = d),
          a.height != e && (a.height = e),
          'undefined' != typeof a.style && (a.style.removeProperty('width'), a.style.removeProperty('height')))
        : (a.width != b && (a.width = b),
          a.height != c && (a.height = c),
          'undefined' != typeof a.style &&
            (d != b || e != c
              ? (a.style.setProperty('width', d + 'px', 'important'),
                a.style.setProperty('height', e + 'px', 'important'))
              : (a.style.removeProperty('width'), a.style.removeProperty('height'))))
    }
    var qc,
      rc,
      sc,
      tc,
      Oc = {}
    function Pc() {
      if (!Qc) {
        var a = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG:
              (('object' == typeof navigator && navigator.languages && navigator.languages[0]) || 'C').replace(
                '-',
                '_',
              ) + '.UTF-8',
            _: da || './this.program',
          },
          b
        for (b in Oc) void 0 === Oc[b] ? delete a[b] : (a[b] = Oc[b])
        var c = []
        for (b in a) c.push(b + '=' + a[b])
        Qc = c
      }
      return Qc
    }
    var Qc,
      Rc = [null, [], []]
    function Sc(a) {
      var b = a.getExtension('ANGLE_instanced_arrays')
      b &&
        ((a.vertexAttribDivisor = function (c, d) {
          b.vertexAttribDivisorANGLE(c, d)
        }),
        (a.drawArraysInstanced = function (c, d, e, f) {
          b.drawArraysInstancedANGLE(c, d, e, f)
        }),
        (a.drawElementsInstanced = function (c, d, e, f, h) {
          b.drawElementsInstancedANGLE(c, d, e, f, h)
        }))
    }
    function Tc(a) {
      var b = a.getExtension('OES_vertex_array_object')
      b &&
        ((a.createVertexArray = function () {
          return b.createVertexArrayOES()
        }),
        (a.deleteVertexArray = function (c) {
          b.deleteVertexArrayOES(c)
        }),
        (a.bindVertexArray = function (c) {
          b.bindVertexArrayOES(c)
        }),
        (a.isVertexArray = function (c) {
          return b.isVertexArrayOES(c)
        }))
    }
    function Uc(a) {
      var b = a.getExtension('WEBGL_draw_buffers')
      b &&
        (a.drawBuffers = function (c, d) {
          b.drawBuffersWEBGL(c, d)
        })
    }
    var Vc = 1,
      Wc = [],
      Q = [],
      R = [],
      Xc = [],
      yc = [],
      Yc = [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8]
    function S(a) {
      Zc || (Zc = a)
    }
    function $c(a) {
      for (var b = Vc++, c = a.length; c < b; c++) a[c] = null
      return b
    }
    function fc(a) {
      return 32 - Math.clz32(0 === a ? 0 : a - 1)
    }
    function xc(a, b) {
      a.Xb ||
        ((a.Xb = a.getContext),
        (a.getContext = function (d, e) {
          e = a.Xb(d, e)
          return ('webgl' == d) == e instanceof WebGLRenderingContext ? e : null
        }))
      var c = a.getContext('webgl', b)
      return c ? ad(c, b) : 0
    }
    function ad(a, b) {
      var c = $c(yc),
        d = { zd: c, attributes: b, version: b.gd, bc: a }
      a.canvas && (a.canvas.rd = d)
      yc[c] = d
      ;('undefined' == typeof b.ad || b.ad) && bd(d)
      d.Dc = d.bc.getParameter(34921)
      d.cc = []
      for (a = 0; a < d.Dc; a++) d.cc[a] = { enabled: !1, oc: !1, size: 0, type: 0, Gc: 0, uc: 0, Nb: 0, Pc: null }
      a = fc(2097152)
      d.Rb = []
      d.kc = []
      d.Rb.length = d.kc.length = a + 1
      d.Wb = []
      d.$b = []
      d.Wb.length = d.$b.length = a + 1
      d.Vb = []
      d.Vb.length = a + 1
      for (b = 0; b <= a; ++b) {
        d.Vb[b] = null
        d.Rb[b] = d.kc[b] = 0
        d.Wb[b] = []
        d.$b[b] = []
        var e = d.Wb[b],
          f = d.$b[b]
        e.length = f.length = 64
        for (var h = 0; 64 > h; ++h) e[h] = f[h] = null
      }
      return c
    }
    function bd(a) {
      a || (a = O)
      if (!a.ed) {
        a.ed = !0
        var b = a.bc
        Sc(b)
        Tc(b)
        Uc(b)
        b.wd = b.getExtension('EXT_disjoint_timer_query')
        b.Cd = b.getExtension('WEBGL_multi_draw')
        ;(b.getSupportedExtensions() || []).forEach(function (c) {
          c.includes('lose_context') || c.includes('debug') || b.getExtension(c)
        })
      }
    }
    var wc = {},
      Zc,
      O,
      cd
    function ed(a, b, c, d) {
      for (var e = 0; e < a; e++) {
        var f = P[c](),
          h = f && $c(d)
        f ? ((f.name = h), (d[h] = f)) : S(1282)
        A[(b + 4 * e) >> 2] = h
      }
    }
    function fd(a) {
      return ']' == a.slice(-1) && a.lastIndexOf('[')
    }
    function gd(a) {
      var b = P.$c
      if (b) {
        var c = b.ac[a]
        'number' == typeof c && (b.ac[a] = c = P.getUniformLocation(b, b.Mc[a] + (0 < c ? '[' + c + ']' : '')))
        return c
      }
      S(1282)
    }
    var hd = []
    function jd(a, b, c, d) {
      this.id = a
      this.y = this.x = 0
      this.qc = !1
      this.Lc = this.Kc = 0
      this.width = b
      this.height = c
      this.Jc = b
      this.Ic = c
      this.title = d
      this.attributes = T
      this.buttons = 0
      this.keys = []
      this.pc = []
      this.kd = 0
      this.Oc =
        this.yc =
        this.Cc =
        this.Ac =
        this.Hc =
        this.ec =
        this.zc =
        this.Ec =
        this.qd =
        this.fc =
        this.Qc =
        this.nc =
        this.title =
          null
    }
    function kd(a) {
      return 0 >= a || !U ? null : U[a - 1]
    }
    var V = null,
      ld = null,
      U = null,
      T = null,
      md = {
        131073: 0,
        131074: 0,
        131075: 1,
        131076: 1,
        131077: 1,
        131082: 0,
        135169: 8,
        135170: 8,
        135171: 8,
        135172: 8,
        135173: 24,
        135174: 8,
        135175: 0,
        135176: 0,
        135177: 0,
        135178: 0,
        135179: 0,
        135180: 0,
        135181: 0,
        135182: 0,
        135183: 0,
        139265: 196609,
        139266: 1,
        139267: 0,
        139268: 0,
        139269: 0,
        139270: 0,
        139271: 0,
        139272: 0,
        139276: 0,
      }
    function nd(a) {
      switch (a) {
        case 32:
          return 32
        case 222:
          return 39
        case 188:
          return 44
        case 173:
          return 45
        case 189:
          return 45
        case 190:
          return 46
        case 191:
          return 47
        case 48:
          return 48
        case 49:
          return 49
        case 50:
          return 50
        case 51:
          return 51
        case 52:
          return 52
        case 53:
          return 53
        case 54:
          return 54
        case 55:
          return 55
        case 56:
          return 56
        case 57:
          return 57
        case 59:
          return 59
        case 61:
          return 61
        case 187:
          return 61
        case 65:
          return 65
        case 66:
          return 66
        case 67:
          return 67
        case 68:
          return 68
        case 69:
          return 69
        case 70:
          return 70
        case 71:
          return 71
        case 72:
          return 72
        case 73:
          return 73
        case 74:
          return 74
        case 75:
          return 75
        case 76:
          return 76
        case 77:
          return 77
        case 78:
          return 78
        case 79:
          return 79
        case 80:
          return 80
        case 81:
          return 81
        case 82:
          return 82
        case 83:
          return 83
        case 84:
          return 84
        case 85:
          return 85
        case 86:
          return 86
        case 87:
          return 87
        case 88:
          return 88
        case 89:
          return 89
        case 90:
          return 90
        case 219:
          return 91
        case 220:
          return 92
        case 221:
          return 93
        case 192:
          return 96
        case 27:
          return 256
        case 13:
          return 257
        case 9:
          return 258
        case 8:
          return 259
        case 45:
          return 260
        case 46:
          return 261
        case 39:
          return 262
        case 37:
          return 263
        case 40:
          return 264
        case 38:
          return 265
        case 33:
          return 266
        case 34:
          return 267
        case 36:
          return 268
        case 35:
          return 269
        case 20:
          return 280
        case 145:
          return 281
        case 144:
          return 282
        case 44:
          return 283
        case 19:
          return 284
        case 112:
          return 290
        case 113:
          return 291
        case 114:
          return 292
        case 115:
          return 293
        case 116:
          return 294
        case 117:
          return 295
        case 118:
          return 296
        case 119:
          return 297
        case 120:
          return 298
        case 121:
          return 299
        case 122:
          return 300
        case 123:
          return 301
        case 124:
          return 302
        case 125:
          return 303
        case 126:
          return 304
        case 127:
          return 305
        case 128:
          return 306
        case 129:
          return 307
        case 130:
          return 308
        case 131:
          return 309
        case 132:
          return 310
        case 133:
          return 311
        case 134:
          return 312
        case 135:
          return 313
        case 136:
          return 314
        case 96:
          return 320
        case 97:
          return 321
        case 98:
          return 322
        case 99:
          return 323
        case 100:
          return 324
        case 101:
          return 325
        case 102:
          return 326
        case 103:
          return 327
        case 104:
          return 328
        case 105:
          return 329
        case 110:
          return 330
        case 111:
          return 331
        case 106:
          return 332
        case 109:
          return 333
        case 107:
          return 334
        case 16:
          return 340
        case 17:
          return 341
        case 18:
          return 342
        case 91:
          return 343
        case 93:
          return 348
        default:
          return -1
      }
    }
    function od() {
      var a = V,
        b = 0
      a.keys[340] && (b |= 1)
      a.keys[341] && (b |= 2)
      a.keys[342] && (b |= 4)
      a.keys[343] && (b |= 8)
      return b
    }
    function pd(a) {
      V && V.yc && !a.ctrlKey && !a.metaKey && ((a = a.charCode), 0 == a || (0 <= a && 31 >= a) || D(V.yc)(V.id, a))
    }
    function qd(a, b) {
      if (V) {
        var c = nd(a)
        if (-1 != c) {
          var d = b && V.keys[c]
          V.keys[c] = b
          V.pc[a] = b
          V.Cc && (d && (b = 2), D(V.Cc)(V.id, c, a, b, od()))
        }
      }
    }
    function rd() {
      sd()
    }
    function td() {
      sd()
    }
    function ud(a) {
      qd(a.keyCode, 1)
      ;(8 !== a.keyCode && 9 !== a.keyCode) || a.preventDefault()
    }
    function vd(a) {
      qd(a.keyCode, 0)
    }
    function wd() {
      if (V) for (var a = 0; a < V.pc.length; ++a) V.pc[a] && qd(a, 0)
    }
    function xd(a) {
      V && (Lc(a), a.target == g.canvas && V.zc && D(V.zc)(V.id, Hc, Ic))
    }
    function yd(a) {
      V && a.target == g.canvas && V.ec && D(V.ec)(V.id, 1)
    }
    function zd(a) {
      V && a.target == g.canvas && V.ec && D(V.ec)(V.id, 0)
    }
    function Ad(a, b) {
      if (V && (Lc(a), a.target == g.canvas)) {
        var c = a.button
        0 < c && (c = 1 == c ? 2 : 1)
        if (1 == b) {
          V.buttons |= 1 << c
          try {
            a.target.setCapture()
          } catch (d) {}
        } else V.buttons &= ~(1 << c)
        V.Ec && D(V.Ec)(V.id, c, b, od())
      }
    }
    function Bd(a) {
      V && Ad(a, 1)
    }
    function Cd(a) {
      V && Ad(a, 0)
    }
    function Dd(a) {
      switch (a.type) {
        case 'DOMMouseScroll':
          var b = a.detail / 3
          break
        case 'mousewheel':
          b = a.wheelDelta / 120
          break
        case 'wheel':
          b = a.deltaY
          switch (a.deltaMode) {
            case 0:
              b /= 100
              break
            case 1:
              b /= 3
              break
            case 2:
              b *= 80
              break
            default:
              throw 'unrecognized mouse wheel delta mode: ' + a.deltaMode
          }
          break
        default:
          throw 'unrecognized mouse wheel event: ' + a.type
      }
      b = -b
      b = 0 == b ? 0 : 0 < b ? Math.max(b, 1) : Math.min(b, -1)
      if (V && V.Hc && a.target == g.canvas) {
        var c = b
        b = 'mousewheel' == a.type ? a.wheelDeltaX : a.deltaX
        D(V.Hc)(V.id, b, c)
        a.preventDefault()
      }
    }
    var W = {},
      Ed = [],
      Fd = null
    function sd() {
      if (ec !== Fd || !ec) {
        Ed = navigator.getGamepads
          ? navigator.getGamepads()
          : navigator.webkitGetGamepads
          ? navigator.webkitGetGamepads
          : []
        Fd = ec
        for (var a = 0; a < Ed.length; ++a) {
          var b = Ed[a]
          if (b) {
            if (!W[a]) {
              ja('glfw joystick connected:', a)
              var c = a,
                d = b.id,
                e = ta(d) + 1,
                f = Gd(e)
              f && sa(d, z, f, e)
              W[c] = {
                id: f,
                ud: b.buttons.length,
                td: b.axes.length,
                buttons: Gd(b.buttons.length),
                axes: Gd(4 * b.axes.length),
              }
            }
            c = W[a]
            for (d = 0; d < b.buttons.length; ++d) z[(c.buttons + d) >> 0] = b.buttons[d].pressed
            for (d = 0; d < b.axes.length; ++d) C[(c.axes + 4 * d) >> 2] = b.axes[d]
          } else W[a] && (ja('glfw joystick disconnected', a), L(W[a].id), L(W[a].buttons), L(W[a].axes), delete W[a])
        }
      }
    }
    function Hd(a) {
      if (V && V.Ac && a.dataTransfer && a.dataTransfer.files && 0 != a.dataTransfer.files.length)
        return a.preventDefault(), !1
    }
    function Id(a) {
      if (V && V.Ac) return a.preventDefault(), !1
    }
    function Jd(a) {
      return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400)
    }
    var Kd = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      Ld = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    function Md(a) {
      var b = Array(ta(a) + 1)
      sa(a, b, 0, b.length)
      return b
    }
    function Nd(a, b, c, d) {
      function e(l, v, t) {
        for (l = 'number' == typeof l ? l.toString() : l || ''; l.length < v; ) l = t[0] + l
        return l
      }
      function f(l, v) {
        return e(l, v, '0')
      }
      function h(l, v) {
        function t(G) {
          return 0 > G ? -1 : 0 < G ? 1 : 0
        }
        var N
        0 === (N = t(l.getFullYear() - v.getFullYear())) &&
          0 === (N = t(l.getMonth() - v.getMonth())) &&
          (N = t(l.getDate() - v.getDate()))
        return N
      }
      function k(l) {
        switch (l.getDay()) {
          case 0:
            return new Date(l.getFullYear() - 1, 11, 29)
          case 1:
            return l
          case 2:
            return new Date(l.getFullYear(), 0, 3)
          case 3:
            return new Date(l.getFullYear(), 0, 2)
          case 4:
            return new Date(l.getFullYear(), 0, 1)
          case 5:
            return new Date(l.getFullYear() - 1, 11, 31)
          case 6:
            return new Date(l.getFullYear() - 1, 11, 30)
        }
      }
      function m(l) {
        var v = l.Sb
        for (l = new Date(new Date(l.Tb + 1900, 0, 1).getTime()); 0 < v; ) {
          var t = l.getMonth(),
            N = (Jd(l.getFullYear()) ? Kd : Ld)[t]
          if (v > N - l.getDate())
            (v -= N - l.getDate() + 1),
              l.setDate(1),
              11 > t ? l.setMonth(t + 1) : (l.setMonth(0), l.setFullYear(l.getFullYear() + 1))
          else {
            l.setDate(l.getDate() + v)
            break
          }
        }
        t = new Date(l.getFullYear() + 1, 0, 4)
        v = k(new Date(l.getFullYear(), 0, 4))
        t = k(t)
        return 0 >= h(v, l) ? (0 >= h(t, l) ? l.getFullYear() + 1 : l.getFullYear()) : l.getFullYear() - 1
      }
      var p = A[(d + 40) >> 2]
      d = {
        nd: A[d >> 2],
        md: A[(d + 4) >> 2],
        lc: A[(d + 8) >> 2],
        vc: A[(d + 12) >> 2],
        mc: A[(d + 16) >> 2],
        Tb: A[(d + 20) >> 2],
        Pb: A[(d + 24) >> 2],
        Sb: A[(d + 28) >> 2],
        Fd: A[(d + 32) >> 2],
        ld: A[(d + 36) >> 2],
        od: p ? ra(p) : '',
      }
      c = ra(c)
      p = {
        '%c': '%a %b %d %H:%M:%S %Y',
        '%D': '%m/%d/%y',
        '%F': '%Y-%m-%d',
        '%h': '%b',
        '%r': '%I:%M:%S %p',
        '%R': '%H:%M',
        '%T': '%H:%M:%S',
        '%x': '%m/%d/%y',
        '%X': '%H:%M:%S',
        '%Ec': '%c',
        '%EC': '%C',
        '%Ex': '%m/%d/%y',
        '%EX': '%H:%M:%S',
        '%Ey': '%y',
        '%EY': '%Y',
        '%Od': '%d',
        '%Oe': '%e',
        '%OH': '%H',
        '%OI': '%I',
        '%Om': '%m',
        '%OM': '%M',
        '%OS': '%S',
        '%Ou': '%u',
        '%OU': '%U',
        '%OV': '%V',
        '%Ow': '%w',
        '%OW': '%W',
        '%Oy': '%y',
      }
      for (var r in p) c = c.replace(new RegExp(r, 'g'), p[r])
      var x = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
        y = 'January February March April May June July August September October November December'.split(' ')
      p = {
        '%a': function (l) {
          return x[l.Pb].substring(0, 3)
        },
        '%A': function (l) {
          return x[l.Pb]
        },
        '%b': function (l) {
          return y[l.mc].substring(0, 3)
        },
        '%B': function (l) {
          return y[l.mc]
        },
        '%C': function (l) {
          return f(((l.Tb + 1900) / 100) | 0, 2)
        },
        '%d': function (l) {
          return f(l.vc, 2)
        },
        '%e': function (l) {
          return e(l.vc, 2, ' ')
        },
        '%g': function (l) {
          return m(l).toString().substring(2)
        },
        '%G': function (l) {
          return m(l)
        },
        '%H': function (l) {
          return f(l.lc, 2)
        },
        '%I': function (l) {
          l = l.lc
          0 == l ? (l = 12) : 12 < l && (l -= 12)
          return f(l, 2)
        },
        '%j': function (l) {
          for (var v = 0, t = 0; t <= l.mc - 1; v += (Jd(l.Tb + 1900) ? Kd : Ld)[t++]);
          return f(l.vc + v, 3)
        },
        '%m': function (l) {
          return f(l.mc + 1, 2)
        },
        '%M': function (l) {
          return f(l.md, 2)
        },
        '%n': function () {
          return '\n'
        },
        '%p': function (l) {
          return 0 <= l.lc && 12 > l.lc ? 'AM' : 'PM'
        },
        '%S': function (l) {
          return f(l.nd, 2)
        },
        '%t': function () {
          return '\t'
        },
        '%u': function (l) {
          return l.Pb || 7
        },
        '%U': function (l) {
          return f(Math.floor((l.Sb + 7 - l.Pb) / 7), 2)
        },
        '%V': function (l) {
          var v = Math.floor((l.Sb + 7 - ((l.Pb + 6) % 7)) / 7)
          2 >= (l.Pb + 371 - l.Sb - 2) % 7 && v++
          if (v) 53 == v && ((t = (l.Pb + 371 - l.Sb) % 7), 4 == t || (3 == t && Jd(l.Tb)) || (v = 1))
          else {
            v = 52
            var t = (l.Pb + 7 - l.Sb - 1) % 7
            ;(4 == t || (5 == t && Jd((l.Tb % 400) - 1))) && v++
          }
          return f(v, 2)
        },
        '%w': function (l) {
          return l.Pb
        },
        '%W': function (l) {
          return f(Math.floor((l.Sb + 7 - ((l.Pb + 6) % 7)) / 7), 2)
        },
        '%y': function (l) {
          return (l.Tb + 1900).toString().substring(2)
        },
        '%Y': function (l) {
          return l.Tb + 1900
        },
        '%z': function (l) {
          l = l.ld
          var v = 0 <= l
          l = Math.abs(l) / 60
          return (v ? '+' : '-') + String('0000' + ((l / 60) * 100 + (l % 60))).slice(-4)
        },
        '%Z': function (l) {
          return l.od
        },
        '%%': function () {
          return '%'
        },
      }
      c = c.replace(/%%/g, '\x00\x00')
      for (r in p) c.includes(r) && (c = c.replace(new RegExp(r, 'g'), p[r](d)))
      c = c.replace(/\0\0/g, '%')
      r = Md(c)
      if (r.length > b) return 0
      z.set(r, a)
      return r.length - 1
    }
    for (var Od = Array(256), Pd = 0; 256 > Pd; ++Pd) Od[Pd] = String.fromCharCode(Pd)
    $a = Od
    gb = g.BindingError = fb('BindingError')
    hb = g.InternalError = fb('InternalError')
    g.count_emval_handles = function () {
      for (var a = 0, b = 5; b < I.length; ++b) void 0 !== I[b] && ++a
      return a
    }
    g.get_first_emval = function () {
      for (var a = 5; a < I.length; ++a) if (void 0 !== I[a]) return I[a]
      return null
    }
    ub = g.UnboundTypeError = fb('UnboundTypeError')
    g.requestFullscreen = function (a, b) {
      Cc(a, b)
    }
    g.requestAnimationFrame = function (a) {
      Yb(a)
    }
    g.setCanvasSize = function (a, b, c) {
      Nc(a, b, c)
    }
    g.pauseMainLoop = function () {
      M = null
      ac++
    }
    g.resumeMainLoop = function () {
      ac++
      var a = Rb,
        b = Sb,
        c = Tb
      Tb = null
      Zb(c, 0, !1, $b, !0)
      Qb(a, b)
      M()
    }
    g.getUserMedia = function () {
      window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia)
      window.getUserMedia(void 0)
    }
    g.createContext = function (a, b, c, d) {
      return vc(a, b, c, d)
    }
    for (var P, Qd = new Float32Array(288), Rd = 0; 288 > Rd; ++Rd) hd[Rd] = Qd.subarray(0, Rd + 1)
    var ze = {
      s: function (a) {
        a = new Ua(a)
        a.Tc() || (a.sc(!0), Ra--)
        a.tc(!1)
        Qa.push(a)
        a.Rc()
        return a.Uc()
      },
      x: function () {
        X(0)
        var a = Qa.pop()
        if (a.jd() && !a.Bc()) {
          var b = a.bd()
          b && D(b)(a.Zb)
          Sd(a.Zb)
        }
        Sa = 0
      },
      a: Wa,
      f: Wa,
      Va: function () {
        var a = Qa.pop()
        a || u('no exception to throw')
        var b = a.Zb
        a.Bc() || (Qa.push(a), a.tc(!0), a.sc(!1), Ra++)
        Sa = b
        throw b
      },
      o: function (a, b, c) {
        new Ua(a).Vc(b, c)
        Sa = a
        Ra++
        throw a
      },
      b: function (a) {
        Sa || (Sa = a)
        throw a
      },
      ab: function () {},
      Z: function (a, b, c, d, e) {
        var f = Za(c)
        b = E(b)
        H(a, {
          name: b,
          fromWireType: function (h) {
            return !!h
          },
          toWireType: function (h, k) {
            return k ? d : e
          },
          argPackAdvance: 8,
          readValueFromPointer: function (h) {
            if (1 === c) var k = z
            else if (2 === c) k = ua
            else if (4 === c) k = A
            else throw new TypeError('Unknown boolean type size: ' + b)
            return this.fromWireType(k[h >> f])
          },
          Qb: null,
        })
      },
      X: function (a, b) {
        b = E(b)
        H(a, {
          name: b,
          fromWireType: function (c) {
            var d = J(c)
            kb(c)
            return d
          },
          toWireType: function (c, d) {
            return K(d)
          },
          argPackAdvance: 8,
          readValueFromPointer: lb,
          Qb: null,
        })
      },
      J: function (a, b, c) {
        c = Za(c)
        b = E(b)
        H(a, {
          name: b,
          fromWireType: function (d) {
            return d
          },
          toWireType: function (d, e) {
            return e
          },
          argPackAdvance: 8,
          readValueFromPointer: mb(b, c),
          Qb: null,
        })
      },
      w: function (a, b, c, d, e, f, h) {
        var k = rb(b, c)
        a = E(a)
        e = tb(d, e)
        qb(
          a,
          function () {
            xb('Cannot call ' + a + ' due to unbound types', k)
          },
          b - 1,
        )
        ib(k, function (m) {
          var p = a,
            r = a
          m = [m[0], null].concat(m.slice(1))
          var x = e,
            y = m.length
          2 > y && F("argTypes array size mismatch! Must at least get return value and 'this' types!")
          for (var l = null !== m[1] && !1, v = !1, t = 1; t < m.length; ++t)
            if (null !== m[t] && void 0 === m[t].Qb) {
              v = !0
              break
            }
          var N = 'void' !== m[0].name,
            G = '',
            qa = ''
          for (t = 0; t < y - 2; ++t)
            (G += (0 !== t ? ', ' : '') + 'arg' + t), (qa += (0 !== t ? ', ' : '') + 'arg' + t + 'Wired')
          r =
            'return function ' +
            db(r) +
            '(' +
            G +
            ') {\nif (arguments.length !== ' +
            (y - 2) +
            ") {\nthrowBindingError('function " +
            r +
            " called with ' + arguments.length + ' arguments, expected " +
            (y - 2) +
            " args!');\n}\n"
          v && (r += 'var destructors = [];\n')
          var dd = v ? 'destructors' : 'null'
          G = 'throwBindingError invoker fn runDestructors retType classParam'.split(' ')
          x = [F, x, f, ob, m[0], m[1]]
          l && (r += 'var thisWired = classParam.toWireType(' + dd + ', this);\n')
          for (t = 0; t < y - 2; ++t)
            (r +=
              'var arg' +
              t +
              'Wired = argType' +
              t +
              '.toWireType(' +
              dd +
              ', arg' +
              t +
              '); // ' +
              m[t + 2].name +
              '\n'),
              G.push('argType' + t),
              x.push(m[t + 2])
          l && (qa = 'thisWired' + (0 < qa.length ? ', ' : '') + qa)
          r += (N || h ? 'var rv = ' : '') + 'invoker(fn' + (0 < qa.length ? ', ' : '') + qa + ');\n'
          if (v) r += 'runDestructors(destructors);\n'
          else
            for (t = l ? 1 : 2; t < m.length; ++t)
              (y = 1 === t ? 'thisWired' : 'arg' + (t - 2) + 'Wired'),
                null !== m[t].Qb &&
                  ((r += y + '_dtor(' + y + '); // ' + m[t].name + '\n'), G.push(y + '_dtor'), x.push(m[t].Qb))
          N && (r += 'var ret = retType.fromWireType(rv);\nreturn ret;\n')
          G.push(r + '}\n')
          m = nb(G).apply(null, x)
          t = b - 1
          if (!g.hasOwnProperty(p)) throw new hb('Replacing nonexistant public symbol')
          void 0 !== g[p].Ob && void 0 !== t ? (g[p].Ob[t] = m) : ((g[p] = m), (g[p].Zc = t))
          return []
        })
      },
      t: function (a, b, c, d, e) {
        b = E(b)
        ;-1 === e && (e = 4294967295)
        e = Za(c)
        var f = (k) => k
        if (0 === d) {
          var h = 32 - 8 * c
          f = (k) => (k << h) >>> h
        }
        c = b.includes('unsigned')
          ? function (k, m) {
              return m >>> 0
            }
          : function (k, m) {
              return m
            }
        H(a, {
          name: b,
          fromWireType: f,
          toWireType: c,
          argPackAdvance: 8,
          readValueFromPointer: yb(b, e, 0 !== d),
          Qb: null,
        })
      },
      p: function (a, b, c) {
        function d(f) {
          f >>= 2
          var h = B
          return new e(h.buffer, h[f + 1], h[f])
        }
        var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][b]
        c = E(c)
        H(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { dd: !0 })
      },
      I: function (a, b) {
        b = E(b)
        var c = 'std::string' === b
        H(a, {
          name: b,
          fromWireType: function (d) {
            var e = B[d >> 2],
              f = d + 4
            if (c)
              for (var h = f, k = 0; k <= e; ++k) {
                var m = f + k
                if (k == e || 0 == w[m]) {
                  h = ra(h, m - h)
                  if (void 0 === p) var p = h
                  else (p += String.fromCharCode(0)), (p += h)
                  h = m + 1
                }
              }
            else {
              p = Array(e)
              for (k = 0; k < e; ++k) p[k] = String.fromCharCode(w[f + k])
              p = p.join('')
            }
            L(d)
            return p
          },
          toWireType: function (d, e) {
            e instanceof ArrayBuffer && (e = new Uint8Array(e))
            var f,
              h = 'string' == typeof e
            h ||
              e instanceof Uint8Array ||
              e instanceof Uint8ClampedArray ||
              e instanceof Int8Array ||
              F('Cannot pass non-string to std::string')
            c && h ? (f = ta(e)) : (f = e.length)
            var k = Gd(4 + f + 1),
              m = k + 4
            B[k >> 2] = f
            if (c && h) sa(e, w, m, f + 1)
            else if (h)
              for (h = 0; h < f; ++h) {
                var p = e.charCodeAt(h)
                255 < p && (L(m), F('String has UTF-16 code units that do not fit in 8 bits'))
                w[m + h] = p
              }
            else for (h = 0; h < f; ++h) w[m + h] = e[h]
            null !== d && d.push(L, k)
            return k
          },
          argPackAdvance: 8,
          readValueFromPointer: lb,
          Qb: function (d) {
            L(d)
          },
        })
      },
      D: function (a, b, c) {
        c = E(c)
        if (2 === b) {
          var d = Ab
          var e = Bb
          var f = Cb
          var h = () => va
          var k = 1
        } else 4 === b && ((d = Db), (e = Eb), (f = Fb), (h = () => B), (k = 2))
        H(a, {
          name: c,
          fromWireType: function (m) {
            for (var p = B[m >> 2], r = h(), x, y = m + 4, l = 0; l <= p; ++l) {
              var v = m + 4 + l * b
              if (l == p || 0 == r[v >> k])
                (y = d(y, v - y)), void 0 === x ? (x = y) : ((x += String.fromCharCode(0)), (x += y)), (y = v + b)
            }
            L(m)
            return x
          },
          toWireType: function (m, p) {
            'string' != typeof p && F('Cannot pass non-string to C++ string type ' + c)
            var r = f(p),
              x = Gd(4 + r + b)
            B[x >> 2] = r >> k
            e(p, x + 4, r + b)
            null !== m && m.push(L, x)
            return x
          },
          argPackAdvance: 8,
          readValueFromPointer: lb,
          Qb: function (m) {
            L(m)
          },
        })
      },
      _: function (a, b) {
        b = E(b)
        H(a, { fd: !0, name: b, argPackAdvance: 0, fromWireType: function () {}, toWireType: function () {} })
      },
      kb: function () {
        return !0
      },
      Xa: function (a, b, c) {
        a = J(a)
        b = Gb(b, 'emval::as')
        var d = [],
          e = K(d)
        B[c >> 2] = e
        return b.toWireType(d, a)
      },
      M: function (a, b, c, d) {
        a = Jb[a]
        b = J(b)
        c = Ib(c)
        a(b, c, null, d)
      },
      Za: kb,
      ea: function (a) {
        if (0 === a) return K(Kb())
        a = Ib(a)
        return K(Kb()[a])
      },
      L: function (a, b) {
        var c = Mb(a, b),
          d = c[0]
        b =
          d.name +
          '_$' +
          c
            .slice(1)
            .map(function (r) {
              return r.name
            })
            .join('_') +
          '$'
        var e = Nb[b]
        if (void 0 !== e) return e
        e = ['retType']
        for (var f = [d], h = '', k = 0; k < a - 1; ++k)
          (h += (0 !== k ? ', ' : '') + 'arg' + k), e.push('argType' + k), f.push(c[1 + k])
        var m = 'return function ' + db('methodCaller_' + b) + '(handle, name, destructors, args) {\n',
          p = 0
        for (k = 0; k < a - 1; ++k)
          (m += '    var arg' + k + ' = argType' + k + '.readValueFromPointer(args' + (p ? '+' + p : '') + ');\n'),
            (p += c[k + 1].argPackAdvance)
        m += '    var rv = handle[name](' + h + ');\n'
        for (k = 0; k < a - 1; ++k) c[k + 1].deleteObject && (m += '    argType' + k + '.deleteObject(arg' + k + ');\n')
        d.fd || (m += '    return retType.toWireType(destructors, rv);\n')
        e.push(m + '};\n')
        a = nb(e).apply(null, f)
        e = Lb(a)
        return (Nb[b] = e)
      },
      ba: function (a) {
        a = Ib(a)
        return K(g[a])
      },
      Ya: function (a, b) {
        a = J(a)
        b = J(b)
        return K(a[b])
      },
      R: function (a) {
        4 < a && (I[a].rc += 1)
      },
      da: function (a, b) {
        a = J(a)
        b = J(b)
        return a instanceof b
      },
      K: function (a, b, c, d) {
        a = J(a)
        var e = Pb[b]
        e || ((e = Ob(b)), (Pb[b] = e))
        return e(a, c, d)
      },
      Ua: function (a) {
        return K(Ib(a))
      },
      Ta: function (a) {
        var b = J(a)
        ob(b)
        kb(a)
      },
      ca: function (a, b, c) {
        a = J(a)
        b = J(b)
        c = J(c)
        a[b] = c
      },
      G: function () {
        u('')
      },
      $: function () {
        M = null
        ac++
        Tb = null
      },
      V: Wb,
      W: function (a, b, c) {
        w.copyWithin(a, b, b + c)
      },
      U: function (a) {
        var b = w.length
        a >>>= 0
        if (2147483648 < a) return !1
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c)
          d = Math.min(d, a + 100663296)
          var e = Math,
            f = e.min
          d = Math.max(a, d)
          d += (65536 - (d % 65536)) % 65536
          a: {
            var h = la.buffer
            try {
              la.grow((f.call(e, 2147483648, d) - h.byteLength + 65535) >>> 16)
              xa()
              var k = 1
              break a
            } catch (m) {}
            k = void 0
          }
          if (k) return !0
        }
        return !1
      },
      aa: function (a, b, c, d) {
        Zb(() => D(a)(b), c, d, b)
      },
      ib: function (a, b) {
        var c = 0
        Pc().forEach(function (d, e) {
          var f = b + c
          e = B[(a + 4 * e) >> 2] = f
          for (f = 0; f < d.length; ++f) z[e++ >> 0] = d.charCodeAt(f)
          z[e >> 0] = 0
          c += d.length + 1
        })
        return 0
      },
      jb: function (a, b) {
        var c = Pc()
        B[a >> 2] = c.length
        var d = 0
        c.forEach(function (e) {
          d += e.length + 1
        })
        B[b >> 2] = d
        return 0
      },
      H: function (a, b, c, d) {
        for (var e = 0, f = 0; f < c; f++) {
          var h = B[b >> 2],
            k = B[(b + 4) >> 2]
          b += 8
          for (var m = 0; m < k; m++) {
            var p = w[h + m],
              r = Rc[a]
            0 === p || 10 === p ? ((1 === a ? ja : q)(pa(r, 0)), (r.length = 0)) : r.push(p)
          }
          e += k
        }
        B[d >> 2] = e
        return 0
      },
      la: function (a, b) {
        P.attachShader(Q[a], R[b])
      },
      z: function (a, b) {
        34962 == a ? (P.dc = b) : 34963 == a && (P.Yb = b)
        P.bindBuffer(a, Wc[b])
      },
      y: function (a) {
        P.bindVertexArray(Xc[a])
        a = P.getParameter(34965)
        P.Yb = a ? a.name | 0 : 0
      },
      O: function (a, b, c, d) {
        P.bufferData(a, c ? w.subarray(c, c + b) : b, d)
      },
      Da: function (a, b, c, d) {
        P.bufferSubData(a, b, w.subarray(d, d + c))
      },
      Ka: function (a) {
        P.clear(a)
      },
      La: function (a, b, c, d) {
        P.clearColor(a, b, c, d)
      },
      pa: function (a) {
        P.compileShader(R[a])
      },
      ma: function () {
        var a = $c(Q),
          b = P.createProgram()
        b.name = a
        b.jc = b.hc = b.ic = 0
        b.wc = 1
        Q[a] = b
        return a
      },
      ra: function (a) {
        var b = $c(R)
        R[b] = P.createShader(a)
        return b
      },
      za: function (a, b) {
        for (var c = 0; c < a; c++) {
          var d = A[(b + 4 * c) >> 2],
            e = Wc[d]
          e && (P.deleteBuffer(e), (e.name = 0), (Wc[d] = null), d == P.dc && (P.dc = 0), d == P.Yb && (P.Yb = 0))
        }
      },
      ha: function (a) {
        if (a) {
          var b = Q[a]
          b ? (P.deleteProgram(b), (b.name = 0), (Q[a] = null)) : S(1281)
        }
      },
      ia: function (a) {
        if (a) {
          var b = R[a]
          b ? (P.deleteShader(b), (R[a] = null)) : S(1281)
        }
      },
      Ca: function (a, b, c, d) {
        if (!P.Yb) {
          var e = 1 * Yc[c - 5120] * b
          var f = fc(e)
          var h = O.Vb[f]
          h
            ? (f = h)
            : ((h = P.getParameter(34965)),
              (O.Vb[f] = P.createBuffer()),
              P.bindBuffer(34963, O.Vb[f]),
              P.bufferData(34963, 1 << f, 35048),
              P.bindBuffer(34963, h),
              (f = O.Vb[f]))
          P.bindBuffer(34963, f)
          P.bufferSubData(34963, 0, w.subarray(d, d + e))
          d = 0
        }
        cd = !1
        for (e = 0; e < O.Dc; ++e)
          if (((f = O.cc[e]), f.oc && f.enabled)) {
            cd = !0
            h = f.uc
            h = 0 < h ? b * h : f.size * Yc[f.type - 5120] * b
            var k = fc(h)
            var m = O.Wb[k],
              p = O.Rb[k]
            O.Rb[k] = (O.Rb[k] + 1) & 63
            var r = m[p]
            r
              ? (k = r)
              : ((r = P.getParameter(34964)),
                (m[p] = P.createBuffer()),
                P.bindBuffer(34962, m[p]),
                P.bufferData(34962, 1 << k, 35048),
                P.bindBuffer(34962, r),
                (k = m[p]))
            P.bindBuffer(34962, k)
            P.bufferSubData(34962, 0, w.subarray(f.Nb, f.Nb + h))
            f.Pc.call(P, e, f.size, f.type, f.Gc, f.uc, 0)
          }
        P.drawElements(a, b, c, d)
        cd && P.bindBuffer(34962, Wc[P.dc])
        P.Yb || P.bindBuffer(34963, null)
      },
      ya: function (a) {
        O.cc[a].enabled = !0
        P.enableVertexAttribArray(a)
      },
      Aa: function (a, b) {
        ed(a, b, 'createBuffer', Wc)
      },
      Ba: function (a, b) {
        ed(a, b, 'createVertexArray', Xc)
      },
      ua: function (a, b, c, d, e, f, h) {
        a = Q[a]
        if ((b = P.getActiveUniform(a, b)))
          (c = h && sa(b.name, w, h, c)), d && (A[d >> 2] = c), e && (A[e >> 2] = b.size), f && (A[f >> 2] = b.type)
      },
      ja: function (a, b, c, d) {
        a = P.getProgramInfoLog(Q[a])
        null === a && (a = '(unknown error)')
        b = 0 < b && d ? sa(a, w, d, b) : 0
        c && (A[c >> 2] = b)
      },
      sa: function (a, b, c) {
        if (c)
          if (a >= Vc) S(1281)
          else if (((a = Q[a]), 35716 == b))
            (a = P.getProgramInfoLog(a)), null === a && (a = '(unknown error)'), (A[c >> 2] = a.length + 1)
          else if (35719 == b) {
            if (!a.jc)
              for (b = 0; b < P.getProgramParameter(a, 35718); ++b)
                a.jc = Math.max(a.jc, P.getActiveUniform(a, b).name.length + 1)
            A[c >> 2] = a.jc
          } else if (35722 == b) {
            if (!a.hc)
              for (b = 0; b < P.getProgramParameter(a, 35721); ++b)
                a.hc = Math.max(a.hc, P.getActiveAttrib(a, b).name.length + 1)
            A[c >> 2] = a.hc
          } else if (35381 == b) {
            if (!a.ic)
              for (b = 0; b < P.getProgramParameter(a, 35382); ++b)
                a.ic = Math.max(a.ic, P.getActiveUniformBlockName(a, b).length + 1)
            A[c >> 2] = a.ic
          } else A[c >> 2] = P.getProgramParameter(a, b)
        else S(1281)
      },
      na: function (a, b, c, d) {
        a = P.getShaderInfoLog(R[a])
        null === a && (a = '(unknown error)')
        b = 0 < b && d ? sa(a, w, d, b) : 0
        c && (A[c >> 2] = b)
      },
      oa: function (a, b, c) {
        c
          ? 35716 == b
            ? ((a = P.getShaderInfoLog(R[a])),
              null === a && (a = '(unknown error)'),
              (A[c >> 2] = a ? a.length + 1 : 0))
            : 35720 == b
            ? ((a = P.getShaderSource(R[a])), (A[c >> 2] = a ? a.length + 1 : 0))
            : (A[c >> 2] = P.getShaderParameter(R[a], b))
          : S(1281)
      },
      ta: function (a, b) {
        b = ra(b)
        if ((a = Q[a])) {
          var c = a,
            d = c.ac,
            e = c.Nc,
            f
          if (!d)
            for (c.ac = d = {}, c.Mc = {}, f = 0; f < P.getProgramParameter(c, 35718); ++f) {
              var h = P.getActiveUniform(c, f)
              var k = h.name
              h = h.size
              var m = fd(k)
              m = 0 < m ? k.slice(0, m) : k
              var p = c.wc
              c.wc += h
              e[m] = [h, p]
              for (k = 0; k < h; ++k) (d[p] = k), (c.Mc[p++] = m)
            }
          c = a.ac
          d = 0
          e = b
          f = fd(b)
          0 < f && ((d = parseInt(b.slice(f + 1)) >>> 0), (e = b.slice(0, f)))
          if ((e = a.Nc[e]) && d < e[0] && ((d += e[1]), (c[d] = c[d] || P.getUniformLocation(a, b)))) return d
        } else S(1281)
        return -1
      },
      ka: function (a) {
        a = Q[a]
        P.linkProgram(a)
        a.ac = 0
        a.Nc = {}
      },
      qa: function (a, b, c, d) {
        for (var e = '', f = 0; f < b; ++f) {
          var h = d ? A[(d + 4 * f) >> 2] : -1
          e += ra(A[(c + 4 * f) >> 2], 0 > h ? void 0 : h)
        }
        P.shaderSource(R[a], e)
      },
      wa: function (a, b, c) {
        if (144 >= b)
          for (var d = hd[2 * b - 1], e = 0; e < 2 * b; e += 2)
            (d[e] = C[(c + 4 * e) >> 2]), (d[e + 1] = C[(c + (4 * e + 4)) >> 2])
        else d = C.subarray(c >> 2, (c + 8 * b) >> 2)
        P.uniform2fv(gd(a), d)
      },
      va: function (a, b, c, d) {
        if (18 >= b) {
          var e = hd[16 * b - 1],
            f = C
          d >>= 2
          for (var h = 0; h < 16 * b; h += 16) {
            var k = d + h
            e[h] = f[k]
            e[h + 1] = f[k + 1]
            e[h + 2] = f[k + 2]
            e[h + 3] = f[k + 3]
            e[h + 4] = f[k + 4]
            e[h + 5] = f[k + 5]
            e[h + 6] = f[k + 6]
            e[h + 7] = f[k + 7]
            e[h + 8] = f[k + 8]
            e[h + 9] = f[k + 9]
            e[h + 10] = f[k + 10]
            e[h + 11] = f[k + 11]
            e[h + 12] = f[k + 12]
            e[h + 13] = f[k + 13]
            e[h + 14] = f[k + 14]
            e[h + 15] = f[k + 15]
          }
        } else e = C.subarray(d >> 2, (d + 64 * b) >> 2)
        P.uniformMatrix4fv(gd(a), !!c, e)
      },
      N: function (a) {
        a = Q[a]
        P.useProgram(a)
        P.$c = a
      },
      xa: function (a, b, c, d, e, f) {
        var h = O.cc[a]
        P.dc
          ? ((h.oc = !1), P.vertexAttribPointer(a, b, c, !!d, e, f))
          : ((h.size = b),
            (h.type = c),
            (h.Gc = d),
            (h.uc = e),
            (h.Nb = f),
            (h.oc = !0),
            (h.Pc = function (k, m, p, r, x, y) {
              this.vertexAttribPointer(k, m, p, r, x, y)
            }))
      },
      Pa: function (a, b, c, d) {
        P.viewport(a, b, c, d)
      },
      Ia: function (a, b, c, d) {
        var e
        for (e = 0; e < U.length && null !== U[e]; e++);
        if (0 < e) throw 'glfwCreateWindow only supports one window at time currently'
        var f = e + 1
        if (0 >= a || 0 >= b) f = 0
        else {
          d ? Cc() : Nc(a, b)
          for (e = 0; e < U.length && null == U[e]; e++);
          d = 0 < T[139265]
          e == U.length &&
            (d
              ? (g.Ub = vc(g.canvas, !0, !0, {
                  antialias: 1 < T[135181],
                  depth: 0 < T[135173],
                  stencil: 0 < T[135174],
                  alpha: 0 < T[135172],
                }))
              : pc())
          !g.Ub && d
            ? (f = 0)
            : ((a = new jd(f, a, b, c)), f - 1 == U.length ? U.push(a) : (U[f - 1] = a), (V = a), (f = a.id))
        }
        return f
      },
      Ea: function (a) {
        a: {
          if ((a = kd(a))) {
            a.Qc && D(a.Qc)(a.id)
            U[a.id - 1] = null
            V.id == a.id && (V = null)
            for (a = 0; a < U.length; a++)
              if (null !== U[a]) {
                a = void 0
                break a
              }
            g.Ub = void 0
          }
          a = void 0
        }
        return a
      },
      Ra: function (a, b, c) {
        var d = 0,
          e = 0
        if ((a = kd(a))) (d = a.width), (e = a.height)
        b && (A[b >> 2] = d)
        c && (A[c >> 2] = e)
      },
      Qa: function (a) {
        return (a = kd(a)) ? a.Oc : 0
      },
      ga: function () {
        if (U) return 1
        Wb()
        T = md
        U = []
        V = null
        ld = devicePixelRatio
        window.addEventListener('gamepadconnected', rd, !0)
        window.addEventListener('gamepaddisconnected', td, !0)
        window.addEventListener('keydown', ud, !0)
        window.addEventListener('keypress', pd, !0)
        window.addEventListener('keyup', vd, !0)
        window.addEventListener('blur', wd, !0)
        ;(function b() {
          window
            .matchMedia('(resolution: ' + window.devicePixelRatio + 'dppx)')
            .addEventListener('change', b, { once: !0 })
          ld = devicePixelRatio
          V && D(V.qd)(V.id, ld, ld)
        })()
        g.canvas.addEventListener('touchmove', xd, !0)
        g.canvas.addEventListener('touchstart', Bd, !0)
        g.canvas.addEventListener('touchcancel', Cd, !0)
        g.canvas.addEventListener('touchend', Cd, !0)
        g.canvas.addEventListener('mousemove', xd, !0)
        g.canvas.addEventListener('mousedown', Bd, !0)
        g.canvas.addEventListener('mouseup', Cd, !0)
        g.canvas.addEventListener('wheel', Dd, !0)
        g.canvas.addEventListener('mousewheel', Dd, !0)
        g.canvas.addEventListener('mouseenter', yd, !0)
        g.canvas.addEventListener('mouseleave', zd, !0)
        g.canvas.addEventListener('drop', Hd, !0)
        g.canvas.addEventListener('dragover', Id, !0)
        Mc.push((b, c) => {
          if (V) {
            var d = !0
            document.fullscreen || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
              ? ((V.Kc = V.x),
                (V.Lc = V.y),
                (V.Jc = V.width),
                (V.Ic = V.height),
                (V.x = V.y = 0),
                (V.width = screen.width),
                (V.height = screen.height),
                (V.qc = !0))
              : 1 == V.qc
              ? ((V.x = V.Kc), (V.y = V.Lc), (V.width = V.Jc), (V.height = V.Ic), (V.qc = !1))
              : V.width != b || V.height != c
              ? ((V.width = b), (V.height = c))
              : (d = !1)
            d &&
              (Nc(V.width, V.height, !0),
              V && V.nc && D(V.nc)(V.id, V.width, V.height),
              V && V.fc && D(V.fc)(V.id, V.width, V.height))
          }
        })
        return 1
      },
      Ha: function () {},
      Na: function () {},
      Fa: function (a, b) {
        a = kd(a)
        if (!a) return null
        var c = a.fc
        a.fc = b
        return c
      },
      Sa: function (a, b, c) {
        if ((a = kd(a)))
          V.id == a.id &&
            (b == screen.width && c == screen.height ? Cc() : (Dc(), Nc(b, c), (a.width = b), (a.height = c))),
            a.nc && D(a.nc)(a.id, b, c)
      },
      Ga: function (a, b) {
        if ((a = kd(a))) a.Oc = b
      },
      Ma: function () {},
      fa: function () {
        window.removeEventListener('gamepadconnected', rd, !0)
        window.removeEventListener('gamepaddisconnected', td, !0)
        window.removeEventListener('keydown', ud, !0)
        window.removeEventListener('keypress', pd, !0)
        window.removeEventListener('keyup', vd, !0)
        window.removeEventListener('blur', wd, !0)
        g.canvas.removeEventListener('touchmove', xd, !0)
        g.canvas.removeEventListener('touchstart', Bd, !0)
        g.canvas.removeEventListener('touchcancel', Cd, !0)
        g.canvas.removeEventListener('touchend', Cd, !0)
        g.canvas.removeEventListener('mousemove', xd, !0)
        g.canvas.removeEventListener('mousedown', Bd, !0)
        g.canvas.removeEventListener('mouseup', Cd, !0)
        g.canvas.removeEventListener('wheel', Dd, !0)
        g.canvas.removeEventListener('mousewheel', Dd, !0)
        g.canvas.removeEventListener('mouseenter', yd, !0)
        g.canvas.removeEventListener('mouseleave', zd, !0)
        g.canvas.removeEventListener('drop', Hd, !0)
        g.canvas.removeEventListener('dragover', Id, !0)
        g.canvas.width = g.canvas.height = 1
        V = U = null
      },
      Ja: function (a, b) {
        T[a] = b
      },
      Oa: function (a) {
        return (a = kd(a)) ? a.kd : 0
      },
      S: Td,
      T: Ud,
      n: Vd,
      A: Wd,
      e: Xd,
      P: Yd,
      d: Zd,
      g: $d,
      i: ae,
      r: be,
      u: ce,
      E: de,
      C: ee,
      gb: fe,
      eb: ge,
      fb: he,
      bb: ie,
      db: je,
      $a: ke,
      _a: le,
      l: me,
      k: ne,
      Wa: oe,
      Y: pe,
      c: qe,
      h: re,
      j: se,
      m: te,
      Q: ue,
      q: ve,
      v: we,
      B: xe,
      cb: ye,
      F: function (a) {
        return a
      },
      hb: function (a, b, c, d) {
        return Nd(a, b, c, d)
      },
    }
    ;(function () {
      function a(c) {
        c = c.exports
        g.asm = c
        la = g.asm.lb
        xa()
        ya = g.asm.ob
        Aa.unshift(g.asm.mb)
        Ea--
        g.monitorRunDependencies && g.monitorRunDependencies(Ea)
        if (0 == Ea && (null !== Fa && (clearInterval(Fa), (Fa = null)), Ga)) {
          var d = Ga
          Ga = null
          d()
        }
        return c
      }
      var b = { a: ze }
      Ea++
      g.monitorRunDependencies && g.monitorRunDependencies(Ea)
      if (g.instantiateWasm)
        try {
          return g.instantiateWasm(b, a)
        } catch (c) {
          q('Module.instantiateWasm callback failed with error: ' + c), ba(c)
        }
      Na(b, function (c) {
        a(c.instance)
      }).catch(ba)
      return {}
    })()
    function Sd() {
      return (Sd = g.asm.nb).apply(null, arguments)
    }
    function Gd() {
      return (Gd = g.asm.pb).apply(null, arguments)
    }
    var Ae = (g._main = function () {
        return (Ae = g._main = g.asm.qb).apply(null, arguments)
      }),
      wb = (g.___getTypeName = function () {
        return (wb = g.___getTypeName = g.asm.rb).apply(null, arguments)
      })
    g.__embind_initialize_bindings = function () {
      return (g.__embind_initialize_bindings = g.asm.sb).apply(null, arguments)
    }
    function L() {
      return (L = g.asm.tb).apply(null, arguments)
    }
    function X() {
      return (X = g.asm.ub).apply(null, arguments)
    }
    function Xa() {
      return (Xa = g.asm.vb).apply(null, arguments)
    }
    function Y() {
      return (Y = g.asm.wb).apply(null, arguments)
    }
    function Z() {
      return (Z = g.asm.xb).apply(null, arguments)
    }
    function Ya() {
      return (Ya = g.asm.yb).apply(null, arguments)
    }
    function Va() {
      return (Va = g.asm.zb).apply(null, arguments)
    }
    var Be = (g.dynCall_iij = function () {
        return (Be = g.dynCall_iij = g.asm.Ab).apply(null, arguments)
      }),
      Ce = (g.dynCall_iijiii = function () {
        return (Ce = g.dynCall_iijiii = g.asm.Bb).apply(null, arguments)
      }),
      De = (g.dynCall_iiji = function () {
        return (De = g.dynCall_iiji = g.asm.Cb).apply(null, arguments)
      }),
      Ee = (g.dynCall_ijjiii = function () {
        return (Ee = g.dynCall_ijjiii = g.asm.Db).apply(null, arguments)
      }),
      Fe = (g.dynCall_vij = function () {
        return (Fe = g.dynCall_vij = g.asm.Eb).apply(null, arguments)
      }),
      Ge = (g.dynCall_iijjiii = function () {
        return (Ge = g.dynCall_iijjiii = g.asm.Fb).apply(null, arguments)
      })
    g.dynCall_ji = function () {
      return (g.dynCall_ji = g.asm.Gb).apply(null, arguments)
    }
    g.dynCall_jiji = function () {
      return (g.dynCall_jiji = g.asm.Hb).apply(null, arguments)
    }
    var He = (g.dynCall_j = function () {
        return (He = g.dynCall_j = g.asm.Ib).apply(null, arguments)
      }),
      Ie = (g.dynCall_jiiii = function () {
        return (Ie = g.dynCall_jiiii = g.asm.Jb).apply(null, arguments)
      })
    g.dynCall_iiiiij = function () {
      return (g.dynCall_iiiiij = g.asm.Kb).apply(null, arguments)
    }
    g.dynCall_iiiiijj = function () {
      return (g.dynCall_iiiiijj = g.asm.Lb).apply(null, arguments)
    }
    g.dynCall_iiiiiijj = function () {
      return (g.dynCall_iiiiiijj = g.asm.Mb).apply(null, arguments)
    }
    function qe(a, b, c) {
      var d = Y()
      try {
        D(a)(b, c)
      } catch (e) {
        Z(d)
        if (e !== e + 0) throw e
        X(1, 0)
      }
    }
    function re(a, b, c, d) {
      var e = Y()
      try {
        D(a)(b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function te(a, b, c, d, e, f) {
      var h = Y()
      try {
        D(a)(b, c, d, e, f)
      } catch (k) {
        Z(h)
        if (k !== k + 0) throw k
        X(1, 0)
      }
    }
    function Zd(a, b, c) {
      var d = Y()
      try {
        return D(a)(b, c)
      } catch (e) {
        Z(d)
        if (e !== e + 0) throw e
        X(1, 0)
      }
    }
    function Xd(a, b) {
      var c = Y()
      try {
        return D(a)(b)
      } catch (d) {
        Z(c)
        if (d !== d + 0) throw d
        X(1, 0)
      }
    }
    function Vd(a) {
      var b = Y()
      try {
        return D(a)()
      } catch (c) {
        Z(b)
        if (c !== c + 0) throw c
        X(1, 0)
      }
    }
    function ne(a, b) {
      var c = Y()
      try {
        D(a)(b)
      } catch (d) {
        Z(c)
        if (d !== d + 0) throw d
        X(1, 0)
      }
    }
    function pe(a, b, c) {
      var d = Y()
      try {
        D(a)(b, c)
      } catch (e) {
        Z(d)
        if (e !== e + 0) throw e
        X(1, 0)
      }
    }
    function se(a, b, c, d, e) {
      var f = Y()
      try {
        D(a)(b, c, d, e)
      } catch (h) {
        Z(f)
        if (h !== h + 0) throw h
        X(1, 0)
      }
    }
    function $d(a, b, c, d) {
      var e = Y()
      try {
        return D(a)(b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function oe(a, b, c) {
      var d = Y()
      try {
        D(a)(b, c)
      } catch (e) {
        Z(d)
        if (e !== e + 0) throw e
        X(1, 0)
      }
    }
    function be(a, b, c, d, e, f) {
      var h = Y()
      try {
        return D(a)(b, c, d, e, f)
      } catch (k) {
        Z(h)
        if (k !== k + 0) throw k
        X(1, 0)
      }
    }
    function ae(a, b, c, d, e) {
      var f = Y()
      try {
        return D(a)(b, c, d, e)
      } catch (h) {
        Z(f)
        if (h !== h + 0) throw h
        X(1, 0)
      }
    }
    function ue(a, b, c, d, e, f, h) {
      var k = Y()
      try {
        D(a)(b, c, d, e, f, h)
      } catch (m) {
        Z(k)
        if (m !== m + 0) throw m
        X(1, 0)
      }
    }
    function Yd(a, b, c, d) {
      var e = Y()
      try {
        return D(a)(b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function ve(a, b, c, d, e, f, h, k) {
      var m = Y()
      try {
        D(a)(b, c, d, e, f, h, k)
      } catch (p) {
        Z(m)
        if (p !== p + 0) throw p
        X(1, 0)
      }
    }
    function me(a) {
      var b = Y()
      try {
        D(a)()
      } catch (c) {
        Z(b)
        if (c !== c + 0) throw c
        X(1, 0)
      }
    }
    function ce(a, b, c, d, e, f, h) {
      var k = Y()
      try {
        return D(a)(b, c, d, e, f, h)
      } catch (m) {
        Z(k)
        if (m !== m + 0) throw m
        X(1, 0)
      }
    }
    function Wd(a, b, c, d, e) {
      var f = Y()
      try {
        return D(a)(b, c, d, e)
      } catch (h) {
        Z(f)
        if (h !== h + 0) throw h
        X(1, 0)
      }
    }
    function de(a, b, c, d, e, f, h, k) {
      var m = Y()
      try {
        return D(a)(b, c, d, e, f, h, k)
      } catch (p) {
        Z(m)
        if (p !== p + 0) throw p
        X(1, 0)
      }
    }
    function Ud(a, b, c, d) {
      var e = Y()
      try {
        return D(a)(b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function Td(a, b, c, d) {
      var e = Y()
      try {
        return D(a)(b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function ee(a, b, c, d, e, f, h, k, m, p, r, x) {
      var y = Y()
      try {
        return D(a)(b, c, d, e, f, h, k, m, p, r, x)
      } catch (l) {
        Z(y)
        if (l !== l + 0) throw l
        X(1, 0)
      }
    }
    function we(a, b, c, d, e, f, h, k, m, p, r) {
      var x = Y()
      try {
        D(a)(b, c, d, e, f, h, k, m, p, r)
      } catch (y) {
        Z(x)
        if (y !== y + 0) throw y
        X(1, 0)
      }
    }
    function xe(a, b, c, d, e, f, h, k, m, p, r, x, y, l, v, t) {
      var N = Y()
      try {
        D(a)(b, c, d, e, f, h, k, m, p, r, x, y, l, v, t)
      } catch (G) {
        Z(N)
        if (G !== G + 0) throw G
        X(1, 0)
      }
    }
    function fe(a, b, c, d) {
      var e = Y()
      try {
        return Be(a, b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function he(a, b, c, d, e, f, h) {
      var k = Y()
      try {
        return Ce(a, b, c, d, e, f, h)
      } catch (m) {
        Z(k)
        if (m !== m + 0) throw m
        X(1, 0)
      }
    }
    function ge(a, b, c, d, e) {
      var f = Y()
      try {
        return De(a, b, c, d, e)
      } catch (h) {
        Z(f)
        if (h !== h + 0) throw h
        X(1, 0)
      }
    }
    function je(a, b, c, d, e, f, h, k) {
      var m = Y()
      try {
        return Ee(a, b, c, d, e, f, h, k)
      } catch (p) {
        Z(m)
        if (p !== p + 0) throw p
        X(1, 0)
      }
    }
    function ye(a, b, c, d) {
      var e = Y()
      try {
        Fe(a, b, c, d)
      } catch (f) {
        Z(e)
        if (f !== f + 0) throw f
        X(1, 0)
      }
    }
    function ie(a, b, c, d, e, f, h, k, m) {
      var p = Y()
      try {
        return Ge(a, b, c, d, e, f, h, k, m)
      } catch (r) {
        Z(p)
        if (r !== r + 0) throw r
        X(1, 0)
      }
    }
    function ke(a) {
      var b = Y()
      try {
        return He(a)
      } catch (c) {
        Z(b)
        if (c !== c + 0) throw c
        X(1, 0)
      }
    }
    function le(a, b, c, d, e) {
      var f = Y()
      try {
        return Ie(a, b, c, d, e)
      } catch (h) {
        Z(f)
        if (h !== h + 0) throw h
        X(1, 0)
      }
    }
    var Je
    Ga = function Ke() {
      Je || Le()
      Je || (Ga = Ke)
    }
    function Le() {
      function a() {
        if (!Je && ((Je = !0), (g.calledRun = !0), !ma)) {
          Pa(Aa)
          Pa(Ba)
          aa(g)
          if (g.onRuntimeInitialized) g.onRuntimeInitialized()
          if (Me) {
            var b = Ae
            try {
              var c = b(0, 0)
              na = c
              ic(c)
            } catch (d) {
              hc(d)
            }
          }
          if (g.postRun)
            for ('function' == typeof g.postRun && (g.postRun = [g.postRun]); g.postRun.length; )
              (b = g.postRun.shift()), Ca.unshift(b)
          Pa(Ca)
        }
      }
      if (!(0 < Ea)) {
        if (g.preRun) for ('function' == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length; ) Da()
        Pa(za)
        0 < Ea ||
          (g.setStatus
            ? (g.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  g.setStatus('')
                }, 1)
                a()
              }, 1))
            : a())
      }
    }
    if (g.preInit)
      for ('function' == typeof g.preInit && (g.preInit = [g.preInit]); 0 < g.preInit.length; ) g.preInit.pop()()
    var Me = !0
    g.noInitialRun && (Me = !1)
    Le()

    return createAiMarkModule.ready
  }
})()
export default createAiMarkModule
