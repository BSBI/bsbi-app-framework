function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire (path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$11 =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails$B = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$A = fails$B;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$A(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var fails$z = fails$B;

var functionBindNative = !fails$z(function () {
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var NATIVE_BIND$4 = functionBindNative;

var call$j = Function.prototype.call;

var functionCall = NATIVE_BIND$4 ? call$j.bind(call$j) : function () {
  return call$j.apply(call$j, arguments);
};

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable$1 = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$3 && !$propertyIsEnumerable$1.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$3(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable$1;

var createPropertyDescriptor$6 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var NATIVE_BIND$3 = functionBindNative;

var FunctionPrototype$3 = Function.prototype;
var bind$9 = FunctionPrototype$3.bind;
var call$i = FunctionPrototype$3.call;
var uncurryThis$F = NATIVE_BIND$3 && bind$9.bind(call$i, call$i);

var functionUncurryThis = NATIVE_BIND$3 ? function (fn) {
  return fn && uncurryThis$F(fn);
} : function (fn) {
  return fn && function () {
    return call$i.apply(fn, arguments);
  };
};

var uncurryThis$E = functionUncurryThis;

var toString$i = uncurryThis$E({}.toString);
var stringSlice$8 = uncurryThis$E(''.slice);

var classofRaw$1 = function (it) {
  return stringSlice$8(toString$i(it), 8, -1);
};

var global$10 = global$11;
var uncurryThis$D = functionUncurryThis;
var fails$y = fails$B;
var classof$e = classofRaw$1;

var Object$5 = global$10.Object;
var split = uncurryThis$D(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$y(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !Object$5('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$e(it) == 'String' ? split(it, '') : Object$5(it);
} : Object$5;

var global$$ = global$11;

var TypeError$m = global$$.TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$a = function (it) {
  if (it == undefined) throw TypeError$m("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$2 = indexedObject;
var requireObjectCoercible$9 = requireObjectCoercible$a;

var toIndexedObject$b = function (it) {
  return IndexedObject$2(requireObjectCoercible$9(it));
};

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
var isCallable$p = function (argument) {
  return typeof argument == 'function';
};

var isCallable$o = isCallable$p;

var isObject$m = function (it) {
  return typeof it == 'object' ? it !== null : isCallable$o(it);
};

var global$_ = global$11;
var isCallable$n = isCallable$p;

var aFunction = function (argument) {
  return isCallable$n(argument) ? argument : undefined;
};

var getBuiltIn$c = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global$_[namespace]) : global$_[namespace] && global$_[namespace][method];
};

var uncurryThis$C = functionUncurryThis;

var objectIsPrototypeOf = uncurryThis$C({}.isPrototypeOf);

var getBuiltIn$b = getBuiltIn$c;

var engineUserAgent = getBuiltIn$b('navigator', 'userAgent') || '';

var global$Z = global$11;
var userAgent$5 = engineUserAgent;

var process$3 = global$Z.process;
var Deno = global$Z.Deno;
var versions = process$3 && process$3.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match$1, version;

if (v8) {
  match$1 = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match$1[0] > 0 && match$1[0] < 4 ? 1 : +(match$1[0] + match$1[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent$5) {
  match$1 = userAgent$5.match(/Edge\/(\d+)/);
  if (!match$1 || match$1[1] >= 74) {
    match$1 = userAgent$5.match(/Chrome\/(\d+)/);
    if (match$1) version = +match$1[1];
  }
}

var engineV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */

var V8_VERSION$3 = engineV8Version;
var fails$x = fails$B;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$x(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$3 && V8_VERSION$3 < 41;
});

/* eslint-disable es/no-symbol -- required for testing */

var NATIVE_SYMBOL$3 = nativeSymbol;

var useSymbolAsUid = NATIVE_SYMBOL$3
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var global$Y = global$11;
var getBuiltIn$a = getBuiltIn$c;
var isCallable$m = isCallable$p;
var isPrototypeOf$8 = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var Object$4 = global$Y.Object;

var isSymbol$3 = USE_SYMBOL_AS_UID$1 ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$a('Symbol');
  return isCallable$m($Symbol) && isPrototypeOf$8($Symbol.prototype, Object$4(it));
};

var global$X = global$11;

var String$5 = global$X.String;

var tryToString$4 = function (argument) {
  try {
    return String$5(argument);
  } catch (error) {
    return 'Object';
  }
};

var global$W = global$11;
var isCallable$l = isCallable$p;
var tryToString$3 = tryToString$4;

var TypeError$l = global$W.TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable$7 = function (argument) {
  if (isCallable$l(argument)) return argument;
  throw TypeError$l(tryToString$3(argument) + ' is not a function');
};

var aCallable$6 = aCallable$7;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$7 = function (V, P) {
  var func = V[P];
  return func == null ? undefined : aCallable$6(func);
};

var global$V = global$11;
var call$h = functionCall;
var isCallable$k = isCallable$p;
var isObject$l = isObject$m;

var TypeError$k = global$V.TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$1 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$k(fn = input.toString) && !isObject$l(val = call$h(fn, input))) return val;
  if (isCallable$k(fn = input.valueOf) && !isObject$l(val = call$h(fn, input))) return val;
  if (pref !== 'string' && isCallable$k(fn = input.toString) && !isObject$l(val = call$h(fn, input))) return val;
  throw TypeError$k("Can't convert object to primitive value");
};

var shared$5 = {exports: {}};

var isPure = false;

var global$U = global$11;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$b = Object.defineProperty;

var setGlobal$3 = function (key, value) {
  try {
    defineProperty$b(global$U, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global$U[key] = value;
  } return value;
};

var global$T = global$11;
var setGlobal$2 = setGlobal$3;

var SHARED = '__core-js_shared__';
var store$3 = global$T[SHARED] || setGlobal$2(SHARED, {});

var sharedStore = store$3;

var store$2 = sharedStore;

(shared$5.exports = function (key, value) {
  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.21.0',
  mode: 'global',
  copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.21.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

var global$S = global$11;
var requireObjectCoercible$8 = requireObjectCoercible$a;

var Object$3 = global$S.Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$a = function (argument) {
  return Object$3(requireObjectCoercible$8(argument));
};

var uncurryThis$B = functionUncurryThis;
var toObject$9 = toObject$a;

var hasOwnProperty = uncurryThis$B({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject$9(it), key);
};

var uncurryThis$A = functionUncurryThis;

var id$2 = 0;
var postfix = Math.random();
var toString$h = uncurryThis$A(1.0.toString);

var uid$4 = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$h(++id$2 + postfix, 36);
};

var global$R = global$11;
var shared$4 = shared$5.exports;
var hasOwn$h = hasOwnProperty_1;
var uid$3 = uid$4;
var NATIVE_SYMBOL$2 = nativeSymbol;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var WellKnownSymbolsStore$1 = shared$4('wks');
var Symbol$2 = global$R.Symbol;
var symbolFor = Symbol$2 && Symbol$2['for'];
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$2 : Symbol$2 && Symbol$2.withoutSetter || uid$3;

var wellKnownSymbol$q = function (name) {
  if (!hasOwn$h(WellKnownSymbolsStore$1, name) || !(NATIVE_SYMBOL$2 || typeof WellKnownSymbolsStore$1[name] == 'string')) {
    var description = 'Symbol.' + name;
    if (NATIVE_SYMBOL$2 && hasOwn$h(Symbol$2, name)) {
      WellKnownSymbolsStore$1[name] = Symbol$2[name];
    } else if (USE_SYMBOL_AS_UID && symbolFor) {
      WellKnownSymbolsStore$1[name] = symbolFor(description);
    } else {
      WellKnownSymbolsStore$1[name] = createWellKnownSymbol(description);
    }
  } return WellKnownSymbolsStore$1[name];
};

var global$Q = global$11;
var call$g = functionCall;
var isObject$k = isObject$m;
var isSymbol$2 = isSymbol$3;
var getMethod$6 = getMethod$7;
var ordinaryToPrimitive = ordinaryToPrimitive$1;
var wellKnownSymbol$p = wellKnownSymbol$q;

var TypeError$j = global$Q.TypeError;
var TO_PRIMITIVE$1 = wellKnownSymbol$p('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$1 = function (input, pref) {
  if (!isObject$k(input) || isSymbol$2(input)) return input;
  var exoticToPrim = getMethod$6(input, TO_PRIMITIVE$1);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call$g(exoticToPrim, input, pref);
    if (!isObject$k(result) || isSymbol$2(result)) return result;
    throw TypeError$j("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

var toPrimitive = toPrimitive$1;
var isSymbol$1 = isSymbol$3;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$4 = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol$1(key) ? key : key + '';
};

var global$P = global$11;
var isObject$j = isObject$m;

var document$3 = global$P.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$j(document$3) && isObject$j(document$3.createElement);

var documentCreateElement$2 = function (it) {
  return EXISTS$1 ? document$3.createElement(it) : {};
};

var DESCRIPTORS$j = descriptors;
var fails$w = fails$B;
var createElement$1 = documentCreateElement$2;

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !DESCRIPTORS$j && !fails$w(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement$1('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var DESCRIPTORS$i = descriptors;
var call$f = functionCall;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var createPropertyDescriptor$5 = createPropertyDescriptor$6;
var toIndexedObject$a = toIndexedObject$b;
var toPropertyKey$3 = toPropertyKey$4;
var hasOwn$g = hasOwnProperty_1;
var IE8_DOM_DEFINE$1 = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$i ? $getOwnPropertyDescriptor$2 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$a(O);
  P = toPropertyKey$3(P);
  if (IE8_DOM_DEFINE$1) try {
    return $getOwnPropertyDescriptor$2(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn$g(O, P)) return createPropertyDescriptor$5(!call$f(propertyIsEnumerableModule$1.f, O, P), O[P]);
};

var objectDefineProperty = {};

var DESCRIPTORS$h = descriptors;
var fails$v = fails$B;

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = DESCRIPTORS$h && fails$v(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype != 42;
});

var global$O = global$11;
var isObject$i = isObject$m;

var String$4 = global$O.String;
var TypeError$i = global$O.TypeError;

// `Assert: Type(argument) is Object`
var anObject$l = function (argument) {
  if (isObject$i(argument)) return argument;
  throw TypeError$i(String$4(argument) + ' is not an object');
};

var global$N = global$11;
var DESCRIPTORS$g = descriptors;
var IE8_DOM_DEFINE = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
var anObject$k = anObject$l;
var toPropertyKey$2 = toPropertyKey$4;

var TypeError$h = global$N.TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty$1 = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE$1 = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$g ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
  anObject$k(O);
  P = toPropertyKey$2(P);
  anObject$k(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty$1(O, P, Attributes);
} : $defineProperty$1 : function defineProperty(O, P, Attributes) {
  anObject$k(O);
  P = toPropertyKey$2(P);
  anObject$k(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty$1(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError$h('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$f = descriptors;
var definePropertyModule$6 = objectDefineProperty;
var createPropertyDescriptor$4 = createPropertyDescriptor$6;

var createNonEnumerableProperty$a = DESCRIPTORS$f ? function (object, key, value) {
  return definePropertyModule$6.f(object, key, createPropertyDescriptor$4(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var redefine$d = {exports: {}};

var uncurryThis$z = functionUncurryThis;
var isCallable$j = isCallable$p;
var store$1 = sharedStore;

var functionToString$1 = uncurryThis$z(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$j(store$1.inspectSource)) {
  store$1.inspectSource = function (it) {
    return functionToString$1(it);
  };
}

var inspectSource$4 = store$1.inspectSource;

var global$M = global$11;
var isCallable$i = isCallable$p;
var inspectSource$3 = inspectSource$4;

var WeakMap$2 = global$M.WeakMap;

var nativeWeakMap = isCallable$i(WeakMap$2) && /native code/.test(inspectSource$3(WeakMap$2));

var shared$3 = shared$5.exports;
var uid$2 = uid$4;

var keys$1 = shared$3('keys');

var sharedKey$4 = function (key) {
  return keys$1[key] || (keys$1[key] = uid$2(key));
};

var hiddenKeys$6 = {};

var NATIVE_WEAK_MAP$1 = nativeWeakMap;
var global$L = global$11;
var uncurryThis$y = functionUncurryThis;
var isObject$h = isObject$m;
var createNonEnumerableProperty$9 = createNonEnumerableProperty$a;
var hasOwn$f = hasOwnProperty_1;
var shared$2 = sharedStore;
var sharedKey$3 = sharedKey$4;
var hiddenKeys$5 = hiddenKeys$6;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$g = global$L.TypeError;
var WeakMap$1 = global$L.WeakMap;
var set$1, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set$1(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$h(it) || (state = get(it)).type !== TYPE) {
      throw TypeError$g('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP$1 || shared$2.state) {
  var store = shared$2.state || (shared$2.state = new WeakMap$1());
  var wmget = uncurryThis$y(store.get);
  var wmhas = uncurryThis$y(store.has);
  var wmset = uncurryThis$y(store.set);
  set$1 = function (it, metadata) {
    if (wmhas(store, it)) throw new TypeError$g(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    wmset(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget(store, it) || {};
  };
  has = function (it) {
    return wmhas(store, it);
  };
} else {
  var STATE = sharedKey$3('state');
  hiddenKeys$5[STATE] = true;
  set$1 = function (it, metadata) {
    if (hasOwn$f(it, STATE)) throw new TypeError$g(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$9(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn$f(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn$f(it, STATE);
  };
}

var internalState = {
  set: set$1,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var DESCRIPTORS$e = descriptors;
var hasOwn$e = hasOwnProperty_1;

var FunctionPrototype$2 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$e && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn$e(FunctionPrototype$2, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$e || (DESCRIPTORS$e && getDescriptor(FunctionPrototype$2, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var global$K = global$11;
var isCallable$h = isCallable$p;
var hasOwn$d = hasOwnProperty_1;
var createNonEnumerableProperty$8 = createNonEnumerableProperty$a;
var setGlobal$1 = setGlobal$3;
var inspectSource$2 = inspectSource$4;
var InternalStateModule$7 = internalState;
var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;

var getInternalState$8 = InternalStateModule$7.get;
var enforceInternalState$2 = InternalStateModule$7.enforce;
var TEMPLATE = String(String).split('String');

(redefine$d.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var name = options && options.name !== undefined ? options.name : key;
  var state;
  if (isCallable$h(value)) {
    if (String(name).slice(0, 7) === 'Symbol(') {
      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
    }
    if (!hasOwn$d(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name)) {
      createNonEnumerableProperty$8(value, 'name', name);
    }
    state = enforceInternalState$2(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
    }
  }
  if (O === global$K) {
    if (simple) O[key] = value;
    else setGlobal$1(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty$8(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return isCallable$h(this) && getInternalState$8(this).source || inspectSource$2(this);
});

var objectGetOwnPropertyNames = {};

var ceil = Math.ceil;
var floor$2 = Math.floor;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity$5 = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- safe
  return number !== number || number === 0 ? 0 : (number > 0 ? floor$2 : ceil)(number);
};

var toIntegerOrInfinity$4 = toIntegerOrInfinity$5;

var max$4 = Math.max;
var min$5 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$4 = function (index, length) {
  var integer = toIntegerOrInfinity$4(index);
  return integer < 0 ? max$4(integer + length, 0) : min$5(integer, length);
};

var toIntegerOrInfinity$3 = toIntegerOrInfinity$5;

var min$4 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$6 = function (argument) {
  return argument > 0 ? min$4(toIntegerOrInfinity$3(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toLength$5 = toLength$6;

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike$9 = function (obj) {
  return toLength$5(obj.length);
};

var toIndexedObject$9 = toIndexedObject$b;
var toAbsoluteIndex$3 = toAbsoluteIndex$4;
var lengthOfArrayLike$8 = lengthOfArrayLike$9;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$3 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$9($this);
    var length = lengthOfArrayLike$8(O);
    var index = toAbsoluteIndex$3(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod$3(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$3(false)
};

var uncurryThis$x = functionUncurryThis;
var hasOwn$c = hasOwnProperty_1;
var toIndexedObject$8 = toIndexedObject$b;
var indexOf$1 = arrayIncludes.indexOf;
var hiddenKeys$4 = hiddenKeys$6;

var push$6 = uncurryThis$x([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$8(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn$c(hiddenKeys$4, key) && hasOwn$c(O, key) && push$6(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn$c(O, key = names[i++])) {
    ~indexOf$1(result, key) || push$6(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys$3 = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys$3;

var hiddenKeys$3 = enumBugKeys$2.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys$1(O, hiddenKeys$3);
};

var objectGetOwnPropertySymbols = {};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$9 = getBuiltIn$c;
var uncurryThis$w = functionUncurryThis;
var getOwnPropertyNamesModule$2 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var anObject$j = anObject$l;

var concat$2 = uncurryThis$w([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys$3 = getBuiltIn$9('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$2.f(anObject$j(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
  return getOwnPropertySymbols ? concat$2(keys, getOwnPropertySymbols(it)) : keys;
};

var hasOwn$b = hasOwnProperty_1;
var ownKeys$2 = ownKeys$3;
var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;
var definePropertyModule$5 = objectDefineProperty;

var copyConstructorProperties$3 = function (target, source, exceptions) {
  var keys = ownKeys$2(source);
  var defineProperty = definePropertyModule$5.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$2.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn$b(target, key) && !(exceptions && hasOwn$b(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var fails$u = fails$B;
var isCallable$g = isCallable$p;

var replacement = /#|\.prototype\./;

var isForced$4 = function (feature, detection) {
  var value = data$1[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : isCallable$g(detection) ? fails$u(detection)
    : !!detection;
};

var normalize = isForced$4.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data$1 = isForced$4.data = {};
var NATIVE = isForced$4.NATIVE = 'N';
var POLYFILL = isForced$4.POLYFILL = 'P';

var isForced_1 = isForced$4;

var global$J = global$11;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$7 = createNonEnumerableProperty$a;
var redefine$c = redefine$d.exports;
var setGlobal = setGlobal$3;
var copyConstructorProperties$2 = copyConstructorProperties$3;
var isForced$3 = isForced_1;

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
  options.name        - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$J;
  } else if (STATIC) {
    target = global$J[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global$J[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$2(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$3(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties$2(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$7(sourceProperty, 'sham', true);
    }
    // extend global
    redefine$c(target, key, sourceProperty, options);
  }
};

var NATIVE_BIND$2 = functionBindNative;

var FunctionPrototype$1 = Function.prototype;
var apply$7 = FunctionPrototype$1.apply;
var call$e = FunctionPrototype$1.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND$2 ? call$e.bind(apply$7) : function () {
  return call$e.apply(apply$7, arguments);
});

var global$I = global$11;
var isCallable$f = isCallable$p;

var String$3 = global$I.String;
var TypeError$f = global$I.TypeError;

var aPossiblePrototype$1 = function (argument) {
  if (typeof argument == 'object' || isCallable$f(argument)) return argument;
  throw TypeError$f("Can't set " + String$3(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */

var uncurryThis$v = functionUncurryThis;
var anObject$i = anObject$l;
var aPossiblePrototype = aPossiblePrototype$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    setter = uncurryThis$v(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set);
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject$i(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var isCallable$e = isCallable$p;
var isObject$g = isObject$m;
var setPrototypeOf$3 = objectSetPrototypeOf;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$3 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf$3 &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$e(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject$g(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf$3($this, NewTargetPrototype);
  return $this;
};

var wellKnownSymbol$o = wellKnownSymbol$q;

var TO_STRING_TAG$3 = wellKnownSymbol$o('toStringTag');
var test$1 = {};

test$1[TO_STRING_TAG$3] = 'z';

var toStringTagSupport = String(test$1) === '[object z]';

var global$H = global$11;
var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var isCallable$d = isCallable$p;
var classofRaw = classofRaw$1;
var wellKnownSymbol$n = wellKnownSymbol$q;

var TO_STRING_TAG$2 = wellKnownSymbol$n('toStringTag');
var Object$2 = global$H.Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$d = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object$2(it), TO_STRING_TAG$2)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && isCallable$d(O.callee) ? 'Arguments' : result;
};

var global$G = global$11;
var classof$c = classof$d;

var String$2 = global$G.String;

var toString$g = function (argument) {
  if (classof$c(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String$2(argument);
};

var toString$f = toString$g;

var normalizeStringArgument$1 = function (argument, $default) {
  return argument === undefined ? arguments.length < 2 ? '' : $default : toString$f(argument);
};

var isObject$f = isObject$m;
var createNonEnumerableProperty$6 = createNonEnumerableProperty$a;

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
var installErrorCause$1 = function (O, options) {
  if (isObject$f(options) && 'cause' in options) {
    createNonEnumerableProperty$6(O, 'cause', options.cause);
  }
};

var uncurryThis$u = functionUncurryThis;

var replace$6 = uncurryThis$u(''.replace);

var TEST = (function (arg) { return String(Error(arg).stack); })('zxcasd');
var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

var clearErrorStack$1 = function (stack, dropEntries) {
  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string') {
    while (dropEntries--) stack = replace$6(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
  } return stack;
};

var fails$t = fails$B;
var createPropertyDescriptor$3 = createPropertyDescriptor$6;

var errorStackInstallable = !fails$t(function () {
  var error = Error('a');
  if (!('stack' in error)) return true;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(error, 'stack', createPropertyDescriptor$3(1, 7));
  return error.stack !== 7;
});

var getBuiltIn$8 = getBuiltIn$c;
var hasOwn$a = hasOwnProperty_1;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$a;
var isPrototypeOf$7 = objectIsPrototypeOf;
var setPrototypeOf$2 = objectSetPrototypeOf;
var copyConstructorProperties$1 = copyConstructorProperties$3;
var inheritIfRequired$2 = inheritIfRequired$3;
var normalizeStringArgument = normalizeStringArgument$1;
var installErrorCause = installErrorCause$1;
var clearErrorStack = clearErrorStack$1;
var ERROR_STACK_INSTALLABLE = errorStackInstallable;

var wrapErrorConstructorWithCause$1 = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var path = FULL_NAME.split('.');
  var ERROR_NAME = path[path.length - 1];
  var OriginalError = getBuiltIn$8.apply(null, path);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if (hasOwn$a(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn$8('Error');

  var WrappedError = wrapper(function (a, b) {
    var message = normalizeStringArgument(IS_AGGREGATE_ERROR ? b : a, undefined);
    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
    if (message !== undefined) createNonEnumerableProperty$5(result, 'message', message);
    if (ERROR_STACK_INSTALLABLE) createNonEnumerableProperty$5(result, 'stack', clearErrorStack(result.stack, 2));
    if (this && isPrototypeOf$7(OriginalErrorPrototype, this)) inheritIfRequired$2(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (setPrototypeOf$2) setPrototypeOf$2(WrappedError, BaseError);
    else copyConstructorProperties$1(WrappedError, BaseError, { name: true });
  }

  copyConstructorProperties$1(WrappedError, OriginalError);

  try {
    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
    if (OriginalErrorPrototype.name !== ERROR_NAME) {
      createNonEnumerableProperty$5(OriginalErrorPrototype, 'name', ERROR_NAME);
    }
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};

/* eslint-disable no-unused-vars -- required for functions `.length` */

var $$w = _export;
var global$F = global$11;
var apply$6 = functionApply;
var wrapErrorConstructorWithCause = wrapErrorConstructorWithCause$1;

var WEB_ASSEMBLY = 'WebAssembly';
var WebAssembly = global$F[WEB_ASSEMBLY];

var FORCED$7 = Error('e', { cause: 7 }).cause !== 7;

var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  var O = {};
  O[ERROR_NAME] = wrapErrorConstructorWithCause(ERROR_NAME, wrapper, FORCED$7);
  $$w({ global: true, forced: FORCED$7 }, O);
};

var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  if (WebAssembly && WebAssembly[ERROR_NAME]) {
    var O = {};
    O[ERROR_NAME] = wrapErrorConstructorWithCause(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED$7);
    $$w({ target: WEB_ASSEMBLY, stat: true, forced: FORCED$7 }, O);
  }
};

// https://github.com/tc39/proposal-error-cause
exportGlobalErrorCauseWrapper('Error', function (init) {
  return function Error(message) { return apply$6(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('EvalError', function (init) {
  return function EvalError(message) { return apply$6(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('RangeError', function (init) {
  return function RangeError(message) { return apply$6(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
  return function ReferenceError(message) { return apply$6(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
  return function SyntaxError(message) { return apply$6(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('TypeError', function (init) {
  return function TypeError(message) { return apply$6(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('URIError', function (init) {
  return function URIError(message) { return apply$6(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
  return function CompileError(message) { return apply$6(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
  return function LinkError(message) { return apply$6(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
  return function RuntimeError(message) { return apply$6(init, this, arguments); };
});

function _classStaticPrivateFieldSpecSet$2(receiver, classConstructor, descriptor, value) { _classCheckPrivateStaticAccess$2(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor$2(descriptor, "set"); _classApplyDescriptorSet$3(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet$3(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classStaticPrivateFieldSpecGet$2(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess$2(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor$2(descriptor, "get"); return _classApplyDescriptorGet$3(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor$2(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess$2(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet$3(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

// AppController
// Abstract super-class for page controllers
var AppController = /*#__PURE__*/function () {
  function AppController() {
    _classCallCheck(this, AppController);

    _defineProperty(this, "route", null);

    _defineProperty(this, "view", void 0);

    _defineProperty(this, "title", 'untitled');

    _defineProperty(this, "handle", void 0);

    _defineProperty(this, "app", void 0);

    _defineProperty(this, "beforeRouteHandler", null);

    _defineProperty(this, "afterRouteHandler", null);

    _defineProperty(this, "leaveRouteHandler", null);

    _defineProperty(this, "alreadyRouteHandler", null);
  }

  _createClass(AppController, [{
    key: "initialise",
    value:
    /**
     * called from App.initialise() to trigger late-stage initialisation
     */
    function initialise() {
      this.view.initialise();
    }
    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */

  }, {
    key: "registerRoute",
    value: function registerRoute(router) {
      if (null === this.route) {
        throw new Error("No route set for '".concat(this.title, "' controller."));
      }

      console.log({
        route: this.route
      });
      router.on(this.route, this.routeHandler.bind(this), {
        before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
      });
    }
    /**
     *
     * @param {object} params
     * @param {string} query
     */

  }, {
    key: "routeHandler",
    value: function routeHandler(params, query) {}
  }], [{
    key: "nextHandle",
    get: function get() {
      var _AppController$handle;

      return _classStaticPrivateFieldSpecSet$2(AppController, AppController, _handleIndex, (_AppController$handle = +_classStaticPrivateFieldSpecGet$2(AppController, AppController, _handleIndex)) + 1), _AppController$handle;
    }
  }]);

  return AppController;
}();
var _handleIndex = {
  writable: true,
  value: 0
};

var defineProperty$a = objectDefineProperty.f;
var hasOwn$9 = hasOwnProperty_1;
var wellKnownSymbol$m = wellKnownSymbol$q;

var TO_STRING_TAG$1 = wellKnownSymbol$m('toStringTag');

var setToStringTag$6 = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn$9(target, TO_STRING_TAG$1)) {
    defineProperty$a(target, TO_STRING_TAG$1, { configurable: true, value: TAG });
  }
};

var $$v = _export;
var global$E = global$11;
var setToStringTag$5 = setToStringTag$6;

$$v({ global: true }, { Reflect: {} });

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
setToStringTag$5(global$E.Reflect, 'Reflect', true);

var uncurryThis$t = functionUncurryThis;

var arraySlice$6 = uncurryThis$t([].slice);

var global$D = global$11;
var uncurryThis$s = functionUncurryThis;
var aCallable$5 = aCallable$7;
var isObject$e = isObject$m;
var hasOwn$8 = hasOwnProperty_1;
var arraySlice$5 = arraySlice$6;
var NATIVE_BIND$1 = functionBindNative;

var Function$2 = global$D.Function;
var concat$1 = uncurryThis$s([].concat);
var join = uncurryThis$s([].join);
var factories = {};

var construct$1 = function (C, argsLength, args) {
  if (!hasOwn$8(factories, argsLength)) {
    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
    factories[argsLength] = Function$2('C,a', 'return new C(' + join(list, ',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.es/ecma262/#sec-function.prototype.bind
var functionBind = NATIVE_BIND$1 ? Function$2.bind : function bind(that /* , ...args */) {
  var F = aCallable$5(this);
  var Prototype = F.prototype;
  var partArgs = arraySlice$5(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = concat$1(partArgs, arraySlice$5(arguments));
    return this instanceof boundFunction ? construct$1(F, args.length, args) : F.apply(that, args);
  };
  if (isObject$e(Prototype)) boundFunction.prototype = Prototype;
  return boundFunction;
};

var uncurryThis$r = functionUncurryThis;
var fails$s = fails$B;
var isCallable$c = isCallable$p;
var classof$b = classof$d;
var getBuiltIn$7 = getBuiltIn$c;
var inspectSource$1 = inspectSource$4;

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn$7('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec$5 = uncurryThis$r(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable$c(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable$c(argument)) return false;
  switch (classof$b(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec$5(constructorRegExp, inspectSource$1(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor$4 = !construct || fails$s(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var global$C = global$11;
var isConstructor$3 = isConstructor$4;
var tryToString$2 = tryToString$4;

var TypeError$e = global$C.TypeError;

// `Assert: IsConstructor(argument) is true`
var aConstructor$2 = function (argument) {
  if (isConstructor$3(argument)) return argument;
  throw TypeError$e(tryToString$2(argument) + ' is not a constructor');
};

var objectDefineProperties = {};

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys$2 = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys$1);
};

var DESCRIPTORS$d = descriptors;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var definePropertyModule$4 = objectDefineProperty;
var anObject$h = anObject$l;
var toIndexedObject$7 = toIndexedObject$b;
var objectKeys$1 = objectKeys$2;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
objectDefineProperties.f = DESCRIPTORS$d && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$h(O);
  var props = toIndexedObject$7(Properties);
  var keys = objectKeys$1(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$4.f(O, key = keys[index++], props[key]);
  return O;
};

var getBuiltIn$6 = getBuiltIn$c;

var html$2 = getBuiltIn$6('document', 'documentElement');

/* global ActiveXObject -- old IE, WSH */

var anObject$g = anObject$l;
var definePropertiesModule$1 = objectDefineProperties;
var enumBugKeys = enumBugKeys$3;
var hiddenKeys$2 = hiddenKeys$6;
var html$1 = html$2;
var documentCreateElement$1 = documentCreateElement$2;
var sharedKey$2 = sharedKey$4;

var GT = '>';
var LT = '<';
var PROTOTYPE$1 = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey$2('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement$1('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html$1.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE$1][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys$2[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE$1] = anObject$g(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule$1.f(result, Properties);
};

var $$u = _export;
var getBuiltIn$5 = getBuiltIn$c;
var apply$5 = functionApply;
var bind$8 = functionBind;
var aConstructor$1 = aConstructor$2;
var anObject$f = anObject$l;
var isObject$d = isObject$m;
var create$4 = objectCreate;
var fails$r = fails$B;

var nativeConstruct = getBuiltIn$5('Reflect', 'construct');
var ObjectPrototype$2 = Object.prototype;
var push$5 = [].push;

// `Reflect.construct` method
// https://tc39.es/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails$r(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});

var ARGS_BUG = !fails$r(function () {
  nativeConstruct(function () { /* empty */ });
});

var FORCED$6 = NEW_TARGET_BUG || ARGS_BUG;

$$u({ target: 'Reflect', stat: true, forced: FORCED$6, sham: FORCED$6 }, {
  construct: function construct(Target, args /* , newTarget */) {
    aConstructor$1(Target);
    anObject$f(args);
    var newTarget = arguments.length < 3 ? Target : aConstructor$1(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      apply$5(push$5, $args, args);
      return new (apply$5(bind$8, Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create$4(isObject$d(proto) ? proto : ObjectPrototype$2);
    var result = apply$5(Target, instance, args);
    return isObject$d(result) ? result : instance;
  }
});

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _typeof$1(obj) {
  "@babel/helpers - typeof";

  return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof$1(obj);
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof$1(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _classApplyDescriptorSet$2(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
  _classApplyDescriptorSet$2(receiver, descriptor, value);
  return value;
}

function _classApplyDescriptorGet$2(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");
  return _classApplyDescriptorGet$2(receiver, descriptor);
}

var wellKnownSymbol$l = wellKnownSymbol$q;
var create$3 = objectCreate;
var definePropertyModule$3 = objectDefineProperty;

var UNSCOPABLES = wellKnownSymbol$l('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
  definePropertyModule$3.f(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: create$3(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$2 = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var iterators = {};

var fails$q = fails$B;

var correctPrototypeGetter = !fails$q(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var global$B = global$11;
var hasOwn$7 = hasOwnProperty_1;
var isCallable$b = isCallable$p;
var toObject$8 = toObject$a;
var sharedKey$1 = sharedKey$4;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

var IE_PROTO = sharedKey$1('IE_PROTO');
var Object$1 = global$B.Object;
var ObjectPrototype$1 = Object$1.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? Object$1.getPrototypeOf : function (O) {
  var object = toObject$8(O);
  if (hasOwn$7(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$b(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof Object$1 ? ObjectPrototype$1 : null;
};

var fails$p = fails$B;
var isCallable$a = isCallable$p;
var getPrototypeOf$1 = objectGetPrototypeOf;
var redefine$b = redefine$d.exports;
var wellKnownSymbol$k = wellKnownSymbol$q;

var ITERATOR$6 = wellKnownSymbol$k('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails$p(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$2[ITERATOR$6].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable$a(IteratorPrototype$2[ITERATOR$6])) {
  redefine$b(IteratorPrototype$2, ITERATOR$6, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$2,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
var create$2 = objectCreate;
var createPropertyDescriptor$2 = createPropertyDescriptor$6;
var setToStringTag$4 = setToStringTag$6;
var Iterators$4 = iterators;

var returnThis$1 = function () { return this; };

var createIteratorConstructor$2 = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$2(IteratorPrototype$1, { next: createPropertyDescriptor$2(+!ENUMERABLE_NEXT, next) });
  setToStringTag$4(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$4[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var $$t = _export;
var call$d = functionCall;
var FunctionName = functionName;
var isCallable$9 = isCallable$p;
var createIteratorConstructor$1 = createIteratorConstructor$2;
var getPrototypeOf = objectGetPrototypeOf;
var setPrototypeOf$1 = objectSetPrototypeOf;
var setToStringTag$3 = setToStringTag$6;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$a;
var redefine$a = redefine$d.exports;
var wellKnownSymbol$j = wellKnownSymbol$q;
var Iterators$3 = iterators;
var IteratorsCore = iteratorsCore;

var PROPER_FUNCTION_NAME$2 = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$5 = wellKnownSymbol$j('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var defineIterator$3 = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor$1(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$5]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf$1) {
          setPrototypeOf$1(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable$9(CurrentIteratorPrototype[ITERATOR$5])) {
          redefine$a(CurrentIteratorPrototype, ITERATOR$5, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$3(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME$2 && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty$4(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call$d(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine$a(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$t({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if (IterablePrototype[ITERATOR$5] !== defaultIterator) {
    redefine$a(IterablePrototype, ITERATOR$5, defaultIterator, { name: DEFAULT });
  }
  Iterators$3[NAME] = defaultIterator;

  return methods;
};

var toIndexedObject$6 = toIndexedObject$b;
var addToUnscopables$1 = addToUnscopables$2;
var Iterators$2 = iterators;
var InternalStateModule$6 = internalState;
var defineProperty$9 = objectDefineProperty.f;
var defineIterator$2 = defineIterator$3;
var DESCRIPTORS$c = descriptors;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$6 = InternalStateModule$6.set;
var getInternalState$7 = InternalStateModule$6.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator$2(Array, 'Array', function (iterated, kind) {
  setInternalState$6(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$6(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$7(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators$2.Arguments = Iterators$2.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$1('keys');
addToUnscopables$1('values');
addToUnscopables$1('entries');

// V8 ~ Chrome 45- bug
if (DESCRIPTORS$c && values.name !== 'values') try {
  defineProperty$9(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$a = classof$d;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$a(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var redefine$9 = redefine$d.exports;
var toString$e = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  redefine$9(Object.prototype, 'toString', toString$e, { unsafe: true });
}

var uncurryThis$q = functionUncurryThis;
var toIntegerOrInfinity$2 = toIntegerOrInfinity$5;
var toString$d = toString$g;
var requireObjectCoercible$7 = requireObjectCoercible$a;

var charAt$6 = uncurryThis$q(''.charAt);
var charCodeAt$1 = uncurryThis$q(''.charCodeAt);
var stringSlice$7 = uncurryThis$q(''.slice);

var createMethod$2 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString$d(requireObjectCoercible$7($this));
    var position = toIntegerOrInfinity$2(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt$1(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt$1(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$6(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$7(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$2(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$2(true)
};

var charAt$5 = stringMultibyte.charAt;
var toString$c = toString$g;
var InternalStateModule$5 = internalState;
var defineIterator$1 = defineIterator$3;

var STRING_ITERATOR = 'String Iterator';
var setInternalState$5 = InternalStateModule$5.set;
var getInternalState$6 = InternalStateModule$5.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator$1(String, 'String', function (iterated) {
  setInternalState$5(this, {
    type: STRING_ITERATOR,
    string: toString$c(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$6(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt$5(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

var redefine$8 = redefine$d.exports;

var redefineAll$4 = function (target, src, options) {
  for (var key in src) redefine$8(target, key, src[key], options);
  return target;
};

var internalMetadata = {exports: {}};

var objectGetOwnPropertyNamesExternal = {};

var toPropertyKey$1 = toPropertyKey$4;
var definePropertyModule$2 = objectDefineProperty;
var createPropertyDescriptor$1 = createPropertyDescriptor$6;

var createProperty$6 = function (object, key, value) {
  var propertyKey = toPropertyKey$1(key);
  if (propertyKey in object) definePropertyModule$2.f(object, propertyKey, createPropertyDescriptor$1(0, value));
  else object[propertyKey] = value;
};

var global$A = global$11;
var toAbsoluteIndex$2 = toAbsoluteIndex$4;
var lengthOfArrayLike$7 = lengthOfArrayLike$9;
var createProperty$5 = createProperty$6;

var Array$5 = global$A.Array;
var max$3 = Math.max;

var arraySliceSimple = function (O, start, end) {
  var length = lengthOfArrayLike$7(O);
  var k = toAbsoluteIndex$2(start, length);
  var fin = toAbsoluteIndex$2(end === undefined ? length : end, length);
  var result = Array$5(max$3(fin - k, 0));
  for (var n = 0; k < fin; k++, n++) createProperty$5(result, n, O[k]);
  result.length = n;
  return result;
};

/* eslint-disable es/no-object-getownpropertynames -- safe */

var classof$9 = classofRaw$1;
var toIndexedObject$5 = toIndexedObject$b;
var $getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var arraySlice$4 = arraySliceSimple;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames$1(it);
  } catch (error) {
    return arraySlice$4(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && classof$9(it) == 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames$1(toIndexedObject$5(it));
};

// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
var fails$o = fails$B;

var arrayBufferNonExtensible = fails$o(function () {
  if (typeof ArrayBuffer == 'function') {
    var buffer = new ArrayBuffer(8);
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
  }
});

var fails$n = fails$B;
var isObject$c = isObject$m;
var classof$8 = classofRaw$1;
var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isextensible -- safe
var $isExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES$2 = fails$n(function () { $isExtensible(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
var objectIsExtensible = (FAILS_ON_PRIMITIVES$2 || ARRAY_BUFFER_NON_EXTENSIBLE) ? function isExtensible(it) {
  if (!isObject$c(it)) return false;
  if (ARRAY_BUFFER_NON_EXTENSIBLE && classof$8(it) == 'ArrayBuffer') return false;
  return $isExtensible ? $isExtensible(it) : true;
} : $isExtensible;

var fails$m = fails$B;

var freezing = !fails$m(function () {
  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
  return Object.isExtensible(Object.preventExtensions({}));
});

var $$s = _export;
var uncurryThis$p = functionUncurryThis;
var hiddenKeys$1 = hiddenKeys$6;
var isObject$b = isObject$m;
var hasOwn$6 = hasOwnProperty_1;
var defineProperty$8 = objectDefineProperty.f;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
var isExtensible$1 = objectIsExtensible;
var uid$1 = uid$4;
var FREEZING = freezing;

var REQUIRED = false;
var METADATA = uid$1('meta');
var id$1 = 0;

var setMetadata = function (it) {
  defineProperty$8(it, METADATA, { value: {
    objectID: 'O' + id$1++, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey$1 = function (it, create) {
  // return a primitive with prefix
  if (!isObject$b(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!hasOwn$6(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData$1 = function (it, create) {
  if (!hasOwn$6(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZING && REQUIRED && isExtensible$1(it) && !hasOwn$6(it, METADATA)) setMetadata(it);
  return it;
};

var enable = function () {
  meta.enable = function () { /* empty */ };
  REQUIRED = true;
  var getOwnPropertyNames = getOwnPropertyNamesModule$1.f;
  var splice = uncurryThis$p([].splice);
  var test = {};
  test[METADATA] = 1;

  // prevent exposing of metadata key
  if (getOwnPropertyNames(test).length) {
    getOwnPropertyNamesModule$1.f = function (it) {
      var result = getOwnPropertyNames(it);
      for (var i = 0, length = result.length; i < length; i++) {
        if (result[i] === METADATA) {
          splice(result, i, 1);
          break;
        }
      } return result;
    };

    $$s({ target: 'Object', stat: true, forced: true }, {
      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
    });
  }
};

var meta = internalMetadata.exports = {
  enable: enable,
  fastKey: fastKey$1,
  getWeakData: getWeakData$1,
  onFreeze: onFreeze
};

hiddenKeys$1[METADATA] = true;

var uncurryThis$o = functionUncurryThis;
var aCallable$4 = aCallable$7;
var NATIVE_BIND = functionBindNative;

var bind$7 = uncurryThis$o(uncurryThis$o.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable$4(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind$7(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var wellKnownSymbol$i = wellKnownSymbol$q;
var Iterators$1 = iterators;

var ITERATOR$4 = wellKnownSymbol$i('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$2 = function (it) {
  return it !== undefined && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$4] === it);
};

var classof$7 = classof$d;
var getMethod$5 = getMethod$7;
var Iterators = iterators;
var wellKnownSymbol$h = wellKnownSymbol$q;

var ITERATOR$3 = wellKnownSymbol$h('iterator');

var getIteratorMethod$3 = function (it) {
  if (it != undefined) return getMethod$5(it, ITERATOR$3)
    || getMethod$5(it, '@@iterator')
    || Iterators[classof$7(it)];
};

var global$z = global$11;
var call$c = functionCall;
var aCallable$3 = aCallable$7;
var anObject$e = anObject$l;
var tryToString$1 = tryToString$4;
var getIteratorMethod$2 = getIteratorMethod$3;

var TypeError$d = global$z.TypeError;

var getIterator$2 = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$2(argument) : usingIterator;
  if (aCallable$3(iteratorMethod)) return anObject$e(call$c(iteratorMethod, argument));
  throw TypeError$d(tryToString$1(argument) + ' is not iterable');
};

var call$b = functionCall;
var anObject$d = anObject$l;
var getMethod$4 = getMethod$7;

var iteratorClose$2 = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject$d(iterator);
  try {
    innerResult = getMethod$4(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call$b(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject$d(innerResult);
  return value;
};

var global$y = global$11;
var bind$6 = functionBindContext;
var call$a = functionCall;
var anObject$c = anObject$l;
var tryToString = tryToString$4;
var isArrayIteratorMethod$1 = isArrayIteratorMethod$2;
var lengthOfArrayLike$6 = lengthOfArrayLike$9;
var isPrototypeOf$6 = objectIsPrototypeOf;
var getIterator$1 = getIterator$2;
var getIteratorMethod$1 = getIteratorMethod$3;
var iteratorClose$1 = iteratorClose$2;

var TypeError$c = global$y.TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate$4 = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind$6(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$1(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$c(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$1(iterable);
    if (!iterFn) throw TypeError$c(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$1(iterFn)) {
      for (index = 0, length = lengthOfArrayLike$6(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf$6(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator$1(iterable, iterFn);
  }

  next = iterator.next;
  while (!(step = call$a(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose$1(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && isPrototypeOf$6(ResultPrototype, result)) return result;
  } return new Result(false);
};

var global$x = global$11;
var isPrototypeOf$5 = objectIsPrototypeOf;

var TypeError$b = global$x.TypeError;

var anInstance$4 = function (it, Prototype) {
  if (isPrototypeOf$5(Prototype, it)) return it;
  throw TypeError$b('Incorrect invocation');
};

var wellKnownSymbol$g = wellKnownSymbol$q;

var ITERATOR$2 = wellKnownSymbol$g('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$2] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$3 = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$2] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var $$r = _export;
var global$w = global$11;
var uncurryThis$n = functionUncurryThis;
var isForced$2 = isForced_1;
var redefine$7 = redefine$d.exports;
var InternalMetadataModule$1 = internalMetadata.exports;
var iterate$3 = iterate$4;
var anInstance$3 = anInstance$4;
var isCallable$8 = isCallable$p;
var isObject$a = isObject$m;
var fails$l = fails$B;
var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration$3;
var setToStringTag$2 = setToStringTag$6;
var inheritIfRequired$1 = inheritIfRequired$3;

var collection$2 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global$w[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var uncurriedNativeMethod = uncurryThis$n(NativePrototype[KEY]);
    redefine$7(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        uncurriedNativeMethod(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject$a(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject$a(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject$a(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  var REPLACE = isForced$2(
    CONSTRUCTOR_NAME,
    !isCallable$8(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$l(function () {
      new NativeConstructor().entries().next();
    }))
  );

  if (REPLACE) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule$1.enable();
  } else if (isForced$2(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$l(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new -- required for testing
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$2(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$l(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$3(dummy, NativePrototype);
        var that = inheritIfRequired$1(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate$3(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $$r({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag$2(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var classof$6 = classofRaw$1;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$4 = Array.isArray || function isArray(argument) {
  return classof$6(argument) == 'Array';
};

var global$v = global$11;
var isArray$3 = isArray$4;
var isConstructor$2 = isConstructor$4;
var isObject$9 = isObject$m;
var wellKnownSymbol$f = wellKnownSymbol$q;

var SPECIES$6 = wellKnownSymbol$f('species');
var Array$4 = global$v.Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor$1 = function (originalArray) {
  var C;
  if (isArray$3(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor$2(C) && (C === Array$4 || isArray$3(C.prototype))) C = undefined;
    else if (isObject$9(C)) {
      C = C[SPECIES$6];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array$4 : C;
};

var arraySpeciesConstructor = arraySpeciesConstructor$1;

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$3 = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var bind$5 = functionBindContext;
var uncurryThis$m = functionUncurryThis;
var IndexedObject$1 = indexedObject;
var toObject$7 = toObject$a;
var lengthOfArrayLike$5 = lengthOfArrayLike$9;
var arraySpeciesCreate$2 = arraySpeciesCreate$3;

var push$4 = uncurryThis$m([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$1 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_REJECT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$7($this);
    var self = IndexedObject$1(O);
    var boundFunction = bind$5(callbackfn, that);
    var length = lengthOfArrayLike$5(self);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$2;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push$4(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$4(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$1(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$1(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$1(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$1(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$1(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$1(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$1(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$1(7)
};

var uncurryThis$l = functionUncurryThis;
var redefineAll$3 = redefineAll$4;
var getWeakData = internalMetadata.exports.getWeakData;
var anObject$b = anObject$l;
var isObject$8 = isObject$m;
var anInstance$2 = anInstance$4;
var iterate$2 = iterate$4;
var ArrayIterationModule = arrayIteration;
var hasOwn$5 = hasOwnProperty_1;
var InternalStateModule$4 = internalState;

var setInternalState$4 = InternalStateModule$4.set;
var internalStateGetterFor$1 = InternalStateModule$4.getterFor;
var find = ArrayIterationModule.find;
var findIndex = ArrayIterationModule.findIndex;
var splice = uncurryThis$l([].splice);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (store) {
  return store.frozen || (store.frozen = new UncaughtFrozenStore());
};

var UncaughtFrozenStore = function () {
  this.entries = [];
};

var findUncaughtFrozen = function (store, key) {
  return find(store.entries, function (it) {
    return it[0] === key;
  });
};

UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.entries.push([key, value]);
  },
  'delete': function (key) {
    var index = findIndex(this.entries, function (it) {
      return it[0] === key;
    });
    if (~index) splice(this.entries, index, 1);
    return !!~index;
  }
};

var collectionWeak$1 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance$2(that, Prototype);
      setInternalState$4(that, {
        type: CONSTRUCTOR_NAME,
        id: id++,
        frozen: undefined
      });
      if (iterable != undefined) iterate$2(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData(anObject$b(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    redefineAll$3(Prototype, {
      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$8(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && hasOwn$5(data, state.id) && delete data[state.id];
      },
      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
      // https://tc39.es/ecma262/#sec-weakset.prototype.has
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$8(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && hasOwn$5(data, state.id);
      }
    });

    redefineAll$3(Prototype, IS_MAP ? {
      // `WeakMap.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$8(key)) {
          var data = getWeakData(key);
          if (data === true) return uncaughtFrozenStore(state).get(key);
          return data ? data[state.id] : undefined;
        }
      },
      // `WeakMap.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.set
      set: function set(key, value) {
        return define(this, key, value);
      }
    } : {
      // `WeakSet.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-weakset.prototype.add
      add: function add(value) {
        return define(this, value, true);
      }
    });

    return Constructor;
  }
};

var global$u = global$11;
var uncurryThis$k = functionUncurryThis;
var redefineAll$2 = redefineAll$4;
var InternalMetadataModule = internalMetadata.exports;
var collection$1 = collection$2;
var collectionWeak = collectionWeak$1;
var isObject$7 = isObject$m;
var isExtensible = objectIsExtensible;
var enforceInternalState$1 = internalState.enforce;
var NATIVE_WEAK_MAP = nativeWeakMap;

var IS_IE11 = !global$u.ActiveXObject && 'ActiveXObject' in global$u;
var InternalWeakMap;

var wrapper = function (init) {
  return function WeakMap() {
    return init(this, arguments.length ? arguments[0] : undefined);
  };
};

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
var $WeakMap = collection$1('WeakMap', wrapper, collectionWeak);

// IE11 WeakMap frozen keys fix
// We can't use feature detection because it crash some old IE builds
// https://github.com/zloirock/core-js/issues/485
if (NATIVE_WEAK_MAP && IS_IE11) {
  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
  InternalMetadataModule.enable();
  var WeakMapPrototype = $WeakMap.prototype;
  var nativeDelete = uncurryThis$k(WeakMapPrototype['delete']);
  var nativeHas = uncurryThis$k(WeakMapPrototype.has);
  var nativeGet = uncurryThis$k(WeakMapPrototype.get);
  var nativeSet = uncurryThis$k(WeakMapPrototype.set);
  redefineAll$2(WeakMapPrototype, {
    'delete': function (key) {
      if (isObject$7(key) && !isExtensible(key)) {
        var state = enforceInternalState$1(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete(this, key) || state.frozen['delete'](key);
      } return nativeDelete(this, key);
    },
    has: function has(key) {
      if (isObject$7(key) && !isExtensible(key)) {
        var state = enforceInternalState$1(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) || state.frozen.has(key);
      } return nativeHas(this, key);
    },
    get: function get(key) {
      if (isObject$7(key) && !isExtensible(key)) {
        var state = enforceInternalState$1(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) ? nativeGet(this, key) : state.frozen.get(key);
      } return nativeGet(this, key);
    },
    set: function set(key, value) {
      if (isObject$7(key) && !isExtensible(key)) {
        var state = enforceInternalState$1(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        nativeHas(this, key) ? nativeSet(this, key, value) : state.frozen.set(key, value);
      } else nativeSet(this, key, value);
      return this;
    }
  });
}

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
var documentCreateElement = documentCreateElement$2;

var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype$2 = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype$2 === Object.prototype ? undefined : DOMTokenListPrototype$2;

var global$t = global$11;
var DOMIterables$1 = domIterables;
var DOMTokenListPrototype$1 = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$a;
var wellKnownSymbol$e = wellKnownSymbol$q;

var ITERATOR$1 = wellKnownSymbol$e('iterator');
var TO_STRING_TAG = wellKnownSymbol$e('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype$1 = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$1] !== ArrayValues) try {
      createNonEnumerableProperty$3(CollectionPrototype, ITERATOR$1, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$1] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) {
      createNonEnumerableProperty$3(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    }
    if (DOMIterables$1[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty$3(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  handlePrototype$1(global$t[COLLECTION_NAME$1] && global$t[COLLECTION_NAME$1].prototype, COLLECTION_NAME$1);
}

handlePrototype$1(DOMTokenListPrototype$1, 'DOMTokenList');

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _isNativeReflectConstruct$m() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct$m()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _createSuper$l(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$l(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$l() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NotFoundError = /*#__PURE__*/function (_Error) {
  _inherits(NotFoundError, _Error);

  var _super = _createSuper$l(NotFoundError);

  function NotFoundError(message) {
    _classCallCheck(this, NotFoundError);

    return _super.call(this, message);
  }

  return _createClass(NotFoundError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }

      return desc.value;
    };
  }

  return _get.apply(this, arguments);
}

var fails$k = fails$B;
var wellKnownSymbol$d = wellKnownSymbol$q;
var V8_VERSION$2 = engineV8Version;

var SPECIES$5 = wellKnownSymbol$d('species');

var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION$2 >= 51 || !fails$k(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$5] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$q = _export;
var global$s = global$11;
var fails$j = fails$B;
var isArray$2 = isArray$4;
var isObject$6 = isObject$m;
var toObject$6 = toObject$a;
var lengthOfArrayLike$4 = lengthOfArrayLike$9;
var createProperty$4 = createProperty$6;
var arraySpeciesCreate$1 = arraySpeciesCreate$3;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;
var wellKnownSymbol$c = wellKnownSymbol$q;
var V8_VERSION$1 = engineV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$c('isConcatSpreadable');
var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';
var TypeError$a = global$s.TypeError;

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$j(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$4('concat');

var isConcatSpreadable = function (O) {
  if (!isObject$6(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$2(O);
};

var FORCED$5 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$q({ target: 'Array', proto: true, forced: FORCED$5 }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject$6(this);
    var A = arraySpeciesCreate$1(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike$4(E);
        if (n + len > MAX_SAFE_INTEGER$1) throw TypeError$a(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$4(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER$1) throw TypeError$a(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty$4(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var anObject$a = anObject$l;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags$1 = function () {
  var that = anObject$a(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

var uncurryThis$j = functionUncurryThis;
var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
var redefine$6 = redefine$d.exports;
var anObject$9 = anObject$l;
var isPrototypeOf$4 = objectIsPrototypeOf;
var $toString$1 = toString$g;
var fails$i = fails$B;
var regExpFlags$2 = regexpFlags$1;

var TO_STRING = 'toString';
var RegExpPrototype$5 = RegExp.prototype;
var n$ToString = RegExpPrototype$5[TO_STRING];
var getFlags$2 = uncurryThis$j(regExpFlags$2);

var NOT_GENERIC = fails$i(function () { return n$ToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && n$ToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine$6(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject$9(this);
    var p = $toString$1(R.source);
    var rf = R.flags;
    var f = $toString$1(rf === undefined && isPrototypeOf$4(RegExpPrototype$5, R) && !('flags' in RegExpPrototype$5) ? getFlags$2(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

var $$p = _export;
var global$r = global$11;
var getBuiltIn$4 = getBuiltIn$c;
var apply$4 = functionApply;
var uncurryThis$i = functionUncurryThis;
var fails$h = fails$B;

var Array$3 = global$r.Array;
var $stringify$1 = getBuiltIn$4('JSON', 'stringify');
var exec$4 = uncurryThis$i(/./.exec);
var charAt$4 = uncurryThis$i(''.charAt);
var charCodeAt = uncurryThis$i(''.charCodeAt);
var replace$5 = uncurryThis$i(''.replace);
var numberToString = uncurryThis$i(1.0.toString);

var tester = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var fix = function (match, offset, string) {
  var prev = charAt$4(string, offset - 1);
  var next = charAt$4(string, offset + 1);
  if ((exec$4(low, match) && !exec$4(hi, next)) || (exec$4(hi, match) && !exec$4(low, prev))) {
    return '\\u' + numberToString(charCodeAt(match, 0), 16);
  } return match;
};

var FORCED$4 = fails$h(function () {
  return $stringify$1('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify$1('\uDEAD') !== '"\\udead"';
});

if ($stringify$1) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  // https://github.com/tc39/proposal-well-formed-stringify
  $$p({ target: 'JSON', stat: true, forced: FORCED$4 }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      for (var i = 0, l = arguments.length, args = Array$3(l); i < l; i++) args[i] = arguments[i];
      var result = apply$4($stringify$1, null, args);
      return typeof result == 'string' ? replace$5(result, tester, fix) : result;
    }
  });
}

var global$q = global$11;

var nativePromiseConstructor = global$q.Promise;

var getBuiltIn$3 = getBuiltIn$c;
var definePropertyModule$1 = objectDefineProperty;
var wellKnownSymbol$b = wellKnownSymbol$q;
var DESCRIPTORS$b = descriptors;

var SPECIES$4 = wellKnownSymbol$b('species');

var setSpecies$3 = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$3(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule$1.f;

  if (DESCRIPTORS$b && Constructor && !Constructor[SPECIES$4]) {
    defineProperty(Constructor, SPECIES$4, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var anObject$8 = anObject$l;
var aConstructor = aConstructor$2;
var wellKnownSymbol$a = wellKnownSymbol$q;

var SPECIES$3 = wellKnownSymbol$a('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor$4 = function (O, defaultConstructor) {
  var C = anObject$8(O).constructor;
  var S;
  return C === undefined || (S = anObject$8(C)[SPECIES$3]) == undefined ? defaultConstructor : aConstructor(S);
};

var global$p = global$11;

var TypeError$9 = global$p.TypeError;

var validateArgumentsLength$1 = function (passed, required) {
  if (passed < required) throw TypeError$9('Not enough arguments');
  return passed;
};

var userAgent$4 = engineUserAgent;

var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent$4);

var classof$5 = classofRaw$1;
var global$o = global$11;

var engineIsNode = classof$5(global$o.process) == 'process';

var global$n = global$11;
var apply$3 = functionApply;
var bind$4 = functionBindContext;
var isCallable$7 = isCallable$p;
var hasOwn$4 = hasOwnProperty_1;
var fails$g = fails$B;
var html = html$2;
var arraySlice$3 = arraySlice$6;
var createElement = documentCreateElement$2;
var validateArgumentsLength = validateArgumentsLength$1;
var IS_IOS$1 = engineIsIos;
var IS_NODE$2 = engineIsNode;

var set = global$n.setImmediate;
var clear = global$n.clearImmediate;
var process$2 = global$n.process;
var Dispatch = global$n.Dispatch;
var Function$1 = global$n.Function;
var MessageChannel = global$n.MessageChannel;
var String$1 = global$n.String;
var counter = 0;
var queue$1 = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var location, defer, channel, port;

try {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  location = global$n.location;
} catch (error) { /* empty */ }

var run = function (id) {
  if (hasOwn$4(queue$1, id)) {
    var fn = queue$1[id];
    delete queue$1[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global$n.postMessage(String$1(id), location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set || !clear) {
  set = function setImmediate(handler) {
    validateArgumentsLength(arguments.length, 1);
    var fn = isCallable$7(handler) ? handler : Function$1(handler);
    var args = arraySlice$3(arguments, 1);
    queue$1[++counter] = function () {
      apply$3(fn, undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue$1[id];
  };
  // Node.js 0.8-
  if (IS_NODE$2) {
    defer = function (id) {
      process$2.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !IS_IOS$1) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = bind$4(port.postMessage, port);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global$n.addEventListener &&
    isCallable$7(global$n.postMessage) &&
    !global$n.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails$g(post)
  ) {
    defer = post;
    global$n.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in createElement('script')) {
    defer = function (id) {
      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

var task$1 = {
  set: set,
  clear: clear
};

var userAgent$3 = engineUserAgent;
var global$m = global$11;

var engineIsIosPebble = /ipad|iphone|ipod/i.test(userAgent$3) && global$m.Pebble !== undefined;

var userAgent$2 = engineUserAgent;

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$2);

var global$l = global$11;
var bind$3 = functionBindContext;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var macrotask = task$1.set;
var IS_IOS = engineIsIos;
var IS_IOS_PEBBLE = engineIsIosPebble;
var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
var IS_NODE$1 = engineIsNode;

var MutationObserver = global$l.MutationObserver || global$l.WebKitMutationObserver;
var document$2 = global$l.document;
var process$1 = global$l.process;
var Promise$1 = global$l.Promise;
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$1(global$l, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify$1, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE$1 && (parent = process$1.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify$1();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!IS_IOS && !IS_NODE$1 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify$1 = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (!IS_IOS_PEBBLE && Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$1.resolve(undefined);
    // workaround of WebKit ~ iOS Safari 10.1 bug
    promise.constructor = Promise$1;
    then = bind$3(promise.then, promise);
    notify$1 = function () {
      then(flush);
    };
  // Node.js without promises
  } else if (IS_NODE$1) {
    notify$1 = function () {
      process$1.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    // strange IE + webpack dev server bug - use .bind(global)
    macrotask = bind$3(macrotask, global$l);
    notify$1 = function () {
      macrotask(flush);
    };
  }
}

var microtask$1 = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify$1();
  } last = task;
};

var newPromiseCapability$2 = {};

var aCallable$2 = aCallable$7;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable$2(resolve);
  this.reject = aCallable$2(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
newPromiseCapability$2.f = function (C) {
  return new PromiseCapability(C);
};

var anObject$7 = anObject$l;
var isObject$5 = isObject$m;
var newPromiseCapability$1 = newPromiseCapability$2;

var promiseResolve$2 = function (C, x) {
  anObject$7(C);
  if (isObject$5(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability$1.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var global$k = global$11;

var hostReportErrors$1 = function (a, b) {
  var console = global$k.console;
  if (console && console.error) {
    arguments.length == 1 ? console.error(a) : console.error(a, b);
  }
};

var perform$1 = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var Queue$1 = function () {
  this.head = null;
  this.tail = null;
};

Queue$1.prototype = {
  add: function (item) {
    var entry = { item: item, next: null };
    if (this.head) this.tail.next = entry;
    else this.head = entry;
    this.tail = entry;
  },
  get: function () {
    var entry = this.head;
    if (entry) {
      this.head = entry.next;
      if (this.tail === entry) this.tail = null;
      return entry.item;
    }
  }
};

var queue = Queue$1;

var engineIsBrowser = typeof window == 'object';

var $$o = _export;
var global$j = global$11;
var getBuiltIn$2 = getBuiltIn$c;
var call$9 = functionCall;
var NativePromise$1 = nativePromiseConstructor;
var redefine$5 = redefine$d.exports;
var redefineAll$1 = redefineAll$4;
var setPrototypeOf = objectSetPrototypeOf;
var setToStringTag$1 = setToStringTag$6;
var setSpecies$2 = setSpecies$3;
var aCallable$1 = aCallable$7;
var isCallable$6 = isCallable$p;
var isObject$4 = isObject$m;
var anInstance$1 = anInstance$4;
var inspectSource = inspectSource$4;
var iterate$1 = iterate$4;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$3;
var speciesConstructor$3 = speciesConstructor$4;
var task = task$1.set;
var microtask = microtask$1;
var promiseResolve$1 = promiseResolve$2;
var hostReportErrors = hostReportErrors$1;
var newPromiseCapabilityModule = newPromiseCapability$2;
var perform = perform$1;
var Queue = queue;
var InternalStateModule$3 = internalState;
var isForced$1 = isForced_1;
var wellKnownSymbol$9 = wellKnownSymbol$q;
var IS_BROWSER = engineIsBrowser;
var IS_NODE = engineIsNode;
var V8_VERSION = engineV8Version;

var SPECIES$2 = wellKnownSymbol$9('species');
var PROMISE = 'Promise';

var getInternalState$5 = InternalStateModule$3.getterFor(PROMISE);
var setInternalState$3 = InternalStateModule$3.set;
var getInternalPromiseState = InternalStateModule$3.getterFor(PROMISE);
var NativePromisePrototype = NativePromise$1 && NativePromise$1.prototype;
var PromiseConstructor = NativePromise$1;
var PromisePrototype = NativePromisePrototype;
var TypeError$8 = global$j.TypeError;
var document$1 = global$j.document;
var process = global$j.process;
var newPromiseCapability = newPromiseCapabilityModule.f;
var newGenericPromiseCapability = newPromiseCapability;

var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$j.dispatchEvent);
var NATIVE_REJECTION_EVENT = isCallable$6(global$j.PromiseRejectionEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var SUBCLASSING = false;

var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED$3 = isForced$1(PROMISE, function () {
  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(PromiseConstructor);
  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(PromiseConstructor);
  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
  // We can't detect it synchronously, so just check versions
  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (V8_VERSION >= 51 && /native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = new PromiseConstructor(function (resolve) { resolve(1); });
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$2] = FakePromise;
  SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
  if (!SUBCLASSING) return true;
  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  return !GLOBAL_CORE_JS_PROMISE && IS_BROWSER && !NATIVE_REJECTION_EVENT;
});

var INCORRECT_ITERATION$1 = FORCED$3 || !checkCorrectnessOfIteration$1(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject$4(it) && isCallable$6(then = it.then) ? then : false;
};

var callReaction = function (reaction, state) {
  var value = state.value;
  var ok = state.state == FULFILLED;
  var handler = ok ? reaction.ok : reaction.fail;
  var resolve = reaction.resolve;
  var reject = reaction.reject;
  var domain = reaction.domain;
  var result, then, exited;
  try {
    if (handler) {
      if (!ok) {
        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
        state.rejection = HANDLED;
      }
      if (handler === true) result = value;
      else {
        if (domain) domain.enter();
        result = handler(value); // can throw
        if (domain) {
          domain.exit();
          exited = true;
        }
      }
      if (result === reaction.promise) {
        reject(TypeError$8('Promise-chain cycle'));
      } else if (then = isThenable(result)) {
        call$9(then, result, resolve, reject);
      } else resolve(result);
    } else reject(value);
  } catch (error) {
    if (domain && !exited) domain.exit();
    reject(error);
  }
};

var notify = function (state, isReject) {
  if (state.notified) return;
  state.notified = true;
  microtask(function () {
    var reactions = state.reactions;
    var reaction;
    while (reaction = reactions.get()) {
      callReaction(reaction, state);
    }
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document$1.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global$j.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_REJECTION_EVENT && (handler = global$j['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  call$9(task, global$j, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (IS_NODE) {
          process.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  call$9(task, global$j, function () {
    var promise = state.facade;
    if (IS_NODE) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$2 = function (fn, state, unwrap) {
  return function (value) {
    fn(state, value, unwrap);
  };
};

var internalReject = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify(state, true);
};

var internalResolve = function (state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (state.facade === value) throw TypeError$8("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          call$9(then, value,
            bind$2(internalResolve, wrapper, state),
            bind$2(internalReject, wrapper, state)
          );
        } catch (error) {
          internalReject(wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify(state, false);
    }
  } catch (error) {
    internalReject({ done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED$3) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance$1(this, PromisePrototype);
    aCallable$1(executor);
    call$9(Internal, this);
    var state = getInternalState$5(this);
    try {
      executor(bind$2(internalResolve, state), bind$2(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };
  PromisePrototype = PromiseConstructor.prototype;
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState$3(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: new Queue(),
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll$1(PromisePrototype, {
    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    // eslint-disable-next-line unicorn/no-thenable -- safe
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability(speciesConstructor$3(this, PromiseConstructor));
      state.parent = true;
      reaction.ok = isCallable$6(onFulfilled) ? onFulfilled : true;
      reaction.fail = isCallable$6(onRejected) && onRejected;
      reaction.domain = IS_NODE ? process.domain : undefined;
      if (state.state == PENDING) state.reactions.add(reaction);
      else microtask(function () {
        callReaction(reaction, state);
      });
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.es/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState$5(promise);
    this.promise = promise;
    this.resolve = bind$2(internalResolve, state);
    this.reject = bind$2(internalReject, state);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (isCallable$6(NativePromise$1) && NativePromisePrototype !== Object.prototype) {
    nativeThen = NativePromisePrototype.then;

    if (!SUBCLASSING) {
      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
      redefine$5(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          call$9(nativeThen, that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });

      // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
      redefine$5(NativePromisePrototype, 'catch', PromisePrototype['catch'], { unsafe: true });
    }

    // make `.constructor === Promise` work for native promise-based APIs
    try {
      delete NativePromisePrototype.constructor;
    } catch (error) { /* empty */ }

    // make `instanceof Promise` work for native promise-based APIs
    if (setPrototypeOf) {
      setPrototypeOf(NativePromisePrototype, PromisePrototype);
    }
  }
}

$$o({ global: true, wrap: true, forced: FORCED$3 }, {
  Promise: PromiseConstructor
});

setToStringTag$1(PromiseConstructor, PROMISE, false);
setSpecies$2(PROMISE);

PromiseWrapper = getBuiltIn$2(PROMISE);

// statics
$$o({ target: PROMISE, stat: true, forced: FORCED$3 }, {
  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    call$9(capability.reject, undefined, r);
    return capability.promise;
  }
});

$$o({ target: PROMISE, stat: true, forced: FORCED$3 }, {
  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve$1(this, x);
  }
});

$$o({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION$1 }, {
  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aCallable$1(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$1(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        call$9($promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.es/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aCallable$1(C.resolve);
      iterate$1(iterable, function (promise) {
        call$9($promiseResolve, C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var fails$f = fails$B;
var global$i = global$11;

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp$2 = global$i.RegExp;

var UNSUPPORTED_Y$3 = fails$f(function () {
  var re = $RegExp$2('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY$2 = UNSUPPORTED_Y$3 || fails$f(function () {
  return !$RegExp$2('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y$3 || fails$f(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp$2('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var regexpStickyHelpers = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY$2,
  UNSUPPORTED_Y: UNSUPPORTED_Y$3
};

var fails$e = fails$B;
var global$h = global$11;

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = global$h.RegExp;

var regexpUnsupportedDotAll = fails$e(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.exec('\n') && re.flags === 's');
});

var fails$d = fails$B;
var global$g = global$11;

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = global$g.RegExp;

var regexpUnsupportedNcg = fails$d(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call$8 = functionCall;
var uncurryThis$h = functionUncurryThis;
var toString$b = toString$g;
var regexpFlags = regexpFlags$1;
var stickyHelpers$2 = regexpStickyHelpers;
var shared$1 = shared$5.exports;
var create$1 = objectCreate;
var getInternalState$4 = internalState.get;
var UNSUPPORTED_DOT_ALL$2 = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG$1 = regexpUnsupportedNcg;

var nativeReplace = shared$1('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$3 = uncurryThis$h(''.charAt);
var indexOf = uncurryThis$h(''.indexOf);
var replace$4 = uncurryThis$h(''.replace);
var stringSlice$6 = uncurryThis$h(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call$8(nativeExec, re1, 'a');
  call$8(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$2 = stickyHelpers$2.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2 || UNSUPPORTED_DOT_ALL$2 || UNSUPPORTED_NCG$1;

if (PATCH) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState$4(re);
    var str = toString$b(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call$8(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y$2 && re.sticky;
    var flags = call$8(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace$4(flags, 'y', '');
      if (indexOf(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$6(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$3(str, re.lastIndex - 1) !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = call$8(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice$6(match.input, charsAdded);
        match[0] = stringSlice$6(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      call$8(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create$1(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec$3 = patchedExec;

var $$n = _export;
var exec$3 = regexpExec$3;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$$n({ target: 'RegExp', proto: true, forced: /./.exec !== exec$3 }, {
  exec: exec$3
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var uncurryThis$g = functionUncurryThis;
var redefine$4 = redefine$d.exports;
var regexpExec$2 = regexpExec$3;
var fails$c = fails$B;
var wellKnownSymbol$8 = wellKnownSymbol$q;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$a;

var SPECIES$1 = wellKnownSymbol$8('species');
var RegExpPrototype$4 = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol$8(KEY);

  var DELEGATES_TO_SYMBOL = !fails$c(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$c(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES$1] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    FORCED
  ) {
    var uncurriedNativeRegExpMethod = uncurryThis$g(/./[SYMBOL]);
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      var uncurriedNativeMethod = uncurryThis$g(nativeMethod);
      var $exec = regexp.exec;
      if ($exec === regexpExec$2 || $exec === RegExpPrototype$4.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
        }
        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
      }
      return { done: false };
    });

    redefine$4(String.prototype, KEY, methods[0]);
    redefine$4(RegExpPrototype$4, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty$2(RegExpPrototype$4[SYMBOL], 'sham', true);
};

var charAt$2 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex$4 = function (S, index, unicode) {
  return index + (unicode ? charAt$2(S, index).length : 1);
};

var uncurryThis$f = functionUncurryThis;
var toObject$5 = toObject$a;

var floor$1 = Math.floor;
var charAt$1 = uncurryThis$f(''.charAt);
var replace$3 = uncurryThis$f(''.replace);
var stringSlice$5 = uncurryThis$f(''.slice);
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution$1 = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject$5(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace$3(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt$1(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice$5(str, 0, position);
      case "'": return stringSlice$5(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice$5(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor$1(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt$1(ch, 1) : captures[f - 1] + charAt$1(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var global$f = global$11;
var call$7 = functionCall;
var anObject$6 = anObject$l;
var isCallable$5 = isCallable$p;
var classof$4 = classofRaw$1;
var regexpExec$1 = regexpExec$3;

var TypeError$7 = global$f.TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable$5(exec)) {
    var result = call$7(exec, R, S);
    if (result !== null) anObject$6(result);
    return result;
  }
  if (classof$4(R) === 'RegExp') return call$7(regexpExec$1, R, S);
  throw TypeError$7('RegExp#exec called on incompatible receiver');
};

var apply$2 = functionApply;
var call$6 = functionCall;
var uncurryThis$e = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic$2 = fixRegexpWellKnownSymbolLogic;
var fails$b = fails$B;
var anObject$5 = anObject$l;
var isCallable$4 = isCallable$p;
var toIntegerOrInfinity$1 = toIntegerOrInfinity$5;
var toLength$4 = toLength$6;
var toString$a = toString$g;
var requireObjectCoercible$6 = requireObjectCoercible$a;
var advanceStringIndex$3 = advanceStringIndex$4;
var getMethod$3 = getMethod$7;
var getSubstitution = getSubstitution$1;
var regExpExec$3 = regexpExecAbstract;
var wellKnownSymbol$7 = wellKnownSymbol$q;

var REPLACE = wellKnownSymbol$7('replace');
var max$2 = Math.max;
var min$3 = Math.min;
var concat = uncurryThis$e([].concat);
var push$3 = uncurryThis$e([].push);
var stringIndexOf$3 = uncurryThis$e(''.indexOf);
var stringSlice$4 = uncurryThis$e(''.slice);

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
  return 'a'.replace(/./, '$0') === '$0';
})();

// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$b(function () {
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
  return ''.replace(re, '$<a>') !== '7';
});

// @@replace logic
fixRegExpWellKnownSymbolLogic$2('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible$6(this);
      var replacer = searchValue == undefined ? undefined : getMethod$3(searchValue, REPLACE);
      return replacer
        ? call$6(replacer, searchValue, O, replaceValue)
        : call$6(nativeReplace, toString$a(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject$5(this);
      var S = toString$a(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf$3(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf$3(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable$4(replaceValue);
      if (!functionalReplace) replaceValue = toString$a(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec$3(rx, S);
        if (result === null) break;

        push$3(results, result);
        if (!global) break;

        var matchStr = toString$a(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex$3(S, toLength$4(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString$a(result[0]);
        var position = max$2(min$3(toIntegerOrInfinity$1(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push$3(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat([matched], captures, position, S);
          if (namedCaptures !== undefined) push$3(replacerArgs, namedCaptures);
          var replacement = toString$a(apply$2(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice$4(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + stringSlice$4(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

var $$m = _export;
var NativePromise = nativePromiseConstructor;
var fails$a = fails$B;
var getBuiltIn$1 = getBuiltIn$c;
var isCallable$3 = isCallable$p;
var speciesConstructor$2 = speciesConstructor$4;
var promiseResolve = promiseResolve$2;
var redefine$3 = redefine$d.exports;

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromise && fails$a(function () {
  // eslint-disable-next-line unicorn/no-thenable -- required for testing
  NativePromise.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.es/ecma262/#sec-promise.prototype.finally
$$m({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor$2(this, getBuiltIn$1('Promise'));
    var isFunction = isCallable$3(onFinally);
    return this.then(
      isFunction ? function (x) {
        return promiseResolve(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return promiseResolve(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  }
});

// makes sure that native promise-based APIs `Promise#finally` properly works with patched `Promise#then`
if (isCallable$3(NativePromise)) {
  var method = getBuiltIn$1('Promise').prototype['finally'];
  if (NativePromise.prototype['finally'] !== method) {
    redefine$3(NativePromise.prototype, 'finally', method, { unsafe: true });
  }
}

// a string of all valid unicode whitespaces
var whitespaces$3 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var uncurryThis$d = functionUncurryThis;
var requireObjectCoercible$5 = requireObjectCoercible$a;
var toString$9 = toString$g;
var whitespaces$2 = whitespaces$3;

var replace$2 = uncurryThis$d(''.replace);
var whitespace = '[' + whitespaces$2 + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = toString$9(requireObjectCoercible$5($this));
    if (TYPE & 1) string = replace$2(string, ltrim, '');
    if (TYPE & 2) string = replace$2(string, rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};

var global$e = global$11;
var fails$9 = fails$B;
var uncurryThis$c = functionUncurryThis;
var toString$8 = toString$g;
var trim = stringTrim.trim;
var whitespaces$1 = whitespaces$3;

var $parseInt$1 = global$e.parseInt;
var Symbol$1 = global$e.Symbol;
var ITERATOR = Symbol$1 && Symbol$1.iterator;
var hex = /^[+-]?0x/i;
var exec$2 = uncurryThis$c(hex.exec);
var FORCED$2 = $parseInt$1(whitespaces$1 + '08') !== 8 || $parseInt$1(whitespaces$1 + '0x16') !== 22
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR && !fails$9(function () { $parseInt$1(Object(ITERATOR)); }));

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$2 ? function parseInt(string, radix) {
  var S = trim(toString$8(string));
  return $parseInt$1(S, (radix >>> 0) || (exec$2(hex, S) ? 16 : 10));
} : $parseInt$1;

var $$l = _export;
var $parseInt = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$l({ global: true, forced: parseInt != $parseInt }, {
  parseInt: $parseInt
});

var $$k = _export;
var toObject$4 = toObject$a;
var nativeKeys = objectKeys$2;
var fails$8 = fails$B;

var FAILS_ON_PRIMITIVES$1 = fails$8(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$$k({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1 }, {
  keys: function keys(it) {
    return nativeKeys(toObject$4(it));
  }
});

var wellKnownSymbolWrapped = {};

var wellKnownSymbol$6 = wellKnownSymbol$q;

wellKnownSymbolWrapped.f = wellKnownSymbol$6;

var global$d = global$11;

var path$1 = global$d;

var path = path$1;
var hasOwn$3 = hasOwnProperty_1;
var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
var defineProperty$7 = objectDefineProperty.f;

var defineWellKnownSymbol$2 = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!hasOwn$3(Symbol, NAME)) defineProperty$7(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule$1.f(NAME)
  });
};

var $$j = _export;
var global$c = global$11;
var getBuiltIn = getBuiltIn$c;
var apply$1 = functionApply;
var call$5 = functionCall;
var uncurryThis$b = functionUncurryThis;
var DESCRIPTORS$a = descriptors;
var NATIVE_SYMBOL$1 = nativeSymbol;
var fails$7 = fails$B;
var hasOwn$2 = hasOwnProperty_1;
var isArray$1 = isArray$4;
var isCallable$2 = isCallable$p;
var isObject$3 = isObject$m;
var isPrototypeOf$3 = objectIsPrototypeOf;
var isSymbol = isSymbol$3;
var anObject$4 = anObject$l;
var toObject$3 = toObject$a;
var toIndexedObject$4 = toIndexedObject$b;
var toPropertyKey = toPropertyKey$4;
var $toString = toString$g;
var createPropertyDescriptor = createPropertyDescriptor$6;
var nativeObjectCreate = objectCreate;
var objectKeys = objectKeys$2;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;
var definePropertyModule = objectDefineProperty;
var definePropertiesModule = objectDefineProperties;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var arraySlice$2 = arraySlice$6;
var redefine$2 = redefine$d.exports;
var shared = shared$5.exports;
var sharedKey = sharedKey$4;
var hiddenKeys = hiddenKeys$6;
var uid = uid$4;
var wellKnownSymbol$5 = wellKnownSymbol$q;
var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
var defineWellKnownSymbol$1 = defineWellKnownSymbol$2;
var setToStringTag = setToStringTag$6;
var InternalStateModule$2 = internalState;
var $forEach$1 = arrayIteration.forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol$5('toPrimitive');

var setInternalState$2 = InternalStateModule$2.set;
var getInternalState$3 = InternalStateModule$2.getterFor(SYMBOL);

var ObjectPrototype = Object[PROTOTYPE];
var $Symbol = global$c.Symbol;
var SymbolPrototype$1 = $Symbol && $Symbol[PROTOTYPE];
var TypeError$6 = global$c.TypeError;
var QObject = global$c.QObject;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor$1 = getOwnPropertyDescriptorModule$1.f;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
var push$2 = uncurryThis$b([].push);

var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore = shared('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS$a && fails$7(function () {
  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype$1);
  setInternalState$2(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS$a) symbol.description = description;
  return symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject$4(O);
  var key = toPropertyKey(P);
  anObject$4(Attributes);
  if (hasOwn$2(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwn$2(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwn$2(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject$4(O);
  var properties = toIndexedObject$4(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach$1(keys, function (key) {
    if (!DESCRIPTORS$a || call$5($propertyIsEnumerable, properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPropertyKey(V);
  var enumerable = call$5(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype && hasOwn$2(AllSymbols, P) && !hasOwn$2(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwn$2(this, P) || !hasOwn$2(AllSymbols, P) || hasOwn$2(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject$4(O);
  var key = toPropertyKey(P);
  if (it === ObjectPrototype && hasOwn$2(AllSymbols, key) && !hasOwn$2(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
  if (descriptor && hasOwn$2(AllSymbols, key) && !(hasOwn$2(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject$4(O));
  var result = [];
  $forEach$1(names, function (key) {
    if (!hasOwn$2(AllSymbols, key) && !hasOwn$2(hiddenKeys, key)) push$2(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$4(O));
  var result = [];
  $forEach$1(names, function (key) {
    if (hasOwn$2(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn$2(ObjectPrototype, key))) {
      push$2(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL$1) {
  $Symbol = function Symbol() {
    if (isPrototypeOf$3(SymbolPrototype$1, this)) throw TypeError$6('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype) call$5(setter, ObjectPrototypeSymbols, value);
      if (hasOwn$2(this, HIDDEN) && hasOwn$2(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (DESCRIPTORS$a && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype$1 = $Symbol[PROTOTYPE];

  redefine$2(SymbolPrototype$1, 'toString', function toString() {
    return getInternalState$3(this).tag;
  });

  redefine$2($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  propertyIsEnumerableModule.f = $propertyIsEnumerable;
  definePropertyModule.f = $defineProperty;
  definePropertiesModule.f = $defineProperties;
  getOwnPropertyDescriptorModule$1.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol$5(name), name);
  };

  if (DESCRIPTORS$a) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty(SymbolPrototype$1, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$3(this).description;
      }
    });
    {
      redefine$2(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$$j({ global: true, wrap: true, forced: !NATIVE_SYMBOL$1, sham: !NATIVE_SYMBOL$1 }, {
  Symbol: $Symbol
});

$forEach$1(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol$1(name);
});

$$j({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL$1 }, {
  // `Symbol.for` method
  // https://tc39.es/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = $toString(key);
    if (hasOwn$2(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.es/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError$6(sym + ' is not a symbol');
    if (hasOwn$2(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$$j({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$1, sham: !DESCRIPTORS$a }, {
  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$$j({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$1 }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$$j({ target: 'Object', stat: true, forced: fails$7(function () { getOwnPropertySymbolsModule.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule.f(toObject$3(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.es/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL$1 || fails$7(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  $$j({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice$2(arguments);
      var $replacer = replacer;
      if (!isObject$3(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray$1(replacer)) replacer = function (key, value) {
        if (isCallable$2($replacer)) value = call$5($replacer, this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return apply$1($stringify, null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (!SymbolPrototype$1[TO_PRIMITIVE]) {
  var valueOf = SymbolPrototype$1.valueOf;
  // eslint-disable-next-line no-unused-vars -- required for .length
  redefine$2(SymbolPrototype$1, TO_PRIMITIVE, function (hint) {
    // TODO: improve hint logic
    return call$5(valueOf, this);
  });
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;

var $$i = _export;
var $filter = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$3('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$i({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$h = _export;
var fails$6 = fails$B;
var toIndexedObject$3 = toIndexedObject$b;
var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var DESCRIPTORS$9 = descriptors;

var FAILS_ON_PRIMITIVES = fails$6(function () { nativeGetOwnPropertyDescriptor(1); });
var FORCED$1 = !DESCRIPTORS$9 || FAILS_ON_PRIMITIVES;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$$h({ target: 'Object', stat: true, forced: FORCED$1, sham: !DESCRIPTORS$9 }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor(toIndexedObject$3(it), key);
  }
});

var fails$5 = fails$B;

var arrayMethodIsStrict$4 = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$5(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var $forEach = arrayIteration.forEach;
var arrayMethodIsStrict$3 = arrayMethodIsStrict$4;

var STRICT_METHOD$3 = arrayMethodIsStrict$3('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var global$b = global$11;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var forEach = arrayForEach;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$a;

var handlePrototype = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
    createNonEnumerableProperty$1(CollectionPrototype, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype.forEach = forEach;
  }
};

for (var COLLECTION_NAME in DOMIterables) {
  if (DOMIterables[COLLECTION_NAME]) {
    handlePrototype(global$b[COLLECTION_NAME] && global$b[COLLECTION_NAME].prototype);
  }
}

handlePrototype(DOMTokenListPrototype);

var $$g = _export;
var DESCRIPTORS$8 = descriptors;
var ownKeys$1 = ownKeys$3;
var toIndexedObject$2 = toIndexedObject$b;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var createProperty$3 = createProperty$6;

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$$g({ target: 'Object', stat: true, sham: !DESCRIPTORS$8 }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject$2(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var keys = ownKeys$1(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty$3(result, key, descriptor);
    }
    return result;
  }
});

var $$f = _export;
var DESCRIPTORS$7 = descriptors;
var defineProperties = objectDefineProperties.f;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
$$f({ target: 'Object', stat: true, forced: Object.defineProperties !== defineProperties, sham: !DESCRIPTORS$7 }, {
  defineProperties: defineProperties
});

var $$e = _export;
var DESCRIPTORS$6 = descriptors;
var defineProperty$6 = objectDefineProperty.f;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
// eslint-disable-next-line es/no-object-defineproperty -- safe
$$e({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty$6, sham: !DESCRIPTORS$6 }, {
  defineProperty: defineProperty$6
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _classPrivateFieldInitSpec$3(obj, privateMap, value) { _checkPrivateRedeclaration$3(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration$3(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

var _eventListeners = /*#__PURE__*/new WeakMap();

var EventHarness = /*#__PURE__*/function () {
  function EventHarness() {
    _classCallCheck(this, EventHarness);

    _classPrivateFieldInitSpec$3(this, _eventListeners, {
      writable: true,
      value: []
    });
  }

  _createClass(EventHarness, [{
    key: "bindListener",
    value:
    /**
     *
     * @param {string} eventName
     * @param {Object} obj
     * @param {Function} method
     * @param {*=} constructionParam
     * @deprecated use addListener instead
     * @return {number} handle
     */
    function bindListener(eventName, obj, method, constructionParam) {
      _classPrivateFieldSet(this, _eventListeners, _classPrivateFieldGet(this, _eventListeners) || []);

      var handlerFunction = function handlerFunction(context, eventName, invocationParam) {
        return method.call(obj, context, eventName, invocationParam, constructionParam);
      };

      if (_classPrivateFieldGet(this, _eventListeners)[eventName]) {
        return _classPrivateFieldGet(this, _eventListeners)[eventName].push(handlerFunction) - 1;
      } else {
        _classPrivateFieldGet(this, _eventListeners)[eventName] = [handlerFunction];
        return 0; // first element in array
      }
    }
  }, {
    key: "addListener",
    value:
    /**
     *
     * @param {string} eventName
     * @param {Function} handler
     * @param {*=} constructionParam
     * @return {number} handle
     */
    function addListener(eventName, handler) {
      var constructionParam = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      _classPrivateFieldSet(this, _eventListeners, _classPrivateFieldGet(this, _eventListeners) || []);

      var handlerFunction = function handlerFunction(context, eventName) {
        var invocationParam = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return handler(_objectSpread(_objectSpread({
          context: context,
          eventName: eventName
        }, invocationParam), constructionParam));
      };

      if (_classPrivateFieldGet(this, _eventListeners)[eventName]) {
        return _classPrivateFieldGet(this, _eventListeners)[eventName].push(handlerFunction) - 1;
      } else {
        _classPrivateFieldGet(this, _eventListeners)[eventName] = [handlerFunction];
        return 0; // first element in array
      }
    }
  }, {
    key: "removeListener",
    value:
    /**
     *
     * @param {string} eventName
     * @param {number} handle
     * @returns undefined
     */
    function removeListener(eventName, handle) {
      if (_classPrivateFieldGet(this, _eventListeners)[eventName] && _classPrivateFieldGet(this, _eventListeners)[eventName][handle]) {
        delete _classPrivateFieldGet(this, _eventListeners)[eventName][handle];
      } else {
        console.log('trying to remove non-existent event handler, event = ' + eventName + ' handle = ' + handle);
      }

      return undefined;
    }
  }, {
    key: "destructor",
    value:
    /**
     *
     */
    function destructor() {
      _classPrivateFieldSet(this, _eventListeners, null);
    }
  }, {
    key: "fireEvent",
    value:
    /**
     *
     * @param {string} eventName
     * @param {Object=} param optional parameter to pass on to listener
     * @return void
     */
    function fireEvent(eventName, param) {
      //console.log('fire event "' + eventName + '" called by '+this.fire_event.caller.caller+' invoked by '+this.fire_event.caller.caller.caller+' instigated by '+this.fire_event.caller.caller.caller.caller);
      if (_classPrivateFieldGet(this, _eventListeners)) {
        for (var f in _classPrivateFieldGet(this, _eventListeners)[eventName]) {
          if (_classPrivateFieldGet(this, _eventListeners)[eventName].hasOwnProperty(f)) {
            if (_classPrivateFieldGet(this, _eventListeners)[eventName][f](this, eventName, arguments[1]) === EventHarness.STOP_PROPAGATION) {
              break;
            }
          }
        }
      }
    }
  }]);

  return EventHarness;
}();

_defineProperty(EventHarness, "STOP_PROPAGATION", 'STOP_PROPAGATION');

var localforage$1 = {exports: {}};

/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/

(function (module, exports) {
(function(f){{module.exports=f();}})(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof commonjsRequire=="function"&&commonjsRequire;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof commonjsRequire=="function"&&commonjsRequire;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
},{}],2:[function(_dereq_,module,exports){
var immediate = _dereq_(1);

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"1":1}],3:[function(_dereq_,module,exports){
(function (global){
if (typeof global.Promise !== 'function') {
  global.Promise = _dereq_(2);
}

}).call(this,typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
},{"2":2}],4:[function(_dereq_,module,exports){

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getIDB() {
    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    try {
        if (typeof indexedDB !== 'undefined') {
            return indexedDB;
        }
        if (typeof webkitIndexedDB !== 'undefined') {
            return webkitIndexedDB;
        }
        if (typeof mozIndexedDB !== 'undefined') {
            return mozIndexedDB;
        }
        if (typeof OIndexedDB !== 'undefined') {
            return OIndexedDB;
        }
        if (typeof msIndexedDB !== 'undefined') {
            return msIndexedDB;
        }
    } catch (e) {
        return;
    }
}

var idb = getIDB();

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        if (!idb || !idb.open) {
            return false;
        }
        // We mimic PouchDB here;
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

        // Safari <10.1 does not meet our requirements for IDB support
        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
        // Safari 10.1 shipped with fetch, we can use that to detect it.
        // Note: this creates issues with `window.fetch` polyfills and
        // overrides; see:
        // https://github.com/localForage/localForage/issues/856
        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
        // some outdated implementations of IDB that appear on Samsung
        // and HTC Android devices <4.4 are missing IDBKeyRange
        // See: https://github.com/mozilla/localForage/issues/128
        // See: https://github.com/mozilla/localForage/issues/272
        typeof IDBKeyRange !== 'undefined';
    } catch (e) {
        return false;
    }
}

// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
function createBlob(parts, properties) {
    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
    parts = parts || [];
    properties = properties || {};
    try {
        return new Blob(parts, properties);
    } catch (e) {
        if (e.name !== 'TypeError') {
            throw e;
        }
        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
        var builder = new Builder();
        for (var i = 0; i < parts.length; i += 1) {
            builder.append(parts[i]);
        }
        return builder.getBlob(properties.type);
    }
}

// This is CommonJS because lie is an external dependency, so Rollup
// can just ignore it.
if (typeof Promise === 'undefined') {
    // In the "nopromises" build this will just throw if you don't have
    // a global promise object, but it would throw anyway later.
    _dereq_(3);
}
var Promise$1 = Promise;

function executeCallback(promise, callback) {
    if (callback) {
        promise.then(function (result) {
            callback(null, result);
        }, function (error) {
            callback(error);
        });
    }
}

function executeTwoCallbacks(promise, callback, errorCallback) {
    if (typeof callback === 'function') {
        promise.then(callback);
    }

    if (typeof errorCallback === 'function') {
        promise["catch"](errorCallback);
    }
}

function normalizeKey(key) {
    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    return key;
}

function getCallback() {
    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
        return arguments[arguments.length - 1];
    }
}

// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).

var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
var supportsBlobs = void 0;
var dbContexts = {};
var toString = Object.prototype.toString;

// Transaction Modes
var READ_ONLY = 'readonly';
var READ_WRITE = 'readwrite';

// Transform a binary string to an array buffer, because otherwise
// weird stuff happens when you try to work with the binary string directly.
// It is known.
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function _binStringToArrayBuffer(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

//
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
//
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
//
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
//
// Code borrowed from PouchDB. See:
// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
//
function _checkBlobSupportWithoutCaching(idb) {
    return new Promise$1(function (resolve) {
        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
        var blob = createBlob(['']);
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

        txn.onabort = function (e) {
            // If the transaction aborts now its due to not being able to
            // write to the database, likely due to the disk being full
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
        };

        txn.oncomplete = function () {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            // MS Edge pretends to be Chrome 42:
            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
        };
    })["catch"](function () {
        return false; // error, so assume unsupported
    });
}

function _checkBlobSupport(idb) {
    if (typeof supportsBlobs === 'boolean') {
        return Promise$1.resolve(supportsBlobs);
    }
    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
        supportsBlobs = value;
        return supportsBlobs;
    });
}

function _deferReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Create a deferred object representing the current database operation.
    var deferredOperation = {};

    deferredOperation.promise = new Promise$1(function (resolve, reject) {
        deferredOperation.resolve = resolve;
        deferredOperation.reject = reject;
    });

    // Enqueue the deferred operation.
    dbContext.deferredOperations.push(deferredOperation);

    // Chain its promise to the database readiness.
    if (!dbContext.dbReady) {
        dbContext.dbReady = deferredOperation.promise;
    } else {
        dbContext.dbReady = dbContext.dbReady.then(function () {
            return deferredOperation.promise;
        });
    }
}

function _advanceReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Resolve its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.resolve();
        return deferredOperation.promise;
    }
}

function _rejectReadiness(dbInfo, err) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Reject its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.reject(err);
        return deferredOperation.promise;
    }
}

function _getConnection(dbInfo, upgradeNeeded) {
    return new Promise$1(function (resolve, reject) {
        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

        if (dbInfo.db) {
            if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
            } else {
                return resolve(dbInfo.db);
            }
        }

        var dbArgs = [dbInfo.name];

        if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
        }

        var openreq = idb.open.apply(idb, dbArgs);

        if (upgradeNeeded) {
            openreq.onupgradeneeded = function (e) {
                var db = openreq.result;
                try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                        // Added when support for blob shims was added
                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                } catch (ex) {
                    if (ex.name === 'ConstraintError') {
                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                        throw ex;
                    }
                }
            };
        }

        openreq.onerror = function (e) {
            e.preventDefault();
            reject(openreq.error);
        };

        openreq.onsuccess = function () {
            var db = openreq.result;
            db.onversionchange = function (e) {
                // Triggered when the database is modified (e.g. adding an objectStore) or
                // deleted (even when initiated by other sessions in different tabs).
                // Closing the connection here prevents those operations from being blocked.
                // If the database is accessed again later by this instance, the connection
                // will be reopened or the database recreated as needed.
                e.target.close();
            };
            resolve(db);
            _advanceReadiness(dbInfo);
        };
    });
}

function _getOriginalConnection(dbInfo) {
    return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo) {
    return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo, defaultVersion) {
    if (!dbInfo.db) {
        return true;
    }

    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
    var isDowngrade = dbInfo.version < dbInfo.db.version;
    var isUpgrade = dbInfo.version > dbInfo.db.version;

    if (isDowngrade) {
        // If the version is not the default one
        // then warn for impossible downgrade.
        if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
        }
        // Align the versions to prevent errors.
        dbInfo.version = dbInfo.db.version;
    }

    if (isUpgrade || isNewStore) {
        // If the store is new then increment the version (if needed).
        // This will trigger an "upgradeneeded" event which is required
        // for creating a store.
        if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
            }
        }

        return true;
    }

    return false;
}

// encode a blob for indexeddb engines that don't support blobs
function _encodeBlob(blob) {
    return new Promise$1(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = function (e) {
            var base64 = btoa(e.target.result || '');
            resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
            });
        };
        reader.readAsBinaryString(blob);
    });
}

// decode an encoded blob
function _decodeBlob(encodedBlob) {
    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
    return createBlob([arrayBuff], { type: encodedBlob.type });
}

// is this one of our fancy encoded blobs?
function _isEncodedBlob(value) {
    return value && value.__local_forage_encoded_blob;
}

// Specialize the default `ready()` function by making it dependent
// on the current database operations. Thus, the driver will be actually
// ready when it's been initialized (default) *and* there are no pending
// operations on the database (initiated by some other instances).
function _fullyReady(callback) {
    var self = this;

    var promise = self._initReady().then(function () {
        var dbContext = dbContexts[self._dbInfo.name];

        if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
        }
    });

    executeTwoCallbacks(promise, callback, callback);
    return promise;
}

// Try to establish a new db connection to replace the
// current one which is broken (i.e. experiencing
// InvalidStateError while creating a transaction).
function _tryReconnect(dbInfo) {
    _deferReadiness(dbInfo);

    var dbContext = dbContexts[dbInfo.name];
    var forages = dbContext.forages;

    for (var i = 0; i < forages.length; i++) {
        var forage = forages[i];
        if (forage._dbInfo.db) {
            forage._dbInfo.db.close();
            forage._dbInfo.db = null;
        }
    }
    dbInfo.db = null;

    return _getOriginalConnection(dbInfo).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        // store the latest db reference
        // in case the db was upgraded
        dbInfo.db = dbContext.db = db;
        for (var i = 0; i < forages.length; i++) {
            forages[i]._dbInfo.db = db;
        }
    })["catch"](function (err) {
        _rejectReadiness(dbInfo, err);
        throw err;
    });
}

// FF doesn't like Promises (micro-tasks) and IDDB store operations,
// so we have to do it with callbacks
function createTransaction(dbInfo, mode, callback, retries) {
    if (retries === undefined) {
        retries = 1;
    }

    try {
        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
        callback(null, tx);
    } catch (err) {
        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
            return Promise$1.resolve().then(function () {
                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                    // increase the db version, to create the new ObjectStore
                    if (dbInfo.db) {
                        dbInfo.version = dbInfo.db.version + 1;
                    }
                    // Reopen the database for upgrading.
                    return _getUpgradedConnection(dbInfo);
                }
            }).then(function () {
                return _tryReconnect(dbInfo).then(function () {
                    createTransaction(dbInfo, mode, callback, retries - 1);
                });
            })["catch"](callback);
        }

        callback(err);
    }
}

function createDbContext() {
    return {
        // Running localForages sharing a database.
        forages: [],
        // Shared database.
        db: null,
        // Database readiness (promise).
        dbReady: null,
        // Deferred operations on the database.
        deferredOperations: []
    };
}

// Open the IndexedDB database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    // Get the current context of the database;
    var dbContext = dbContexts[dbInfo.name];

    // ...or create a new context.
    if (!dbContext) {
        dbContext = createDbContext();
        // Register the new context in the global container.
        dbContexts[dbInfo.name] = dbContext;
    }

    // Register itself as a running localForage in the current context.
    dbContext.forages.push(self);

    // Replace the default `ready()` function with the specialized one.
    if (!self._initReady) {
        self._initReady = self.ready;
        self.ready = _fullyReady;
    }

    // Create an array of initialization states of the related localForages.
    var initPromises = [];

    function ignoreErrors() {
        // Don't handle errors here,
        // just makes sure related localForages aren't pending.
        return Promise$1.resolve();
    }

    for (var j = 0; j < dbContext.forages.length; j++) {
        var forage = dbContext.forages[j];
        if (forage !== self) {
            // Don't wait for itself...
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
        }
    }

    // Take a snapshot of the related localForages.
    var forages = dbContext.forages.slice(0);

    // Initialize the connection process only when
    // all the related localForages aren't pending.
    return Promise$1.all(initPromises).then(function () {
        dbInfo.db = dbContext.db;
        // Get the connection or open a new one without upgrade.
        return _getOriginalConnection(dbInfo);
    }).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        dbInfo.db = dbContext.db = db;
        self._dbInfo = dbInfo;
        // Share the final connection amongst related localForages.
        for (var k = 0; k < forages.length; k++) {
            var forage = forages[k];
            if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
            }
        }
    });
}

function getItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.get(key);

                    req.onsuccess = function () {
                        var value = req.result;
                        if (value === undefined) {
                            value = null;
                        }
                        if (_isEncodedBlob(value)) {
                            value = _decodeBlob(value);
                        }
                        resolve(value);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items stored in database.
function iterate(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var iterationNumber = 1;

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (cursor) {
                            var value = cursor.value;
                            if (_isEncodedBlob(value)) {
                                value = _decodeBlob(value);
                            }
                            var result = iterator(value, cursor.key, iterationNumber++);

                            // when the iterator callback returns any
                            // (non-`undefined`) value, then we stop
                            // the iteration immediately
                            if (result !== void 0) {
                                resolve(result);
                            } else {
                                cursor["continue"]();
                            }
                        } else {
                            resolve();
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);

    return promise;
}

function setItem(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        var dbInfo;
        self.ready().then(function () {
            dbInfo = self._dbInfo;
            if (toString.call(value) === '[object Blob]') {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                    if (blobSupport) {
                        return value;
                    }
                    return _encodeBlob(value);
                });
            }
            return value;
        }).then(function (value) {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);

                    // The reason we don't _save_ null is because IE 10 does
                    // not support saving the `null` type in IndexedDB. How
                    // ironic, given the bug below!
                    // See: https://github.com/mozilla/localForage/issues/161
                    if (value === null) {
                        value = undefined;
                    }

                    var req = store.put(value, key);

                    transaction.oncomplete = function () {
                        // Cast to undefined so the value passed to
                        // callback/promise is the same as what one would get out
                        // of `getItem()` later. This leads to some weirdness
                        // (setItem('foo', undefined) will return `null`), but
                        // it's not my fault localStorage is our baseline and that
                        // it's weird.
                        if (value === undefined) {
                            value = null;
                        }

                        resolve(value);
                    };
                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    // We use a Grunt task to make this safe for IE and some
                    // versions of Android (including those used by Cordova).
                    // Normally IE won't like `.delete()` and will insist on
                    // using `['delete']()`, but we have a build step that
                    // fixes this for us now.
                    var req = store["delete"](key);
                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onerror = function () {
                        reject(req.error);
                    };

                    // The request will be also be aborted if we've exceeded our storage
                    // space.
                    transaction.onabort = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function clear(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.clear();

                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function length(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.count();

                    req.onsuccess = function () {
                        resolve(req.result);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function key(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        if (n < 0) {
            resolve(null);

            return;
        }

        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var advanced = false;
                    var req = store.openKeyCursor();

                    req.onsuccess = function () {
                        var cursor = req.result;
                        if (!cursor) {
                            // this means there weren't enough keys
                            resolve(null);

                            return;
                        }

                        if (n === 0) {
                            // We have the first key, return it if that's what they
                            // wanted.
                            resolve(cursor.key);
                        } else {
                            if (!advanced) {
                                // Otherwise, ask the cursor to skip ahead n
                                // records.
                                advanced = true;
                                cursor.advance(n);
                            } else {
                                // When we get here, we've got the nth key.
                                resolve(cursor.key);
                            }
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openKeyCursor();
                    var keys = [];

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (!cursor) {
                            resolve(keys);
                            return;
                        }

                        keys.push(cursor.key);
                        cursor["continue"]();
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
            var dbContext = dbContexts[options.name];
            var forages = dbContext.forages;
            dbContext.db = db;
            for (var i = 0; i < forages.length; i++) {
                forages[i]._dbInfo.db = db;
            }
            return db;
        });

        if (!options.storeName) {
            promise = dbPromise.then(function (db) {
                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                }

                var dropDBPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.deleteDatabase(options.name);

                    req.onerror = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        reject(req.error);
                    };

                    req.onblocked = function () {
                        // Closing all open connections in onversionchange handler should prevent this situation, but if
                        // we do get here, it just means the request remains pending - eventually it will succeed or error
                        console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        resolve(db);
                    };
                });

                return dropDBPromise.then(function (db) {
                    dbContext.db = db;
                    for (var i = 0; i < forages.length; i++) {
                        var _forage = forages[i];
                        _advanceReadiness(_forage._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        } else {
            promise = dbPromise.then(function (db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                    return;
                }

                var newVersion = db.version + 1;

                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                    forage._dbInfo.version = newVersion;
                }

                var dropObjectPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.open(options.name, newVersion);

                    req.onerror = function (err) {
                        var db = req.result;
                        db.close();
                        reject(err);
                    };

                    req.onupgradeneeded = function () {
                        var db = req.result;
                        db.deleteObjectStore(options.storeName);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        db.close();
                        resolve(db);
                    };
                });

                return dropObjectPromise.then(function (db) {
                    dbContext.db = db;
                    for (var j = 0; j < forages.length; j++) {
                        var _forage2 = forages[j];
                        _forage2._dbInfo.db = db;
                        _advanceReadiness(_forage2._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        }
    }

    executeCallback(promise, callback);
    return promise;
}

var asyncStorage = {
    _driver: 'asyncStorage',
    _initStorage: _initStorage,
    _support: isIndexedDBValid(),
    iterate: iterate,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    length: length,
    key: key,
    keys: keys,
    dropInstance: dropInstance
};

function isWebSQLValid() {
    return typeof openDatabase === 'function';
}

// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
// it to Base64, so this is how we store it to prevent very strange errors with less
// verbose ways of binary <-> string data storage.
var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

var BLOB_TYPE_PREFIX = '~~local_forage_type~';
var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

var SERIALIZED_MARKER = '__lfsc__:';
var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

// OMG the serializations!
var TYPE_ARRAYBUFFER = 'arbf';
var TYPE_BLOB = 'blob';
var TYPE_INT8ARRAY = 'si08';
var TYPE_UINT8ARRAY = 'ui08';
var TYPE_UINT8CLAMPEDARRAY = 'uic8';
var TYPE_INT16ARRAY = 'si16';
var TYPE_INT32ARRAY = 'si32';
var TYPE_UINT16ARRAY = 'ur16';
var TYPE_UINT32ARRAY = 'ui32';
var TYPE_FLOAT32ARRAY = 'fl32';
var TYPE_FLOAT64ARRAY = 'fl64';
var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

var toString$1 = Object.prototype.toString;

function stringToBuffer(serializedString) {
    // Fill the string into a ArrayBuffer.
    var bufferLength = serializedString.length * 0.75;
    var len = serializedString.length;
    var i;
    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    if (serializedString[serializedString.length - 1] === '=') {
        bufferLength--;
        if (serializedString[serializedString.length - 2] === '=') {
            bufferLength--;
        }
    }

    var buffer = new ArrayBuffer(bufferLength);
    var bytes = new Uint8Array(buffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

        /*jslint bitwise: true */
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
}

// Converts a buffer to a string to store, serialized, in the backend
// storage library.
function bufferToString(buffer) {
    // base64-arraybuffer
    var bytes = new Uint8Array(buffer);
    var base64String = '';
    var i;

    for (i = 0; i < bytes.length; i += 3) {
        /*jslint bitwise: true */
        base64String += BASE_CHARS[bytes[i] >> 2];
        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64String += BASE_CHARS[bytes[i + 2] & 63];
    }

    if (bytes.length % 3 === 2) {
        base64String = base64String.substring(0, base64String.length - 1) + '=';
    } else if (bytes.length % 3 === 1) {
        base64String = base64String.substring(0, base64String.length - 2) + '==';
    }

    return base64String;
}

// Serialize a value, afterwards executing a callback (which usually
// instructs the `setItem()` callback/promise to be executed). This is how
// we store binary data with localStorage.
function serialize(value, callback) {
    var valueType = '';
    if (value) {
        valueType = toString$1.call(value);
    }

    // Cannot use `value instanceof ArrayBuffer` or such here, as these
    // checks fail when running the tests using casper.js...
    //
    // TODO: See why those tests fail and use a better solution.
    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
        // Convert binary arrays to a string and prefix the string with
        // a special marker.
        var buffer;
        var marker = SERIALIZED_MARKER;

        if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
        } else {
            buffer = value.buffer;

            if (valueType === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
            } else if (valueType === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
            } else if (valueType === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueType === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
            } else if (valueType === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
            } else if (valueType === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
            } else if (valueType === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
            } else if (valueType === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
            } else if (valueType === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
            } else {
                callback(new Error('Failed to get type for BinaryArray'));
            }
        }

        callback(marker + bufferToString(buffer));
    } else if (valueType === '[object Blob]') {
        // Conver the blob to a binaryArray and then to a string.
        var fileReader = new FileReader();

        fileReader.onload = function () {
            // Backwards-compatible prefix for the blob type.
            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
        };

        fileReader.readAsArrayBuffer(value);
    } else {
        try {
            callback(JSON.stringify(value));
        } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);

            callback(null, e);
        }
    }
}

// Deserialize data we've inserted into a value column/field. We place
// special markers into our strings to mark them as encoded; this isn't
// as nice as a meta field, but it's the only sane thing we can do whilst
// keeping localStorage support intact.
//
// Oftentimes this will just deserialize JSON content, but if we have a
// special marker (SERIALIZED_MARKER, defined above), we will extract
// some kind of arraybuffer/binary data/typed array out of the string.
function deserialize(value) {
    // If we haven't marked this string as being specially serialized (i.e.
    // something other than serialized JSON), we can just return it and be
    // done with it.
    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
        return JSON.parse(value);
    }

    // The following code deals with deserializing some kind of Blob or
    // TypedArray. First we separate out the type of data we're dealing
    // with from the data itself.
    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

    var blobType;
    // Backwards-compatible blob type serialization strategy.
    // DBs created with older versions of localForage will simply not have the blob type.
    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
        blobType = matcher[1];
        serializedString = serializedString.substring(matcher[0].length);
    }
    var buffer = stringToBuffer(serializedString);

    // Return the right type based on the code/type set during
    // serialization.
    switch (type) {
        case TYPE_ARRAYBUFFER:
            return buffer;
        case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
        case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
        case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
        case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
        case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
        case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
        case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
        case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
        case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
        case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
        default:
            throw new Error('Unkown type: ' + type);
    }
}

var localforageSerializer = {
    serialize: serialize,
    deserialize: deserialize,
    stringToBuffer: stringToBuffer,
    bufferToString: bufferToString
};

/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

function createDbTable(t, dbInfo, callback, errorCallback) {
    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
}

// Open the WebSQL database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
        }
    }

    var dbInfoPromise = new Promise$1(function (resolve, reject) {
        // Open the database; the openDatabase API will automatically
        // create it for us if it doesn't exist.
        try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
        } catch (e) {
            return reject(e);
        }

        // Create our key/value table if it doesn't exist.
        dbInfo.db.transaction(function (t) {
            createDbTable(t, dbInfo, function () {
                self._dbInfo = dbInfo;
                resolve();
            }, function (t, error) {
                reject(error);
            });
        }, reject);
    });

    dbInfo.serializer = localforageSerializer;
    return dbInfoPromise;
}

function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
    t.executeSql(sqlStatement, args, callback, function (t, error) {
        if (error.code === error.SYNTAX_ERR) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
                if (!results.rows.length) {
                    // if the table is missing (was deleted)
                    // re-create it table and retry
                    createDbTable(t, dbInfo, function () {
                        t.executeSql(sqlStatement, args, callback, errorCallback);
                    }, errorCallback);
                } else {
                    errorCallback(t, error);
                }
            }, errorCallback);
        } else {
            errorCallback(t, error);
        }
    }, errorCallback);
}

function getItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;

                    // Check to see if this is serialized content we need to
                    // unpack.
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }

                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function iterate$1(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;

            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                    var rows = results.rows;
                    var length = rows.length;

                    for (var i = 0; i < length; i++) {
                        var item = rows.item(i);
                        var result = item.value;

                        // Check to see if this is serialized content
                        // we need to unpack.
                        if (result) {
                            result = dbInfo.serializer.deserialize(result);
                        }

                        result = iterator(result, item.key, i + 1);

                        // void(0) prevents problems with redefinition
                        // of `undefined`.
                        if (result !== void 0) {
                            resolve(result);
                            return;
                        }
                    }

                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function _setItem(key, value, callback, retriesLeft) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            // The localStorage API doesn't return undefined values in an
            // "expected" way, so undefined is always cast to null in all
            // drivers. See: https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
                value = null;
            }

            // Save the original value to pass to the callback.
            var originalValue = value;

            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    dbInfo.db.transaction(function (t) {
                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
                            resolve(originalValue);
                        }, function (t, error) {
                            reject(error);
                        });
                    }, function (sqlError) {
                        // The transaction failed; check
                        // to see if it's a quota error.
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                            // We reject the callback outright for now, but
                            // it's worth trying to re-run the transaction.
                            // Even if the user accepts the prompt to use
                            // more storage on Safari, this error will
                            // be called.
                            //
                            // Try to re-run the transaction.
                            if (retriesLeft > 0) {
                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
                                return;
                            }
                            reject(sqlError);
                        }
                    });
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function setItem$1(key, value, callback) {
    return _setItem.apply(this, [key, value, callback, 1]);
}

function removeItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Deletes every item in the table.
// TODO: Find out if this resets the AUTO_INCREMENT number.
function clear$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Does a simple `COUNT(key)` to get the number of items stored in
// localForage.
function length$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                    var result = results.rows.item(0).c;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Return the key located at key index X; essentially gets the key from a
// `WHERE id = ?`. This is the most efficient way I can think to implement
// this rarely-used (in my experience) part of the API, but it can seem
// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
// the ID of each key will change every time it's updated. Perhaps a stored
// procedure for the `setItem()` SQL would solve this problem?
// TODO: Don't change ID on `setItem()`.
function key$1(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                    var keys = [];

                    for (var i = 0; i < results.rows.length; i++) {
                        keys.push(results.rows.item(i).key);
                    }

                    resolve(keys);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// https://www.w3.org/TR/webdatabase/#databases
// > There is no way to enumerate or delete the databases available for an origin from this API.
function getAllStoreNames(db) {
    return new Promise$1(function (resolve, reject) {
        db.transaction(function (t) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
                var storeNames = [];

                for (var i = 0; i < results.rows.length; i++) {
                    storeNames.push(results.rows.item(i).name);
                }

                resolve({
                    db: db,
                    storeNames: storeNames
                });
            }, function (t, error) {
                reject(error);
            });
        }, function (sqlError) {
            reject(sqlError);
        });
    });
}

function dropInstance$1(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            var db;
            if (options.name === currentConfig.name) {
                // use the db reference of the current instance
                db = self._dbInfo.db;
            } else {
                db = openDatabase(options.name, '', '', 0);
            }

            if (!options.storeName) {
                // drop all database tables
                resolve(getAllStoreNames(db));
            } else {
                resolve({
                    db: db,
                    storeNames: [options.storeName]
                });
            }
        }).then(function (operationInfo) {
            return new Promise$1(function (resolve, reject) {
                operationInfo.db.transaction(function (t) {
                    function dropTable(storeName) {
                        return new Promise$1(function (resolve, reject) {
                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
                                resolve();
                            }, function (t, error) {
                                reject(error);
                            });
                        });
                    }

                    var operations = [];
                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                        operations.push(dropTable(operationInfo.storeNames[i]));
                    }

                    Promise$1.all(operations).then(function () {
                        resolve();
                    })["catch"](function (e) {
                        reject(e);
                    });
                }, function (sqlError) {
                    reject(sqlError);
                });
            });
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    _support: isWebSQLValid(),
    iterate: iterate$1,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem$1,
    clear: clear$1,
    length: length$1,
    key: key$1,
    keys: keys$1,
    dropInstance: dropInstance$1
};

function isLocalStorageValid() {
    try {
        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
        // in IE8 typeof localStorage.setItem === 'object'
        !!localStorage.setItem;
    } catch (e) {
        return false;
    }
}

function _getKeyPrefix(options, defaultConfig) {
    var keyPrefix = options.name + '/';

    if (options.storeName !== defaultConfig.storeName) {
        keyPrefix += options.storeName + '/';
    }
    return keyPrefix;
}

// Check if localStorage throws when saving an item
function checkIfLocalStorageThrows() {
    var localStorageTestKey = '_localforage_support_test';

    try {
        localStorage.setItem(localStorageTestKey, true);
        localStorage.removeItem(localStorageTestKey);

        return false;
    } catch (e) {
        return true;
    }
}

// Check if localStorage is usable and allows to save an item
// This method checks if localStorage is usable in Safari Private Browsing
// mode, or in any other case where the available quota for localStorage
// is 0 and there wasn't any saved items yet.
function _isLocalStorageUsable() {
    return !checkIfLocalStorageThrows() || localStorage.length > 0;
}

// Config the localStorage backend, using options set in the config.
function _initStorage$2(options) {
    var self = this;
    var dbInfo = {};
    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

    if (!_isLocalStorageUsable()) {
        return Promise$1.reject();
    }

    self._dbInfo = dbInfo;
    dbInfo.serializer = localforageSerializer;

    return Promise$1.resolve();
}

// Remove all keys from the datastore, effectively destroying all data in
// the app's key/value store!
function clear$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var keyPrefix = self._dbInfo.keyPrefix;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Retrieve an item from the store. Unlike the original async_storage
// library in Gaia, we don't modify return values at all. If a key's value
// is `undefined`, we pass that value to the callback function.
function getItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result = localStorage.getItem(dbInfo.keyPrefix + key);

        // If a result was found, parse it from the serialized
        // string into a JS object. If result isn't truthy, the key
        // is likely undefined and we'll pass it straight to the
        // callback.
        if (result) {
            result = dbInfo.serializer.deserialize(result);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items in the store.
function iterate$2(iterator, callback) {
    var self = this;

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var keyPrefix = dbInfo.keyPrefix;
        var keyPrefixLength = keyPrefix.length;
        var length = localStorage.length;

        // We use a dedicated iterator instead of the `i` variable below
        // so other keys we fetch in localStorage aren't counted in
        // the `iterationNumber` argument passed to the `iterate()`
        // callback.
        //
        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
        var iterationNumber = 1;

        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            var value = localStorage.getItem(key);

            // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the
            // key is likely undefined and we'll pass it straight
            // to the iterator.
            if (value) {
                value = dbInfo.serializer.deserialize(value);
            }

            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

            if (value !== void 0) {
                return value;
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Same as localStorage's key() method, except takes a callback.
function key$2(n, callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result;
        try {
            result = localStorage.key(n);
        } catch (error) {
            result = null;
        }

        // Remove the prefix from the key, if a key is found.
        if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var length = localStorage.length;
        var keys = [];

        for (var i = 0; i < length; i++) {
            var itemKey = localStorage.key(i);
            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
            }
        }

        return keys;
    });

    executeCallback(promise, callback);
    return promise;
}

// Supply the number of keys in the datastore to the callback function.
function length$2(callback) {
    var self = this;
    var promise = self.keys().then(function (keys) {
        return keys.length;
    });

    executeCallback(promise, callback);
    return promise;
}

// Remove an item from the store, nice and simple.
function removeItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        localStorage.removeItem(dbInfo.keyPrefix + key);
    });

    executeCallback(promise, callback);
    return promise;
}

// Set a key's value and run an optional callback once the value is set.
// Unlike Gaia's implementation, the callback function is passed the value,
// in case you want to operate on that value only after you're sure it
// saved, or something like that.
function setItem$2(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        // Convert undefined values to null.
        // https://github.com/mozilla/localForage/pull/42
        if (value === undefined) {
            value = null;
        }

        // Save the original value to pass to the callback.
        var originalValue = value;

        return new Promise$1(function (resolve, reject) {
            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        localStorage.setItem(dbInfo.keyPrefix + key, value);
                        resolve(originalValue);
                    } catch (e) {
                        // localStorage capacity exceeded.
                        // TODO: Make this a specific error/event.
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            reject(e);
                        }
                        reject(e);
                    }
                }
            });
        });
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance$2(options, callback) {
    callback = getCallback.apply(this, arguments);

    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        var currentConfig = this.config();
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            if (!options.storeName) {
                resolve(options.name + '/');
            } else {
                resolve(_getKeyPrefix(options, self._defaultConfig));
            }
        }).then(function (keyPrefix) {
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);

                if (key.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var localStorageWrapper = {
    _driver: 'localStorageWrapper',
    _initStorage: _initStorage$2,
    _support: isLocalStorageValid(),
    iterate: iterate$2,
    getItem: getItem$2,
    setItem: setItem$2,
    removeItem: removeItem$2,
    clear: clear$2,
    length: length$2,
    key: key$2,
    keys: keys$2,
    dropInstance: dropInstance$2
};

var sameValue = function sameValue(x, y) {
    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
};

var includes = function includes(array, searchElement) {
    var len = array.length;
    var i = 0;
    while (i < len) {
        if (sameValue(array[i], searchElement)) {
            return true;
        }
        i++;
    }

    return false;
};

var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

// Drivers are stored here when `defineDriver()` is called.
// They are shared across all instances of localForage.
var DefinedDrivers = {};

var DriverSupport = {};

var DefaultDrivers = {
    INDEXEDDB: asyncStorage,
    WEBSQL: webSQLStorage,
    LOCALSTORAGE: localStorageWrapper
};

var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

var OptionalDriverMethods = ['dropInstance'];

var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

var DefaultConfig = {
    description: '',
    driver: DefaultDriverOrder.slice(),
    name: 'localforage',
    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
    // we can use without a prompt.
    size: 4980736,
    storeName: 'keyvaluepairs',
    version: 1.0
};

function callWhenReady(localForageInstance, libraryMethod) {
    localForageInstance[libraryMethod] = function () {
        var _args = arguments;
        return localForageInstance.ready().then(function () {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
        });
    };
}

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];

        if (arg) {
            for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                    if (isArray(arg[_key])) {
                        arguments[0][_key] = arg[_key].slice();
                    } else {
                        arguments[0][_key] = arg[_key];
                    }
                }
            }
        }
    }

    return arguments[0];
}

var LocalForage = function () {
    function LocalForage(options) {
        _classCallCheck(this, LocalForage);

        for (var driverTypeKey in DefaultDrivers) {
            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;

                if (!DefinedDrivers[driverName]) {
                    // we don't need to wait for the promise,
                    // since the default drivers can be defined
                    // in a blocking manner
                    this.defineDriver(driver);
                }
            }
        }

        this._defaultConfig = extend({}, DefaultConfig);
        this._config = extend({}, this._defaultConfig, options);
        this._driverSet = null;
        this._initDriver = null;
        this._ready = false;
        this._dbInfo = null;

        this._wrapLibraryMethodsWithReady();
        this.setDriver(this._config.driver)["catch"](function () {});
    }

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.


    LocalForage.prototype.config = function config(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                if (i === 'version' && typeof options[i] !== 'number') {
                    return new Error('Database version must be a number.');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                return this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof options === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.


    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
        var promise = new Promise$1(function (resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }

                var driverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0, len = driverMethods.length; i < len; i++) {
                    var driverMethodName = driverMethods[i];

                    // when the property is there,
                    // it should be a method even when optional
                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var configureMissingMethods = function configureMissingMethods() {
                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                        return function () {
                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
                            var promise = Promise$1.reject(error);
                            executeCallback(promise, arguments[arguments.length - 1]);
                            return promise;
                        };
                    };

                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                        var optionalDriverMethod = OptionalDriverMethods[_i];
                        if (!driverObject[optionalDriverMethod]) {
                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                        }
                    }
                };

                configureMissingMethods();

                var setDriverSupport = function setDriverSupport(support) {
                    if (DefinedDrivers[driverName]) {
                        console.info('Redefining LocalForage driver: ' + driverName);
                    }
                    DefinedDrivers[driverName] = driverObject;
                    DriverSupport[driverName] = support;
                    // don't use a then, so that we can define
                    // drivers that have simple _support methods
                    // in a blocking manner
                    resolve();
                };

                if ('_support' in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        driverObject._support().then(setDriverSupport, reject);
                    } else {
                        setDriverSupport(!!driverObject._support);
                    }
                } else {
                    setDriverSupport(true);
                }
            } catch (e) {
                reject(e);
            }
        });

        executeTwoCallbacks(promise, callback, errorCallback);
        return promise;
    };

    LocalForage.prototype.driver = function driver() {
        return this._driver || null;
    };

    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
        return getDriverPromise;
    };

    LocalForage.prototype.getSerializer = function getSerializer(callback) {
        var serializerPromise = Promise$1.resolve(localforageSerializer);
        executeTwoCallbacks(serializerPromise, callback);
        return serializerPromise;
    };

    LocalForage.prototype.ready = function ready(callback) {
        var self = this;

        var promise = self._driverSet.then(function () {
            if (self._ready === null) {
                self._ready = self._initDriver();
            }

            return self._ready;
        });

        executeTwoCallbacks(promise, callback, callback);
        return promise;
    };

    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
            drivers = [drivers];
        }

        var supportedDrivers = this._getSupportedDrivers(drivers);

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }

        function extendSelfWithDriver(driver) {
            self._extend(driver);
            setDriverToConfig();

            self._ready = self._initStorage(self._config);
            return self._ready;
        }

        function initDriver(supportedDrivers) {
            return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers.length) {
                        var driverName = supportedDrivers[currentDriverIndex];
                        currentDriverIndex++;

                        self._dbInfo = null;
                        self._ready = null;

                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                    }

                    setDriverToConfig();
                    var error = new Error('No available storage method found.');
                    self._driverSet = Promise$1.reject(error);
                    return self._driverSet;
                }

                return driverPromiseLoop();
            };
        }

        // There might be a driver initialization in progress
        // so wait for it to finish in order to avoid a possible
        // race condition to set _dbInfo
        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
            return Promise$1.resolve();
        }) : Promise$1.resolve();

        this._driverSet = oldDriverSetDone.then(function () {
            var driverName = supportedDrivers[0];
            self._dbInfo = null;
            self._ready = null;

            return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();
                self._wrapLibraryMethodsWithReady();
                self._initDriver = initDriver(supportedDrivers);
            });
        })["catch"](function () {
            setDriverToConfig();
            var error = new Error('No available storage method found.');
            self._driverSet = Promise$1.reject(error);
            return self._driverSet;
        });

        executeTwoCallbacks(this._driverSet, callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function supports(driverName) {
        return !!DriverSupport[driverName];
    };

    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];
        for (var i = 0, len = drivers.length; i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
            }
        }
        return supportedDrivers;
    };

    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }
    };

    LocalForage.prototype.createInstance = function createInstance(options) {
        return new LocalForage(options);
    };

    return LocalForage;
}();

// The actual localForage object that we expose as a module or via a
// global. It's extended by pulling in one of our other libraries.


var localforage_js = new LocalForage();

module.exports = localforage_js;

},{"3":3}]},{},[4])(4)
});
}(localforage$1));

var localforage = localforage$1.exports;

function _createSuper$k(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$k(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$k() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function uuid(a) {
  return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}
/**
 * regex used to validate AppObject external ids
 * (UUID form is 8 digits followed by three groups of 4 digits followed by a group of 12)
 */

var UUID_REGEX = /^[a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$/;
var SAVE_STATE_LOCAL = 'SAVED_LOCALLY';
var SAVE_STATE_SERVER = 'SAVED_TO_SERVER';
var Model = /*#__PURE__*/function (_EventHarness) {
  _inherits(Model, _EventHarness);

  var _super = _createSuper$k(Model);

  function Model() {
    var _this;

    _classCallCheck(this, Model);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "_id", void 0);

    _defineProperty(_assertThisInitialized(_this), "_savedRemotely", false);

    _defineProperty(_assertThisInitialized(_this), "_savedLocally", false);

    _defineProperty(_assertThisInitialized(_this), "deleted", false);

    _defineProperty(_assertThisInitialized(_this), "createdStamp", void 0);

    _defineProperty(_assertThisInitialized(_this), "modifiedStamp", void 0);

    _defineProperty(_assertThisInitialized(_this), "projectId", void 0);

    _defineProperty(_assertThisInitialized(_this), "isPristine", false);

    _this.createdStamp = Math.floor(Date.now() / 1000);
    return _this;
  }
  /**
   * returns true if either remote or local copy is missing
   *
   * @returns {boolean}
   */


  _createClass(Model, [{
    key: "savedRemotely",
    set:
    /**
     * @type {string}
     */

    /**
     * set if the object has been posted to the server
     *
     * @type {boolean}
     */

    /**
     *
     * @param {Boolean} savedFlag
     */
    function set(savedFlag) {
      if (this._savedRemotely !== savedFlag) {
        this._savedRemotely = !!savedFlag;

        if (this._savedRemotely) {
          this.fireEvent(Model.EVENT_SAVED_REMOTELY, {
            id: this.id
          });
        }
      }
    }
    /**
     * set if the object has been added to a temporary store (e.g. indexedDb)
     *
     * @type {boolean}
     */

  }, {
    key: "unsaved",
    value: function unsaved() {
      return !(this._savedLocally && this._savedRemotely);
    }
    /**
     * string
     */

  }, {
    key: "id",
    get: function get() {
      if (!this._id) {
        this._id = uuid();
      } else if (this._id === 'undefined') {
        console.error("id is literal 'undefined', am forcing new id");
        this._id = uuid();
      }

      return this._id;
    }
    /**
     *
     * @param {string} newId
     */
    ,
    set: function set(newId) {
      // only allow an id to be set if not present already
      if (this._id && newId !== this._id) {
        throw new Error("Occurrence id has already been set, when trying to set new id '".concat(newId, "'."));
      }

      this._id = newId;
    }
    /**
     *
     * @type {Array.<function>}
     * @private
     */

  }, {
    key: "queuePost",
    value:
    /**
     * Add a post request to the queue
     * Requests run in sequence.
     * Returns a promise that resolves once the queued request completes
     *
     * The queue reduces the chance of requests being sent to the server out-of-order (which can lead to race conditions)
     *
     * @param formData
     * @returns {Promise}
     */
    function queuePost(formData) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        /**
         * @returns {Promise}
         */
        var task = function task() {
          console.log({
            'posting form data': formData
          });
          return _this2.post(formData).then(resolve, reject);
        };

        Model._tasks.push(task);

        if (Model._tasks.length > 1) {
          console.log("Added post request to the queue.");
        } else {
          console.log("No pending tasks, starting post request immediately.");
          task().finally(Model._next);
        }
      });
    }
    /**
     *
     * @returns {Promise}
     * @private
     */

  }, {
    key: "post",
    value:
    /**
     * if not securely saved then makes a post to /save<object>
     *
     * this may be intercepted by a service worker, which could write the image to indexdb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexdb
     *
     * must test indexdb for this eventuality after the save has returned
     *
     * @param {FormData} formData
     * @returns {Promise}
     */
    function post(formData) {
      var _this3 = this;

      return fetch(this.SAVE_ENDPOINT, {
        method: 'POST',
        body: formData
      }).then(function (response) {
        if (response.ok) {
          // need to find out whether this was a local store in indexedDb by the service worker
          // or a server-side save
          // to do that need to decode the json response
          // which can only be done once, so need to clone first
          var clonedResponse = response.clone();
          return clonedResponse.json().then(function (responseData) {
            /** @param {{saveState : string, created : number, modified : number}} responseData */
            console.log({
              'returned to client after save': responseData
            });

            switch (responseData.saveState) {
              case SAVE_STATE_SERVER:
                _this3._savedLocally = true; //this._savedRemotely = true;

                _this3.savedRemotely = true;
                break;

              case SAVE_STATE_LOCAL:
                _this3._savedLocally = true; //this._savedRemotely = false;

                _this3.savedRemotely = false;
                break;

              default:
                console.log("Unrecognised save state '".concat(responseData.saveState, "'"));
            }

            _this3.createdStamp = parseInt(responseData.created, 10);
            _this3.modifiedStamp = parseInt(responseData.modified, 10); // return the json version of the original response as a promise

            return response.json(); // assign appropriate JSON type to the response
          });
        } else {
          // try instead to write the data to local storage
          console.log('Save failed, presumably service worker is missing and there is no network connection. Should write to IndexedDb here.');
          return Promise.reject('IndexedDb storage not yet implemented');
        }
      });
    }
    /**
     *
     * @param {string} id
     * @param {(Survey|Occurrence|OccurrenceImage)} modelObject
     * @returns {Promise}
     */

  }, {
    key: "_parseDescriptor",
    value:
    /**
     *
     * @param {{id : string, saveState: string, attributes: Object.<string, *>, deleted: boolean|string, created: (number|string), modified: (number|string), projectId: (number|string)}} descriptor
     */
    function _parseDescriptor(descriptor) {
      this._parseAttributes(descriptor.attributes);

      this._parseSavedState(descriptor.saveState);

      this.deleted = descriptor.deleted === true || descriptor.deleted === 'true'; // cast stringified boolean to true boolean

      this.createdStamp = parseInt(descriptor.created, 10); //this.modifiedStamp = descriptor.modified ? parseInt(descriptor.modified, 10) : this.createdStamp; // avoids NaN

      this.modifiedStamp = descriptor.modified ? parseInt(descriptor.modified, 10) : 0; // avoids NaN

      this.projectId = parseInt(descriptor.projectId, 10);
    }
    /**
     *
     * @param {Object.<string, {}>|string|Array} attributes
     */

  }, {
    key: "_parseAttributes",
    value: function _parseAttributes(attributes) {
      if (typeof attributes === 'string') {
        attributes = JSON.parse(attributes);
      }

      if (Array.isArray(attributes)) {
        // problematic bug, where empty attributes come back as an array rather than as an object
        console.log('Attributes were spuriously represented as an array rather than as an empty object');
        this.attributes = {};
      } else {
        this.attributes = attributes;
      }
    }
    /**
     *
     * @param {string} saveState
     */

  }, {
    key: "_parseSavedState",
    value: function _parseSavedState(saveState) {
      switch (saveState) {
        case SAVE_STATE_LOCAL:
          //this._savedRemotely = false;
          this.savedRemotely = false;
          this._savedLocally = true;
          break;

        case SAVE_STATE_SERVER:
          //this._savedRemotely = true;
          this.savedRemotely = true;
          this._savedLocally = true;
          break;

        default:
          throw new Error("Unrecognised saved state '".concat(saveState));
      }
    }
    /**
     * update modified stamp to current time
     */

  }, {
    key: "touch",
    value: function touch() {
      this.modifiedStamp = Math.floor(Date.now() / 1000);

      if (this.isPristine) {
        this.isPristine = false;
        this.createdStamp = this.modifiedStamp;
      }

      this._savedLocally = false; //this._savedRemotely = false;

      this.savedRemotely = false;
    }
    /**
     *
     * @param {{}} formSectionProperties
     * @return {{requiredFieldsPresent: boolean, validity: Object.<string, boolean>}}
     */

  }, {
    key: "evaluateCompletionStatus",
    value: function evaluateCompletionStatus(formSectionProperties) {
      var validity = {};
      var requiredFieldsPresent = true;

      for (var key in formSectionProperties) {
        if (formSectionProperties.hasOwnProperty(key)) {
          var property = formSectionProperties[key];
          validity[key] = property.validator ? property.validator(key, property, this.attributes) : property.field.isValid(key, property, this.attributes);

          if (null !== validity[key]) {
            // validity can be 'null' in which case field was optional and not assessed
            requiredFieldsPresent = requiredFieldsPresent && validity[key];
          }
        }
      }

      return {
        requiredFieldsPresent: requiredFieldsPresent,
        validity: validity
      };
    }
  }], [{
    key: "_next",
    value: function _next() {
      Model._tasks.shift(); // save is done


      if (Model._tasks.length) {
        // run the next task
        console.log('Running the next task.');
        return Model._tasks[0]().finally(Model._next);
      }
    }
  }, {
    key: "retrieveFromLocal",
    value: function retrieveFromLocal(id, modelObject) {
      return localforage.getItem("".concat(modelObject.TYPE, ".").concat(id)).then(function (descriptor) {
        if (descriptor) {
          modelObject.id = id;

          modelObject._parseDescriptor(descriptor);

          return modelObject;
        } else {
          return Promise.reject("Failed to retrieve ".concat(modelObject.TYPE, ".").concat(id, " locally"));
        }
      });
    }
  }]);

  return Model;
}(EventHarness);

_defineProperty(Model, "EVENT_SAVED_REMOTELY", 'savedremotely');

_defineProperty(Model, "_tasks", []);

function _createSuper$j(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$j(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$j() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var TaxonError = /*#__PURE__*/function (_Error) {
  _inherits(TaxonError, _Error);

  var _super = _createSuper$j(TaxonError);

  function TaxonError() {
    _classCallCheck(this, TaxonError);

    return _super.apply(this, arguments);
  }

  return _createClass(TaxonError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

/**
 *
 * @param text
 * @returns {string}
 */
function escapeHTML(text) {
  try {
    // IE (even v 11) sometimes fails here with 'Unknown runtime error', see http://blog.rakeshpai.me/2007/02/ies-unknown-runtime-error-when-using.html
    var textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.innerHTML.replace(/"/g, '&quot;');
  } catch (e) {
    var pre = document.createElement('pre');
    pre.appendChild(document.createTextNode(text));
    return pre.innerHTML.replace(/"/g, '&quot;');
  }
}

/**
 * @external BsbiDb
 */

var Taxon = /*#__PURE__*/function () {
  function Taxon() {
    _classCallCheck(this, Taxon);

    _defineProperty(this, "id", void 0);

    _defineProperty(this, "nameString", '');

    _defineProperty(this, "canonical", '');

    _defineProperty(this, "hybridCanonical", '');

    _defineProperty(this, "acceptedEntityId", '');

    _defineProperty(this, "qualifier", '');

    _defineProperty(this, "authority", '');

    _defineProperty(this, "vernacular", '');

    _defineProperty(this, "vernacularRoot", '');

    _defineProperty(this, "used", void 0);

    _defineProperty(this, "sortOrder", void 0);

    _defineProperty(this, "parentIds", []);
  }

  _createClass(Taxon, [{
    key: "formattedHTML",
    value:
    /**
     *
     * @param {boolean} vernacularMatched
     * @returns {string}
     */
    function formattedHTML(vernacularMatched) {
      var acceptedTaxon;

      if (this.id !== this.acceptedEntityId) {
        acceptedTaxon = Taxon.fromId(this.acceptedEntityId);
      }

      if (Taxon.showVernacular) {
        if (vernacularMatched) {
          return acceptedTaxon ? "<q class=\"taxon-vernacular\">".concat(escapeHTML(this.vernacular), "</q><wbr> <span class=\"italictaxon\">").concat(this.nameString).concat(this.qualifier ? " <span class=\"taxon-qualifier\">".concat(this.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(this.authority), "</span>") + " = <span class=\"italictaxon\">".concat(acceptedTaxon.nameString).concat(acceptedTaxon.qualifier ? " <span class=\"taxon-qualifier\">".concat(acceptedTaxon.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(acceptedTaxon.authority), "</span>") : "<q class=\"taxon-vernacular\">".concat(escapeHTML(this.vernacular), "</q><wbr> <span class=\"italictaxon\">").concat(this.nameString).concat(this.qualifier ? " <span class=\"taxon-qualifier\">".concat(this.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(this.authority), "</span>");
        } else {
          return acceptedTaxon ? "<span class=\"italictaxon\">".concat(this.nameString).concat(this.qualifier ? " <span class=\"taxon-qualifier\">".concat(this.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(this.authority, "</span>").concat(this.vernacular ? " <wbr><q class=\"taxon-vernacular\">".concat(escapeHTML(this.vernacular), "</q>") : '', " = <span class=\"italictaxon\">").concat(acceptedTaxon.nameString).concat(acceptedTaxon.qualifier ? " <span class=\"taxon-qualifier\">".concat(acceptedTaxon.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(acceptedTaxon.authority), "</span>") : "<span class=\"italictaxon\">".concat(this.nameString).concat(this.qualifier ? " <span class=\"taxon-qualifier\">".concat(this.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(this.authority), "</span>").concat(this.vernacular ? " <wbr><q class=\"taxon-vernacular\">".concat(escapeHTML(this.vernacular), "</q>") : '');
        }
      } else {
        return acceptedTaxon ? "<span class=\"italictaxon\">".concat(this.nameString).concat(this.qualifier ? " <span class=\"taxon-qualifier\">".concat(this.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(this.authority, "</span>") + " = <span class=\"italictaxon\">".concat(acceptedTaxon.nameString).concat(acceptedTaxon.qualifier ? " <span class=\"taxon-qualifier\">".concat(acceptedTaxon.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(acceptedTaxon.authority), "</span>") : "<span class=\"italictaxon\">".concat(this.nameString).concat(this.qualifier ? " <span class=\"taxon-qualifier\">".concat(this.qualifier, "</span>") : '', "</span> <span class=\"taxauthority\">").concat(escapeHTML(this.authority), "</span>");
      }
    }
  }], [{
    key: "fromId",
    value:
    /**
     *
     * @param {string} id
     * @returns {Taxon}
     * @throws {TaxonError}
     */
    function fromId(id) {
      if (!Taxon.rawTaxa) {
        // may not yet have been initialised due to deferred loading
        if (BsbiDb.TaxonNames) {
          Taxon.rawTaxa = BsbiDb.TaxonNames;
        } else {
          throw new TaxonError("Taxon.fromId() called before taxon list has loaded.");
        }
      }

      if (!Taxon.rawTaxa.hasOwnProperty(id)) {
        throw new TaxonError("Taxon id '".concat(id, "' not found."));
      }

      var raw = Taxon.rawTaxa[id];
      var taxon = new Taxon();
      taxon.id = id;
      taxon.nameString = raw[0];
      taxon.canonical = raw[1] || raw[0]; // raw entry is blank if namesString == canonical

      taxon.hybridCanonical = raw[2] || taxon.canonical; // raw entry is blank if canonical == hybridCanonical

      taxon.acceptedEntityId = raw[3] || id;
      taxon.qualifier = raw[4];
      taxon.authority = raw[5];
      taxon.vernacular = raw[6];
      taxon.vernacularRoot = raw[7];
      taxon.used = raw[8];
      taxon.sortOrder = raw[9];
      taxon.parentIds = raw[10];
      return taxon;
    }
  }]);

  return Taxon;
}();

_defineProperty(Taxon, "rawTaxa", void 0);

_defineProperty(Taxon, "showVernacular", true);

var PROPER_FUNCTION_NAME = functionName.PROPER;
var fails$4 = fails$B;
var whitespaces = whitespaces$3;

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails$4(function () {
    return !!whitespaces[METHOD_NAME]()
      || non[METHOD_NAME]() !== non
      || (PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME);
  });
};

var $$d = _export;
var $trim = stringTrim.trim;
var forcedStringTrimMethod = stringTrimForced;

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$$d({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

function _createSuper$i(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$i(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$i() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _classStaticPrivateFieldSpecSet$1(receiver, classConstructor, descriptor, value) { _classCheckPrivateStaticAccess$1(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor$1(descriptor, "set"); _classApplyDescriptorSet$1(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet$1(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classStaticPrivateFieldSpecGet$1(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess$1(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor$1(descriptor, "get"); return _classApplyDescriptorGet$1(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor$1(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess$1(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet$1(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
var FormField = /*#__PURE__*/function (_EventHarness) {
  _inherits(FormField, _EventHarness);

  var _super = _createSuper$i(FormField);

  /**
   * overall wrapped field element (not necessarily the form element itself)
   *
   * @type {HTMLElement}
   */

  /**
   *
   * @type {string}
   */

  /**
   *
   * @type {string}
   */

  /**
   * validation message - displayed if field is not valid
   * HTML string
   *
   * @type {string}
   */

  /**
   *
   * @type {string}
   */

  /**
   *
   * @type {string}
   */

  /**
   *
   * @param {{[label] : string, [helpText]: string, [validationMessage]: string, [completion]: string}} [params]
   */
  function FormField(params) {
    var _this;

    _classCallCheck(this, FormField);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "_value", null);

    _defineProperty(_assertThisInitialized(_this), "_fieldEl", void 0);

    _defineProperty(_assertThisInitialized(_this), "label", 'field label');

    _defineProperty(_assertThisInitialized(_this), "helpText", '');

    _defineProperty(_assertThisInitialized(_this), "validationMessage", '');

    _defineProperty(_assertThisInitialized(_this), "completion", FormField.COMPLETION_OPTIONAL);

    _defineProperty(_assertThisInitialized(_this), "parentForm", void 0);

    _defineProperty(_assertThisInitialized(_this), "attributeName", void 0);

    if (params) {
      if (params.label) {
        _this.label = params.label;
      }

      if (params.helpText) {
        _this.helpText = params.helpText;
      }

      if (params.validationMessage) {
        _this.validationMessage = params.validationMessage;
      }

      if (params.completion) {
        // @see COMPLETION_COMPULSORY, COMPLETION_DESIRED, COMPLETION_OPTIONAL
        _this.completion = params.completion;
      }
    }

    return _this;
  }

  _createClass(FormField, [{
    key: "value",
    get: function get() {
      return this._value;
    }
    /**
     * @abstract
     * @param value
     */
    ,
    set: function set(value) {}
  }, {
    key: "fieldElement",
    get: function get() {
      if (!this._fieldEl) {
        this.buildField();
      }

      return this._fieldEl;
    }
    /**
     * @type {Form}
     */

  }, {
    key: "addField",
    value:
    /**
     *
     * @param {HTMLElement} contentContainer
     */
    function addField(contentContainer) {
      // const formEl = this.parentForm.formElement;
      //
      // formEl.appendChild(this.fieldElement);
      contentContainer.appendChild(this.fieldElement);
    }
    /**
     *
     * @param {boolean} isValid
     */

  }, {
    key: "markValidity",
    value: function markValidity(isValid) {}
    /**
     *
     * @param {HTMLInputElement} inputElement
     * @returns {string}
     */

  }], [{
    key: "nextId",
    get: function get() {
      var _FormField$fieldIdInd;

      return "field".concat((_classStaticPrivateFieldSpecSet$1(FormField, FormField, _fieldIdIndex, (_FormField$fieldIdInd = +_classStaticPrivateFieldSpecGet$1(FormField, FormField, _fieldIdIndex)) + 1), _FormField$fieldIdInd));
    }
  }, {
    key: "cleanRawInput",
    value: function cleanRawInput(inputElement) {
      return inputElement.value.trim().replace(/\s\s+/g, ' ');
    }
    /**
     *
     * @param {string} text
     * @returns {string}
     */

  }, {
    key: "cleanRawString",
    value: function cleanRawString(text) {
      return text.trim().replace(/\s\s+/g, ' ');
    }
    /**
     *
     * @param value
     * @returns {boolean}
     */

  }, {
    key: "isEmpty",
    value: function isEmpty(value) {
      return value === '' || value === undefined || value === null;
    }
    /**
     *
     * @param {string} key
     * @param property properties of the form descriptor
     * @param attributes attributes of the model object
     * @return {(boolean|null)} returns null if validity was not assessed
     */

  }, {
    key: "isValid",
    value: function isValid(key, property, attributes) {
      //console.log(`FormField isValid for '${key}'`);
      if (property.attributes.completion && (property.attributes.completion === FormField.COMPLETION_COMPULSORY || property.attributes.completion === FormField.COMPLETION_DESIRED)) {
        // test whether required field is missing
        return !(!attributes.hasOwnProperty(key) || property.field.isEmpty(attributes[key]));
      } // field is present or optional
      // report as valid unless content is corrupt


      return null; // field not assessed
    }
    /**
     *
     * @param {string} key
     * @param {{field : typeof FormField, [summary] : {}}} property properties of the form descriptor
     * @param attributes attributes of the model object
     * @return {string}
     */

  }, {
    key: "summarise",
    value: function summarise(key, property, attributes) {
      if (property.summary && (!property.summary.hasOwnProperty('summarise') || true === property.summary.summarise)) {
        // test is that summary spec object exists and doesn't have the summarise flag set to false
        // return property.field.summariseImpl(key, property, attributes);
        if (property.summarise) {
          return property.summarise(key, property, attributes);
        } else {
          return property.field.summariseImpl(key, property, attributes);
        }
      } else {
        return '';
      }
    }
    /**
     * by the time summariseImpl has been called have already checked that summary is wanted
     *
     * @param {string} key
     * @param {{field : FormField, [attributes]: {}, summary : {}}} property properties of the form descriptor
     * @param {{}} attributes attributes of the model object
     * @returns {string}
     */

  }, {
    key: "summariseImpl",
    value: function summariseImpl(key, property, attributes) {
      return '';
    }
  }]);

  return FormField;
}(EventHarness);

_defineProperty(FormField, "COMPLETION_COMPULSORY", 'compulsory');

_defineProperty(FormField, "COMPLETION_DESIRED", 'desired');

_defineProperty(FormField, "COMPLETION_OPTIONAL", 'optional');

var _fieldIdIndex = {
  writable: true,
  value: 1
};

_defineProperty(FormField, "EVENT_CHANGE", 'fieldChange');

function _createSuper$h(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$h(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$h() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _classPrivateFieldInitSpec$2(obj, privateMap, value) { _checkPrivateRedeclaration$2(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration$2(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

var _formEl = /*#__PURE__*/new WeakMap();

var Form = /*#__PURE__*/function (_EventHarness) {
  _inherits(Form, _EventHarness);

  var _super = _createSuper$h(Form);

  function Form() {
    var _this;

    _classCallCheck(this, Form);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _classPrivateFieldInitSpec$2(_assertThisInitialized(_this), _formEl, {
      writable: true,
      value: void 0
    });

    _defineProperty(_assertThisInitialized(_this), "_formId", void 0);

    _defineProperty(_assertThisInitialized(_this), "_formContentContainer", void 0);

    _defineProperty(_assertThisInitialized(_this), "fields", void 0);

    _defineProperty(_assertThisInitialized(_this), "liveValidation", false);

    _defineProperty(_assertThisInitialized(_this), "isValid", null);

    _defineProperty(_assertThisInitialized(_this), "nextButtonId", null);

    _defineProperty(_assertThisInitialized(_this), "_formFieldsBuilt", false);

    return _this;
  }

  _createClass(Form, [{
    key: "formElement",
    get:
    /**
     *
     * @returns {HTMLElement}
     */
    function get() {
      var _this2 = this;

      if (!_classPrivateFieldGet(this, _formEl)) {
        var _Form$formSerial;

        _classPrivateFieldSet(this, _formEl, document.createElement('form'));

        _classPrivateFieldGet(this, _formEl).id = this._formId = "form".concat((_classStaticPrivateFieldSpecSet(Form, Form, _formSerial, (_Form$formSerial = +_classStaticPrivateFieldSpecGet(Form, Form, _formSerial)) + 1), _Form$formSerial));
        _classPrivateFieldGet(this, _formEl).noValidate = true; // bootstrap overrides browser-based validation

        if (this.liveValidation) {
          _classPrivateFieldGet(this, _formEl).className = 'needs-validation';
        }

        this.buildContentContainer(_classPrivateFieldGet(this, _formEl)); //this._formContentContainer = this.#formEl; // currently the form doesn't have any inner liner elements

        _classPrivateFieldGet(this, _formEl).addEventListener('change', function (event) {
          _this2.changeHandler(event);
        }, {
          capture: false
        });
      }

      return _classPrivateFieldGet(this, _formEl);
    }
    /**
     * sets this._formContentContainer to the container that should contain the form fields
     *
     * if no wrapper then can re-use the outer container id (this.#formEl
     */

  }, {
    key: "buildContentContainer",
    value: function buildContentContainer(outerContainer) {
      this._formContentContainer = outerContainer; // default form doesn't have any inner liner elements

      return this._formContentContainer;
    }
  }, {
    key: "changeHandler",
    value: function changeHandler(params) {
      console.log({
        'form change event': params
      });
    }
  }, {
    key: "destructor",
    value: function destructor() {
      _get(_getPrototypeOf(Form.prototype), "destructor", this).call(this);

      _classPrivateFieldSet(this, _formEl, null);
    }
  }, {
    key: "buildFormFields",
    value:
    /**
     *
     */
    function buildFormFields() {
      this.initialiseFormFields();

      for (var key in this.fields) {
        if (this.fields.hasOwnProperty(key)) {
          var field = this.fields[key];
          field.parentForm = this;
          field.attributeName = key; //this._formContentContainer.appendChild(field.fieldElement);

          field.addField(this._formContentContainer);
          field.addListener(FormField.EVENT_CHANGE, this.changeHandler.bind(this));
        }
      }

      this._formFieldsBuilt = true;
    }
    /**
     * called after a form change once the model has been updated
     * validation is only applied if the form is subject to live validation
     */

  }, {
    key: "conditionallyValidateForm",
    value: function conditionallyValidateForm() {
      console.log('called conditionallyValidateForm');

      if (this.liveValidation) {
        console.log('doing validation conditionallyValidateForm');
        this.validateForm();
      }
    }
    /**
     * similar to validateForm but does not update form validity UI
     * @returns {boolean}
     */

  }, {
    key: "testRequiredComplete",
    value: function testRequiredComplete() {
      var validityResult = this.model.evaluateCompletionStatus(this.getFormSectionProperties()).requiredFieldsPresent;

      if (this.isValid !== validityResult) {
        this.isValid = validityResult;
        this.fireEvent(Form.EVENT_VALIDATION_STATE_CHANGE, {
          isValid: this.isValid
        });
      }

      return validityResult;
    }
    /**
     *
     * @returns {boolean}
     */

  }, {
    key: "validateForm",
    value: function validateForm() {
      if (this.liveValidation) {
        this.formElement.classList.add('needs-validation'); // add a bootstrap class marking that the form should be subject to validation
      }

      var validationResult = this.model.evaluateCompletionStatus(this.getFormSectionProperties());

      for (var key in this.fields) {
        if (this.fields.hasOwnProperty(key)) {
          var field = this.fields[key];
          field.markValidity(validationResult.validity[key]);
        }
      }

      if (this.isValid !== validationResult.requiredFieldsPresent) {
        this.isValid = validationResult.requiredFieldsPresent;
        this.fireEvent(Form.EVENT_VALIDATION_STATE_CHANGE, {
          isValid: this.isValid
        });
      }

      return validationResult.requiredFieldsPresent;
    }
    /**
     * fills in the form fields based on the model
     */

  }, {
    key: "populateFormContent",
    value: function populateFormContent() {
      if (this._formFieldsBuilt) {
        // throw new Error("populateFormContent shouldn't be called until fields have been initialised");
        var model = this.model;

        for (var key in this.fields) {
          if (this.fields.hasOwnProperty(key)) {
            var field = this.fields[key];
            field.value = model.attributes[key]; // value setter will update the field
          }
        }

        this.conditionallyValidateForm();
      }
    }
    /**
     * @abstract
     */

  }, {
    key: "updateModelFromContent",
    value: function updateModelFromContent() {}
  }], [{
    key: "nextId",
    get: function get() {
      var _Form$idIndex;

      return "id".concat((_classStaticPrivateFieldSpecSet(Form, Form, _idIndex, (_Form$idIndex = +_classStaticPrivateFieldSpecGet(Form, Form, _idIndex)) + 1), _Form$idIndex));
    }
  }]);

  return Form;
}(EventHarness);

_defineProperty(Form, "CHANGE_EVENT", 'change');

_defineProperty(Form, "EVENT_INITIALISE_NEW", 'initialisenew');

_defineProperty(Form, "EVENT_INITIALISED", 'initialised');

_defineProperty(Form, "EVENT_CAMERA", 'cameraimage');

var _formSerial = {
  writable: true,
  value: 0
};

_defineProperty(Form, "EVENT_VALIDATION_STATE_CHANGE", 'validationstatechange');

var _idIndex = {
  writable: true,
  value: 0
};

_defineProperty(Form, "COMPLETION_STATUS_UNSTARTED", 'unstarted');

_defineProperty(Form, "COMPLETION_STATUS_COMPLETE", 'complete');

_defineProperty(Form, "COMPLETION_STATUS_IN_PROGRESS", 'inProgress');

function _createSuper$g(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$g(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$g() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Occurrence = /*#__PURE__*/function (_Model) {
  _inherits(Occurrence, _Model);

  var _super = _createSuper$g(Occurrence);

  function Occurrence() {
    var _this;

    _classCallCheck(this, Occurrence);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "attributes", {// taxon: {
      //     taxonId: '',
      //     taxonName: '',
      //     vernacularMatch: false
      // }
    });

    _defineProperty(_assertThisInitialized(_this), "SAVE_ENDPOINT", '/saveoccurrence.php');

    _defineProperty(_assertThisInitialized(_this), "TYPE", 'occurrence');

    _defineProperty(_assertThisInitialized(_this), "isNew", false);

    return _this;
  }

  _createClass(Occurrence, [{
    key: "taxon",
    get:
    /**
     *
     * @returns {(Taxon|null)} returns null for unmatched taxa specified by name
     */
    function get() {
      return this.attributes.taxon && this.attributes.taxon.taxonId ? Taxon.fromId(this.attributes.taxon.taxonId) : null;
    }
  }, {
    key: "setForm",
    value:
    /**
     *
     * @param {OccurrenceForm} form
     * @returns {OccurrenceForm}
     */
    function setForm(form) {
      form.addListener(Form.CHANGE_EVENT, this.formChangedHandler.bind(this));

      if (!this.isNew) {
        form.liveValidation = true;
      }

      return form;
    }
    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     *
     * @param {{form: Form}} params
     */

  }, {
    key: "formChangedHandler",
    value: function formChangedHandler(params) {
      console.log('Occurrence change handler invoked.'); // read new values
      // then fire it's own change event (Occurrence.EVENT_MODIFIED)

      params.form.updateModelFromContent(); // refresh the form's validation state

      params.form.conditionallyValidateForm();
      this.touch();
      this.fireEvent(Occurrence.EVENT_MODIFIED, {
        occurrenceId: this.id
      });
    }
  }, {
    key: "delete",
    value: function _delete() {
      if (!this.deleted) {
        this.touch();
        this.deleted = true;
        this.fireEvent(Occurrence.EVENT_MODIFIED, {
          occurrenceId: this.id
        });
      }
    }
    /**
     * if not securely saved then makes a post to /saveoccurrence.php
     *
     * this may be intercepted by a service worker, which could write the image to indexdb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexdb
     *
     * must test indexdb for this eventuality after the save has returned
     *
     * @param {string} surveyId
     * @returns {Promise}
     */

  }, {
    key: "save",
    value: function save(surveyId) {
      if (!this._savedRemotely) {
        var formData = new FormData();

        if (!surveyId && this.surveyId) {
          surveyId = this.surveyId;
        }

        formData.append('type', this.TYPE);
        formData.append('surveyId', surveyId);
        formData.append('occurrenceId', this.id);
        formData.append('id', this.id);
        formData.append('projectId', this.projectId.toString());
        formData.append('attributes', JSON.stringify(this.attributes));
        formData.append('deleted', this.deleted.toString());
        formData.append('created', this.createdStamp.toString());
        console.log('queueing occurrence post');
        return this.queuePost(formData);
      } else {
        return Promise.reject("".concat(this.id, " has already been saved."));
      }
    }
    /**
     *
     * @param {{id : string, saveState: string, attributes: Object.<string, *>, deleted: boolean|string, created: number, modified: number, projectId: number, surveyId: string}} descriptor
     */

  }, {
    key: "_parseDescriptor",
    value: function _parseDescriptor(descriptor) {
      _get(_getPrototypeOf(Occurrence.prototype), "_parseDescriptor", this).call(this, descriptor);

      this.surveyId = descriptor.surveyId;
    }
  }]);

  return Occurrence;
}(Model);

_defineProperty(Occurrence, "EVENT_MODIFIED", 'modified');

function _createSuper$f(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$f(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$f() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

/**
 *
 */
var InternalAppError = /*#__PURE__*/function (_Error) {
  _inherits(InternalAppError, _Error);

  var _super = _createSuper$f(InternalAppError);

  function InternalAppError() {
    _classCallCheck(this, InternalAppError);

    return _super.apply(this, arguments);
  }

  return _createClass(InternalAppError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

function _createSuper$e(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$e(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$e() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _classPrivateFieldInitSpec$1(obj, privateMap, value) { _checkPrivateRedeclaration$1(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration$1(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

var _currentOccurrenceId = /*#__PURE__*/new WeakMap();

var MainController = /*#__PURE__*/function (_AppController) {
  _inherits(MainController, _AppController);

  var _super = _createSuper$e(MainController);

  /**
   *
   * @param {MainView} view
   */
  function MainController(view) {
    var _this;

    _classCallCheck(this, MainController);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "route", '/list/:action/:id');

    _defineProperty(_assertThisInitialized(_this), "title", 'App homepage');

    _defineProperty(_assertThisInitialized(_this), "app", void 0);

    _defineProperty(_assertThisInitialized(_this), "view", void 0);

    _classPrivateFieldInitSpec$1(_assertThisInitialized(_this), _currentOccurrenceId, {
      writable: true,
      value: ''
    });

    _defineProperty(_assertThisInitialized(_this), "needsFullRefresh", true);

    _defineProperty(_assertThisInitialized(_this), "needRightPanelRefresh", true);

    _defineProperty(_assertThisInitialized(_this), "viewSubcontext", '');

    _defineProperty(_assertThisInitialized(_this), "surveySection", void 0);

    _defineProperty(_assertThisInitialized(_this), "leftPanelBaseRoute", '');

    _defineProperty(_assertThisInitialized(_this), "viewContexts", {
      /**
       * @this {MainController}
       * @param {({[id] : string}|null)} queryParameters
       */
      record: function record(queryParameters) {
        // if (queryParameters && queryParameters.id) {
        //     console.log(`in record id ${queryParameters.id}`);
        // }
        // console.log({scope: this});
        this.surveySection = null; // No current survey form section, all should be closed

        if (!queryParameters) {
          // query parameters can be missing
          // force a refresh as it cheap to refresh static content and more difficult to detect
          // if strictly needed.
          // May have reached this point following deletion of the current record.
          this.currentOccurrenceId = '';
          this.needRightPanelRefresh = true;
        } else if (_classPrivateFieldGet(this, _currentOccurrenceId) !== queryParameters.id) {
          this.needRightPanelRefresh = true;
          this.currentOccurrenceId = queryParameters.id ? queryParameters.id : '';
        } else {
          this.needRightPanelRefresh = false;
        }

        this.leftPanelBaseRoute = '/list/record';
      },

      /**
       * @this {MainController}
       * @param {{[section]: string}} queryParameters
       */
      survey: function survey(queryParameters) {
        console.log("in survey section ".concat(queryParameters.section));
        this.currentOccurrenceId = '';
        this.needRightPanelRefresh = true;
        this.surveySection = queryParameters.section;
        this.leftPanelBaseRoute = "/list/survey/".concat(queryParameters.section);
      }
    });

    _this.view = view;
    view.controller = _assertThisInitialized(_this);
    _this.handle = AppController.nextHandle;
    view.addListener(MainController.EVENT_SELECT_OCCURRENCE, _this.occurrenceSelectionHandler.bind(_assertThisInitialized(_this)));
    view.addListener(MainController.EVENT_SELECT_SURVEY_SECTION, _this.surveyPartSelectionHandler.bind(_assertThisInitialized(_this)));
    view.addListener(MainController.EVENT_NEW_RECORD, _this.newRecordHandler.bind(_assertThisInitialized(_this)));
    view.addListener(MainController.EVENT_DELETE_OCCURRENCE, _this.deleteOccurrenceHandler.bind(_assertThisInitialized(_this)));
    view.addListener(MainController.EVENT_BACK, _this.backHandler.bind(_assertThisInitialized(_this)));
    view.addListener(MainController.EVENT_NEXT_TO_RECORDS, _this.nextTransitionToRecordsHandler.bind(_assertThisInitialized(_this)));
    return _this;
  }
  /**
   * handler for event fired on and by view when 'next section' button has been click, leading to the records section
   * this will expand the list of records, or if none exist, add a first one and open it
   */


  _createClass(MainController, [{
    key: "occurrences",
    get:
    /**
     * event fired on and by view when 'next section' button has been click, leading to the records section
     * this will expand the list of records, or if none exist, add a first one and open it
     *
     * @type {string}
     */

    /**
     * ? should be overridden by child class
     *
     * @type {string}
     */

    /**
     * @type {App}
     */

    /**
     *
     * @type {MainView}
     */

    /**
     * @type {string}
     */

    /**
     * set if the view needs full layout rendering
     * @todo this should possibly be a view rather than controller property
     * @type {boolean}
     */

    /**
     * set if the currently displayed occurrence needs revision
     * @todo this should possibly be a view rather than controller property
     * @type {boolean}
     */

    /**
     *
     * @type {string}
     */

    /**
     * Currently displayed survey subsection
     *
     * @type {string|null}
     */

    /**
     * this is the route that the 'back button' in a right-hand panel view should resolve to
     * @type {string}
     */

    /**
     * ultimately this getter might be the point at which to apply filters
     *
     * @returns {Map.<string,Occurrence>}
     */
    function get() {
      return this.app.occurrences;
    }
    /**
     *
     * @returns {null|Occurrence}
     */

  }, {
    key: "currentOccurrence",
    get: function get() {
      if (_classPrivateFieldGet(this, _currentOccurrenceId)) {
        if (this.app.occurrences.has(_classPrivateFieldGet(this, _currentOccurrenceId))) {
          return this.app.occurrences.get(_classPrivateFieldGet(this, _currentOccurrenceId));
        } else {
          throw new NotFoundError("Record id '".concat(_classPrivateFieldGet(this, _currentOccurrenceId), "' was not found."));
        }
      } else {
        return null;
      }
    }
    /**
     *
     * @returns {string}
     */

  }, {
    key: "currentOccurrenceId",
    get: function get() {
      return _classPrivateFieldGet(this, _currentOccurrenceId);
    }
    /**
     *
     * @param {string} occurrenceId
     */
    ,
    set: function set(occurrenceId) {
      _classPrivateFieldSet(this, _currentOccurrenceId, occurrenceId);
    }
    /**
     *
     * @returns {Survey}
     */

  }, {
    key: "survey",
    get: function get() {
      return this.app.currentSurvey;
    }
  }, {
    key: "nextTransitionToRecordsHandler",
    value: function nextTransitionToRecordsHandler() {
      console.log('in nextTransitionToRecordsHandler()');

      if (this.app.haveExtantOccurrences()) {
        this.app.router.navigate('/list/record/');
      } else {
        this.newRecordHandler();
      }
    }
    /**
     *
     * @param {{occurrenceId : string}} parameters
     */

  }, {
    key: "deleteOccurrenceHandler",
    value: function deleteOccurrenceHandler(parameters) {
      console.log({
        deleting: parameters.occurrenceId
      });
      var occurrence = this.app.occurrences.get(parameters.occurrenceId);

      if (!occurrence) {
        throw new InternalAppError("Occurrence id '".concat(parameters.occurrenceId, "' not found when trying to delete."));
      }

      occurrence.delete();

      if (this.currentOccurrenceId === parameters.occurrenceId) {
        this.app.router.navigate("/list/record/");
      }
    }
    /**
     *
     * @param {{sectionKey : string}} params
     */

  }, {
    key: "surveyPartSelectionHandler",
    value: function surveyPartSelectionHandler(params) {
      console.log({
        'In surveyPartSelectionHandler': params
      });

      if (params.sectionKey === 'record') {
        this.app.router.navigate("/list/record/");
      } else if (params.sectionKey) {
        this.app.router.navigate("/list/survey/".concat(params.sectionKey));
      } else {
        this.app.router.navigate("/list/");
      }
    }
    /**
     * may be invoked directly or in response to the Add New Record event
     * therefore assume that the method receives no event parameters
     */

  }, {
    key: "newRecordHandler",
    value: function newRecordHandler() {
      var occurrence = this.app.addNewOccurrence();
      this.app.router.navigate("/list/record/".concat(occurrence.id));
    }
    /**
     *
     * @param {{occurrenceId : string}} params
     */

  }, {
    key: "occurrenceSelectionHandler",
    value: function occurrenceSelectionHandler(params) {
      console.log({
        'In occurrenceSelectionHandler': params
      });

      if (this.currentOccurrenceId && params.occurrenceId && this.currentOccurrenceId === params.occurrenceId) {
        console.log("ignoring spurious navigation event for '".concat(params.occurrenceId, "'"));
      } else {
        this.app.router.navigate("/list/record/".concat(params.occurrenceId));
      }
    }
    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */

  }, {
    key: "registerRoute",
    value: function registerRoute(router) {
      router.on('/list', this.mainRouteHandler.bind(this, 'list', '', ''), {
        before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
      });
      router.on('/list/help', this.mainRouteHandler.bind(this, 'list', '', 'help'));
      router.on('/list/record/', this.mainRouteHandler.bind(this, 'list', 'record', ''), {
        before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
      });
      router.on('/list/record/help', this.mainRouteHandler.bind(this, 'list', 'record', 'help'));
      router.on('/list/record/:id', this.mainRouteHandler.bind(this, 'list', 'record', 'form'), {
        before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
      });
      router.on('/list/survey/:section', this.mainRouteHandler.bind(this, 'list', 'survey', ''), {
        before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
      });
      router.on('/list/survey/:section/help', this.mainRouteHandler.bind(this, 'list', 'survey', 'help'));
    }
    /**
     *
     * @param {string} context typically 'list'
     * @param {('record'|'survey')} subcontext record|survey
     * @param {(''|'help')} rhs
     * @param {Object.<string, string>} queryParameters
     */

  }, {
    key: "mainRouteHandler",
    value: function mainRouteHandler(context, subcontext, rhs, queryParameters) {
      console.log("reached special route handler for MainController.js");
      console.log({
        context: context,
        params: subcontext,
        query: queryParameters
      });
      this.app.saveRoute();

      try {
        this.viewSubcontext = subcontext;

        if (subcontext) {
          this.viewContexts[subcontext].call(this, queryParameters);
        }

        if (this.app.currentControllerHandle !== this.handle) {
          // need a complete refresh of the page (the list and any occurrence panel)
          // console.log(`currentControllerHandle = ${this.app.currentControllerHandle}, handle = ${this.handle}`);
          this.needsFullRefresh = true;
          this.needRightPanelRefresh = true;
          this.app.currentControllerHandle = this.handle;
        }

        this.view.panelKey = rhs;
        this.view.display();
        this.needsFullRefresh = false;
      } catch (error) {
        this.error = error;
        console.log({
          error: error
        }); // attempt to carry on regardless to some extent (error should be reported in the view)
        // but wrap in a further try just in case

        try {
          this.needsFullRefresh = true;
          this.view.display();
        } catch (rethrownError) {
          console.log({
            rethrownError: rethrownError
          });
          document.body.innerHTML = "<h2>Internal error</h2><p>Please report this problem:</p><p>".concat(rethrownError.message, "</p>");
        }
      }
    }
  }, {
    key: "backHandler",
    value: function backHandler() {
      if (this.app.routeHistory.length >= 2 && this.app.routeHistory[this.app.routeHistory.length - 2].url === this.leftPanelBaseRoute) {
        this.app.routeHistory.length -= 1;
        console.log('using standard back navigation');
        window.history.back(); //console.log('fell through back!');
      } else {
        console.log("navigating back using base address '".concat(this.leftPanelBaseRoute, "'"));
        this.app.router.navigate(this.leftPanelBaseRoute);
      }
    }
  }]);

  return MainController;
}(AppController);

_defineProperty(MainController, "EVENT_SELECT_OCCURRENCE", 'selectoccurrence');

_defineProperty(MainController, "EVENT_SELECT_SURVEY_SECTION", 'selectsurveysection');

_defineProperty(MainController, "EVENT_NEW_RECORD", 'newrecord');

_defineProperty(MainController, "EVENT_DELETE_OCCURRENCE", 'deleteoccurrence');

_defineProperty(MainController, "EVENT_BACK", 'back');

_defineProperty(MainController, "EVENT_NEXT_TO_RECORDS", 'nexttorecords');

function _createSuper$d(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$d(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$d() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var StaticContentController = /*#__PURE__*/function (_AppController) {
  _inherits(StaticContentController, _AppController);

  var _super = _createSuper$d(StaticContentController);

  /**
   * @type {string}
   */

  /**
   *
   * @param {Page} view
   * @param {string} route
   */
  function StaticContentController(view, route) {
    var _this;

    _classCallCheck(this, StaticContentController);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "route", void 0);

    _this.view = view;
    _this.route = route;
    _this.handle = AppController.nextHandle;
    return _this;
  }
  /**
   *
   * @param {object} params
   * @param {string} query
   */


  _createClass(StaticContentController, [{
    key: "routeHandler",
    value: function routeHandler(params, query) {
      // console.log("reached route handler for StaticContentController.js");
      this.app.currentControllerHandle = this.handle;
      this.view.display();
    }
  }]);

  return StaticContentController;
}(AppController);

var call$4 = functionCall;
var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$3 = anObject$l;
var toLength$3 = toLength$6;
var toString$7 = toString$g;
var requireObjectCoercible$4 = requireObjectCoercible$a;
var getMethod$2 = getMethod$7;
var advanceStringIndex$2 = advanceStringIndex$4;
var regExpExec$2 = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic$1('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$4(this);
      var matcher = regexp == undefined ? undefined : getMethod$2(regexp, MATCH);
      return matcher ? call$4(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString$7(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject$3(this);
      var S = toString$7(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regExpExec$2(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec$2(rx, S)) !== null) {
        var matchStr = toString$7(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$2(S, toLength$3(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

var $$c = _export;
var global$a = global$11;
var isArray = isArray$4;
var isConstructor$1 = isConstructor$4;
var isObject$2 = isObject$m;
var toAbsoluteIndex$1 = toAbsoluteIndex$4;
var lengthOfArrayLike$3 = lengthOfArrayLike$9;
var toIndexedObject$1 = toIndexedObject$b;
var createProperty$2 = createProperty$6;
var wellKnownSymbol$4 = wellKnownSymbol$q;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;
var un$Slice = arraySlice$6;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$2('slice');

var SPECIES = wellKnownSymbol$4('species');
var Array$2 = global$a.Array;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$c({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$1(this);
    var length = lengthOfArrayLike$3(O);
    var k = toAbsoluteIndex$1(start, length);
    var fin = toAbsoluteIndex$1(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor$1(Constructor) && (Constructor === Array$2 || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject$2(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array$2 || Constructor === undefined) {
        return un$Slice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array$2 : Constructor)(max$1(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$2(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var DESCRIPTORS$5 = descriptors;
var FUNCTION_NAME_EXISTS = functionName.EXISTS;
var uncurryThis$a = functionUncurryThis;
var defineProperty$5 = objectDefineProperty.f;

var FunctionPrototype = Function.prototype;
var functionToString = uncurryThis$a(FunctionPrototype.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec$1 = uncurryThis$a(nameRE.exec);
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS$5 && !FUNCTION_NAME_EXISTS) {
  defineProperty$5(FunctionPrototype, NAME, {
    configurable: true,
    get: function () {
      try {
        return regExpExec$1(nameRE, functionToString(this))[1];
      } catch (error) {
        return '';
      }
    }
  });
}

var anObject$2 = anObject$l;
var iteratorClose = iteratorClose$2;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject$2(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

var global$9 = global$11;
var bind$1 = functionBindContext;
var call$3 = functionCall;
var toObject$2 = toObject$a;
var callWithSafeIterationClosing = callWithSafeIterationClosing$1;
var isArrayIteratorMethod = isArrayIteratorMethod$2;
var isConstructor = isConstructor$4;
var lengthOfArrayLike$2 = lengthOfArrayLike$9;
var createProperty$1 = createProperty$6;
var getIterator = getIterator$2;
var getIteratorMethod = getIteratorMethod$3;

var Array$1 = global$9.Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$2(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind$1(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this == Array$1 && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = call$3(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$1(result, index, value);
    }
  } else {
    length = lengthOfArrayLike$2(O);
    result = IS_CONSTRUCTOR ? new this(length) : Array$1(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$1(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var $$b = _export;
var from = arrayFrom;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$3;

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$b({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var $$a = _export;
var global$8 = global$11;
var call$2 = functionCall;
var uncurryThis$9 = functionUncurryThis;
var isCallable$1 = isCallable$p;
var isObject$1 = isObject$m;

var DELEGATES_TO_EXEC = function () {
  var execCalled = false;
  var re = /[ac]/;
  re.exec = function () {
    execCalled = true;
    return /./.exec.apply(this, arguments);
  };
  return re.test('abc') === true && execCalled;
}();

var Error$1 = global$8.Error;
var un$Test = uncurryThis$9(/./.test);

// `RegExp.prototype.test` method
// https://tc39.es/ecma262/#sec-regexp.prototype.test
$$a({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (str) {
    var exec = this.exec;
    if (!isCallable$1(exec)) return un$Test(this, str);
    var result = call$2(exec, this, str);
    if (result !== null && !isObject$1(result)) {
      throw new Error$1('RegExp exec method returned something other than an Object or null');
    }
    return !!result;
  }
});

var $$9 = _export;
var DESCRIPTORS$4 = descriptors;
var global$7 = global$11;
var uncurryThis$8 = functionUncurryThis;
var hasOwn$1 = hasOwnProperty_1;
var isCallable = isCallable$p;
var isPrototypeOf$2 = objectIsPrototypeOf;
var toString$6 = toString$g;
var defineProperty$4 = objectDefineProperty.f;
var copyConstructorProperties = copyConstructorProperties$3;

var NativeSymbol = global$7.Symbol;
var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

if (DESCRIPTORS$4 && isCallable(NativeSymbol) && (!('description' in SymbolPrototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString$6(arguments[0]);
    var result = isPrototypeOf$2(SymbolPrototype, this)
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  SymbolWrapper.prototype = SymbolPrototype;
  SymbolPrototype.constructor = SymbolWrapper;

  var NATIVE_SYMBOL = String(NativeSymbol('test')) == 'Symbol(test)';
  var symbolToString = uncurryThis$8(SymbolPrototype.toString);
  var symbolValueOf = uncurryThis$8(SymbolPrototype.valueOf);
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  var replace$1 = uncurryThis$8(''.replace);
  var stringSlice$3 = uncurryThis$8(''.slice);

  defineProperty$4(SymbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = symbolValueOf(this);
      var string = symbolToString(symbol);
      if (hasOwn$1(EmptyStringDescriptionStore, symbol)) return '';
      var desc = NATIVE_SYMBOL ? stringSlice$3(string, 7, -1) : replace$1(string, regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $$9({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var defineWellKnownSymbol = defineWellKnownSymbol$2;

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');

var isObject = isObject$m;
var classof$3 = classofRaw$1;
var wellKnownSymbol$3 = wellKnownSymbol$q;

var MATCH$2 = wellKnownSymbol$3('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classof$3(it) == 'RegExp');
};

var apply = functionApply;
var call$1 = functionCall;
var uncurryThis$7 = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var isRegExp$3 = isRegexp;
var anObject$1 = anObject$l;
var requireObjectCoercible$3 = requireObjectCoercible$a;
var speciesConstructor$1 = speciesConstructor$4;
var advanceStringIndex$1 = advanceStringIndex$4;
var toLength$2 = toLength$6;
var toString$5 = toString$g;
var getMethod$1 = getMethod$7;
var arraySlice$1 = arraySliceSimple;
var callRegExpExec = regexpExecAbstract;
var regexpExec = regexpExec$3;
var stickyHelpers$1 = regexpStickyHelpers;
var fails$3 = fails$B;

var UNSUPPORTED_Y$1 = stickyHelpers$1.UNSUPPORTED_Y;
var MAX_UINT32 = 0xFFFFFFFF;
var min$2 = Math.min;
var $push = [].push;
var exec$1 = uncurryThis$7(/./.exec);
var push$1 = uncurryThis$7($push);
var stringSlice$2 = uncurryThis$7(''.slice);

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$3(function () {
  // eslint-disable-next-line regexp/no-empty-group -- required for testing
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

// @@split logic
fixRegExpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = toString$5(requireObjectCoercible$3(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp$3(separator)) {
        return call$1(nativeSplit, string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = call$1(regexpExec, separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          push$1(output, stringSlice$2(string, lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) apply($push, output, arraySlice$1(match, 1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !exec$1(separatorCopy, '')) push$1(output, '');
      } else push$1(output, stringSlice$2(string, lastLastIndex));
      return output.length > lim ? arraySlice$1(output, 0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : call$1(nativeSplit, this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible$3(this);
      var splitter = separator == undefined ? undefined : getMethod$1(separator, SPLIT);
      return splitter
        ? call$1(splitter, separator, O, limit)
        : call$1(internalSplit, toString$5(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (string, limit) {
      var rx = anObject$1(this);
      var S = toString$5(string);
      var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);

      if (res.done) return res.value;

      var C = speciesConstructor$1(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (UNSUPPORTED_Y$1 ? 'g' : 'y');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(UNSUPPORTED_Y$1 ? '^(?:' + rx.source + ')' : rx, flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = UNSUPPORTED_Y$1 ? 0 : q;
        var z = callRegExpExec(splitter, UNSUPPORTED_Y$1 ? stringSlice$2(S, q) : S);
        var e;
        if (
          z === null ||
          (e = min$2(toLength$2(splitter.lastIndex + (UNSUPPORTED_Y$1 ? q : 0)), S.length)) === p
        ) {
          q = advanceStringIndex$1(S, q, unicodeMatching);
        } else {
          push$1(A, stringSlice$2(S, p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            push$1(A, z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      push$1(A, stringSlice$2(S, p));
      return A;
    }
  ];
}, !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y$1);

var $$8 = _export;
var uncurryThis$6 = functionUncurryThis;
var IndexedObject = indexedObject;
var toIndexedObject = toIndexedObject$b;
var arrayMethodIsStrict$2 = arrayMethodIsStrict$4;

var un$Join = uncurryThis$6([].join);

var ES3_STRINGS = IndexedObject != Object;
var STRICT_METHOD$2 = arrayMethodIsStrict$2('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$8({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$2 }, {
  join: function join(separator) {
    return un$Join(toIndexedObject(this), separator === undefined ? ',' : separator);
  }
});

var newSurveyModal = "<!-- begin: templates/newSurveyModal.html -->\r\n<div class=\"modal fade\" id=\"newsurveymodal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"newsurveymodalTitle\" aria-hidden=\"true\">\r\n    <div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <h5 class=\"modal-title\" id=\"newsurveymodalTitle\">Start a new survey?</h5>\r\n                <button type=\"button\" class=\"close\" data-bs-dismiss=\"modal\" aria-label=\"Close\">\r\n                    <span aria-hidden=\"true\">&times;</span>\r\n                </button>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                Please confirm that you wish to start a new survey. You only need to do this if you wish to send a set of records from a different locality, otherwise please add more records to your current report.\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Back</button>\r\n                <button type=\"button\" class=\"btn btn-danger\" data-bs-dismiss=\"modal\" id=\"newsurveymodalconfirmed\">New survey</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!-- end: templates/newSurveyModal.html -->\r\n";

var resetModal = "<!-- begin: templates/resetModal.html -->\r\n<div class=\"modal fade\" id=\"resetmodal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"resetmodalTitle\" aria-hidden=\"true\">\r\n    <div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <h5 class=\"modal-title\" id=\"resetmodalTitle\">Reset?</h5>\r\n                <button type=\"button\" class=\"close\" data-bs-dismiss=\"modal\" aria-label=\"Close\">\r\n                    <span aria-hidden=\"true\">&times;</span>\r\n                </button>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                Please confirm that you wish to clear out your survey data.\r\n                <p>Warning: any unsaved changes will be lost.</p>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Back</button>\r\n                <button type=\"button\" class=\"btn btn-danger\" data-bs-dismiss=\"modal\" id=\"resetmodalconfirmed\">Reset</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!-- end: templates/resetModal.html -->\r\n";

var saveAllSuccessModal = "<!-- begin: templates/syncSuccessModal.html -->\r\n<div class=\"modal fade\" id=\"saveallsuccess\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"saveallsuccessTitle\" aria-hidden=\"true\">\r\n    <div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <h5 class=\"modal-title\" id=\"saveallsuccessTitle\">All records sent</h5>\r\n                <button type=\"button\" class=\"close\" data-bs-dismiss=\"modal\" aria-label=\"Close\">\r\n                    <span aria-hidden=\"true\">&times;</span>\r\n                </button>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                Your data has been synchronised with the server.\r\n                <p>Thank you.</p>\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Close</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!-- end: templates/syncSuccessModal.html -->\r\n";

var saveAllFailureModal = "<!-- begin: templates/syncFailureModal.html -->\r\n<div class=\"modal fade\" id=\"saveallfailure\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"saveallfailureTitle\" aria-hidden=\"true\">\r\n    <div class=\"modal-dialog modal-dialog-centered\" role=\"document\">\r\n        <div class=\"modal-content\">\r\n            <div class=\"modal-header\">\r\n                <h5 class=\"modal-title\" id=\"saveallfailureTitle\">One or more records could not be saved</h5>\r\n                <button type=\"button\" class=\"close\" data-bs-dismiss=\"modal\" aria-label=\"Close\">\r\n                    <span aria-hidden=\"true\">&times;</span>\r\n                </button>\r\n            </div>\r\n            <div class=\"modal-body\">\r\n                Please check your connection to the network and try again.\r\n            </div>\r\n            <div class=\"modal-footer\">\r\n                <button type=\"button\" class=\"btn btn-secondary\" data-bs-dismiss=\"modal\">Close</button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n<!-- end: templates/syncFailureModal.html -->\r\n";

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayLikeToArray$3(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray$3(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray$3(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$3(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$3(arr, i) || _nonIterableRest();
}

var defineProperty$3 = objectDefineProperty.f;
var create = objectCreate;
var redefineAll = redefineAll$4;
var bind = functionBindContext;
var anInstance = anInstance$4;
var iterate = iterate$4;
var defineIterator = defineIterator$3;
var setSpecies$1 = setSpecies$3;
var DESCRIPTORS$3 = descriptors;
var fastKey = internalMetadata.exports.fastKey;
var InternalStateModule$1 = internalState;

var setInternalState$1 = InternalStateModule$1.set;
var internalStateGetterFor = InternalStateModule$1.getterFor;

var collectionStrong$1 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance(that, Prototype);
      setInternalState$1(that, {
        type: CONSTRUCTOR_NAME,
        index: create(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS$3) that.size = 0;
      if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var entry = getEntry(that, key);
      var previous, index;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          index: index = fastKey(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS$3) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key == key) return entry;
      }
    };

    redefineAll(Prototype, {
      // `{ Map, Set }.prototype.clear()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.clear
      // https://tc39.es/ecma262/#sec-set.prototype.clear
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var data = state.index;
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          delete data[entry.index];
          entry = entry.next;
        }
        state.first = state.last = undefined;
        if (DESCRIPTORS$3) state.size = 0;
        else that.size = 0;
      },
      // `{ Map, Set }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.delete
      // https://tc39.es/ecma262/#sec-set.prototype.delete
      'delete': function (key) {
        var that = this;
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          delete state.index[entry.index];
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first == entry) state.first = next;
          if (state.last == entry) state.last = prev;
          if (DESCRIPTORS$3) state.size--;
          else that.size--;
        } return !!entry;
      },
      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.foreach
      // https://tc39.es/ecma262/#sec-set.prototype.foreach
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // `{ Map, Set}.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.has
      // https://tc39.es/ecma262/#sec-set.prototype.has
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    redefineAll(Prototype, IS_MAP ? {
      // `Map.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-map.prototype.get
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // `Map.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-map.prototype.set
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // `Set.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-set.prototype.add
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS$3) defineProperty$3(Prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return Constructor;
  },
  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
    // https://tc39.es/ecma262/#sec-map.prototype.entries
    // https://tc39.es/ecma262/#sec-map.prototype.keys
    // https://tc39.es/ecma262/#sec-map.prototype.values
    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
    // https://tc39.es/ecma262/#sec-set.prototype.entries
    // https://tc39.es/ecma262/#sec-set.prototype.keys
    // https://tc39.es/ecma262/#sec-set.prototype.values
    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
    defineIterator(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$1(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
      });
    }, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = undefined;
        return { value: undefined, done: true };
      }
      // return step by kind
      if (kind == 'keys') return { value: entry.key, done: false };
      if (kind == 'values') return { value: entry.value, done: false };
      return { value: [entry.key, entry.value], done: false };
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // `{ Map, Set }.prototype[@@species]` accessors
    // https://tc39.es/ecma262/#sec-get-map-@@species
    // https://tc39.es/ecma262/#sec-get-set-@@species
    setSpecies$1(CONSTRUCTOR_NAME);
  }
};

var collection = collection$2;
var collectionStrong = collectionStrong$1;

// `Map` constructor
// https://tc39.es/ecma262/#sec-map-objects
collection('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

var $$7 = _export;
var $includes = arrayIncludes.includes;
var addToUnscopables = addToUnscopables$2;

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$7({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

var global$6 = global$11;
var isRegExp$2 = isRegexp;

var TypeError$5 = global$6.TypeError;

var notARegexp = function (it) {
  if (isRegExp$2(it)) {
    throw TypeError$5("The method doesn't accept regular expressions");
  } return it;
};

var wellKnownSymbol$2 = wellKnownSymbol$q;

var MATCH$1 = wellKnownSymbol$2('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH$1] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

var $$6 = _export;
var uncurryThis$5 = functionUncurryThis;
var notARegExp$1 = notARegexp;
var requireObjectCoercible$2 = requireObjectCoercible$a;
var toString$4 = toString$g;
var correctIsRegExpLogic$1 = correctIsRegexpLogic;

var stringIndexOf$2 = uncurryThis$5(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$$6({ target: 'String', proto: true, forced: !correctIsRegExpLogic$1('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf$2(
      toString$4(requireObjectCoercible$2(this)),
      toString$4(notARegExp$1(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

function _createSuper$c(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$c(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$c() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Page = /*#__PURE__*/function (_EventHarness) {
  _inherits(Page, _EventHarness);

  var _super = _createSuper$c(Page);

  function Page() {
    var _this;

    _classCallCheck(this, Page);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "controller", void 0);

    return _this;
  }

  _createClass(Page, [{
    key: "initialise",
    value:
    /**
     * called once during late-stage app initialisation
     * (NB this may not be the current view when called)
     *
     * an opportunity to register listeners on this.controller.app
     */
    function initialise() {} // /**
    //  *
    //  * @param {HTMLElement} containerEl
    //  */
    // static initialise_layout(containerEl) {
    //
    // }

  }, {
    key: "display",
    value: function display() {
      console.log('got to view display'); // these serve as hook points for child classes

      this.refreshHeader();
      this.body();
    }
  }, {
    key: "refreshHeader",
    value: function refreshHeader() {}
  }, {
    key: "body",
    value: function body() {}
    /**
     *
     * @param {{}} descriptor
     * @param {string} descriptor.cardId
     * @param {string} descriptor.cardHeadingId
     * @param {boolean} descriptor.collapsed
     * @param {string} descriptor.headingButtonId
     * @param {string} descriptor.headingHTML
     * @param {string} [descriptor.headingNonbuttonHTML]
     * @param {string} descriptor.cardDescriptionId
     * @param {string} descriptor.parentContainerId
     * @param {string} descriptor.buttonStyleString
     * @param {HTMLElement} descriptor.bodyContentElement
     * @param {{string, string}} descriptor.dataAttributes
     * @param {string} descriptor.headingValidationWarningHTML
     *
     * @returns {HTMLDivElement}
     */

  }, {
    key: "accordionItem",
    value: function accordionItem(descriptor) {
      var cardContainer = document.createElement('div');
      cardContainer.id = descriptor.cardId;
      cardContainer.className = 'accordion-item';
      var cardHeadingEl = cardContainer.appendChild(document.createElement('div'));
      cardHeadingEl.className = 'accordion-header pointer';

      if (descriptor.cardHeadingId) {
        cardHeadingEl.id = descriptor.cardHeadingId;
      }

      var headingEl = cardHeadingEl.appendChild(document.createElement('h2'));
      headingEl.className = 'mb-0';
      var buttonEl = headingEl.appendChild(document.createElement('button')); //buttonEl.className = `btn btn-link${(descriptor.collapsed ? ' collapsed' : '')}`;

      buttonEl.className = "accordion-button".concat(descriptor.collapsed ? ' collapsed' : '');
      buttonEl.setAttribute('data-bs-toggle', 'collapse'); //buttonEl.setAttribute('data-bs-target', `#${descriptor.cardDescriptionId}`);

      if (descriptor.headingButtonId) {
        buttonEl.id = descriptor.headingButtonId;
      }

      buttonEl.type = 'button'; //buttonEl.setAttribute('data-bs-toggle', 'collapse');

      if (descriptor.buttonStyleString) {
        buttonEl.style.cssText = descriptor.buttonStyleString;
      }

      if (descriptor.cardDescriptionId) {
        buttonEl.setAttribute('data-bs-target', "#".concat(descriptor.cardDescriptionId));
        buttonEl.setAttribute('aria-controls', descriptor.cardDescriptionId);
      }

      buttonEl.setAttribute('aria-expanded', descriptor.collapsed ? 'false' : 'true');
      buttonEl.innerHTML = "<div class=\"material-icons icon-show-collapsed\">expand_more</div><div class=\"material-icons icon-hide-collapsed\">unfold_less</div>".concat(descriptor.headingHTML);

      if (descriptor.headingNonbuttonHTML) {
        var extraHeadingElement = buttonEl.appendChild(document.createElement('span'));
        extraHeadingElement.style.display = 'flex';
        extraHeadingElement.innerHTML = descriptor.headingNonbuttonHTML;
      }

      if (descriptor.headingValidationWarningHTML) {
        var headerValidationWarning = cardHeadingEl.appendChild(document.createElement('div'));
        headerValidationWarning.className = 'card-invalid-feedback';
        headerValidationWarning.innerHTML = "<small>".concat(descriptor.headingValidationWarningHTML, "</small>");
      }

      var cardDescriptionEl = cardContainer.appendChild(document.createElement('div'));

      if (descriptor.cardDescriptionId) {
        cardDescriptionEl.id = descriptor.cardDescriptionId;
      }

      cardDescriptionEl.className = "accordion-collapse collapse".concat(descriptor.collapsed ? '' : ' show');

      if (descriptor.cardHeadingId) {
        cardDescriptionEl.setAttribute('aria-labelledby', descriptor.cardHeadingId);
      }

      cardDescriptionEl.setAttribute('data-bs-parent', "#".concat(descriptor.parentContainerId));

      if (descriptor.dataAttributes) {
        for (var key in descriptor.dataAttributes) {
          if (descriptor.dataAttributes.hasOwnProperty(key)) {
            cardDescriptionEl.setAttribute("data-".concat(key), descriptor.dataAttributes[key]);
          }
        }
      }

      var cardBodyEl = cardDescriptionEl.appendChild(document.createElement('div'));
      cardBodyEl.className = 'accordion-body ps-2 pe-2 ps-md-3 pe-md-3';
      cardBodyEl.appendChild(descriptor.bodyContentElement);
      return cardContainer;
    }
    /**
     *
     * @param {{}} descriptor
     * @param {string} descriptor.cardId
     * @param {string} descriptor.cardHeadingId
     * @param {boolean} descriptor.collapsed
     * @param {string} descriptor.headingButtonId
     * @param {string} descriptor.headingHTML
     * @param {string} [descriptor.headingNonbuttonHTML]
     * @param {string} descriptor.cardDescriptionId
     * @param {string} descriptor.parentContainerId
     * @param {string} descriptor.buttonStyleString
     * @param {HTMLElement} descriptor.bodyContentElement
     * @param {{string, string}} descriptor.dataAttributes
     * @param {string} descriptor.headingValidationWarningHTML
     *
     * @returns {HTMLDivElement}
     */

  }, {
    key: "card",
    value: function card(descriptor) {
      var cardContainer = document.createElement('div');
      cardContainer.id = descriptor.cardId;
      cardContainer.className = 'card';
      var cardHeadingEl = cardContainer.appendChild(document.createElement('div'));
      cardHeadingEl.className = 'card-header pointer';

      if (descriptor.cardHeadingId) {
        cardHeadingEl.id = descriptor.cardHeadingId;
      }

      cardHeadingEl.setAttribute('data-bs-toggle', 'collapse');
      cardHeadingEl.setAttribute('data-bs-target', "#".concat(descriptor.cardDescriptionId));
      var headingEl = cardHeadingEl.appendChild(document.createElement('h2'));
      headingEl.className = 'mb-0';
      var buttonEl = headingEl.appendChild(document.createElement('button'));
      buttonEl.className = "btn btn-link".concat(descriptor.collapsed ? ' collapsed' : '');

      if (descriptor.headingButtonId) {
        buttonEl.id = descriptor.headingButtonId;
      }

      buttonEl.type = 'button';
      buttonEl.setAttribute('data-bs-toggle', 'collapse');

      if (descriptor.buttonStyleString) {
        buttonEl.style.cssText = descriptor.buttonStyleString;
      }

      if (descriptor.cardDescriptionId) {
        buttonEl.setAttribute('data-bs-target', "#".concat(descriptor.cardDescriptionId));
        buttonEl.setAttribute('aria-controls', descriptor.cardDescriptionId);
      }

      buttonEl.setAttribute('aria-expanded', descriptor.collapsed ? 'false' : 'true');
      buttonEl.innerHTML = "<div class=\"material-icons icon-show-collapsed\">expand_more</div><div class=\"material-icons icon-hide-collapsed\">unfold_less</div>".concat(descriptor.headingHTML);

      if (descriptor.headingNonbuttonHTML) {
        var extraHeadingElement = headingEl.appendChild(document.createElement('span'));
        extraHeadingElement.style.display = 'inline-block';
        extraHeadingElement.innerHTML = descriptor.headingNonbuttonHTML;
      }

      if (descriptor.headingValidationWarningHTML) {
        var headerValidationWarning = cardHeadingEl.appendChild(document.createElement('div'));
        headerValidationWarning.className = 'card-invalid-feedback';
        headerValidationWarning.innerHTML = "<small>".concat(descriptor.headingValidationWarningHTML, "</small>");
      }

      var cardDescriptionEl = cardContainer.appendChild(document.createElement('div'));

      if (descriptor.cardDescriptionId) {
        cardDescriptionEl.id = descriptor.cardDescriptionId;
      }

      cardDescriptionEl.className = "collapse".concat(descriptor.collapsed ? '' : ' show');

      if (descriptor.cardHeadingId) {
        cardDescriptionEl.setAttribute('aria-labelledby', descriptor.cardHeadingId);
      }

      cardDescriptionEl.setAttribute('data-parent', "#".concat(descriptor.parentContainerId));

      if (descriptor.dataAttributes) {
        for (var key in descriptor.dataAttributes) {
          if (descriptor.dataAttributes.hasOwnProperty(key)) {
            cardDescriptionEl.setAttribute("data-".concat(key), descriptor.dataAttributes[key]);
          }
        }
      }

      var cardBodyEl = cardDescriptionEl.appendChild(document.createElement('div'));
      cardBodyEl.className = 'card-body ps-2 pe-2 ps-md-3 pe-md-3';
      cardBodyEl.appendChild(descriptor.bodyContentElement);
      return cardContainer; //         `<div class="card-header" id="heading_${occurrence.id}">
      //   <h2 class="mb-0">
      //     <button class="btn btn-link${(this.controller.currentOccurrenceId === occurrence.id ? '' : ' collapsed')}" id="headingbutton_${occurrence.id}" type="button" data-bs-toggle="collapse" data-bs-target="#description_${occurrence.id}" aria-expanded="true" aria-controls="description_${occurrence.id}">
      //       Heading for (${occurrence.id}, ${taxon.canonical})
      //     </button>
      //   </h2>
      // </div>
      //
      // <div id="description_${occurrence.id}" class="collapse${(this.controller.currentOccurrenceId === occurrence.id ? ' show' : '')}" aria-labelledby="heading_${occurrence.id}" data-parent="#occurrenceslist" data-occurrenceId="${occurrence.id}">
      //   <div class="card-body">
      //     Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
      //   </div>
      // </div>`;
    }
  }]);

  return Page;
}(EventHarness);

function _createSuper$b(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$b(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$b() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var NotFoundView = /*#__PURE__*/function (_Page) {
  _inherits(NotFoundView, _Page);

  var _super = _createSuper$b(NotFoundView);

  function NotFoundView() {
    _classCallCheck(this, NotFoundView);

    return _super.apply(this, arguments);
  }

  _createClass(NotFoundView, [{
    key: "body",
    value: function body() {
      // at this point the entire content of #body should be safe to replace
      var pathPrefix = window.location.pathname.split('/')[1];
      var bodyEl = document.getElementById('body');
      bodyEl.innerHTML = "<h2>Page not found</h2><p><a href=\"/".concat(pathPrefix, "/list\">Return to the homepage.</a>");
    }
  }]);

  return NotFoundView;
}(Page);

class S{static tetradOffsets={E:[0,8e3],J:[2e3,8e3],P:[4e3,8e3],U:[6e3,8e3],Z:[8e3,8e3],D:[0,6e3],I:[2e3,6e3],N:[4e3,6e3],T:[6e3,6e3],Y:[8e3,6e3],C:[0,4e3],H:[2e3,4e3],M:[4e3,4e3],S:[6e3,4e3],X:[8e3,4e3],B:[0,2e3],G:[2e3,2e3],L:[4e3,2e3],R:[6e3,2e3],W:[8e3,2e3],A:[0,0],F:[2e3,0],K:[4e3,0],Q:[6e3,0],V:[8e3,0]};static quadrantOffsets={NW:[0,5e3],NE:[5e3,5e3],SW:[0,0],SE:[5e3,0]};static letterMapping={A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,J:8,K:9,L:10,M:11,N:12,O:13,P:14,Q:15,R:16,S:17,T:18,U:19,V:20,W:21,X:22,Y:23,Z:24};static tetradLetters="ABCDEFGHIJKLMNPQRSTUVWXYZ";preciseGridRef="";length=0;hectad="";tetrad="";tetradLetter="";quadrant="";quadrantCode="";gridCoords=null;error=!1;errorMessage="";set_tetrad(){if(this.tetradLetter=S.tetradLetters.substr(5*(Math.floor(this.gridCoords.x%1e4/1e3)>>1)+(Math.floor(this.gridCoords.y%1e4/1e3)>>1),1),!this.tetradLetter)throw new Error("Failed to get tetrad letter when processing '"+this.preciseGridRef+"', easting="+this.gridCoords.x+" northing="+this.gridCoords.y);this.tetrad=this.hectad+this.tetradLetter;}static get_normalized_precision(S,N){return S>2e3?1e4:S>1e3?2e3:S>100?1e3:S>10?100:S>1?10:N||1}}const N=Math.PI/180,t=180/Math.PI;class e{lat;lng;constructor(S,N){this.lat=S,this.lng=N;}static _transform(S,t,T,s,r,a,h,i,o,n,d,M,H,O){const l=1e-6*O;let J=T/Math.sqrt(1-s*(Math.sin(S)*Math.sin(S)));const c=(J+r)*Math.cos(S)*Math.cos(t),g=(J+r)*Math.cos(S)*Math.sin(t),U=((1-s)*J+r)*Math.sin(S),L=d/3600*N,u=M/3600*N,C=H/3600*N,Y=c+c*l-g*C+U*u+i,f=c*C+g+g*l-U*L+o,P=-1*c*u+g*L+U+U*l+n;t=Math.atan(f/Y);const D=Math.sqrt(Y*Y+f*f);S=Math.atan(P/(D*(1-h))),J=a/Math.sqrt(1-h*(Math.sin(S)*Math.sin(S)));let K=1,X=0;for(;K>.001;)X=Math.atan((P+h*J*Math.sin(S))/D),K=Math.abs(X-S),S=X;return new e(S,t)}static _Marc(S,N,t,e){return S*((1+N+5/4*(N*N)+5/4*(N*N*N))*(e-t)-(3*N+N*N*3+21/8*(N*N*N))*Math.sin(e-t)*Math.cos(e+t)+(15/8*(N*N)+15/8*(N*N*N))*Math.sin(2*(e-t))*Math.cos(2*(e+t))-35/24*(N*N*N)*Math.sin(3*(e-t))*Math.cos(3*(e+t)))}}class T extends e{constructor(S,N){super(S,N);}}class s extends e{constructor(S,N){super(S,N);}to_WGS84(){let S=6377563.396,e=.00667054007;const s=this.lat*N,r=Math.sin(s),a=this.lng*N,h=S/Math.sqrt(1-e*(r*r)),i=h*Math.cos(s)*Math.cos(a),o=h*Math.cos(s)*Math.sin(a),n=(1-e)*h*r,d=-204894e-10,M=7.28190110241429e-7,H=119748977294801e-20,O=446.448+i*(1+d)+-M*o+H*n,l=408261589226812e-20*i-124.157+o*(1+d)+-M*n,J=542.06+-H*i+M*o+n*(1+d);S=6378137,e=.00669438003;const c=Math.sqrt(O*O+l*l);let g=Math.atan(J/(c*(1-e)));for(let N=1;N<10;++N){let N=Math.sin(g);g=Math.atan((J+e*(S/Math.sqrt(1-e*(N*N)))*N)/c);}return new T(t*g,t*Math.atan(l/O))}static from_wgs84(S){const e=S.lat*N,T=S.lng*N,r=.00669438037928458,a=.0066705397616,h=20.4894*1e-6;let i=6378137/Math.sqrt(1-r*Math.sin(e)*Math.sin(e));const o=(i+0)*Math.cos(e)*Math.cos(T),n=(i+0)*Math.cos(e)*Math.sin(T),d=((1-r)*i+0)*Math.sin(e),M=-.1502/3600*N,H=-.247/3600*N,O=-.8421/3600*N,l=o+o*h-n*O+d*H-446.448,J=o*O+n+n*h-d*M+125.157,c=-1*o*H+n*M+d+d*h+-542.06,g=Math.atan(J/l),U=Math.sqrt(l*l+J*J);let L=Math.atan(c/(U*(1-a)));i=6377563.396/Math.sqrt(1-a*(Math.sin(L)*Math.sin(L)));let u=1,C=0;for(;u>.001;)C=Math.atan((c+a*i*Math.sin(L))/U),u=Math.abs(C-L),L=C;return new s(L*t,g*t)}}class r extends e{constructor(S,N){super(S,N);}static from_wgs84(S){const T=S.lat*N,s=S.lng*N,a=e._transform(T,s,6378137,.00669438037928458,0,6378388,.0067226700223333,83.901,98.127,118.635,0,0,0,0);return new r(a.lat*t,a.lng*t)}}class a extends e{constructor(S,N){super(S,N);}to_WGS84(){const S=e._transform(this.lat*N,this.lng*N,6377340.189,.00667054015,0,6378137,.00669438037928458,482.53,-130.596,564.557,-1.042,-.214,-.631,-8.15);return new T(S.lat*t,S.lng*t)}static from_wgs84(S){const T=S.lat*N,s=S.lng*N,r=e._transform(T,s,6378137,.00669438037928458,0,6377340.189,.00667054015,-482.53,130.596,-564.557,1.042,.214,.631,8.15);return new a(r.lat*t,r.lng*t)}}class h{x;y;constructor(){}to_latLng(){}to_gridref(S){}static tetradLetters="ABCDEFGHIJKLMNPQRSTUVWXYZ";static tetradLettersRowFirst="AFKQVBGLRWCHMSXDINTYEJPUZ";static from_latlng(S,N){if(N>=-8.74&&S>49.88){let t=new s.from_wgs84(new T(S,N)).to_os_coords();if(t.x>=0&&t.is_gb_hectad())return t}if(N<-5.3&&S>51.34&&N>-11&&S<55.73){let t=new a.from_wgs84(new T(S,N)).to_os_coords();return t.x<0||t.y<0?null:t}{let t=new r.from_wgs84(new T(S,N)).to_os_coords();if(t.x>=5e5&&t.x<6e5&&t.y>=54e5&&t.y<56e5)return t}return null}static calculate_tetrad(S,N){return S>=0&&N>=0?h.tetradLetters.charAt(5*Math.floor(S%1e4/2e3)+Math.floor(N%1e4/2e3)):""}toString(){return this.x+","+this.y}}const i=function(S,N,t,e){let T="00000"+Math.floor(N),s="00000"+Math.floor(t);if(2e3===e)return S+T.charAt(T.length-5)+s.charAt(s.length-5)+h.calculate_tetrad(N,t);if(1e5===e)return S;{5e3===e&&(e=1e4);let N=Math.round(Math.log10(e));return S+(N?T.slice(-5,-N)+s.slice(-5,-N):T.slice(-5)+s.slice(-5))}};class o extends h{country="CI";constructor(S,N){super(),this.x=S,this.y=N;}to_latLng(){var S=.9996,N=.0067226700223333,e=6378388*S,s=6356911.946*S,r=this.x-5e5,a=d(this.y,0,e,0,.0016863406508729017,s),h=e/Math.sqrt(1-N*(Math.sin(a)*Math.sin(a))),i=h*(1-N)/(1-N*Math.sin(a)*Math.sin(a)),o=h/i-1,M=Math.tan(a)*Math.tan(a),H=Math.pow(Math.tan(a),4),O=Math.pow(Math.tan(a),6),l=Math.pow(Math.cos(a),-1),J=Math.tan(a)/(2*i*h),c=Math.tan(a)/(24*i*(h*h*h))*(5+3*M+o-9*o*M),g=Math.tan(a)/(720*i*Math.pow(h,5))*(61+90*M+45*H),U=a-r*r*J+Math.pow(r,4)*c-Math.pow(r,6)*g,L=Math.pow(Math.cos(a),-1)/h,u=l/(h*h*h*6)*(h/i+2*M),C=l/(120*Math.pow(h,5))*(5+28*M+24*H),Y=l/(5040*Math.pow(h,7))*(61+662*M+1320*H+720*O),f=r*L-.0523598775598-r*r*r*u+Math.pow(r,5)*C-Math.pow(r,7)*Y,P=n(U,f);return new T(P.lat*t,P.lng*t)}to_gridref(S){return this.y>=55e5?i("WA",this.x-5e5,this.y-55e5,S||1):this.y<55e5?i("WV",this.x-5e5,this.y-54e5,S||1):null}to_hectad(){return this.y>55e5?"WA"+this.x.toString().substring(1,2)+this.y.toString().substring(2,3):this.y<55e5?"WV"+this.x.toString().substring(1,2)+this.y.toString().substring(2,3):null}}const n=function(S,N){return e._transform(S,N,6378388,.0067226700223333,10,6378137,.00669438037928458,-83.901,-98.127,-118.635,0,0,0,0)},d=function(S,N,t,T,s,r){for(var a=(S-N)/t+T,h=e._Marc(r,s,T,a),i=(S-N-h)/t+a,o=0;Math.abs(S-N-h)>1e-5&&o<20;)o+=1,i=(S-N-h)/t+a,h=e._Marc(r,s,T,i),a=i;return i};class M extends S{country="CI";GridCoords=o;gridCoords=null;constructor(){super(),this.parse_well_formed=this.from_string;}from_string(N){let t,e=N.replace(/[\[\]\s\t.\/-]+/g,"").toUpperCase(),T="";/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(e)&&(S.quadrantOffsets.hasOwnProperty(e.substr(e.length-2))?(this.quadrantCode=e.substr(e.length-2),e=e.substr(0,e.length-2)):(T=e.substr(e.length-1),e=e.substr(0,e.length-1))),/^(W[AV](?:\d\d){1,5})$/.test(e)?(t=M.gridref_string_to_e_n_l(e))?(this.length=t.length,this.gridCoords=new o(t.e,t.n),this.hectad=this.gridCoords.to_gridref(1e4),1e4===this.length&&(T||this.quadrantCode)?T?(this.preciseGridRef=e+T,this.tetrad=this.hectad+T,this.tetradLetter=T,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[T][0],this.gridCoords.y+=S.tetradOffsets[T][1]):(this.preciseGridRef=e+this.quadrantCode,this.tetradLetter="",this.tetrad="",this.quadrant=this.preciseGridRef,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=e,this.length<=1e3&&this.set_tetrad())):(this.error=!0,this.errorMessage="Grid reference format not understood (odd length)."):(this.error=!0,this.errorMessage="Channel Island grid reference format not understood. ('"+N+"')");}static gridref_string_to_e_n_l(S){let N,t,e,T,s=S.substr(0,2);if("WA"===s)N=55e5;else {if("WV"!==s)return console.log("Bad Channel Island grid letters: '"+s+"'"),!1;N=54e5;}let r=S.substr(2);switch(r.length){case 2:t=1e4*r.charAt(0),e=1e4*r.charAt(1),T=1e4;break;case 4:t=1e3*r.substr(0,2),e=1e3*r.substr(2),T=1e3;break;case 6:t=100*r.substr(0,3),e=100*r.substr(3),T=100;break;case 8:t=10*r.substr(0,4),e=10*r.substr(4),T=10;break;case 10:t=parseInt(r.substr(0,5),10),e=parseInt(r.substr(5),10),T=1;break;default:return console.log("Bad length for Channel Island grid ref '"+S+"'"),!1}return {e:t+5e5,n:e+N,length:T}}}class H extends h{gridCoords=null;constructor(S,N){super(),this.x=S,this.y=N;}country="GB";static gbHectads="SV80SV81SV90SV91SW32SW33SW42SW43SW44SW52SW53SW54SW61SW62SW63SW64SW65SW71SW72SW73SW74SW75SW76SW81SW82SW83SW84SW85SW86SW87SW95SW96SW97SS10SS11SS20SS21SS30SW83SW84SW85SW93SW94SW95SW96SW97SW98SX03SX04SX05SX06SX07SX08SX09SX14SX15SX16SX17SX18SX19SX25SX26SX27SX28SX29SX35SX36SX37SX38SX39SX44SX45SX46SX47SS70SS80SS81SS90SS91ST00ST01ST10ST11ST20ST21ST30SX37SX44SX45SX46SX47SX48SX54SX55SX56SX57SX58SX63SX64SX65SX66SX67SX68SX69SX73SX74SX75SX76SX77SX78SX79SX83SX84SX85SX86SX87SX88SX89SX94SX95SX96SX97SX98SX99SY07SY08SY09SY18SY19SY28SY29SY38SY39SS14SS20SS21SS22SS30SS31SS32SS40SS41SS42SS43SS44SS50SS51SS52SS53SS54SS60SS61SS62SS63SS64SS70SS71SS72SS73SS74SS75SS80SS81SS82SS83SS91SS92ST01ST02SX28SX29SX37SX38SX39SX48SX49SX58SX59SX68SX69SX79SS73SS74SS82SS83SS84SS92SS93SS94ST01ST02ST03ST04ST11ST12ST13ST14ST20ST21ST22ST23ST24ST25ST30ST31ST32ST33ST34ST40ST41ST42ST50ST51ST52ST61ST62ST71ST72ST24ST25ST26ST32ST33ST34ST35ST36ST37ST42ST43ST44ST45ST46ST47ST52ST53ST54ST55ST56ST57ST62ST63ST64ST65ST66ST67ST72ST73ST74ST75ST76ST77ST83ST84ST85ST86SP00SP10ST76ST77ST85ST86ST87ST88ST89ST96ST97ST98ST99SU06SU07SU08SU09SU16SU17SU18SU19SU26SU27SU28SU29SU36SU37ST73ST74ST75ST76ST82ST83ST84ST85ST86ST91ST92ST93ST94ST95ST96SU01SU02SU03SU04SU05SU06SU11SU12SU13SU14SU15SU16SU21SU22SU23SU24SU25SU26SU31SU32SU34SU35SU36ST20ST30ST40ST50ST51ST60ST61ST70ST71ST72ST73ST80ST81ST82ST83ST90ST91ST92SU00SU01SU02SU10SU11SY39SY48SY49SY58SY59SY66SY67SY68SY69SY77SY78SY79SY87SY88SY89SY97SY98SY99SZ07SZ08SZ09SZ28SZ38SZ39SZ47SZ48SZ49SZ57SZ58SZ59SZ68SZ69SU00SU01SU02SU10SU11SU12SU20SU21SU22SU23SU30SU31SU32SU33SU40SU41SU42SU43SU50SU51SU52SU60SU61SU62SU70SU71SU72SZ08SZ09SZ19SZ29SZ38SZ39SZ49SZ59SZ69SZ79SU23SU24SU25SU33SU34SU35SU36SU42SU43SU44SU45SU46SU52SU53SU54SU55SU56SU62SU63SU64SU65SU66SU72SU73SU74SU75SU76SU82SU83SU84SU85SU86SU70SU71SU72SU80SU81SU82SU83SU90SU91SU92SU93SZ79SZ89SZ99TQ00TQ01TQ02TQ03TQ10TQ11TQ12TQ13TQ20TQ21TQ22TQ23TQ30TQ31TQ32TQ20TQ21TQ22TQ23TQ30TQ31TQ32TQ33TQ40TQ41TQ42TQ43TQ44TQ50TQ51TQ52TQ53TQ54TQ60TQ61TQ62TQ63TQ70TQ71TQ72TQ80TQ81TQ82TQ91TQ92TV49TV59TV69TQ65TQ72TQ73TQ74TQ75TQ76TQ77TQ82TQ83TQ84TQ85TQ86TQ87TQ91TQ92TQ93TQ94TQ95TQ96TQ97TR01TR02TR03TR04TR05TR06TR07TR12TR13TR14TR15TR16TR23TR24TR25TR26TR27TR33TR34TR35TR36TR37TR46TR47TQ35TQ36TQ37TQ38TQ43TQ44TQ45TQ46TQ47TQ48TQ53TQ54TQ55TQ56TQ57TQ58TQ63TQ64TQ65TQ66TQ67TQ72TQ73TQ74TQ75TQ76TQ77TQ78TQ87TQ88TQ97SU83SU84SU85SU86SU93SU94SU95SU96SU97TQ03TQ04TQ05TQ06TQ07TQ13TQ14TQ15TQ16TQ17TQ23TQ24TQ25TQ26TQ27TQ33TQ34TQ35TQ36TQ37TQ38TQ43TQ44TQ45TL30TL40TL50TL60TL70TL80TL90TM00TQ38TQ39TQ47TQ48TQ49TQ57TQ58TQ59TQ67TQ68TQ69TQ77TQ78TQ79TQ88TQ89TQ98TQ99TR08TR09TR19TL30TL31TL34TL40TL41TL42TL43TL44TL50TL51TL52TL53TL54TL60TL61TL62TL63TL64TL70TL71TL72TL73TL74TL80TL81TL82TL83TL84TL90TL91TL92TL93TM01TM02TM03TM11TM12TM13TM21TM22TM23TQ49SP81SP90SP91TL00TL01TL02TL10TL11TL12TL13TL20TL21TL22TL23TL24TL30TL31TL32TL33TL34TL41TL42TL43TL44TL51TL52TQ09TQ19TQ29TQ39TL20TL30TQ06TQ07TQ08TQ09TQ16TQ17TQ18TQ19TQ27TQ28TQ29TQ37TQ38TQ39SP20SP30SP40SP41SP50SU19SU26SU27SU28SU29SU36SU37SU38SU39SU46SU47SU48SU49SU56SU57SU58SU59SU66SU67SU68SU69SU76SU77SU78SU86SU87SU88SU96SU97SU98SP10SP20SP21SP22SP23SP30SP31SP32SP33SP34SP40SP41SP42SP43SP44SP45SP50SP51SP52SP53SP54SP60SP61SP62SP63SP70SU29SU39SU49SU57SU58SU59SU67SU68SU69SU77SU78SU79SP51SP53SP60SP61SP62SP63SP64SP70SP71SP72SP73SP74SP80SP81SP82SP83SP84SP85SP90SP91SP92SP93SP94SP95SU78SU79SU88SU89SU97SU98SU99TL00TL01TQ07TQ08TQ09TG40TG50TM03TM04TM05TM06TM07TM13TM14TM15TM16TM17TM23TM24TM25TM26TM27TM28TM33TM34TM35TM36TM37TM38TM39TM44TM45TM46TM47TM48TM49TM57TM58TM59TL64TL65TL66TL67TL68TL74TL75TL76TL77TL78TL83TL84TL85TL86TL87TL88TL93TL94TL95TL96TL97TL98TM03TM04TM05TM06TM07TM08TG00TG01TG02TG03TG04TG10TG11TG12TG13TG14TG20TG21TG22TG23TG24TG30TG31TG32TG33TG40TG41TG42TG50TG51TM07TM08TM09TM17TM18TM19TM27TM28TM29TM38TM39TM49TM59TF40TF41TF42TF50TF51TF52TF53TF60TF61TF62TF63TF64TF70TF71TF72TF73TF74TF80TF81TF82TF83TF84TF90TF91TF92TF93TF94TG00TG01TG02TG03TG04TL49TL59TL68TL69TL78TL79TL87TL88TL89TL98TL99TM07TM08TM09TF20TF30TF31TF40TF41TF50TL15TL19TL23TL24TL25TL26TL28TL29TL33TL34TL35TL36TL37TL38TL39TL44TL45TL46TL47TL48TL49TL54TL55TL56TL57TL58TL59TL63TL64TL65TL66TL67TL68TL69TL75TL76SP91SP92SP93SP94SP95SP96TL01TL02TL03TL04TL05TL06TL07TL11TL12TL13TL14TL15TL16TL23TL24TL25TL06TL07TL08TL09TL15TL16TL17TL18TL19TL25TL26TL27TL28TL29TL36TL37TL38TL39SK90SP43SP44SP45SP46SP53SP54SP55SP56SP57SP58SP63SP64SP65SP66SP67SP68SP73SP74SP75SP76SP77SP78SP79SP84SP85SP86SP87SP88SP89SP95SP96SP97SP98SP99TF00TF10TF20TL06TL07TL08TL09TL18TL19TL29SO70SO71SO80SO81SO82SO83SO90SO91SO92SO93SO94SP00SP01SP02SP03SP04SP10SP11SP12SP13SP14SP15SP20SP21SP22SP23SP24SP25ST99SU09SU19SU29SO50SO51SO60SO61SO62SO63SO70SO71SO72SO73SO80SO81SO82SO83SO90ST57ST58ST59ST66ST67ST68ST69ST76ST77ST78ST79ST87ST88ST89ST98ST99SO10SO11SO20SO21SO22SO23SO30SO31SO32SO40SO41SO42SO50SO51ST18ST19ST27ST28ST29ST37ST38ST39ST47ST48ST49ST58ST59SO22SO23SO24SO25SO26SO32SO33SO34SO35SO36SO37SO41SO42SO43SO44SO45SO46SO47SO51SO52SO53SO54SO55SO56SO57SO61SO62SO63SO64SO65SO66SO73SO74SO75SO76SO56SO64SO65SO66SO67SO72SO73SO74SO75SO76SO77SO78SO82SO83SO84SO85SO86SO87SO88SO93SO94SO95SO96SO97SO98SO99SP03SP04SP05SP06SP07SP08SP13SP14SP16SP17SP18SK10SK20SK30SP04SP05SP06SP07SP08SP09SP14SP15SP16SP17SP18SP19SP22SP23SP24SP25SP26SP27SP28SP29SP33SP34SP35SP36SP37SP38SP39SP44SP45SP46SP47SP48SP49SP55SP56SP57SP58SJ63SJ70SJ71SJ72SJ73SJ74SJ75SJ80SJ81SJ82SJ83SJ84SJ85SJ86SJ90SJ91SJ92SJ93SJ94SJ95SJ96SK00SK01SK02SK03SK04SK05SK06SK10SK11SK12SK13SK14SK15SK16SK20SK21SK22SO77SO78SO79SO88SO89SO98SO99SP08SP09SP19SP29SJ20SJ21SJ22SJ23SJ30SJ31SJ32SJ33SJ34SJ40SJ41SJ42SJ43SJ50SJ51SJ52SJ53SJ54SJ60SJ61SJ62SJ63SJ64SJ70SJ71SJ72SJ73SJ74SJ80SO17SO18SO27SO28SO29SO37SO38SO39SO46SO47SO48SO49SO56SO57SO58SO59SO66SO67SO68SO69SO77SO78SO79SO88SO89SN50SN60SN61SN70SN71SN80SN81SN90SO00SO01SO10SO11SS38SS39SS48SS49SS58SS59SS68SS69SS77SS78SS79SS87SS88SS89SS96SS97SS98SS99ST06ST07ST08ST09ST16ST17ST18ST19ST26ST27ST28SN70SN71SN74SN80SN81SN82SN83SN84SN85SN86SN90SN91SN92SN93SN94SN95SN96SO00SO01SO02SO03SO04SO05SO06SO10SO11SO12SO13SO14SO21SO22SO23SO24SN86SN87SN96SN97SO04SO05SO06SO07SO08SO13SO14SO15SO16SO17SO18SO24SO25SO26SO27SO36SO37SN01SN02SN10SN11SN12SN20SN21SN22SN23SN24SN30SN31SN32SN33SN34SN40SN41SN42SN43SN44SN50SN51SN52SN53SN54SN60SN61SN62SN63SN64SN65SN71SN72SN73SN74SN75SN81SN82SN83SN84SS39SS49SS59SM50SM62SM70SM71SM72SM73SM80SM81SM82SM83SM84SM90SM91SM92SM93SM94SN00SN01SN02SN03SN04SN10SN11SN12SN13SN14SN22SN23SN24SR89SR99SS09SS19SN14SN15SN24SN25SN33SN34SN35SN36SN44SN45SN46SN54SN55SN56SN57SN58SN64SN65SN66SN67SN68SN69SN74SN75SN76SN77SN78SN79SN84SN85SN86SN87SN88SN89SH70SH71SH80SH81SH90SH91SH92SJ00SJ01SJ02SJ03SJ10SJ11SJ12SJ20SJ21SJ22SJ31SN69SN78SN79SN87SN88SN89SN97SN98SN99SO07SO08SO09SO18SO19SO28SO29SO39SH50SH51SH52SH53SH54SH60SH61SH62SH63SH64SH70SH71SH72SH73SH74SH80SH81SH82SH83SH84SH91SH92SH93SH94SH95SJ03SJ04SJ05SJ13SJ14SN59SN69SN79SH12SH13SH22SH23SH24SH32SH33SH34SH43SH44SH45SH46SH53SH54SH55SH56SH57SH64SH65SH66SH67SH74SH75SH76SH77SH78SH84SH85SH86SH87SH88SH74SH75SH76SH77SH84SH85SH86SH87SH88SH94SH95SH96SH97SH98SJ02SJ03SJ04SJ05SJ06SJ07SJ08SJ12SJ13SJ14SJ15SJ16SJ17SJ22SJ23SJ24SJ25SJ26SJ33SJ34SJ35SJ43SJ44SJ45SJ53SJ54SH97SH98SJ06SJ07SJ08SJ15SJ16SJ17SJ18SJ25SJ26SJ27SJ35SJ36SJ37SH27SH28SH29SH36SH37SH38SH39SH46SH47SH48SH49SH56SH57SH58SH59SH67SH68SK81SK82SK83SK84SK85SK86SK87SK90SK91SK92SK93SK94SK95SK96SK97TF00TF01TF02TF03TF04TF05TF06TF07TF10TF11TF12TF13TF14TF15TF16TF17TF20TF21TF22TF23TF24TF25TF30TF31TF32TF33TF34TF41TF42TF43TF44TF52SE60SE70SE71SE80SE81SE82SE90SE91SE92SK78SK79SK87SK88SK89SK97SK98SK99TA00TA01TA02TA10TA11TA12TA20TA21TA30TA31TA40TF07TF08TF09TF15TF16TF17TF18TF19TF24TF25TF26TF27TF28TF29TF33TF34TF35TF36TF37TF38TF39TF43TF44TF45TF46TF47TF48TF49TF54TF55TF56TF57TF58SK20SK21SK30SK31SK32SK40SK41SK42SK43SK50SK51SK52SK60SK61SK62SK70SK71SK72SK73SK74SK80SK81SK82SK83SK84SK90SK91SP39SP48SP49SP57SP58SP59SP68SP69SP78SP79SP89SP99TF00TF01SE60SE70SK42SK43SK44SK45SK46SK52SK53SK54SK55SK56SK57SK58SK59SK62SK63SK64SK65SK66SK67SK68SK69SK72SK73SK74SK75SK76SK77SK78SK79SK84SK85SK86SK87SK88SK89SK97SJ98SJ99SK03SK06SK07SK08SK09SK11SK12SK13SK14SK15SK16SK17SK18SK19SK21SK22SK23SK24SK25SK26SK27SK28SK31SK32SK33SK34SK35SK36SK37SK38SK42SK43SK44SK45SK46SK47SK48SK53SK56SK57SD90SE00SE10SJ18SJ19SJ27SJ28SJ29SJ35SJ36SJ37SJ38SJ39SJ44SJ45SJ46SJ47SJ48SJ54SJ55SJ56SJ57SJ58SJ63SJ64SJ65SJ66SJ67SJ68SJ69SJ74SJ75SJ76SJ77SJ78SJ79SJ85SJ86SJ87SJ88SJ89SJ96SJ97SJ98SJ99SK06SK07SK08SK09SK19SD20SD21SD22SD30SD31SD32SD40SD41SD42SD50SD51SD52SD53SD60SD61SD62SD63SD70SD71SD72SD73SD74SD80SD81SD82SD83SD84SD90SD91SD92SD93SD94SJ29SJ38SJ39SJ48SJ49SJ58SJ59SJ68SJ69SJ79SJ88SJ89SJ99SD22SD23SD32SD33SD34SD35SD36SD42SD43SD44SD45SD46SD47SD52SD53SD54SD55SD56SD57SD63SD64SD65SD66SD67SD68SD73SD78SE53SE54SE62SE63SE64SE65SE72SE73SE74SE75SE76SE82SE83SE84SE85SE86SE87SE92SE93SE94SE95SE96SE97SE98TA02TA03TA04TA05TA06TA07TA08TA12TA13TA14TA15TA16TA17TA18TA21TA22TA23TA24TA26TA27TA31TA32TA33TA41TA42NZ30NZ31NZ40NZ41NZ42NZ50NZ51NZ52NZ60NZ61NZ62NZ70NZ71NZ72NZ80NZ81NZ90NZ91SE37SE38SE39SE46SE47SE48SE49SE55SE56SE57SE58SE59SE64SE65SE66SE67SE68SE69SE75SE76SE77SE78SE79SE86SE87SE88SE89SE97SE98SE99TA08TA09TA18SD84SD90SD91SD92SD93SD94SD95SE00SE01SE02SE03SE04SE10SE11SE12SE13SE14SE20SE21SE22SE23SE30SE31SE32SE33SE40SE41SE42SE50SE51SE52SE60SE61SE62SE70SE71SE72SE81SE82SK18SK19SK28SK29SK38SK39SK47SK48SK49SK57SK58SK59SK69SD54SD55SD64SD65SD66SD67SD68SD73SD74SD75SD76SD77SD78SD84SD85SD86SD87SD88SD94SD95SD96SD97SD98SE04SE05SE06SE07SE13SE14SE15SE16SE17SE23SE24SE25SE26SE27SE32SE33SE34SE35SE36SE37SE42SE43SE44SE45SE46SE52SE53SE54SE55SE56SE62SE63SE64SE65SE72NY72NY80NY81NY82NY90NY91NY92NZ00NZ01NZ02NZ10NZ11NZ20NZ21NZ30NZ31SD68SD69SD78SD79SD88SD89SD97SD98SD99SE07SE08SE09SE17SE18SE19SE27SE28SE29SE36SE37SE38SE39SE46SE47NY73NY74NY82NY83NY84NY92NY93NY94NY95NZ01NZ02NZ03NZ04NZ05NZ11NZ12NZ13NZ14NZ15NZ16NZ20NZ21NZ22NZ23NZ24NZ25NZ26NZ30NZ31NZ32NZ33NZ34NZ35NZ36NZ41NZ42NZ43NZ44NZ45NZ46NZ52NZ53NT60NT70NT80NT90NU00NU10NU20NY58NY59NY64NY65NY66NY67NY68NY69NY74NY75NY76NY77NY78NY79NY84NY85NY86NY87NY88NY89NY94NY95NY96NY97NY98NY99NZ04NZ05NZ06NZ07NZ08NZ09NZ15NZ16NZ17NZ18NZ19NZ26NZ27NZ28NZ29NZ36NZ37NZ38NZ39NT70NT71NT73NT80NT81NT82NT83NT84NT90NT91NT92NT93NT94NT95NU00NU01NU02NU03NU04NU05NU10NU11NU12NU13NU14NU20NU21NU22NU23NZ09NZ19NY20NY21NY30NY31NY40NY41NY42NY50NY51NY52NY53NY60NY61NY62NY63NY70NY71NY72NY73NY80NY81NY82NY83SD16SD17SD18SD19SD26SD27SD28SD29SD36SD37SD38SD39SD46SD47SD48SD49SD57SD58SD59SD67SD68SD69SD78SD79SD89NX90NX91NX92NX93NY00NY01NY02NY03NY04NY05NY10NY11NY12NY13NY14NY15NY16NY20NY21NY22NY23NY24NY25NY26NY31NY32NY33NY34NY35NY36NY37NY41NY42NY43NY44NY45NY46NY47NY48NY52NY53NY54NY55NY56NY57NY58NY62NY63NY64NY65NY66NY67NY68NY73NY74NY75NY84SD08SD09SD17SD18SD19SD28SD29NX30NX40SC16SC17SC26SC27SC28SC36SC37SC38SC39SC47SC48SC49NS60NS61NS70NS71NS72NS80NS81NS90NT00NT01NT10NT11NT20NT21NT30NX69NX78NX79NX88NX89NX96NX97NX98NX99NY05NY06NY07NY08NY09NY16NY17NY18NY19NY26NY27NY28NY29NY36NY37NY38NY39NY47NY48NY49NS50NS60NX36NX37NX38NX45NX46NX47NX48NX49NX54NX55NX56NX57NX58NX59NX64NX65NX66NX67NX68NX69NX74NX75NX76NX77NX78NX79NX84NX85NX86NX87NX88NX95NX96NX97NX98NY05NY06NW95NW96NW97NX03NX04NX05NX06NX07NX13NX14NX15NX16NX17NX24NX25NX26NX27NX33NX34NX35NX36NX37NX43NX44NX45NX46NS00NS10NS14NS15NS16NS20NS21NS23NS24NS25NS26NS30NS31NS32NS33NS34NS35NS36NS40NS41NS42NS43NS44NS45NS50NS51NS52NS53NS54NS55NS60NS61NS62NS63NS64NS71NS72NS73NX07NX08NX09NX17NX18NX19NX27NX28NX29NX37NX38NX39NX48NX49NX59NS16NS17NS26NS27NS35NS36NS37NS44NS45NS46NS47NS54NS55NS56NS64NS65NS66NS53NS54NS55NS56NS57NS63NS64NS65NS66NS67NS71NS72NS73NS74NS75NS76NS77NS80NS81NS82NS83NS84NS85NS86NS87NS90NS91NS92NS93NS94NS95NS96NT00NT01NT02NT03NT04NT05NT14NT01NT02NT03NT04NT05NT11NT12NT13NT14NT15NT21NT22NT23NT24NT25NT32NT33NT34NT10NT11NT20NT21NT22NT23NT30NT31NT32NT33NT34NT41NT42NT43NT44NT53NT20NT30NT31NT40NT41NT42NT43NT44NT50NT51NT52NT53NT54NT60NT61NT62NT63NT64NT70NT71NT72NT73NT74NT81NT82NT83NY39NY47NY48NY49NY58NY59NY69NT44NT45NT46NT53NT54NT55NT56NT63NT64NT65NT66NT73NT74NT75NT76NT77NT83NT84NT85NT86NT87NT94NT95NT96NT36NT37NT45NT46NT47NT48NT55NT56NT57NT58NT65NT66NT67NT68NT76NT77NS95NS96NT05NT06NT15NT16NT17NT24NT25NT26NT27NT34NT35NT36NT37NT43NT44NT45NT46NS86NS87NS95NS96NS97NS98NT06NT07NT08NT16NT17NO00NO01NO10NO11NO20NO21NO22NO30NO31NO32NO40NO41NO42NO50NO51NO52NO60NO61NS99NT08NT09NT18NT19NT28NT29NT39NT49NT59NT69NN30NN31NN40NN41NS38NS39NS47NS48NS49NS57NS58NS59NS67NS68NS69NS77NS78NS79NS86NS87NS88NS89NS97NS98NN21NN22NN30NN31NN32NN40NN41NN42NN50NN51NN52NN60NN61NN70NN71NN80NN81NN90NN91NO00NS49NS59NS69NS79NS88NS89NS98NS99NT08NT09NN22NN23NN32NN33NN34NN35NN42NN43NN44NN45NN46NN47NN51NN52NN53NN54NN55NN56NN57NN61NN62NN63NN64NN65NN66NN67NN71NN72NN73NN74NN75NN76NN77NN81NN82NN83NN84NN85NN86NN90NN91NN92NN93NN94NN95NN96NO00NO01NO02NO03NO04NO11NO12NO13NO21NN56NN57NN66NN67NN68NN76NN77NN78NN86NN87NN88NN94NN95NN96NN97NN98NO02NO03NO04NO05NO06NO07NO08NO11NO12NO13NO14NO15NO16NO17NO21NO22NO23NO24NO25NO32NO33NO34NO15NO16NO17NO23NO24NO25NO26NO27NO28NO32NO33NO34NO35NO36NO37NO38NO42NO43NO44NO45NO46NO47NO48NO53NO54NO55NO56NO57NO58NO63NO64NO65NO66NO67NO74NO75NO76NJ60NJ70NJ80NJ90NO57NO58NO66NO67NO68NO69NO76NO77NO78NO79NO86NO87NO88NO89NO99NH90NJ00NJ10NJ11NJ20NJ21NJ30NJ31NJ32NJ40NJ41NJ42NJ50NJ51NJ52NJ60NJ61NJ62NJ70NJ71NJ72NJ80NJ81NJ82NJ90NJ91NJ92NK02NN98NN99NO07NO08NO09NO17NO18NO19NO27NO28NO29NO37NO38NO39NO48NO49NO58NO59NO68NO69NO79NO89NJ31NJ32NJ33NJ34NJ42NJ43NJ44NJ52NJ53NJ54NJ55NJ62NJ63NJ64NJ65NJ72NJ73NJ74NJ75NJ76NJ82NJ83NJ84NJ85NJ86NJ92NJ93NJ94NJ95NJ96NK02NK03NK04NK05NK06NK13NK14NK15NH90NJ00NJ01NJ10NJ11NJ12NJ13NJ14NJ21NJ22NJ23NJ24NJ25NJ32NJ33NJ34NJ35NJ36NJ42NJ43NJ44NJ45NJ46NJ54NJ55NJ56NJ64NJ65NJ66NJ74NJ75NJ76NJ86NN99NH72NH81NH82NH91NH92NH93NH94NH95NH96NJ00NJ01NJ02NJ03NJ04NJ05NJ06NJ11NJ12NJ13NJ14NJ15NJ16NJ17NJ23NJ24NJ25NJ26NJ27NJ34NJ35NJ36NJ45NH01NH02NH10NH11NH12NH13NH14NH20NH21NH22NH23NH24NH30NH31NH32NH33NH34NH40NH41NH42NH43NH44NH50NH51NH52NH53NH54NH60NH61NH62NH63NH64NH70NH71NH72NH73NH74NH75NH80NH81NH82NH83NH84NH85NH90NH91NH92NH93NH94NH95NH96NJ00NJ01NN39NN46NN47NN48NN49NN56NN57NN58NN59NN67NN68NN69NN77NN78NN79NN88NN89NN98NN99NG60NG70NG71NG72NG80NG81NG82NG90NG91NH00NH01NH10NH20NH30NM46NM47NM54NM55NM56NM57NM64NM65NM66NM67NM68NM69NM74NM75NM76NM77NM78NM79NM84NM85NM86NM87NM88NM89NM95NM96NM97NM98NM99NN05NN06NN07NN08NN09NN16NN17NN18NN19NN26NN27NN28NN29NN35NN36NN37NN38NN39NN46NN47NN48NN49NN57NN58NN59NM70NM71NM72NM73NM80NM81NM82NM83NM84NM90NM91NM92NM93NM94NM95NN00NN01NN02NN03NN04NN05NN10NN11NN12NN13NN14NN15NN16NN20NN21NN22NN23NN24NN25NN26NN30NN33NN34NN35NN36NN44NN45NN46NR79NR88NR89NR96NR97NR98NR99NS06NS07NS08NS09NS16NS17NS18NS19NS28NS29NN20NN21NN30NN31NS28NS29NS37NS38NS39NS46NS47NS48NS56NS57NR82NR83NR84NR92NR93NR94NR95NR96NR97NS01NS02NS03NS04NS05NS06NS07NS15NS16NR50NR51NR60NR61NR62NR63NR64NR65NR67NR68NR70NR71NR72NR73NR74NR75NR76NR77NR78NR79NR83NR84NR85NR86NR87NR88NR89NR95NR96NM40NM60NM61NM70NM71NR15NR16NR24NR25NR26NR27NR34NR35NR36NR37NR38NR39NR44NR45NR46NR47NR48NR49NR56NR57NR58NR59NR67NR68NR69NR79NL93NL94NM04NM05NM15NM16NM21NM22NM23NM24NM25NM26NM31NM32NM33NM34NM35NM41NM42NM43NM44NM45NM51NM52NM53NM54NM55NM61NM62NM63NM64NM72NM73NG13NG14NG15NG20NG23NG24NG25NG26NG30NG31NG32NG33NG34NG35NG36NG37NG38NG40NG41NG42NG43NG44NG45NG46NG47NG50NG51NG52NG53NG54NG55NG56NG60NG61NG62NG63NG64NG65NG66NG71NG72NG82NM19NM29NM37NM38NM39NM47NM48NM49NM59NB90NB91NC00NC01NC10NC11NC20NC21NG63NG64NG65NG72NG73NG74NG75NG76NG77NG78NG79NG82NG83NG84NG85NG86NG87NG88NG89NG91NG92NG93NG94NG95NG96NG97NG98NG99NH00NH01NH02NH03NH04NH05NH06NH07NH08NH09NH10NH11NH15NH16NH17NH18NH19NH27NH28NH29NC10NC20NC21NC30NC31NC40NH02NH03NH04NH05NH06NH07NH12NH13NH14NH15NH16NH17NH19NH23NH24NH25NH26NH27NH28NH29NH34NH35NH36NH37NH38NH39NH44NH45NH46NH47NH48NH49NH54NH55NH56NH57NH58NH59NH64NH65NH66NH67NH68NH69NH75NH76NH77NH78NH86NH87NH88NH97NH98NC22NC30NC31NC32NC33NC40NC41NC42NC43NC50NC51NC52NC60NC61NC62NC63NC70NC71NC72NC73NC74NC80NC81NC82NC83NC84NC90NC91NC92NC93ND01ND02NH49NH59NH68NH69NH78NH79NH88NH89NC01NC02NC03NC10NC11NC12NC13NC14NC15NC16NC20NC21NC22NC23NC24NC25NC26NC27NC31NC32NC33NC34NC35NC36NC37NC42NC43NC44NC45NC46NC52NC53NC54NC55NC56NC62NC63NC64NC65NC66NC73NC74NC75NC76NC83NC84NC85NC86NC93NC94NC95NC96NC92NC93NC94NC95NC96ND01ND02ND03ND04ND05ND06ND07ND12ND13ND14ND15ND16ND17ND23ND24ND25ND26ND27ND33ND34ND35ND36ND37ND47HW63HW83HX62NA00NA10NA64NA74NA81NA90NA91NA92NA93NB00NB01NB02NB03NB10NB11NB12NB13NB14NB20NB21NB22NB23NB24NB30NB31NB32NB33NB34NB35NB40NB41NB42NB43NB44NB45NB46NB52NB53NB54NB55NB56NF09NF19NF56NF58NF60NF61NF66NF67NF68NF70NF71NF72NF73NF74NF75NF76NF77NF80NF81NF82NF83NF84NF85NF86NF87NF88NF89NF95NF96NF97NF98NF99NG07NG08NG09NG18NG19NG29NG49NL57NL58NL68NL69NL79HY10HY20HY21HY22HY23HY30HY31HY32HY33HY34HY35HY40HY41HY42HY43HY44HY45HY50HY51HY52HY53HY54HY55HY60HY61HY62HY63HY64HY73HY74HY75ND19ND28ND29ND38ND39ND47ND48ND49ND59HP40HP50HP51HP60HP61HT93HT94HU14HU15HU16HU24HU25HU26HU27HU28HU30HU31HU32HU33HU34HU35HU36HU37HU38HU39HU40HU41HU42HU43HU44HU45HU46HU47HU48HU49HU53HU54HU55HU56HU57HU58HU59HU66HU67HU68HU69HZ16HZ17HZ26HZ27";to_gridref(S){const N=this.x/1e5|0,t=this.y/1e5|0;let e;e=t<5?N<5?"S":"T":t<10?N<5?"N":"O":N<5?"H":"J";let T=65+5*(4-t%5)+N%5;T>=73&&T++;const s=String.fromCharCode(T);return i(e+s,this.x-1e5*N,this.y-1e5*t,S||1)}to_hectad(){const S=this.x/1e5|0,N=this.y/1e5|0;let t;t=N<5?S<5?"S":"T":N<10?S<5?"N":"O":S<5?"H":"J";let e=65+5*(4-N%5)+S%5;return e>=73&&e++,t+String.fromCharCode(e)+((this.x-1e5*S)/1e4|0)+((this.y-1e5*N)/1e4|0)}is_gb_hectad(){return -1!==H.gbHectads.indexOf(this.to_hectad())}to_latLng(){const S=4e5,N=.85521133347722,e=6377563.396,T=.00667054007,r=this.x,a=this.y,h=.0016732203289875;let i,o=(a+1e5)/(.9996012717*e)+N;do{i=a+1e5-6353722.489*(1.0016767257674*(o-N)-.00502807228247412*Math.sin(o-N)*Math.cos(o+N)+(1.875*h*h+1.875*h*h*h)*Math.sin(2*(o-N))*Math.cos(2*(o+N))-35/24*h*h*h*Math.sin(3*(o-N))*Math.cos(3*(o+N))),o+=i/6375020.48098897;}while(i>=.001);const n=Math.sin(o)*Math.sin(o),d=Math.tan(o)*Math.tan(o),M=1/Math.cos(o),H=.9996012717*e*Math.pow(1-T*n,-.5),O=6332495.651423464*Math.pow(1-T*n,-1.5),l=H/O-1,J=Math.tan(o)/(2*O*H),c=Math.tan(o)/(24*O*Math.pow(H,3))*(5+3*d+l-9*d*l),g=Math.tan(o)/(720*O*Math.pow(H,5))*(61+90*d+45*d*d),U=M/H,L=M/(6*H*H*H)*(H/O+2*d),u=M/(120*Math.pow(H,5))*(5+28*d+24*d*d),C=M/(5040*Math.pow(H,7))*(61+662*d+1320*d*d+720*d*d*d),Y=o-J*Math.pow(r-S,2)+c*Math.pow(r-S,4)-g*Math.pow(r-S,6),f=U*(r-S)-.034906585039887-L*Math.pow(r-S,3)+u*Math.pow(r-S,5)-C*Math.pow(r-S,7);return new s(t*Y,t*f).to_WGS84()}}class O extends S{country="GB";GridCoords=H;gridCoords=null;constructor(){super();}parse_well_formed(N){N.length>=5&&/^[A-Z]/.test(N.charAt(4))&&(S.quadrantOffsets.hasOwnProperty(N.substr(N.length-2))?this.quadrantCode=N.substr(N.length-2):this.tetradLetter=N.charAt(4),N=N.substr(0,4)),this.parse_wellformed_gb_gr_string_no_tetrads(N),this.tetradLetter||this.quadrantCode?this.tetradLetter?(this.preciseGridRef=this.tetrad=this.hectad+this.tetradLetter,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[this.tetradLetter][0],this.gridCoords.y+=S.tetradOffsets[this.tetradLetter][1]):(this.preciseGridRef=this.quadrant=N+this.quadrantCode,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=N,this.length<=1e3&&this.set_tetrad());}from_string(N){let t,e=N.replace(/[\[\]\s\t.-]+/g,"").toUpperCase(),T="";if(/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(e)&&(S.quadrantOffsets.hasOwnProperty(e.substr(e.length-2))?(this.quadrantCode=e.substr(e.length-2),e=e.substr(0,e.length-2)):(T=e.substr(e.length-1),e=e.substr(0,e.length-1))),e===parseInt(e,10).toString()?e=e.substr(0,2)+"/"+e.substr(2):e.length>3&&"/"===e.charAt(2)&&/^[A-Z]{2}$/.test(e.substr(0,2))&&(e=e.replace("/","")),"VC"===e.substr(0,2))this.error=!0,this.errorMessage="Misplaced vice-county code in grid-reference field. ('"+e+"')",this.gridCoords=null,this.length=0;else if(null!==(t=e.match(/^([HJNOST][ABCDEFGHJKLMNOPQRSTUVWXYZ](?:\d\d){1,5})$/)))e=t[0],this.parse_wellformed_gb_gr_string_no_tetrads(e),this.length>0?1e4===this.length&&(T||this.quadrantCode)?T?(this.preciseGridRef=e+T,this.tetradLetter=T,this.tetrad=this.hectad+T,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[T][0],this.gridCoords.y+=S.tetradOffsets[T][1]):(this.preciseGridRef=e+this.quadrantCode,this.tetradLetter="",this.tetrad="",this.quadrant=this.preciseGridRef,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=e,this.length<=1e3&&this.set_tetrad()):(this.error=!0,this.errorMessage="GB grid reference format not understood (strange length).");else if(/^([\d]{2})\/((?:\d\d){1,5})$/.test(e)){switch(this.parse_gr_string_without_tetrads(e),this.length){case 1e4:e=this.gridCoords.to_gridref(1e4),this.hectad=e,T?(e+=T,this.tetradLetter=T,this.tetrad=this.hectad+T,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[T][0],this.gridCoords.y+=S.tetradOffsets[T][1]):this.quadrantCode&&(e+=this.quadrantCode,this.quadrant=e,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]);break;case 1e3:case 100:case 10:case 1:e=this.gridCoords.to_gridref(this.length),this.hectad=this.gridCoords.to_gridref(1e4),this.set_tetrad();break;default:this.error=!0,this.errorMessage="Bad grid square dimension ("+this.length+" m).",this.gridCoords=null,this.length=0;}this.preciseGridRef=e;}else this.gridCoords=null,this.length=0,this.error=!0,this.errorMessage="Grid reference format not understood. ('"+N+"')";}parse_gr_string_without_tetrads(N){let t,e,T,s;if(null!==(t=N.match(/^(\d{2})\/((?:\d\d){1,5})$/))){switch(t[1]){case"57":e=3e5,T=1e6;break;case"67":e=4e5,T=1e6;break;case"58":e=3e5,T=11e5;break;case"68":e=4e5,T=11e5;break;case"69":e=4e5,T=12e5;break;default:e=1e5*N.charAt(0),T=1e5*N.charAt(1);}s=t[2];}else {if(!S.letterMapping.hasOwnProperty(N.charAt(0))||!S.letterMapping.hasOwnProperty(N.charAt(1)))return this.length=0,void(this.gridCoords=null);let t=S.letterMapping[N.charAt(0)],r=S.letterMapping[N.charAt(1)];s=N.substr(2),e=t%5*5e5+r%5*1e5-1e6,T=5e5*-Math.floor(t/5)-1e5*Math.floor(r/5)+19e5;}switch(s.length){case 2:this.gridCoords=new H(e+1e4*s.charAt(0),T+1e4*s.charAt(1)),this.length=1e4;break;case 4:this.gridCoords=new H(e+1e3*Math.floor(s/100),T+s%100*1e3),this.length=1e3;break;case 6:this.gridCoords=new H(e+100*Math.floor(s/1e3),T+s%1e3*100),this.length=100;break;case 8:this.gridCoords=new H(e+10*Math.floor(s/1e4),T+s%1e4*10),this.length=10;break;case 10:this.gridCoords=new H(e+Math.floor(s/1e5),T+s%1e5),this.length=1;break;default:console.log("Bad grid ref length, ref="+N),this.gridCoords=null,this.length=0;}}parse_wellformed_gb_gr_string_no_tetrads(N){let t,e,T,s,r;switch(t=S.letterMapping[N.charAt(0)],e=S.letterMapping[N.charAt(1)],T=N.substr(2),s=t%5*5e5+e%5*1e5-1e6,r=5e5*-Math.floor(t/5)-1e5*Math.floor(e/5)+19e5,T.length){case 2:this.gridCoords=new H(s+1e4*T.charAt(0),r+1e4*T.charAt(1)),this.length=1e4,this.hectad=N;break;case 4:this.gridCoords=new H(s+1e3*Math.floor(T/100),r+T%100*1e3),this.length=1e3,this.hectad=N.substr(0,3)+N.substr(4,1);break;case 6:this.gridCoords=new H(s+100*Math.floor(T/1e3),r+T%1e3*100),this.length=100,this.hectad=N.substr(0,3)+N.substr(5,1);break;case 8:this.gridCoords=new H(s+10*Math.floor(T/1e4),r+T%1e4*10),this.length=10,this.hectad=N.substr(0,3)+N.substr(6,1);break;case 10:this.gridCoords=new H(s+Math.floor(T/1e5),r+T%1e5),this.length=1,this.hectad=N.substr(0,3)+N.substr(7,1);break;default:throw this.gridCoords=null,new Error("Bad grid ref length when parsing supposedly well-formed ref, ref='"+N+"'")}}}class l extends h{country="IE";gridCoords=null;constructor(S,N){super(),this.x=S,this.y=N;}static irishGrid={0:["V","Q","L","F","A"],1:["W","R","M","G","B"],2:["X","S","N","H","C"],3:["Y","T","O","J","D"]};to_latLng(){const S=1.000035,N=6377340.189,e=.0066705402933363,T=.0016732203841521,s=this.x-2e5,r=.0067153352074207,h=(5929615.3530033+(this.y-25e4)/S)/6366691.7742864415,i=h+.002509826623715886*Math.sin(2*h)+36745487490091978e-22*Math.sin(4*h)+151*T*T*T/96*Math.sin(6*h),o=N/Math.sqrt(1-e*Math.sin(i)*Math.sin(i)),n=Math.tan(i)*Math.tan(i),d=r*Math.cos(i)*Math.cos(i),M=N*(1-e)/Math.pow(1-e*Math.sin(i)*Math.sin(i),1.5),H=s/(o*S);let O=i-o*Math.tan(i)/M*(H*H/2-(5+3*n+10*d-4*d*d-9*r)*H*H*H*H/24+(61+90*n+298*d+45*n*n-1.6922644722700164-3*d*d)*H*H*H*H*H*H/720);O*=t;let l=(H-(1+2*n+d)*H*H*H/6+(5-2*d+28*n-3*d*d+8*r+24*n*n)*H*H*H*H*H/120)/Math.cos(i);return l=l*t-8,new a(O,l).to_WGS84()}to_gridref(S){const N=Math.floor(this.x/1e5),t=Math.floor(this.y/1e5);return l.irishGrid[N]&&l.irishGrid[N][t]?i(l.irishGrid[N][t],this.x-1e5*N,this.y-1e5*t,S||1):null}to_hectad(){const S=Math.floor(this.x/1e5),N=Math.floor(this.y/1e5);return l.irishGrid[S]&&l.irishGrid[S][N]?l.irishGrid[S][N]+Math.floor(this.x%1e5/1e4)+Math.floor(this.y%1e5/1e4):""}}class J extends S{constructor(){super(),this.parse_well_formed=this.from_string;}country="IE";GridCoords=l;gridCoords=null;static gridLetter={A:[0,4],B:[1,4],C:[2,4],D:[3,4],F:[0,3],G:[1,3],H:[2,3],J:[3,3],L:[0,2],M:[1,2],N:[2,2],O:[3,2],Q:[0,1],R:[1,1],S:[2,1],T:[3,1],V:[0,0],W:[1,0],X:[2,0],Y:[3,0]};from_string(S){let N=S.replace(/[\[\]\s\t.-]+/g,"").toUpperCase();/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(N)&&(J.quadrantOffsets.hasOwnProperty(N.substr(N.length-2))?(this.quadrantCode=N.substr(N.length-2),N=N.substr(0,N.length-2)):(this.tetradLetter=N.substr(N.length-1),N=N.substr(0,N.length-1))),this.parse_gr_string_without_tetrads(N),this.length>0?this.tetradLetter||this.quadrantCode?this.tetradLetter?(this.preciseGridRef=this.hectad+this.tetradLetter,this.tetrad=this.preciseGridRef,this.length=2e3,this.gridCoords.x+=J.tetradOffsets[this.tetradLetter][0],this.gridCoords.y+=J.tetradOffsets[this.tetradLetter][1]):(this.preciseGridRef=this.hectad+this.quadrantCode,this.quadrant=this.preciseGridRef,this.length=5e3,this.gridCoords.x+=J.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=J.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=N,this.length<=1e3&&this.set_tetrad()):(this.error=!0,this.errorMessage="Irish grid reference format not understood. ('"+S+"')");}static _IE_GRID_LETTERS="VQLFAWRMGBXSNHCYTOJD";parse_gr_string_without_tetrads(S){let N,t,e,T;if(/^\d{2}\/(?:\d\d){1,5}$/.test(S)){if(N=parseInt(S.charAt(0),10),t=parseInt(S.charAt(1),10),N>3||t>4)return console.log("bad grid square, ref='"+S+"' (Ireland)"),this.length=0,!1;e=S.substr(3),T=J._IE_GRID_LETTERS.charAt(5*N+t),N*=1e5,t*=1e5;}else {if(S=S.replace("/",""),!/^[ABCDFGHJLMNOQRSTVWXY](?:\d\d){1,5}$/.test(S))return this.length=0,this.gridCoords=null,!1;if(!S)return console.log("Bad (empty) Irish grid ref"),this.length=0,this.gridCoords=null,!1;{T=S.charAt(0);let e=J._IE_GRID_LETTERS.indexOf(T);if(-1===e)return console.log("Bad grid ref grid-letter, ref='"+S+"' (Ireland)"),this.length=0,this.gridCoords=null,!1;N=1e5*Math.floor(e/5),t=e%5*1e5;}e=S.substr(1);}switch(e.length){case 2:this.gridCoords=new l(N+1e4*e.charAt(0),t+1e4*e.charAt(1)),this.length=1e4,this.hectad=T+e;break;case 4:this.gridCoords=new l(N+1e3*Math.floor(e/100),t+e%100*1e3),this.length=1e3,this.hectad=T+e.charAt(0)+e.charAt(2);break;case 6:this.gridCoords=new l(N+100*Math.floor(e/1e3),t+e%1e3*100),this.length=100,this.hectad=T+e.charAt(0)+e.charAt(3);break;case 8:this.gridCoords=new l(N+10*Math.floor(e/1e4),t+e%1e4*10),this.length=10,this.hectad=T+e.charAt(0)+e.charAt(4);break;case 10:this.gridCoords=new l(N+Math.floor(e/1e5),t+e%1e5),this.length=1,this.hectad=T+e.charAt(0)+e.charAt(5);break;default:return console.log("Bad grid ref length, ref='"+S+"' (Ireland)"),this.length=0,this.gridCoords=null,!1}return !0}}S.from_string=function(S){let N,t=S.replace(/\s+/g,"").toUpperCase();if(!t)return !1;if(/^(?:[BCDFGHJLMNOQRSTVWXY]|[HJNOST][ABCDEFGHJKLMNOPQRSTUVWXYZ]|W[VA])\d{2}(?:[A-Z]|[NS][EW]|(?:\d{2}){0,4})?$/.test(t))return N=/^.\d/.test(t)?new J:"W"===t.charAt(0)?new M:new O,N.parse_well_formed(t),!(!N.length||N.error)&&N;if(N=new O,N.from_string(t),N.length&&!N.error)return N;if("W"===t.charAt(0)){if(N=new M,N.from_string(t),N.length&&!N.error)return N}else if(N=new J,N.from_string(t),N.length&&!N.error)return N;return !1};const c=H,g=(s.prototype.to_os_coords=function(){var S=this.lat*N,t=this.lng*N,T=.9996012717,s=.0066705397616,r=6377563.396*T,a=6356256.91*T,h=Math.sin(S)*Math.sin(S),i=r/Math.sqrt(1-s*h),o=i*(1-s)/(1-s*h),n=i/o-1,d=t- -.03490658503988659,M=i*Math.cos(S),H=Math.pow(Math.cos(S),3),O=Math.tan(S)*Math.tan(S),l=i/6*H*(i/o-O),J=Math.pow(Math.cos(S),5),g=Math.pow(Math.tan(S),4),U=i/120*J*(5-18*O+g+14*n-58*O*n),L=4e5+d*M+Math.pow(d,3)*l+Math.pow(d,5)*U,u=e._Marc(a,.0016732202503250907,.8552113334772214,S)+-1e5,C=i/2*Math.sin(S)*Math.cos(S),Y=i/24*Math.sin(S)*Math.pow(Math.cos(S),3)*(5-Math.pow(Math.tan(S),2)+9*n),f=i/720*Math.sin(S)*J*(61-58*O+g),P=u+d*d*C+Math.pow(d,4)*Y+Math.pow(d,6)*f;return new c(Math.round(L),Math.round(P))},s),U=l,L=(a.prototype.to_os_coords=function(){var S=this.lat*N,t=this.lng*N,T=1.000035,s=.00667054015,r=6377340.189*T,a=6356034.447*T,h=Math.sin(S)*Math.sin(S),i=r/Math.sqrt(1-s*h),o=i*(1-s)/(1-s*h),n=i/o-1,d=t- -.13962634015954636,M=i*Math.cos(S),H=Math.pow(Math.cos(S),3),O=Math.tan(S)*Math.tan(S),l=i/6*H*(i/o-O),J=Math.pow(Math.cos(S),5),c=Math.pow(Math.tan(S),4),g=i/120*J*(5-18*O+c+14*n-58*O*n),L=2e5+d*M+Math.pow(d,3)*l+Math.pow(d,5)*g,u=e._Marc(a,.0016732203841520518,.9337511498169663,S)+25e4,C=i/2*Math.sin(S)*Math.cos(S),Y=i/24*Math.sin(S)*Math.pow(Math.cos(S),3)*(5-Math.pow(Math.tan(S),2)+9*n),f=i/720*Math.sin(S)*J*(61-58*O+c),P=u+d*d*C+Math.pow(d,4)*Y+Math.pow(d,6)*f;return new U(Math.round(L),Math.round(P))},a),u=o,C=(r.prototype.to_os_coords=function(){var S=this.lat*N,t=this.lng*N,T=.9996,s=.0067226700223333,r=6378388*T,a=6356911.946*T,h=Math.sin(S)*Math.sin(S),i=r/Math.sqrt(1-s*h),o=i*(1-s)/(1-s*h),n=i/o-1,d=t- -.0523598775598,M=i*Math.cos(S),H=Math.pow(Math.cos(S),3),O=Math.tan(S)*Math.tan(S),l=i/6*H*(i/o-O),J=Math.pow(Math.cos(S),5),c=Math.pow(Math.tan(S),4),g=i/120*J*(5-18*O+c+14*n-58*O*n),U=5e5+d*M+Math.pow(d,3)*l+Math.pow(d,5)*g,L=e._Marc(a,.0016863406508729017,0,S)+0,C=i/2*Math.sin(S)*Math.cos(S),Y=i/24*Math.sin(S)*Math.pow(Math.cos(S),3)*(5-Math.pow(Math.tan(S),2)+9*n),f=i/720*Math.sin(S)*J*(61-58*O+c),P=L+d*d*C+Math.pow(d,4)*Y+Math.pow(d,6)*f;return new u(Math.round(U),Math.round(P))},r);

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var runtime = {exports: {}};

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
}(runtime));

var regenerator = runtime.exports;

function _createSuper$a(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$a(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$a() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * Wrapper for GPS access, including support for user-interface nudges
 */

var GPSRequest = /*#__PURE__*/function (_EventHarness) {
  _inherits(GPSRequest, _EventHarness);

  var _super = _createSuper$a(GPSRequest);

  function GPSRequest() {
    _classCallCheck(this, GPSRequest);

    return _super.apply(this, arguments);
  }

  _createClass(GPSRequest, null, [{
    key: "getDeviceType",
    value:
    /**
     * global flag affecting behaviour of some GPS functionality
     * e.g. on a non-mobile device, don't automatically seek GPS locality for new records
     *
     * @type {string}
     */

    /**
     * @returns {string}
     */
    function getDeviceType() {
      if (GPSRequest._deviceType === GPSRequest.DEVICE_TYPE_UNCHECKED) {
        if (navigator.userAgentData) {
          GPSRequest._deviceType = navigator.userAgentData.mobile ? GPSRequest.DEVICE_TYPE_MOBILE : GPSRequest.DEVICE_TYPE_IMMOBILE;
          console.log("Evaluated device using mobile flag, result: ".concat(GPSRequest._deviceType));
        } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
          // see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
          console.log("Detected mobile via use-agent string: ".concat(navigator.userAgent));
          GPSRequest._deviceType = GPSRequest.DEVICE_TYPE_MOBILE;
        } else {
          console.log('Flagging device type as unknown.');
          GPSRequest._deviceType = GPSRequest.DEVICE_TYPE_UNKNOWN;
        }
      }

      return GPSRequest._deviceType;
    }
  }, {
    key: "haveGPSPermission",
    value:
    /**
     * @returns {string} GPSRequest.GPS_PERMISSION_
     */
    function () {
      var _haveGPSPermission = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(GPSRequest._gpsPermission === GPSRequest.GPS_PERMISSION_UNCHECKED)) {
                  _context.next = 9;
                  break;
                }

                GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN; // make unknown while checking to avoid any race condition

                GPSRequest.gpsEventObject = new GPSRequest();

                if (!(navigator.permissions && navigator.permissions.query)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 6;
                return navigator.permissions.query({
                  name: 'geolocation'
                }).then(function (permissionStatus) {
                  permissionStatus.onchange = function () {
                    console.log('geolocation permission status has changed to ', this.state);
                    GPSRequest._gpsPermission = this.state;
                    GPSRequest.gpsEventObject.fireEvent(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, GPSRequest._gpsPermission);
                  }; //console.log({'GPS permission state': permissionStatus.state});


                  //console.log({'GPS permission state': permissionStatus.state});
                  GPSRequest._gpsPermission = permissionStatus.state;
                });

              case 6:
                _context.next = 9;
                break;

              case 8:
                GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN;

              case 9:
                return _context.abrupt("return", GPSRequest._gpsPermission);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function haveGPSPermission() {
        return _haveGPSPermission.apply(this, arguments);
      }

      return haveGPSPermission;
    }()
    /**
     * returns a promise with GPSRequest.GPS_PERMISSION_ parameter
     *
     * @returns {Promise<string>} GPSRequest.GPS_PERMISSION_
     */

  }, {
    key: "haveGPSPermissionPromise",
    value: function haveGPSPermissionPromise() {
      if (GPSRequest._gpsPermission === GPSRequest.GPS_PERMISSION_UNCHECKED) {
        GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN; // make unknown while checking to avoid any race condition

        GPSRequest.gpsEventObject = new GPSRequest();

        if (navigator.permissions && navigator.permissions.query) {
          return navigator.permissions.query({
            name: 'geolocation'
          }).then(function (permissionStatus) {
            permissionStatus.onchange = function () {
              console.log('geolocation permission status has changed to ', this.state);
              GPSRequest._gpsPermission = this.state;
              GPSRequest.gpsEventObject.fireEvent(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, GPSRequest._gpsPermission);
            }; //console.log({'GPS permission state': permissionStatus.state});


            GPSRequest._gpsPermission = permissionStatus.state;
            return GPSRequest._gpsPermission;
          });
        } else {
          GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN;
          return new Promise(function () {
            return GPSRequest._gpsPermission;
          });
        }
      } else {
        return new Promise(function () {
          return GPSRequest._gpsPermission;
        });
      }
    }
  }, {
    key: "_setGPSPermission",
    value: function _setGPSPermission(state) {
      if (GPSRequest._gpsPermission !== state) {
        GPSRequest._gpsPermission = state;

        if (GPSRequest.gpsEventObject) {
          GPSRequest.gpsEventObject.fireEvent(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, GPSRequest._gpsPermission);
        }
      }
    }
    /**
     *
     * @param {string=} gpsPromptBannerId
     * @return Promise
     */

  }, {
    key: "seekGPS",
    value: function seekGPS(gpsPromptBannerId) {
      GPSRequest.haveGPSPermission(); // ensures that GPSRequest._gpsPermission is initialised
      // for delayed prompt see Google's UI advice here: https://developers.google.com/web/fundamentals/native-hardware/user-location

      var nudge = gpsPromptBannerId ? document.getElementById(gpsPromptBannerId) : null;
      var showNudgeBanner = nudge ? function () {
        nudge.style.display = "block";
      } : function () {};
      var hideNudgeBanner = nudge ? function () {
        nudge.style.display = "none";
      } : function () {};
      var nudgeTimeoutId;

      if (nudge && GPSRequest._gpsPermission !== GPSRequest.GPS_PERMISSION_GRANTED) {
        nudgeTimeoutId = setTimeout(showNudgeBanner, 5000);
      } else {
        nudgeTimeoutId = null;
      }

      return new Promise(function (resolve, reject) {
        return navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30 * 1000,
          // 30 second timeout
          maximumAge: 20 * 1000 // can use a cached response from up to 20s ago

        });
      }).then(function (position) {
        // const latitude  = position.coords.latitude;
        // const longitude = position.coords.longitude;
        //
        //
        // const gridCoords = GridCoords.from_latlng(latitude, longitude);
        // const gridRef = gridCoords.to_gridref(1000);
        //
        // console.log(`Got grid-ref: ${gridRef}`);
        // this.value = gridRef;
        // this.fireEvent(FormField.EVENT_CHANGE);
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log("Got GPS fix ".concat(latitude, " , ").concat(longitude)); //@todo maybe should prevent use of readings if speed is too great (which might imply use of GPS in a moving vehicle)
        // this.processLatLngPosition(
        //     position.coords.latitude,
        //     position.coords.longitude,
        //     position.coords.accuracy * 2
        // );

        if (nudge) {
          clearTimeout(nudgeTimeoutId);
          hideNudgeBanner();
        } // unsure if this should be set as permission may only have been one-off
        //GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_GRANTED;


        GPSRequest._setGPSPermission(GPSRequest.GPS_PERMISSION_GRANTED);

        return position;
      }, function (error) {
        console.log({
          'gps look-up failed': error
        });

        switch (error.code) {
          case error.TIMEOUT:
          case error.PERMISSION_DENIED:
            // The user didn't accept the callout
            nudge && showNudgeBanner();
            break;
        }

        return null;
      });
    }
  }]);

  return GPSRequest;
}(EventHarness);

_defineProperty(GPSRequest, "DEVICE_TYPE_UNKNOWN", 'unknown');

_defineProperty(GPSRequest, "DEVICE_TYPE_UNCHECKED", 'unchecked');

_defineProperty(GPSRequest, "DEVICE_TYPE_MOBILE", 'mobile');

_defineProperty(GPSRequest, "DEVICE_TYPE_IMMOBILE", 'immobile');

_defineProperty(GPSRequest, "EVENT_GPS_PERMISSION_CHANGE", 'gpspermissionchange');

_defineProperty(GPSRequest, "_deviceType", GPSRequest.DEVICE_TYPE_UNCHECKED);

_defineProperty(GPSRequest, "GPS_PERMISSION_UNKNOWN", 'unknown');

_defineProperty(GPSRequest, "GPS_PERMISSION_UNCHECKED", 'unchecked');

_defineProperty(GPSRequest, "GPS_PERMISSION_GRANTED", 'granted');

_defineProperty(GPSRequest, "GPS_PERMISSION_DENIED", 'denied');

_defineProperty(GPSRequest, "GPS_PERMISSION_PROMPT", 'prompt');

_defineProperty(GPSRequest, "_gpsPermission", GPSRequest.GPS_PERMISSION_UNCHECKED);

_defineProperty(GPSRequest, "gpsEventObject", void 0);

/**
 *
 * @param {MouseEvent} event
 * @returns {boolean}
 */
function doubleClickIntercepted(event) {
  if (event.detail && event.detail > 1) {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  return false;
}

function _createSuper$9(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$9(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$9() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var TextGeorefField = /*#__PURE__*/function (_FormField) {
  _inherits(TextGeorefField, _FormField);

  var _super = _createSuper$9(TextGeorefField);

  /**
   * @type {string}
   */

  /**
   * @type {string}
   */

  /**
   * set if map has a well-defined zoom and centre
   * (i.e. has been initialised from a typed grid-ref, a manual re-centre or user-click)
   *
   * @type {boolean}
   */

  /**
   *
   * @type {{
   * rawString: string,
   * precision: number|null,
   * source: string,
   * gridRef: string,
   * latLng: ({lat:number,lng:number}|null)
   * }}
   * @private
   */

  /**
   *
   * @type {string}
   * @private
   */

  /**
   *
   * @type {string}
   */

  /**
   * the maximum precision to use for geocoded results
   *
   * @type {?int}
   */

  /**
   * minimum (least precise) precision (m diameter) to allow
   *
   * @type {number}
   */

  /**
   * maximum (most precise) precision (m diameter) to allow
   * @type {number}
   */

  /**
   * if set then as well as labelling the GPS button with a symbol, also include text 'GPS'
   * @type {boolean}
   */

  /**
   *
   * @type {string}
   */

  /**
   *
   * @type {boolean}
   */

  /**
   *
   * @type {boolean}
   */
  // /**
  //  * if set (default false) then the field's placeholder changes dynamically, e.g. depending on the surveys base georef.
  //  *
  //  * @type {boolean}
  //  */
  // dynamicPlaceholderFlag = false;

  /**
   *
   * @type {null|string}
   * @private
   */

  /**
   *
   * @param {{
   * [label] : string,
   * [helpText]: string,
   * [options]: {},
   * [placeholder]: string,
   * [type]: string,
   * [autocomplete]: string,
   * [baseSquareResolution]: ?number,
   * [maxResolution]: ?number,
   * [minResolution]: ?number,
   * [gpsPermissionPromptText]: string,
   * [initialiseFromDefaultSurveyGeoref] : boolean,
   * [gpsTextLabel] : boolean,
   * [showGPSEnableLinkIfNotActiveOnMobile] : boolean,
   * }} [params]
   */
  function TextGeorefField(params) {
    var _this;

    _classCallCheck(this, TextGeorefField);

    _this = _super.call(this, params);

    _defineProperty(_assertThisInitialized(_this), "_inputId", void 0);

    _defineProperty(_assertThisInitialized(_this), "containerId", void 0);

    _defineProperty(_assertThisInitialized(_this), "mapPositionIsCurrent", false);

    _defineProperty(_assertThisInitialized(_this), "_value", {
      gridRef: '',
      rawString: '',
      // what was provided by the user to generate this grid-ref (might be a postcode or placename)
      source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
      latLng: null,
      precision: null
    });

    _defineProperty(_assertThisInitialized(_this), "_inputType", 'text');

    _defineProperty(_assertThisInitialized(_this), "_autocomplete", '');

    _defineProperty(_assertThisInitialized(_this), "baseSquareResolution", null);

    _defineProperty(_assertThisInitialized(_this), "minResolution", 2000);

    _defineProperty(_assertThisInitialized(_this), "maxResolution", 10);

    _defineProperty(_assertThisInitialized(_this), "gpsTextLabel", false);

    _defineProperty(_assertThisInitialized(_this), "gpsPermissionsPromptText", '<p class="gps-nudge">Allowing access to GPS will save you time by allowing the app to locate your records automatically.</p>');

    _defineProperty(_assertThisInitialized(_this), "initialiseFromDefaultSurveyGeoref", false);

    _defineProperty(_assertThisInitialized(_this), "showGPSEnableLinkIfNotActiveOnMobile", true);

    _defineProperty(_assertThisInitialized(_this), "_gpsPermissionsPromptId", null);

    _defineProperty(_assertThisInitialized(_this), "_seekingGPS", false);

    if (params) {
      if (params.type) {
        _this._inputType = params.type;
      }

      if (params.placeholder) {
        _this.placeholder = params.placeholder;
      } // if (params.dynamicPlaceholder) {
      //     this.dynamicPlaceholder = params.dynamicPlaceholder;
      // }


      if (params.autocomplete) {
        _this._autocomplete = params.autocomplete;
      }

      if (params.baseSquareResolution) {
        _this.baseSquareResolution = params.baseSquareResolution;
      }

      if (params.maxResolution) {
        _this.maxResolution = params.maxResolution;
      }

      if (params.minResolution) {
        _this.minResolution = params.minResolution;
      }

      if (params.gpsPermissionPromptText) {
        _this.gpsPermissionsPromptText = params.gpsPermissionPromptText;
      }

      if (params.gpsTextLabel) {
        _this.gpsTextLabel = params.gpsTextLabel;
      }

      if (params.hasOwnProperty('initialiseFromDefaultSurveyGeoref')) {
        _this.initialiseFromDefaultSurveyGeoref = params.initialiseFromDefaultSurveyGeoref;
      }

      if (params.hasOwnProperty('showGPSEnableLinkIfNotActiveOnMobile')) {
        _this.showGPSEnableLinkIfNotActiveOnMobile = params.showGPSEnableLinkIfNotActiveOnMobile;
      }
    }

    return _this;
  }
  /**
   *
   * @param {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: Array|null}|string|null)} georefSpec
   */


  _createClass(TextGeorefField, [{
    key: "value",
    get:
    /**
     *
     * @returns {{rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: Array|null}}
     */
    function get() {
      return this._value;
    },
    set: function set(georefSpec) {
      //this._value = (undefined === textContent || null == textContent) ? '' : textContent.trim();
      if (georefSpec) {
        if (typeof georefSpec === 'string') {
          // backward compatible string gridref
          this._value = {
            gridRef: georefSpec,
            rawString: georefSpec,
            // what was provided by the user to generate this grid-ref (might be a postcode or placename)
            source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
            latLng: null,
            precision: null
          };
        } else {
          this._value = georefSpec;
        }
      } else {
        this._value = {
          gridRef: '',
          rawString: '',
          // what was provided by the user to generate this grid-ref (might be a postcode or placename)
          source: null,
          latLng: null,
          precision: null
        };
      }

      this.updateView();
    }
  }, {
    key: "updateView",
    value: function updateView() {
      if (this._fieldEl) {
        // do nothing until the view has been constructed
        var inputEl = document.getElementById(this._inputId);
        inputEl.value = FormField.cleanRawString(this._value.gridRef);
      }
    }
    /**
     * initialises this._fieldEl
     *
     * @returns {void}
     */

  }, {
    key: "buildField",
    value: function buildField() {
      // <div class="form-group">
      //     <label for="{baseId}gridref">Postcode or grid-reference</label>
      //     <input type="text" class="form-control" id="{baseId}gridref" aria-describedby="{baseId}grHelp" placeholder="Grid-reference or postcode">
      //     <small id="{baseId}grHelp" class="form-text text-muted">We need to be able to put your survey on our map. Detailed locations won't be made public.</small>
      // </div>
      // <div class="form-group">
      //     <label for="{baseId}gridref">Postcode or grid-reference</label>
      //     <div class="input-group">
      //         <input id="{baseId}gridref" aria-describedby="{baseId}grHelp" type="text" class="form-control" placeholder="Grid-reference or postcode" autocomplete="postal-code" required>
      //         <span class="input-group-btn">
      //             <button id="gps" type="button" class="btn btn-outline-secondary btn-sm" title="use GPS">
      //                 <span class="material-icons">gps_not_fixed</span>
      //             </button>
      //         </span>
      //     </div>
      //     <small id="{baseId}grHelp" class="form-text text-muted">We need to be able to put your survey on our map. Detailed locations won't be made public.</small>
      // </div>
      var container = document.createElement('div');
      container.className = 'form-group';
      this.containerId = container.id = FormField.nextId;
      this._inputId = FormField.nextId;

      if (navigator.geolocation && this.showGPSEnableLinkIfNotActiveOnMobile && GPSRequest.getDeviceType() === GPSRequest.DEVICE_TYPE_MOBILE) {
        // if on a mobile device and GPS is not turned on
        var gpsEnabledLinkEl = document.createElement('a');
        gpsEnabledLinkEl.className = 'no-gps-link-prompt'; // will be visible only if document body doesn't have a 'gps-enabled' class

        gpsEnabledLinkEl.href = '#';
        gpsEnabledLinkEl.innerText = 'Please enable GPS';
        container.appendChild(gpsEnabledLinkEl);
        gpsEnabledLinkEl.addEventListener('click', this.gpsButtonClickHandler.bind(this));
      }

      var labelEl = container.appendChild(document.createElement('label'));
      labelEl.htmlFor = this._inputId;
      labelEl.textContent = this.label;
      var inputGroupEl = container.appendChild(document.createElement('div'));
      inputGroupEl.className = 'input-group';
      var inputField = inputGroupEl.appendChild(document.createElement('input'));
      inputField.className = "form-control";
      inputField.id = this._inputId;
      inputField.type = 'text';

      if (this.placeholder) {
        inputField.placeholder = this.placeholder;
      }

      if (this._autocomplete) {
        inputField.autocomplete = this._autocomplete;

        if ('off' === this._autocomplete) {
          // browsers tend to ignore autocomplete off, so also assign a random 'name' value
          inputField.name = uuid();
        }
      }

      var buttonContainerEl = inputGroupEl.appendChild(document.createElement('span'));
      buttonContainerEl.className = 'input-group-btn';

      if (navigator.geolocation) {
        var gpsButton = buttonContainerEl.appendChild(document.createElement('button'));
        gpsButton.id = FormField.nextId;
        gpsButton.type = 'button';
        gpsButton.className = 'btn btn-outline-secondary btn-sm';
        gpsButton.title = 'use GPS';

        if (this.gpsTextLabel) {
          var gpsTextLabel = gpsButton.appendChild(document.createElement('span'));
          gpsTextLabel.style.verticalAlign = 'middle';
          gpsTextLabel.innerText = 'GPS ';
        }

        var buttonIconEl = gpsButton.appendChild(document.createElement('span'));
        buttonIconEl.className = 'material-icons';
        buttonIconEl.innerText = 'gps_not_fixed';

        if (this.gpsTextLabel) {
          buttonIconEl.style.verticalAlign = 'middle';
        }

        gpsButton.addEventListener('click', this.gpsButtonClickHandler.bind(this));
      }

      if (this.completion === FormField.COMPLETION_COMPULSORY) {
        inputField.required = true;
      }

      if (this.validationMessage) {
        var validationMessageElement = container.appendChild(document.createElement('div'));
        validationMessageElement.className = 'invalid-feedback';
        validationMessageElement.innerHTML = this.validationMessage;
      }

      if (this.gpsPermissionsPromptText && navigator.geolocation) {
        var gpsPermissionsPromptField = container.appendChild(document.createElement('small'));
        this._gpsPermissionsPromptId = gpsPermissionsPromptField.id = FormField.nextId;
        gpsPermissionsPromptField.style.display = 'none'; // hidden initially

        gpsPermissionsPromptField.innerHTML = this.gpsPermissionsPromptText;
      }

      if (this.helpText) {
        var helpTextField = container.appendChild(document.createElement('small'));
        helpTextField.innerHTML = this.helpText;
      }

      inputField.addEventListener('change', this.inputChangeHandler.bind(this));
      this._fieldEl = container;
    }
    /**
     *
     * @param {(boolean|null)} isValid
     */

  }, {
    key: "markValidity",
    value: function markValidity(isValid) {
      var el = document.getElementById(this._inputId);

      if (null === isValid) {
        el.classList.remove('is-invalid', 'is-valid');
      } else {
        el.classList.remove(isValid ? 'is-invalid' : 'is-valid');
        el.classList.add(isValid ? 'is-valid' : 'is-invalid');
      }
    }
  }, {
    key: "inputChangeHandler",
    value: function inputChangeHandler(event) {
      event.stopPropagation(); // don't allow the change event to reach the form-level event handler (will handle it here instead)
      //console.log('got input field change event');

      var rawValue = FormField.cleanRawString(document.getElementById(this._inputId).value);
      var gridRefParser = S.from_string(rawValue);
      this.mapPositionIsCurrent = false; // any linked map ought to be re-centred & zoomed

      if (gridRefParser) {
        this.value = {
          gridRef: gridRefParser.preciseGridRef,
          rawString: rawValue,
          // what was provided by the user to generate this grid-ref (might be a postcode or placename)
          source: TextGeorefField.GEOREF_SOURCE_GRIDREF,
          latLng: null,
          precision: null
        };
      } else {
        // should try geo-coding the value
        this.value = {
          gridRef: '',
          rawString: rawValue,
          // what was provided by the user to generate this grid-ref (might be a postcode or placename)
          source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
          latLng: null,
          precision: null
        };
      }

      this.fireEvent(FormField.EVENT_CHANGE);
    } // /**
    //  *
    //  * @param {MouseEvent} event
    //  */
    // gpsButtonClickHandler (event) {
    //     console.log('got gps button click event');
    //
    //     navigator.geolocation.getCurrentPosition((position) => {
    //         const latitude  = position.coords.latitude;
    //         const longitude = position.coords.longitude;
    //
    //         console.log(`Got GPS fix ${latitude} , ${longitude}`);
    //
    //         // const latLng = new LatLngWGS84(latitude, longitude);
    //         const gridCoords = GridCoords.from_latlng(latitude, longitude);
    //         const gridRef = gridCoords.to_gridref(1000);
    //
    //         console.log(`Got grid-ref: ${gridRef}`);
    //         this.value = gridRef;
    //         this.fireEvent(FormField.EVENT_CHANGE);
    //     }, (error) => {
    //         console.log('gps look-up failed');
    //         console.log(error);
    //     });
    // }

    /**
     *
     * @param {MouseEvent} event
     */

  }, {
    key: "gpsButtonClickHandler",
    value: function gpsButtonClickHandler(event) {
      if (doubleClickIntercepted(event)) {
        return;
      }

      var containerEl = document.getElementById(this.containerId);
      containerEl.classList.add('gps-active');
      this.seekGPS().catch(function (error) {
        console.log({
          'gps look-up failed, error': error
        });
      }).finally(function () {
        containerEl.classList.remove('gps-active');
      });
      event.preventDefault();
      event.stopPropagation();
    }
  }, {
    key: "seekGPS",
    value:
    /**
     *
     * @returns {Promise<unknown>}
     */
    function seekGPS() {
      var _this2 = this;

      if (this._seekingGPS) {
        // a GPS request is already in progress
        // don't allow concurrent GPS seek requests
        return Promise.reject();
      } else {
        this._seekingGPS = true;
        return GPSRequest.seekGPS(this._gpsPermissionsPromptId).then(function (position) {
          _this2._seekingGPS = false; // const latitude  = position.coords.latitude;
          // const longitude = position.coords.longitude;
          // console.log(`Got GPS fix ${latitude} , ${longitude}`);
          //
          // const gridCoords = GridCoords.from_latlng(latitude, longitude);
          // const gridRef = gridCoords.to_gridref(1000);
          //
          // console.log(`Got grid-ref: ${gridRef}`);
          // this.value = gridRef;
          // this.fireEvent(FormField.EVENT_CHANGE);
          //@todo maybe should prevent use of readings if speed is too great (which might imply use of GPS in a moving vehicle)

          console.log({
            'gps position': position
          });
          var accuracy = position.coords.accuracy * 2;
          _this2.mapPositionIsCurrent = false; // force zoom and re-centre

          _this2.processLatLngPosition(position.coords.latitude, position.coords.longitude, accuracy, TextGeorefField.GEOREF_SOURCE_GPS);
        }, function (error) {
          _this2._seekingGPS = false;
          return error;
        });
      }
    }
    /**
     *
     * @param {number} latitude
     * @param {number} longitude
     * @param {number} precision diameter in metres
     * @param {string} source
     * @param {string} rawString
     */

  }, {
    key: "processLatLngPosition",
    value: function processLatLngPosition(latitude, longitude, precision, source) {
      var rawString = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
      var gridCoords = h.from_latlng(latitude, longitude);
      var scaledPrecision = S.get_normalized_precision(precision);

      if (this.maxResolution && scaledPrecision < this.maxResolution) {
        scaledPrecision = this.maxResolution;
      }

      if (this.minResolution && scaledPrecision > this.minResolution) {
        scaledPrecision = this.minResolution;
      }

      var gridRef = gridCoords.to_gridref(scaledPrecision);
      console.log("Got grid-ref: ".concat(gridRef)); //this.value = gridRef;

      this.value = {
        gridRef: gridRef,
        rawString: rawString,
        source: source,
        latLng: {
          lat: latitude,
          lng: longitude
        },
        precision: precision
      };
      this.fireEvent(FormField.EVENT_CHANGE);
    }
    /**
     * by the time summariseImpl has been called have already checked that summary is wanted
     *
     * @param {string} key
     * @param {{
     *          field : TextGeorefField,
     *          attributes : {options : Object.<string, {label : string}>},
     *          summary : {summaryPrefix: string}
     *          }} property properties of the form descriptor
     * @param {Object.<string, {}>} attributes attributes of the model object
     * @return {string}
     */

  }], [{
    key: "summariseImpl",
    value: function summariseImpl(key, property, attributes) {
      return attributes[key] !== '' && attributes[key] !== null && attributes[key] !== undefined && attributes[key].gridRef ? "<span>grid-reference <span class=\"gridref-summary\">".concat(escapeHTML(attributes[key].gridRef.trim()), "</span></span>") : '';
    }
    /**
     *
     * @param value
     * @returns {boolean}
     */

  }, {
    key: "isEmpty",
    value: function isEmpty(value) {
      return !(value && value.gridRef);
    }
    /**
     *
     *
     * @param {string} key
     * @param property
     * @param attributes
     * @returns {null|boolean}
     */

  }, {
    key: "isValid",
    value: function isValid(key, property, attributes) {
      //console.log("in TextGeorefField isValid");
      if (property.attributes.completion && (property.attributes.completion === FormField.COMPLETION_COMPULSORY || property.attributes.completion === FormField.COMPLETION_DESIRED)) {
        // test whether required field is missing
        if (!attributes.hasOwnProperty(key) || property.field.isEmpty(attributes[key])) {
          return false;
        } else {
          // check if grid-ref is set
          var geoRef = attributes[key];
          console.log({
            "testing gr validity": geoRef
          });
          return !!(geoRef && geoRef.gridRef);
        }
      } // field is present or optional
      // report as valid unless content is corrupt


      return null; // field not assessed
    }
  }]);

  return TextGeorefField;
}(FormField);

_defineProperty(TextGeorefField, "GEOREF_SOURCE_UNKNOWN", 'unknown');

_defineProperty(TextGeorefField, "GEOREF_SOURCE_GRIDREF", 'gridref');

_defineProperty(TextGeorefField, "GEOREF_SOURCE_MAP", 'map');

_defineProperty(TextGeorefField, "GEOREF_SOURCE_GPS", 'gps');

_defineProperty(TextGeorefField, "GEOREF_SOURCE_POSTCODE", 'postcode');

_defineProperty(TextGeorefField, "GEOREF_SOURCE_PLACE", 'place');

function _createSuper$8(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$8(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$8() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Survey = /*#__PURE__*/function (_Model) {
  _inherits(Survey, _Model);

  var _super = _createSuper$8(Survey);

  function Survey() {
    var _this;

    _classCallCheck(this, Survey);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "SAVE_ENDPOINT", '/savesurvey.php');

    _defineProperty(_assertThisInitialized(_this), "TYPE", 'survey');

    _defineProperty(_assertThisInitialized(_this), "attributes", {});

    _defineProperty(_assertThisInitialized(_this), "isNew", false);

    _defineProperty(_assertThisInitialized(_this), "hasAppModifiedListener", false);

    return _this;
  }

  _createClass(Survey, [{
    key: "geoReference",
    get:
    /**
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null)}|null)}
     */
    function get() {
      return this.attributes.georef || {
        gridRef: '',
        rawString: '',
        // what was provided by the user to generate this grid-ref (might be a postcode or placename)
        source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
        latLng: null,
        precision: null
      };
    }
  }, {
    key: "date",
    get: function get() {
      return this.attributes.date || '';
    }
  }, {
    key: "place",
    get: function get() {
      return this.attributes.place || '';
    }
    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     *
     * @param {{form: SurveyForm}} params
     */

  }, {
    key: "formChangedHandler",
    value: function formChangedHandler(params) {
      console.log('Survey change handler invoked.'); // read new values
      // then fire its own change event (Occurrence.EVENT_MODIFIED)

      params.form.updateModelFromContent();
      console.log('Survey calling conditional validation.'); // refresh the form's validation state

      params.form.conditionallyValidateForm();
      this.touch();
      this.fireEvent(Survey.EVENT_MODIFIED, {
        surveyId: this.id
      });
    }
    /**
     * Used for special-case setting of a custom attribute
     * (i.e. not usually one linked to a form)
     * e.g. used for updating the NYPH null-list flag
     *
     * @param attributeName
     * @param value
     */

  }, {
    key: "setAttribute",
    value: function setAttribute(attributeName, value) {
      if (this.attributes[attributeName] !== value) {
        this.attributes[attributeName] = value;
        this.touch();
        this.fireEvent(Survey.EVENT_MODIFIED, {
          surveyId: this.id
        });
      }
    }
    /**
     *
     * @param {SurveyForm} form
     */

  }, {
    key: "registerForm",
    value: function registerForm(form) {
      form.model = this;
      form.addListener(Form.CHANGE_EVENT, this.formChangedHandler.bind(this));

      if (this.isNew) {
        form.fireEvent(Form.EVENT_INITIALISE_NEW, {}); // allows first-time initialisation of dynamic default data, e.g. starting a GPS fix

        form.liveValidation = false;
      } else {
        form.liveValidation = true;
      }
    }
    /**
     * if not securely saved then makes a post to /savesurvey.php
     *
     * this may be intercepted by a service worker, which could write the image to indexdb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexdb
     *
     * must test indexdb for this eventuality after the save has returned
     *
     * @returns {Promise}
     */

  }, {
    key: "save",
    value: function save() {
      if (!this._savedRemotely) {
        var formData = new FormData();
        formData.append('type', this.TYPE);
        formData.append('surveyId', this.id);
        formData.append('id', this.id);
        formData.append('projectId', this.projectId.toString());
        formData.append('attributes', JSON.stringify(this.attributes));
        formData.append('deleted', this.deleted.toString());
        formData.append('created', this.createdStamp.toString());
        console.log('queueing survey post');
        return this.queuePost(formData);
      } else {
        return Promise.reject("".concat(this.id, " has already been saved."));
      }
    }
    /**
     *
     * @returns {string} an html-safe string based on the locality and creation date
     */

  }, {
    key: "generateSurveyName",
    value: function generateSurveyName() {
      var place = (this.attributes.place || this.attributes.georef && this.attributes.georef.gridRef || '(unlocalised)').trim();
      var userDate = this.date;
      var dateString;

      if (userDate) {
        dateString = userDate;
      } else {
        var createdDate = new Date(this.createdStamp * 1000);

        try {
          // 'default' locale fails on Edge
          dateString = createdDate.toLocaleString('default', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (e) {
          dateString = createdDate.toLocaleString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }

      return "".concat(escapeHTML(place), " ").concat(dateString);
    }
  }]);

  return Survey;
}(Model);

_defineProperty(Survey, "EVENT_MODIFIED", 'modified');

function _createSuper$7(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$7(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$7() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var OccurrenceImage = /*#__PURE__*/function (_Model) {
  _inherits(OccurrenceImage, _Model);

  var _super = _createSuper$7(OccurrenceImage);

  function OccurrenceImage() {
    var _this;

    _classCallCheck(this, OccurrenceImage);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "file", void 0);

    _defineProperty(_assertThisInitialized(_this), "TYPE", 'image');

    _defineProperty(_assertThisInitialized(_this), "SAVE_ENDPOINT", '/saveimage.php');

    return _this;
  }

  _createClass(OccurrenceImage, [{
    key: "getUrl",
    value:
    /**
     * fetches a url of the image
     * this might be a remote url (or one intercepted by a service worker)
     * or a data url of the raw image, (not yet uploaded)
     *
     * @returns {string}
     */
    function getUrl() {}
  }, {
    key: "save",
    value:
    /**
     * if not securely saved then makes a post to /saveimage.php
     *
     * this may be intercepted by a service worker, which could write the image to indexdb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexdb
     *
     * must test indexdb for this eventuality after the save has returned
     *
     * @param {string} surveyId
     * @param {string} occurrenceId
     * @param {number} projectId
     * @returns {Promise}
     */
    function save(surveyId, occurrenceId, projectId) {
      if (!this._savedRemotely) {
        var formData = new FormData();
        formData.append('type', this.TYPE);
        formData.append('surveyId', surveyId ? surveyId : ''); // avoid 'undefined'

        formData.append('occurrenceId', occurrenceId ? occurrenceId : this.occurrenceId); // avoid 'undefined'

        formData.append('projectId', projectId ? projectId.toString() : '');
        formData.append('imageId', this.id);
        formData.append('id', this.id);
        formData.append('image', this.file);
        formData.append('deleted', this.deleted.toString());
        console.log("queueing image post, image id ".concat(this.id));
        return this.queuePost(formData);
      } else {
        return Promise.reject("".concat(this.id, " has already been saved."));
      }
    }
    /**
     * fired from Occurrence when the object's contents have been modified
     *
     * @type {string}
     */

  }, {
    key: "_parseDescriptor",
    value:
    /**
     *
     * @param {{surveyId: string, occurrenceId: string, [image]: File}} descriptor
     * @private
     */
    function _parseDescriptor(descriptor) {
      _get(_getPrototypeOf(OccurrenceImage.prototype), "_parseDescriptor", this).call(this, descriptor);

      this.surveyId = descriptor.surveyId; // note lower case

      this.occurrenceId = descriptor.occurrenceId; // note lower case

      this.file = descriptor.image;
    }
    /**
     *
     * @param {string} id
     * @param {(number|null)} width
     * @param {(number|null)} height
     * @param {{[className] : string}} [attributes]
     * @return {string}
     */

  }], [{
    key: "fromFile",
    value:
    /**
     *
     * @param {File} file
     */
    function fromFile(file) {
      var image = new OccurrenceImage();
      image.file = file;
      return image;
    }
  }, {
    key: "placeholder",
    value:
    /**
     *
     * @param id
     * @returns {OccurrenceImage}
     */
    function placeholder(id) {
      var placeholderObject = new OccurrenceImage();
      placeholderObject._id = id;
      OccurrenceImage.imageCache.set(id, placeholderObject);
      return placeholderObject;
    }
  }, {
    key: "imageLink",
    value: function imageLink(id, width, height, attributes) {
      width = width || 0;
      height = height || 0;
      var attributesString = '';

      if (attributes.className) {
        attributesString += " class=\"".concat(attributes.className, "\"");
      }

      var renderingConstraint = width > height ? "width=\"".concat(width, "\"") : "height=\"".concat(height, "\"");
      return "<picture><source srcset=\"/image.php?imageid=".concat(id, "&amp;height=128&amp;format=webp\" type=\"image/webp\"><img").concat(attributesString, " src=\"/image.php?imageid=").concat(id, "&amp;width=").concat(width, "&amp;height=").concat(height, "&amp;format=jpeg\" ").concat(renderingConstraint, " alt=\"photo\"></picture>");
    }
  }]);

  return OccurrenceImage;
}(Model);

_defineProperty(OccurrenceImage, "imageCache", new Map());

_defineProperty(OccurrenceImage, "EVENT_MODIFIED", 'modified');

function _createForOfIteratorHelper$2(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$2(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$2(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen); }

function _arrayLikeToArray$2(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$6(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$6(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$6() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

var _router = /*#__PURE__*/new WeakMap();

var _containerEl = /*#__PURE__*/new WeakMap();

var App = /*#__PURE__*/function (_EventHarness) {
  _inherits(App, _EventHarness);

  var _super = _createSuper$6(App);

  function App() {
    var _this;

    _classCallCheck(this, App);

    _this = _super.call(this);

    _classPrivateFieldInitSpec(_assertThisInitialized(_this), _router, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(_assertThisInitialized(_this), _containerEl, {
      writable: true,
      value: void 0
    });

    _defineProperty(_assertThisInitialized(_this), "controllers", []);

    _defineProperty(_assertThisInitialized(_this), "currentControllerHandle", false);

    _defineProperty(_assertThisInitialized(_this), "routeHistory", []);

    _defineProperty(_assertThisInitialized(_this), "occurrences", void 0);

    _defineProperty(_assertThisInitialized(_this), "surveys", void 0);

    _defineProperty(_assertThisInitialized(_this), "_currentSurvey", null);

    _defineProperty(_assertThisInitialized(_this), "layout", void 0);

    _this.reset();

    return _this;
  }
  /**
   *
   * @param {string} name
   */


  _createClass(App, [{
    key: "currentSurvey",
    get:
    /**
     *
     * @returns {?Survey}
     */
    function get() {
      return this._currentSurvey;
    }
    /**
     *
     * @returns {Promise<string | null>}
     */
    ,
    set:
    /**
     * @type {PatchedNavigo}
     */

    /**
     * @type {HTMLElement}
     */

    /**
     *
     * @type {Array.<AppController>}
     */

    /**
     * tracks the handle of the current page controller
     * updating this is the responsibility of the controller
     *
     * @type {number|boolean}
     */

    /**
     *
     * @type {Array.<{url : string}>}
     */

    /**
     * keyed by occurrence id (a UUID string)
     *
     * @type {Map.<string,Occurrence>}
     */

    /**
     * keyed by survey id (a UUID string)
     *
     * @type {Map.<string,Survey>}
     */

    /**
     * @type {?Survey}
     */

    /**
     *
     * @param {?Survey} survey
     */
    function set(survey) {
      if (this._currentSurvey !== survey) {
        this._currentSurvey = survey || null;
        var surveyId = survey ? survey.id : null;
        localforage.setItem(App.CURRENT_SURVEY_KEY_NAME, surveyId);
      }
    }
  }, {
    key: "getLastSurveyId",
    value: function getLastSurveyId() {
      return localforage.getItem(App.CURRENT_SURVEY_KEY_NAME).catch(function (error) {
        console.log({
          'Error retrieving last survey id': error
        });
        return Promise.resolve(null);
      });
    }
    /**
     * @type {Layout}
     */

  }, {
    key: "setLocalForageName",
    value: function setLocalForageName(name) {
      localforage.config({
        name: name
      });
    }
  }, {
    key: "reset",
    value: function reset() {
      this.surveys = new Map();
      this.clearCurrentSurvey();
    }
    /**
     * unset the current survey and its associated list of occurrences
     * called when switching surveys and during startup
     */

  }, {
    key: "clearCurrentSurvey",
    value: function clearCurrentSurvey() {
      this.occurrences = new Map();
      this.currentSurvey = null;
    }
    /**
     * see https://github.com/krasimir/navigo
     * @param {PatchedNavigo} router
     */

  }, {
    key: "router",
    get:
    /**
     *
     * @returns {PatchedNavigo}
     */
    function get() {
      return _classPrivateFieldGet(this, _router);
    },
    set: function set(router) {
      _classPrivateFieldSet(this, _router, router);
    }
  }, {
    key: "containerId",
    set: function set(containerId) {
      var el = document.getElementById(containerId);

      if (!el) {
        throw new Error("App container '".concat(containerId, "' not found."));
      } else {
        _classPrivateFieldSet(this, _containerEl, el);
      }
    }
  }, {
    key: "container",
    get: function get() {
      return _classPrivateFieldGet(this, _containerEl);
    }
    /**
     *
     * @param {AppController} controller
     */

  }, {
    key: "registerController",
    value: function registerController(controller) {
      controller.handle = this.controllers.length;
      this.controllers[this.controllers.length] = controller;
      controller.app = this;
      controller.registerRoute(_classPrivateFieldGet(this, _router));
    }
  }, {
    key: "initialise",
    value: function initialise() {
      var _this2 = this;

      //Page.initialise_layout(this.#containerEl);
      this.layout.initialise();

      _classPrivateFieldGet(this, _router).notFound(function (query) {
        // called when there is path specified but
        // there is no route matching
        console.log("no route found for '".concat(query, "'")); //this.#router.navigate('/list');

        var view = new NotFoundView();
        view.display();
      }); //default homepage


      _classPrivateFieldGet(this, _router).on(function () {
        // special-case redirect (replacing in history) from '/' to '/list' without updating browser history
        console.log("redirecting from '/' to '/list'");

        _classPrivateFieldGet(_this2, _router).pause(); //if (this.clearCurrentSurvey && this.currentSurvey.isPristine) { // this appears to be a bug 'this.clearCurrentSurvey'
        // rather than 'this.clearCurrentSurvey()' is nonsensical
        // and if clearCurrentSurvey() was actually called then the isPristine test would fail (called on null)


        if (_this2.currentSurvey && _this2.currentSurvey.isPristine) {
          _classPrivateFieldGet(_this2, _router).navigate('/list/survey/welcome').resume();
        } else {
          _classPrivateFieldGet(_this2, _router).navigate('/list').resume();
        }

        _classPrivateFieldGet(_this2, _router).resolve();
      });

      var _iterator = _createForOfIteratorHelper$2(this.controllers),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var controller = _step.value;
          controller.initialise();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "display",
    value: function display() {
      console.log('App display');

      _classPrivateFieldGet(this, _router).resolve(); // it's opportune at this point to try to ping the server again to save anything left outstanding


      this.syncAll();
    }
  }, {
    key: "saveRoute",
    value: function saveRoute() {
      var lastRoute = _classPrivateFieldGet(this, _router).lastRouteResolved();

      if (this.routeHistory.length) {
        if (this.routeHistory[this.routeHistory.length - 1] !== lastRoute) {
          this.routeHistory[this.routeHistory.length] = lastRoute;
        }
      } else {
        this.routeHistory[0] = lastRoute;
      }
    }
    /**
     * mark the current survey and its constituent records as subject to validation checks (not pristine)
     */

  }, {
    key: "markAllNotPristine",
    value: function markAllNotPristine() {
      var _iterator2 = _createForOfIteratorHelper$2(this.occurrences),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var occurrenceTuple = _step2.value;
          occurrenceTuple[1].isPristine = false;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    /**
     *
     * @param {Layout} layout
     */

  }, {
    key: "setLayout",
    value: function setLayout(layout) {
      this.layout = layout;
      layout.setApp(this);
    }
    /**
     *
     * @param {Survey} survey
     */

  }, {
    key: "addSurvey",
    value: function addSurvey(survey) {
      var _this3 = this;

      if (survey.projectId !== this.projectId) {
        throw new Error("Survey project id '".concat(survey.projectId, " does not match with current project ('").concat(this.projectId, "')"));
      } //if (!this.surveys.has(survey.id)) {


      if (!survey.hasAppModifiedListener) {
        survey.hasAppModifiedListener = true;
        console.log("setting survey's modified/save handler");
        survey.addListener(Survey.EVENT_MODIFIED, function () {
          _this3.fireEvent(App.EVENT_SURVEYS_CHANGED);

          return survey.save();
        });
      }

      this.surveys.set(survey.id, survey);
      this.fireEvent(App.EVENT_SURVEYS_CHANGED);
    }
    /**
     * tests whether occurrences have been defined, excluding any that have been deleted
     *
     * @returns {boolean}
     */

  }, {
    key: "haveExtantOccurrences",
    value: function haveExtantOccurrences() {
      var _iterator3 = _createForOfIteratorHelper$2(this.occurrences),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var occurrence = _step3.value;

          if (!occurrence.deleted) {
            return true;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return false;
    }
    /**
     *
     * @param {Occurrence} occurrence
     */

  }, {
    key: "addOccurrence",
    value: function addOccurrence(occurrence) {
      var _this4 = this;

      if (!occurrence.surveyId) {
        throw new InternalAppError('Survey id must set prior to registering occurrence.');
      }

      if (this.occurrences.size === 0) {
        // this is the first occurrence added, set the survey creation stamp to match
        // this avoids anomalies where a 'stale' survey created when the form was first opened but not used sits around
        // for a protracted period
        var survey = this.surveys.get(occurrence.surveyId);
        survey.createdStamp = occurrence.createdStamp;
      }

      console.log("in addOccurrence setting id '".concat(occurrence.id, "'"));
      this.occurrences.set(occurrence.id, occurrence);
      occurrence.addListener(Occurrence.EVENT_MODIFIED, // possibly this should be async, with await on the survey and occurrence save
      function () {
        var survey = _this4.surveys.get(occurrence.surveyId);

        if (!survey) {
          throw new Error("Failed to look up survey id ".concat(occurrence.surveyId));
        } else {
          survey.isPristine = false; // need to ensure that currentSurvey is saved before occurrence
          // rather than using a promise chain here, instead rely on enforced queuing of post requests in Model
          // otherwise there are problems with queue-jumping (e.g. when an image needs to be saved after both previous requests)

          if (survey.unsaved()) {
            // noinspection JSIgnoredPromiseFromCall
            survey.save();
          }

          occurrence.save(survey.id);
        }
      });
    }
    /**
     * attempts to refresh the state of local storage for the specified survey ids
     * if fetch fails then return a failed promise
     *
     * updates local copy of surveys and occurrences
     *
     * no service worker interception of this call - passed through and not cached
     *
     * @param {Array.<string>} surveyIds
     * @return {Promise}
     */

  }, {
    key: "refreshFromServer",
    value: function refreshFromServer(surveyIds) {
      var _this5 = this;

      console.log({
        'Refresh from server, ids': surveyIds
      });
      var formData = new FormData();
      var n = 0;

      var _iterator4 = _createForOfIteratorHelper$2(surveyIds),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var key = _step4.value;

          if (key && key !== 'undefined') {
            formData.append("surveyId[".concat(n++, "]"), key);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      return fetch(App.LOAD_SURVEYS_ENDPOINT, {
        method: 'POST',
        body: formData
      }).then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject("Invalid response from server when refreshing survey ids");
        }
      }).then(function (jsonResponse) {
        /** @param {{survey : Array.<object>, occurrence: Array.<object>, image: Array.<object>}} jsonResponse */
        console.log({
          'refresh from server json response': jsonResponse
        }); // if external objects newer than local version then place in local storage

        var promises = [];

        for (var type in jsonResponse) {
          if (jsonResponse.hasOwnProperty(type)) {
            var _iterator5 = _createForOfIteratorHelper$2(jsonResponse[type]),
                _step5;

            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var object = _step5.value;
                promises.push(_this5._conditionallyReplaceObject(object));
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          }
        }

        return Promise.all(promises);
      });
    }
    /**
     * compare modified stamp of indexeddb and external objects and write external version locally if more recent
     *
     * @param {{id : string, type : string, modified : number, created : number, saveState : string, deleted : boolean}} externalVersion
     * @returns {Promise}
     * @private
     */

  }, {
    key: "_conditionallyReplaceObject",
    value: function _conditionallyReplaceObject(externalVersion) {
      var objectType = externalVersion.type;
      var id = externalVersion.id;
      var key = "".concat(objectType, ".").concat(id);
      return localforage.getItem(key).then(function (localVersion) {
        if (localVersion) {
          // compare stamps
          // if (externalVersion.deleted) {
          //     // if the external copy is deleted then remove the local copy
          //     return localforage.removeItem(key);
          // }
          if (!externalVersion.deleted && localVersion.modified >= externalVersion.modified) {
            console.log("Local copy of ".concat(key, " is the same or newer than the server copy. (").concat(localVersion.modified, " >= ").concat(externalVersion.modified, ") "));
            return Promise.resolve();
          }
        } // no local copy or stale copy
        // so store response locally


        console.log("Adding or replacing local copy of ".concat(key));
        return localforage.setItem(key, externalVersion);
      });
    }
    /**
     * retrieve the full set of keys from local storage (IndexedDb)
     *
     * @param {{survey: Array.<string>, occurrence : Array.<string>, image: Array.<string>}} storedObjectKeys
     * @returns {Promise}
     */

  }, {
    key: "seekKeys",
    value: function seekKeys(storedObjectKeys) {
      console.log('starting seekKeys');
      return localforage.keys().then(function (keys) {
        console.log({
          "in seekKeys: local forage keys": keys
        });

        var _iterator6 = _createForOfIteratorHelper$2(keys),
            _step6;

        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var key = _step6.value;

            if (key !== App.CURRENT_SURVEY_KEY_NAME) {
              var type = void 0,
                  id = void 0;

              var _key$split = key.split('.', 2);

              var _key$split2 = _slicedToArray(_key$split, 2);

              type = _key$split2[0];
              id = _key$split2[1];

              if (storedObjectKeys.hasOwnProperty(type)) {
                if (!storedObjectKeys[type].includes(id)) {
                  storedObjectKeys[type].push(id);
                }
              } else {
                console.log("Unrecognised stored key type '".concat(type, "."));
              }
            }
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }

        return storedObjectKeys;
      });
    }
    /**
     * @returns {Promise}
     */

  }, {
    key: "syncAll",
    value: function syncAll() {
      var _this6 = this;

      var storedObjectKeys = {
        survey: [],
        occurrence: [],
        image: []
      };
      return this.seekKeys(storedObjectKeys).then(function (storedObjectKeys) {
        return _this6._syncLocalUnsaved(storedObjectKeys).then(function (result) {
          _this6.fireEvent(App.EVENT_ALL_SYNCED_TO_SERVER);

          return result;
        });
      }, function (failedResult) {
        console.log("Failed to sync all: ".concat(failedResult));

        _this6.fireEvent(App.EVENT_SYNC_ALL_FAILED);

        return false;
      });
    }
    /**
     *
     * @param storedObjectKeys
     * @returns {Promise}
     * @private
     */

  }, {
    key: "_syncLocalUnsaved",
    value: function _syncLocalUnsaved(storedObjectKeys) {
      // synchronises surveys first, then occurrences, then images from indexedDb
      var promises = [];

      var _iterator7 = _createForOfIteratorHelper$2(storedObjectKeys.survey),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var surveyKey = _step7.value;
          promises.push(Survey.retrieveFromLocal(surveyKey, new Survey()).then(function (survey) {
            if (survey.unsaved()) {
              return survey.save();
            }
          }));
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var _iterator8 = _createForOfIteratorHelper$2(storedObjectKeys.occurrence),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var occurrenceKey = _step8.value;
          promises.push(Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence()).then(function (occurrence) {
            if (occurrence.unsaved()) {
              return occurrence.save();
            }
          }));
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }

      var _iterator9 = _createForOfIteratorHelper$2(storedObjectKeys.image),
          _step9;

      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var imageKey = _step9.value;
          promises.push(OccurrenceImage.retrieveFromLocal(imageKey, new OccurrenceImage()).then(function (image) {
            if (image.unsaved()) {
              return image.save();
            }
          }));
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }

      return Promise.all(promises).catch(function (result) {
        console.log("Save failure: ".concat(result));
        return Promise.reject(result); // pass on the failed save (catch was only for logging, not to allow subsequent success)
      });
    }
    /**
     * restore previous state, pulling back from local and external store
     * @todo this needs a save phase, so that local changes are saved back to the server
     *
     * @param {string} [targetSurveyId] if specified then select this id as the current survey
     * @return {Promise}
     */

  }, {
    key: "restoreOccurrences",
    value: function restoreOccurrences() {
      var _this7 = this;

      var targetSurveyId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      console.log("Invoked restoreOccurrences, target survey id: ".concat(targetSurveyId));

      if (targetSurveyId === 'undefined') {
        console.error("Attempt to restore occurrences for literal 'undefined' survey id.");
        targetSurveyId = '';
      }

      return targetSurveyId ? this._restoreOccurrenceImp(targetSurveyId) : this.getLastSurveyId().then(function (lastSurveyId) {
        console.log("Retrieved last used survey id '".concat(lastSurveyId, "'"));
        return _this7._restoreOccurrenceImp(lastSurveyId).catch(function () {
          console.log("Failed to retrieve lastSurveyId ".concat(lastSurveyId, ". Resetting current survey and retrying."));
          _this7.currentSurvey = null;
          return _this7._restoreOccurrenceImp();
        });
      }, function () {
        return _this7._restoreOccurrenceImp();
      });
    }
  }, {
    key: "_restoreOccurrenceImp",
    value: function _restoreOccurrenceImp(targetSurveyId) {
      var _this8 = this;

      // need to check for a special case where restoring a survey that has never been saved even locally
      // i.e. new and unmodified
      // only present in current App.surveys
      // this occurs if user creates a new survey, makes no changes, switches away from it then switches back
      if (targetSurveyId && this.surveys.has(targetSurveyId)) {
        var localSurvey = this.surveys.get(targetSurveyId);

        if (localSurvey.isPristine) {
          this.clearCurrentSurvey(); // clear occurrences from the previous survey

          this.currentSurvey = localSurvey;
          this.fireEvent(App.EVENT_SURVEYS_CHANGED); // current survey should be set now, so menu needs refresh

          return Promise.resolve();
        }
      }

      var storedObjectKeys = {
        survey: [],
        occurrence: [],
        image: []
      };

      if (targetSurveyId) {
        storedObjectKeys.survey[0] = targetSurveyId;
      }

      return this.seekKeys(storedObjectKeys).then(function (storedObjectKeys) {
        if (storedObjectKeys.survey.length) {
          return _this8.refreshFromServer(storedObjectKeys.survey).finally(function () {
            // re-seek keys from indexed db, to take account of any new occurrences received from the server
            return _this8.seekKeys(storedObjectKeys);
          });
        } else {
          return null;
        }
      }).finally(function () {
        // called regardless of whether a server refresh was successful
        // storedObjectKeys and indexed db should be as up-to-date as possible
        console.log({
          storedObjectKeys: storedObjectKeys
        });

        if (storedObjectKeys && storedObjectKeys.survey && storedObjectKeys.survey.length) {
          var surveyFetchingPromises = [];
          var n = 0;

          var _iterator10 = _createForOfIteratorHelper$2(storedObjectKeys.survey),
              _step10;

          try {
            for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
              var surveyKey = _step10.value;
              // arbitrarily set first survey key as current if a target id hasn't been specified
              surveyFetchingPromises.push(_this8._restoreSurveyFromLocal(surveyKey, storedObjectKeys, targetSurveyId === surveyKey || !targetSurveyId && n++ === 0));
            }
          } catch (err) {
            _iterator10.e(err);
          } finally {
            _iterator10.f();
          }

          return Promise.all(surveyFetchingPromises).finally(function () {
            //this.currentSurvey = this.surveys.get(storedObjectKeys.survey[0]);
            if (!_this8.currentSurvey) {
              // survey doesn't actually exist
              // this could have happened in an invalid survey id was provided as a targetSurveyId
              console.log("Failed to retrieve survey id '".concat(targetSurveyId, "'"));
              return Promise.reject(new Error("Failed to retrieve survey id '".concat(targetSurveyId, "'")));
            }

            if (_this8.currentSurvey.deleted) {
              // unusual case where survey is deleted
              // substitute a new one
              // this should probably never happen, as items deleted on the server ought to have been
              // removed locally
              _this8.setNewSurvey();
            } else {
              _this8.fireEvent(App.EVENT_SURVEYS_CHANGED); // current survey should be set now, so menu needs refresh

            }

            return Promise.resolve();
          });
        } else {
          console.log('no pre-existing surveys, so creating a new one'); // no pre-existing surveys, so create a new one

          _this8.setNewSurvey();

          return Promise.resolve();
        }
      });
    }
  }, {
    key: "setNewSurvey",
    value: function setNewSurvey() {
      this.currentSurvey = new Survey();
      this.currentSurvey.projectId = this.projectId;
      this.currentSurvey.isPristine = true;
      this.currentSurvey.isNew = true;
      this.fireEvent(App.EVENT_NEW_SURVEY);
      this.addSurvey(this.currentSurvey);
    }
    /**
     * @return {Occurrence}
     */

  }, {
    key: "addNewOccurrence",
    value: function addNewOccurrence() {
      var occurrence = new Occurrence();
      occurrence.surveyId = this.currentSurvey.id;
      occurrence.projectId = this.projectId;
      occurrence.isNew = true;
      occurrence.isPristine = true;
      this.addOccurrence(occurrence);
      this.fireEvent(App.EVENT_OCCURRENCE_ADDED, {
        occurrenceId: occurrence.id,
        surveyId: occurrence.surveyId
      });
      return occurrence;
    }
    /**
     *
     * @param {string} surveyId
     * @param {{survey: Array, occurrence: Array, image: Array}} storedObjectKeys
     * @param {boolean} setAsCurrent
     * @returns {Promise}
     * @private
     */

  }, {
    key: "_restoreSurveyFromLocal",
    value: function _restoreSurveyFromLocal(surveyId, storedObjectKeys, setAsCurrent) {
      var _this9 = this;

      // retrieve surveys first, then occurrences, then images from indexedDb
      var promise = Survey.retrieveFromLocal(surveyId, new Survey()).then(function (survey) {
        console.log("retrieving local survey ".concat(surveyId));

        if (setAsCurrent) {
          // the apps occurrences should only relate to the current survey
          // (the reset are remote or in IndexedDb)
          _this9.clearCurrentSurvey();

          _this9.addSurvey(survey);

          var occurrenceFetchingPromises = [];

          var _iterator11 = _createForOfIteratorHelper$2(storedObjectKeys.occurrence),
              _step11;

          try {
            var _loop = function _loop() {
              var occurrenceKey = _step11.value;
              occurrenceFetchingPromises.push(Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence()).then(function (occurrence) {
                if (occurrence.surveyId === surveyId) {
                  console.log("adding occurrence ".concat(occurrenceKey));

                  _this9.addOccurrence(occurrence);
                }
              }));
            };

            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
              _loop();
            }
          } catch (err) {
            _iterator11.e(err);
          } finally {
            _iterator11.f();
          }

          return Promise.all(occurrenceFetchingPromises);
        } else {
          // not the current survey, so just add it but don't load occurrences
          _this9.addSurvey(survey);
        }
      });

      if (setAsCurrent) {
        promise.finally(function () {
          //console.log('Reached image fetching part');
          var imageFetchingPromises = [];

          var _iterator12 = _createForOfIteratorHelper$2(storedObjectKeys.image),
              _step12;

          try {
            var _loop2 = function _loop2() {
              var occurrenceImageKey = _step12.value;
              imageFetchingPromises.push(OccurrenceImage.retrieveFromLocal(occurrenceImageKey, new OccurrenceImage()).then(function (occurrenceImage) {
                console.log("restoring image id '".concat(occurrenceImageKey, "'"));

                if (occurrenceImage.surveyId === surveyId) {
                  OccurrenceImage.imageCache.set(occurrenceImageKey, occurrenceImage);
                }
              }, function (reason) {
                console.log("Failed to retrieve an image: ".concat(reason));
              }));
            };

            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              _loop2();
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }

          _this9.currentSurvey = _this9.surveys.get(storedObjectKeys.survey[0]);
          return Promise.all(imageFetchingPromises);
        });
      }

      return promise;
    }
    /**
     *
     * @returns {Promise<void>}
     */

  }, {
    key: "clearLocalForage",
    value: function clearLocalForage() {
      return localforage.clear();
    }
  }]);

  return App;
}(EventHarness);

_defineProperty(App, "EVENT_ADD_SURVEY_USER_REQUEST", 'useraddsurveyrequest');

_defineProperty(App, "EVENT_RESET_SURVEYS", 'userresetsurveys');

_defineProperty(App, "EVENT_NEW_SURVEY", 'newsurvey');

_defineProperty(App, "LOAD_SURVEYS_ENDPOINT", '/loadsurveys.php');

_defineProperty(App, "EVENT_OCCURRENCE_ADDED", 'occurrenceadded');

_defineProperty(App, "EVENT_SURVEYS_CHANGED", 'surveyschanged');

_defineProperty(App, "EVENT_ALL_SYNCED_TO_SERVER", 'allsyncedtoserver');

_defineProperty(App, "EVENT_SYNC_ALL_FAILED", 'syncallfailed');

_defineProperty(App, "CURRENT_SURVEY_KEY_NAME", 'currentsurvey');

_defineProperty(App, "devMode", false);

var modal = {exports: {}};

var eventHandler = {exports: {}};

/*!
  * Bootstrap event-handler.js v5.1.3 (https://getbootstrap.com/)
  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (module, exports) {
(function (global, factory) {
  module.exports = factory() ;
})(commonjsGlobal, (function () {
  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const getjQuery = () => {
    const {
      jQuery
    } = window;

    if (jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return jQuery;
    }

    return null;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage

  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const customEventsRegex = /^(mouseenter|mouseleave)/i;
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);
  /**
   * ------------------------------------------------------------------------
   * Private methods
   * ------------------------------------------------------------------------
   */

  function getUidEvent(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }

  function getEvent(element) {
    const uid = getUidEvent(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }

  function bootstrapHandler(element, fn) {
    return function handler(event) {
      event.delegateTarget = element;

      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }

      return fn.apply(element, [event]);
    };
  }

  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);

      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (let i = domElements.length; i--;) {
          if (domElements[i] === target) {
            event.delegateTarget = target;

            if (handler.oneOff) {
              EventHandler.off(element, event.type, selector, fn);
            }

            return fn.apply(target, [event]);
          }
        }
      } // To please ESLint


      return null;
    };
  }

  function findHandler(events, handler, delegationSelector = null) {
    const uidEventList = Object.keys(events);

    for (let i = 0, len = uidEventList.length; i < len; i++) {
      const event = events[uidEventList[i]];

      if (event.originalHandler === handler && event.delegationSelector === delegationSelector) {
        return event;
      }
    }

    return null;
  }

  function normalizeParams(originalTypeEvent, handler, delegationFn) {
    const delegation = typeof handler === 'string';
    const originalHandler = delegation ? delegationFn : handler;
    let typeEvent = getTypeEvent(originalTypeEvent);
    const isNative = nativeEvents.has(typeEvent);

    if (!isNative) {
      typeEvent = originalTypeEvent;
    }

    return [delegation, originalHandler, typeEvent];
  }

  function addHandler(element, originalTypeEvent, handler, delegationFn, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }

    if (!handler) {
      handler = delegationFn;
      delegationFn = null;
    } // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does


    if (customEventsRegex.test(originalTypeEvent)) {
      const wrapFn = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };

      if (delegationFn) {
        delegationFn = wrapFn(delegationFn);
      } else {
        handler = wrapFn(handler);
      }
    }

    const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
    const events = getEvent(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFn = findHandler(handlers, originalHandler, delegation ? handler : null);

    if (previousFn) {
      previousFn.oneOff = previousFn.oneOff && oneOff;
      return;
    }

    const uid = getUidEvent(originalHandler, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = delegation ? bootstrapDelegationHandler(element, handler, delegationFn) : bootstrapHandler(element, handler);
    fn.delegationSelector = delegation ? handler : null;
    fn.originalHandler = originalHandler;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, delegation);
  }

  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);

    if (!fn) {
      return;
    }

    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }

  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    Object.keys(storeElementEvent).forEach(handlerKey => {
      if (handlerKey.includes(namespace)) {
        const event = storeElementEvent[handlerKey];
        removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
      }
    });
  }

  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }

  const EventHandler = {
    on(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, false);
    },

    one(element, event, handler, delegationFn) {
      addHandler(element, event, handler, delegationFn, true);
    },

    off(element, originalTypeEvent, handler, delegationFn) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }

      const [delegation, originalHandler, typeEvent] = normalizeParams(originalTypeEvent, handler, delegationFn);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getEvent(element);
      const isNamespace = originalTypeEvent.startsWith('.');

      if (typeof originalHandler !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!events || !events[typeEvent]) {
          return;
        }

        removeHandler(element, events, typeEvent, originalHandler, delegation ? handler : null);
        return;
      }

      if (isNamespace) {
        Object.keys(events).forEach(elementEvent => {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        });
      }

      const storeElementEvent = events[typeEvent] || {};
      Object.keys(storeElementEvent).forEach(keyHandlers => {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');

        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          const event = storeElementEvent[keyHandlers];
          removeHandler(element, events, typeEvent, event.originalHandler, event.delegationSelector);
        }
      });
    },

    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }

      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      const isNative = nativeEvents.has(typeEvent);
      let jQueryEvent;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      let evt = null;

      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }

      if (isNative) {
        evt = document.createEvent('HTMLEvents');
        evt.initEvent(typeEvent, bubbles, true);
      } else {
        evt = new CustomEvent(event, {
          bubbles,
          cancelable: true
        });
      } // merge custom information in our event


      if (typeof args !== 'undefined') {
        Object.keys(args).forEach(key => {
          Object.defineProperty(evt, key, {
            get() {
              return args[key];
            }

          });
        });
      }

      if (defaultPrevented) {
        evt.preventDefault();
      }

      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }

      if (evt.defaultPrevented && typeof jQueryEvent !== 'undefined') {
        jQueryEvent.preventDefault();
      }

      return evt;
    }

  };

  return EventHandler;

}));

}(eventHandler));

var manipulator = {exports: {}};

/*!
  * Bootstrap manipulator.js v5.1.3 (https://getbootstrap.com/)
  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (module, exports) {
(function (global, factory) {
  module.exports = factory() ;
})(commonjsGlobal, (function () {
  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  function normalizeData(val) {
    if (val === 'true') {
      return true;
    }

    if (val === 'false') {
      return false;
    }

    if (val === Number(val).toString()) {
      return Number(val);
    }

    if (val === '' || val === 'null') {
      return null;
    }

    return val;
  }

  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }

  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },

    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },

    getDataAttributes(element) {
      if (!element) {
        return {};
      }

      const attributes = {};
      Object.keys(element.dataset).filter(key => key.startsWith('bs')).forEach(key => {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      });
      return attributes;
    },

    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    },

    offset(element) {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset
      };
    },

    position(element) {
      return {
        top: element.offsetTop,
        left: element.offsetLeft
      };
    }

  };

  return Manipulator;

}));

}(manipulator));

var selectorEngine = {exports: {}};

/*!
  * Bootstrap selector-engine.js v5.1.3 (https://getbootstrap.com/)
  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (module, exports) {
(function (global, factory) {
  module.exports = factory() ;
})(commonjsGlobal, (function () {
  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const isElement = obj => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj.jquery !== 'undefined') {
      obj = obj[0];
    }

    return typeof obj.nodeType !== 'undefined';
  };

  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }

    return getComputedStyle(element).getPropertyValue('visibility') === 'visible';
  };

  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (element.classList.contains('disabled')) {
      return true;
    }

    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }

    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const NODE_TEXT = 3;
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },

    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },

    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },

    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode;

      while (ancestor && ancestor.nodeType === Node.ELEMENT_NODE && ancestor.nodeType !== NODE_TEXT) {
        if (ancestor.matches(selector)) {
          parents.push(ancestor);
        }

        ancestor = ancestor.parentNode;
      }

      return parents;
    },

    prev(element, selector) {
      let previous = element.previousElementSibling;

      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }

        previous = previous.previousElementSibling;
      }

      return [];
    },

    next(element, selector) {
      let next = element.nextElementSibling;

      while (next) {
        if (next.matches(selector)) {
          return [next];
        }

        next = next.nextElementSibling;
      }

      return [];
    },

    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(', ');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    }

  };

  return SelectorEngine;

}));

}(selectorEngine));

var baseComponent = {exports: {}};

var data = {exports: {}};

/*!
  * Bootstrap data.js v5.1.3 (https://getbootstrap.com/)
  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (module, exports) {
(function (global, factory) {
  module.exports = factory() ;
})(commonjsGlobal, (function () {
  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const elementMap = new Map();
  const data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }

      const instanceMap = elementMap.get(element); // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used

      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }

      instanceMap.set(key, instance);
    },

    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }

      return null;
    },

    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }

      const instanceMap = elementMap.get(element);
      instanceMap.delete(key); // free up element references if there are no instances left for an element

      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }

  };

  return data;

}));

}(data));

/*!
  * Bootstrap base-component.js v5.1.3 (https://getbootstrap.com/)
  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (module, exports) {
(function (global, factory) {
  module.exports = factory(data.exports, eventHandler.exports) ;
})(commonjsGlobal, (function (Data, EventHandler) {
  const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

  const Data__default = /*#__PURE__*/_interopDefaultLegacy(Data);
  const EventHandler__default = /*#__PURE__*/_interopDefaultLegacy(EventHandler);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend'; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    } // Get transition-duration of the element


    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    } // If multiple durations are defined, take the first


    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };

  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };

  const isElement = obj => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj.jquery !== 'undefined') {
      obj = obj[0];
    }

    return typeof obj.nodeType !== 'undefined';
  };

  const getElement = obj => {
    if (isElement(obj)) {
      // it's a jQuery object or a node element
      return obj.jquery ? obj[0] : obj;
    }

    if (typeof obj === 'string' && obj.length > 0) {
      return document.querySelector(obj);
    }

    return null;
  };

  const execute = callback => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }

    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;

    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }

      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };

    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const VERSION = '5.1.3';

  class BaseComponent {
    constructor(element) {
      element = getElement(element);

      if (!element) {
        return;
      }

      this._element = element;
      Data__default.default.set(this._element, this.constructor.DATA_KEY, this);
    }

    dispose() {
      Data__default.default.remove(this._element, this.constructor.DATA_KEY);
      EventHandler__default.default.off(this._element, this.constructor.EVENT_KEY);
      Object.getOwnPropertyNames(this).forEach(propertyName => {
        this[propertyName] = null;
      });
    }

    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    /** Static */


    static getInstance(element) {
      return Data__default.default.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }

    static get VERSION() {
      return VERSION;
    }

    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }

    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }

    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }

  }

  return BaseComponent;

}));

}(baseComponent));

/*!
  * Bootstrap modal.js v5.1.3 (https://getbootstrap.com/)
  * Copyright 2011-2021 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (module, exports) {
(function (global, factory) {
  module.exports = factory(eventHandler.exports, manipulator.exports, selectorEngine.exports, baseComponent.exports) ;
})(commonjsGlobal, (function (EventHandler, Manipulator, SelectorEngine, BaseComponent) {
  const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

  const EventHandler__default = /*#__PURE__*/_interopDefaultLegacy(EventHandler);
  const Manipulator__default = /*#__PURE__*/_interopDefaultLegacy(Manipulator);
  const SelectorEngine__default = /*#__PURE__*/_interopDefaultLegacy(SelectorEngine);
  const BaseComponent__default = /*#__PURE__*/_interopDefaultLegacy(BaseComponent);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend'; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  const toType = obj => {
    if (obj === null || obj === undefined) {
      return `${obj}`;
    }

    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  };

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');

    if (!selector || selector === '#') {
      let hrefAttr = element.getAttribute('href'); // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273

      if (!hrefAttr || !hrefAttr.includes('#') && !hrefAttr.startsWith('.')) {
        return null;
      } // Just in case some CMS puts out a full URL with the anchor appended


      if (hrefAttr.includes('#') && !hrefAttr.startsWith('#')) {
        hrefAttr = `#${hrefAttr.split('#')[1]}`;
      }

      selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : null;
    }

    return selector;
  };

  const getElementFromSelector = element => {
    const selector = getSelector(element);
    return selector ? document.querySelector(selector) : null;
  };

  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    } // Get transition-duration of the element


    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    } // If multiple durations are defined, take the first


    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };

  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };

  const isElement = obj => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    if (typeof obj.jquery !== 'undefined') {
      obj = obj[0];
    }

    return typeof obj.nodeType !== 'undefined';
  };

  const getElement = obj => {
    if (isElement(obj)) {
      // it's a jQuery object or a node element
      return obj.jquery ? obj[0] : obj;
    }

    if (typeof obj === 'string' && obj.length > 0) {
      return document.querySelector(obj);
    }

    return null;
  };

  const typeCheckConfig = (componentName, config, configTypes) => {
    Object.keys(configTypes).forEach(property => {
      const expectedTypes = configTypes[property];
      const value = config[property];
      const valueType = value && isElement(value) ? 'element' : toType(value);

      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(`${componentName.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
      }
    });
  };

  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }

    return getComputedStyle(element).getPropertyValue('visibility') === 'visible';
  };

  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (element.classList.contains('disabled')) {
      return true;
    }

    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }

    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };
  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */


  const reflow = element => {
    // eslint-disable-next-line no-unused-expressions
    element.offsetHeight;
  };

  const getjQuery = () => {
    const {
      jQuery
    } = window;

    if (jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return jQuery;
    }

    return null;
  };

  const DOMContentLoadedCallbacks = [];

  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          DOMContentLoadedCallbacks.forEach(callback => callback());
        });
      }

      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };

  const isRTL = () => document.documentElement.dir === 'rtl';

  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */

      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;

        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };

  const execute = callback => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }

    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;

    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }

      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };

    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }

    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }

    hide() {
      const width = this.getWidth();

      this._disableOverFlow(); // give padding to element to balance the hidden scrollbar width


      this._setElementAttributes(this._element, 'paddingRight', calculatedValue => calculatedValue + width); // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth


      this._setElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight', calculatedValue => calculatedValue + width);

      this._setElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight', calculatedValue => calculatedValue - width);
    }

    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');

      this._element.style.overflow = 'hidden';
    }

    _setElementAttributes(selector, styleProp, callback) {
      const scrollbarWidth = this.getWidth();

      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }

        this._saveInitialAttribute(element, styleProp);

        const calculatedValue = window.getComputedStyle(element)[styleProp];
        element.style[styleProp] = `${callback(Number.parseFloat(calculatedValue))}px`;
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    reset() {
      this._resetElementAttributes(this._element, 'overflow');

      this._resetElementAttributes(this._element, 'paddingRight');

      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, 'paddingRight');

      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, 'marginRight');
    }

    _saveInitialAttribute(element, styleProp) {
      const actualValue = element.style[styleProp];

      if (actualValue) {
        Manipulator__default.default.setDataAttribute(element, styleProp, actualValue);
      }
    }

    _resetElementAttributes(selector, styleProp) {
      const manipulationCallBack = element => {
        const value = Manipulator__default.default.getDataAttribute(element, styleProp);

        if (typeof value === 'undefined') {
          element.style.removeProperty(styleProp);
        } else {
          Manipulator__default.default.removeDataAttribute(element, styleProp);
          element.style[styleProp] = value;
        }
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    _applyManipulationCallback(selector, callBack) {
      if (isElement(selector)) {
        callBack(selector);
      } else {
        SelectorEngine__default.default.find(selector, this._element).forEach(callBack);
      }
    }

    isOverflowing() {
      return this.getWidth() > 0;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const Default$2 = {
    className: 'modal-backdrop',
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    isAnimated: false,
    rootElement: 'body',
    // give the choice to place backdrop under different elements
    clickCallback: null
  };
  const DefaultType$2 = {
    className: 'string',
    isVisible: 'boolean',
    isAnimated: 'boolean',
    rootElement: '(element|string)',
    clickCallback: '(function|null)'
  };
  const NAME$2 = 'backdrop';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$2}`;

  class Backdrop {
    constructor(config) {
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }

    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._append();

      if (this._config.isAnimated) {
        reflow(this._getElement());
      }

      this._getElement().classList.add(CLASS_NAME_SHOW$1);

      this._emulateAnimation(() => {
        execute(callback);
      });
    }

    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._getElement().classList.remove(CLASS_NAME_SHOW$1);

      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    } // Private


    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;

        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$1);
        }

        this._element = backdrop;
      }

      return this._element;
    }

    _getConfig(config) {
      config = { ...Default$2,
        ...(typeof config === 'object' ? config : {})
      }; // use getElement() with the default "body" to get a fresh Element on each instantiation

      config.rootElement = getElement(config.rootElement);
      typeCheckConfig(NAME$2, config, DefaultType$2);
      return config;
    }

    _append() {
      if (this._isAppended) {
        return;
      }

      this._config.rootElement.append(this._getElement());

      EventHandler__default.default.on(this._getElement(), EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }

    dispose() {
      if (!this._isAppended) {
        return;
      }

      EventHandler__default.default.off(this._element, EVENT_MOUSEDOWN);

      this._element.remove();

      this._isAppended = false;
    }

    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const Default$1 = {
    trapElement: null,
    // The element to trap focus inside of
    autofocus: true
  };
  const DefaultType$1 = {
    trapElement: 'element',
    autofocus: 'boolean'
  };
  const NAME$1 = 'focustrap';
  const DATA_KEY$1 = 'bs.focustrap';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY$1}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$1}`;
  const TAB_KEY = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';

  class FocusTrap {
    constructor(config) {
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }

    activate() {
      const {
        trapElement,
        autofocus
      } = this._config;

      if (this._isActive) {
        return;
      }

      if (autofocus) {
        trapElement.focus();
      }

      EventHandler__default.default.off(document, EVENT_KEY$1); // guard against infinite focus loop

      EventHandler__default.default.on(document, EVENT_FOCUSIN, event => this._handleFocusin(event));
      EventHandler__default.default.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }

    deactivate() {
      if (!this._isActive) {
        return;
      }

      this._isActive = false;
      EventHandler__default.default.off(document, EVENT_KEY$1);
    } // Private


    _handleFocusin(event) {
      const {
        target
      } = event;
      const {
        trapElement
      } = this._config;

      if (target === document || target === trapElement || trapElement.contains(target)) {
        return;
      }

      const elements = SelectorEngine__default.default.focusableChildren(trapElement);

      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }

    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }

      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }

    _getConfig(config) {
      config = { ...Default$1,
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME$1, config, DefaultType$1);
      return config;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler__default.default.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }

      if (isDisabled(this)) {
        return;
      }

      const target = getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target); // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method

      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.1.3): modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'modal';
  const DATA_KEY = 'bs.modal';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const ESCAPE_KEY = 'Escape';
  const Default = {
    backdrop: true,
    keyboard: true,
    focus: true
  };
  const DefaultType = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean'
  };
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const EVENT_RESIZE = `resize${EVENT_KEY}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY}`;
  const EVENT_MOUSEUP_DISMISS = `mouseup.dismiss${EVENT_KEY}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="modal"]';
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Modal extends BaseComponent__default.default {
    constructor(element, config) {
      super(element);
      this._config = this._getConfig(config);
      this._dialog = SelectorEngine__default.default.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
    } // Getters


    static get Default() {
      return Default;
    }

    static get NAME() {
      return NAME;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }

      const showEvent = EventHandler__default.default.trigger(this._element, EVENT_SHOW, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;

      if (this._isAnimated()) {
        this._isTransitioning = true;
      }

      this._scrollBar.hide();

      document.body.classList.add(CLASS_NAME_OPEN);

      this._adjustDialog();

      this._setEscapeEvent();

      this._setResizeEvent();

      EventHandler__default.default.on(this._dialog, EVENT_MOUSEDOWN_DISMISS, () => {
        EventHandler__default.default.one(this._element, EVENT_MOUSEUP_DISMISS, event => {
          if (event.target === this._element) {
            this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(() => this._showElement(relatedTarget));
    }

    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }

      const hideEvent = EventHandler__default.default.trigger(this._element, EVENT_HIDE);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._isShown = false;

      const isAnimated = this._isAnimated();

      if (isAnimated) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      this._focustrap.deactivate();

      this._element.classList.remove(CLASS_NAME_SHOW);

      EventHandler__default.default.off(this._element, EVENT_CLICK_DISMISS);
      EventHandler__default.default.off(this._dialog, EVENT_MOUSEDOWN_DISMISS);

      this._queueCallback(() => this._hideModal(), this._element, isAnimated);
    }

    dispose() {
      [window, this._dialog].forEach(htmlElement => EventHandler__default.default.off(htmlElement, EVENT_KEY));

      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    }

    handleUpdate() {
      this._adjustDialog();
    } // Private


    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value
        isAnimated: this._isAnimated()
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _getConfig(config) {
      config = { ...Default,
        ...Manipulator__default.default.getDataAttributes(this._element),
        ...(typeof config === 'object' ? config : {})
      };
      typeCheckConfig(NAME, config, DefaultType);
      return config;
    }

    _showElement(relatedTarget) {
      const isAnimated = this._isAnimated();

      const modalBody = SelectorEngine__default.default.findOne(SELECTOR_MODAL_BODY, this._dialog);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // Don't move modal's DOM position
        document.body.append(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.scrollTop = 0;

      if (modalBody) {
        modalBody.scrollTop = 0;
      }

      if (isAnimated) {
        reflow(this._element);
      }

      this._element.classList.add(CLASS_NAME_SHOW);

      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }

        this._isTransitioning = false;
        EventHandler__default.default.trigger(this._element, EVENT_SHOWN, {
          relatedTarget
        });
      };

      this._queueCallback(transitionComplete, this._dialog, isAnimated);
    }

    _setEscapeEvent() {
      if (this._isShown) {
        EventHandler__default.default.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
          if (this._config.keyboard && event.key === ESCAPE_KEY) {
            event.preventDefault();
            this.hide();
          } else if (!this._config.keyboard && event.key === ESCAPE_KEY) {
            this._triggerBackdropTransition();
          }
        });
      } else {
        EventHandler__default.default.off(this._element, EVENT_KEYDOWN_DISMISS);
      }
    }

    _setResizeEvent() {
      if (this._isShown) {
        EventHandler__default.default.on(window, EVENT_RESIZE, () => this._adjustDialog());
      } else {
        EventHandler__default.default.off(window, EVENT_RESIZE);
      }
    }

    _hideModal() {
      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._element.removeAttribute('aria-modal');

      this._element.removeAttribute('role');

      this._isTransitioning = false;

      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);

        this._resetAdjustments();

        this._scrollBar.reset();

        EventHandler__default.default.trigger(this._element, EVENT_HIDDEN);
      });
    }

    _showBackdrop(callback) {
      EventHandler__default.default.on(this._element, EVENT_CLICK_DISMISS, event => {
        if (this._ignoreBackdropClick) {
          this._ignoreBackdropClick = false;
          return;
        }

        if (event.target !== event.currentTarget) {
          return;
        }

        if (this._config.backdrop === true) {
          this.hide();
        } else if (this._config.backdrop === 'static') {
          this._triggerBackdropTransition();
        }
      });

      this._backdrop.show(callback);
    }

    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE);
    }

    _triggerBackdropTransition() {
      const hideEvent = EventHandler__default.default.trigger(this._element, EVENT_HIDE_PREVENTED);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const {
        classList,
        scrollHeight,
        style
      } = this._element;
      const isModalOverflowing = scrollHeight > document.documentElement.clientHeight; // return if the following background transition hasn't yet completed

      if (!isModalOverflowing && style.overflowY === 'hidden' || classList.contains(CLASS_NAME_STATIC)) {
        return;
      }

      if (!isModalOverflowing) {
        style.overflowY = 'hidden';
      }

      classList.add(CLASS_NAME_STATIC);

      this._queueCallback(() => {
        classList.remove(CLASS_NAME_STATIC);

        if (!isModalOverflowing) {
          this._queueCallback(() => {
            style.overflowY = '';
          }, this._dialog);
        }
      }, this._dialog);

      this._element.focus();
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // ----------------------------------------------------------------------


    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      const scrollbarWidth = this._scrollBar.getWidth();

      const isBodyOverflowing = scrollbarWidth > 0;

      if (!isBodyOverflowing && isModalOverflowing && !isRTL() || isBodyOverflowing && !isModalOverflowing && isRTL()) {
        this._element.style.paddingLeft = `${scrollbarWidth}px`;
      }

      if (isBodyOverflowing && !isModalOverflowing && !isRTL() || !isBodyOverflowing && isModalOverflowing && isRTL()) {
        this._element.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    } // Static


    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](relatedTarget);
      });
    }

  }
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  EventHandler__default.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    EventHandler__default.default.one(target, EVENT_SHOW, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }

      EventHandler__default.default.one(target, EVENT_HIDDEN, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    }); // avoid conflict when clicking moddal toggler while another one is open

    const allReadyOpen = SelectorEngine__default.default.findOne(OPEN_SELECTOR);

    if (allReadyOpen) {
      Modal.getInstance(allReadyOpen).hide();
    }

    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   * add .Modal to jQuery only if jQuery is present
   */

  defineJQueryPlugin(Modal);

  return Modal;

}));

}(modal));

var Modal = modal.exports;

function _createForOfIteratorHelper$1(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper$5(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$5(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$5() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var Layout = /*#__PURE__*/function (_EventHarness) {
  _inherits(Layout, _EventHarness);

  var _super = _createSuper$5(Layout);

  /**
   * @type {App}
   */

  /**
   * @type {string}
   */

  /**
   * this also needs to be edited in index.html
   *
   * @type {string}
   */

  /**
   * @type {string}
   */
  function Layout() {
    var _this;

    _classCallCheck(this, Layout);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "app", void 0);

    _defineProperty(_assertThisInitialized(_this), "surveysMenuId", void 0);

    _defineProperty(_assertThisInitialized(_this), "newSurveyLabel", 'new survey');

    _defineProperty(_assertThisInitialized(_this), "newSurveyContent", newSurveyModal);

    _defineProperty(_assertThisInitialized(_this), "pathPrefix", void 0);

    _defineProperty(_assertThisInitialized(_this), "newSurveyModal", void 0);

    _defineProperty(_assertThisInitialized(_this), "resetModal", void 0);

    _defineProperty(_assertThisInitialized(_this), "saveAllSuccessModal", void 0);

    _defineProperty(_assertThisInitialized(_this), "saveAllFailureModal", void 0);

    _this.pathPrefix = window.location.pathname.split('/')[1];
    return _this;
  }
  /**
   *
   * @param {App} app
   */


  _createClass(Layout, [{
    key: "setApp",
    value: function setApp(app) {
      var _this2 = this;

      this.app = app;
      app.addListener(App.EVENT_SURVEYS_CHANGED, function () {
        _this2.refreshSurveysMenu();
      });

      if (navigator.hasOwnProperty('onLine') && navigator.onLine === false) {
        this.addOfflineFlag();
      }

      window.addEventListener('online', function () {
        document.body.classList.remove('offline');
        app.syncAll(); // possibly not needed but useful as fallback to try to force saving
      });
      window.addEventListener('offline', this.addOfflineFlag);
      this.registerGPSClassMarker(); // const navMain = $("#navbarSupportedContent");
      // navMain.on("click", "a", null, function () {
      //     console.log('forced navbar collapse');
      //     navMain.collapse('hide');
      // });

      var navEl = document.getElementById('navbarSupportedContent');
      navEl.addEventListener('click', function (event) {
        var element = event.target;
        console.log({
          'nav content click': event
        });

        if (element.tagName === 'A') {
          console.log('forced navbar collapse (inactive)'); //Collapse.getOrCreateInstance(navEl).hide();
        }
      });
    }
  }, {
    key: "addOfflineFlag",
    value: function addOfflineFlag() {
      document.body.classList.add('offline');
    }
  }, {
    key: "registerGPSClassMarker",
    value: function registerGPSClassMarker() {
      if (navigator.geolocation) {
        GPSRequest.haveGPSPermissionPromise().then(function (permission) {
          if (permission === GPSRequest.GPS_PERMISSION_GRANTED) {
            document.body.classList.add('gps-enabled');
          }

          GPSRequest.gpsEventObject.addListener(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, function (permission) {
            if (permission === GPSRequest.GPS_PERMISSION_GRANTED) {
              document.body.classList.add('gps-enabled');
            } else {
              document.body.classList.remove('gps-enabled');
            }
          });
        });
      }
    }
    /**
     * @type {Modal}
     */

  }, {
    key: "initialise",
    value: function initialise() {
      var _this3 = this;

      this.refreshSurveysMenu();
      var modalContent = document.createElement('div');
      modalContent.innerHTML = this.newSurveyContent;
      document.body.appendChild(modalContent.getElementsByTagName('div')[0]);
      modalContent = document.createElement('div');
      modalContent.innerHTML = resetModal;
      document.body.appendChild(modalContent.getElementsByTagName('div')[0]);
      modalContent = document.createElement('div');
      modalContent.innerHTML = saveAllSuccessModal;
      document.body.appendChild(modalContent.getElementsByTagName('div')[0]);
      modalContent = document.createElement('div');
      modalContent.innerHTML = saveAllFailureModal;
      document.body.appendChild(modalContent.getElementsByTagName('div')[0]); // register event handlers once the content is likely to be in the DOM
      //setTimeout(() => {

      this.newSurveyModal = Modal.getOrCreateInstance(document.getElementById(Layout.NEW_SURVEY_MODAL_ID), {});
      this.resetModal = Modal.getOrCreateInstance(document.getElementById(Layout.RESET_MODAL_ID), {});
      this.saveAllSuccessModal = Modal.getOrCreateInstance(document.getElementById(Layout.SAVE_ALL_SUCCESS_MODAL_ID), {});
      this.saveAllFailureModal = Modal.getOrCreateInstance(document.getElementById(Layout.SAVE_ALL_FAILURE_MODAL_ID), {});
      document.getElementById("".concat(Layout.NEW_SURVEY_MODAL_ID, "confirmed")).addEventListener('click', function (event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.detail < 2) {
          // only if not a double click
          // force hide the new survey modal
          //$(`#${Layout.NEW_SURVEY_MODAL_ID}`).modal('hide');
          _this3.newSurveyModal.hide();

          _this3.app.fireEvent(App.EVENT_ADD_SURVEY_USER_REQUEST);
        }
      });
      document.getElementById("".concat(Layout.RESET_MODAL_ID, "confirmed")).addEventListener('click', function (event) {
        event.stopPropagation();
        event.preventDefault();

        if (event.detail < 2) {
          // force hide the new survey modal
          //$(`#${Layout.RESET_MODAL_ID}`).modal('hide');
          _this3.resetModal.hide(); // only if not a double click


          _this3.app.fireEvent(App.EVENT_RESET_SURVEYS);
        }
      }); //}, 100);
    }
  }, {
    key: "refreshSurveysMenu",
    value: function refreshSurveysMenu() {
      var surveyMenuContainer = document.getElementById(this.surveysMenuId);
      var items = this.getSurveyItems();
      surveyMenuContainer.innerHTML = "<a class=\"dropdown-item\" href=\"/".concat(this.pathPrefix, "/survey/save\" data-navigo=\"survey/save\">save all</a>\n    <div class=\"dropdown-divider\"></div>\n    ").concat(items.join(''), "\n    <div class=\"dropdown-divider\"></div>\n    <a class=\"dropdown-item\" href=\"/").concat(this.pathPrefix, "/survey/new\" data-navigo=\"survey/new\">").concat(this.newSurveyLabel, "</a>\n    <a class=\"dropdown-item\" href=\"/").concat(this.pathPrefix, "/survey/reset\" data-navigo=\"survey/reset\">reset</a>");
      this.app.router.updatePageLinks();
    }
  }, {
    key: "getSurveyItems",
    value: function getSurveyItems() {
      /**
       *
       * @type {Array.<string>}
       */
      var items = [];
      var currentSurveyId = this.app.currentSurvey ? this.app.currentSurvey.id : null;

      var _iterator = _createForOfIteratorHelper$1(this.app.surveys),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var surveyTuple = _step.value;
          var survey = surveyTuple[1];
          var label = survey.generateSurveyName() + (surveyTuple[0] === currentSurveyId ? ' <span style="color: green">●</span>' : '');
          items[items.length] = "<a class=\"dropdown-item\" href=\"/".concat(this.pathPrefix, "/survey/add/").concat(surveyTuple[0], "\" data-navigo=\"survey/add/").concat(surveyTuple[0], "\">").concat(label, "</a>");
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return items;
    }
  }]);

  return Layout;
}(EventHarness);

_defineProperty(Layout, "NEW_SURVEY_MODAL_ID", 'newsurveymodal');

_defineProperty(Layout, "RESET_MODAL_ID", 'resetmodal');

_defineProperty(Layout, "SAVE_ALL_SUCCESS_MODAL_ID", 'saveallsuccess');

_defineProperty(Layout, "SAVE_ALL_FAILURE_MODAL_ID", 'saveallfailure');

function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var SurveyPickerController = /*#__PURE__*/function (_AppController) {
  _inherits(SurveyPickerController, _AppController);

  var _super = _createSuper$4(SurveyPickerController);

  /**
   *
   * @param {SurveyPickerView} view
   */
  function SurveyPickerController(view) {
    var _this;

    _classCallCheck(this, SurveyPickerController);

    _this = _super.call(this);

    _defineProperty(_assertThisInitialized(_this), "route", '/survey/:action/:id');

    _defineProperty(_assertThisInitialized(_this), "title", 'Survey picker');

    _defineProperty(_assertThisInitialized(_this), "app", void 0);

    _defineProperty(_assertThisInitialized(_this), "view", void 0);

    _this.view = view;
    view.controller = _assertThisInitialized(_this);
    _this.handle = AppController.nextHandle;
    return _this;
  }
  /**
   * registers the default route from this.route
   * or alternatively is overridden in a child class
   *
   * @param {PatchedNavigo} router
   */


  _createClass(SurveyPickerController, [{
    key: "survey",
    get:
    /**
     * @type {App}
     */

    /**
     *
     * @type {SurveyPickerView}
     */

    /**
     *
     * @returns {Survey}
     */
    function get() {
      return this.app.currentSurvey;
    }
  }, {
    key: "registerRoute",
    value: function registerRoute(router) {
      router.on('/survey', this.mainRouteHandler.bind(this, 'survey', '', ''), {// before : this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        // after : this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        // leave : this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        // already : this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
      });
      router.on('/survey/new', this.newSurveyHandler.bind(this, 'survey', 'new', ''), {
        before: this.beforeNewHandler.bind(this)
      });
      router.on('/survey/reset', this.mainRouteHandler.bind(this, 'survey', 'reset', ''), {
        before: this.beforeResetHandler.bind(this)
      });
      router.on('/survey/save', this.mainRouteHandler.bind(this, 'survey', 'save', ''), {
        before: this.beforeSaveAllHandler.bind(this)
      });
      router.on('/survey/add/:surveyId', this.addSurveyHandler.bind(this, 'survey', 'add', ''));
      this.app.addListener(App.EVENT_ADD_SURVEY_USER_REQUEST, this.addNewSurveyHandler.bind(this));
      this.app.addListener(App.EVENT_RESET_SURVEYS, this.resetSurveysHandler.bind(this));
    }
  }, {
    key: "beforeNewHandler",
    value: function beforeNewHandler(done) {
      //$(`#${Layout.NEW_SURVEY_MODAL_ID}`).modal();
      Modal.getOrCreateInstance(Layout.NEW_SURVEY_MODAL_ID).show();
      this.app.router.pause();
      console.log({
        'route history': this.app.routeHistory
      });

      if (window.history.state) {
        window.history.back(); // this could fail if previous url was not under the single-page-app umbrella (should test)
      }

      this.app.router.resume();
      done(false); // block navigation
    }
  }, {
    key: "beforeResetHandler",
    value: function beforeResetHandler(done) {
      //$(`#${Layout.RESET_MODAL_ID}`).modal();
      Modal.getOrCreateInstance(Layout.RESET_MODAL_ID).show();
      this.app.router.pause();

      if (window.history.state) {
        window.history.back(); // this could fail if previous url was not under the single-page-app umbrella (should test)
      }

      this.app.router.resume();
      done(false); // block navigation
    }
  }, {
    key: "beforeSaveAllHandler",
    value: function beforeSaveAllHandler(done) {
      // invoke sync of any/all unsaved data
      // show pop-ups on success and failure
      this.app.syncAll().then(function (result) {
        console.log({
          'In save all handler, success result': result
        });

        if (Array.isArray(result)) {
          //$(`#${Layout.SAVE_ALL_SUCCESS_MODAL_ID}`).modal();
          Modal.getOrCreateInstance(Layout.SAVE_ALL_SUCCESS_MODAL_ID).show();
        } else {
          //$(`#${Layout.SAVE_ALL_FAILURE_MODAL_ID}`).modal();
          Modal.getOrCreateInstance(Layout.SAVE_ALL_FAILURE_MODAL_ID).show();
        }
      }, function (result) {
        console.log({
          'In save all handler, failure result': result
        }); //$(`#${Layout.SAVE_ALL_FAILURE_MODAL_ID}`).modal();

        Modal.getOrCreateInstance(Layout.SAVE_ALL_FAILURE_MODAL_ID).show();
      }).finally(function () {// stop the spinner
      });
      this.app.router.pause();

      if (window.history.state) {
        window.history.back(); // this could fail if previous url was not under the single-page-app umbrella (should test)
      }

      this.app.router.resume();
      done(false); // block navigation
    }
    /**
     *
     * @param {string} context typically 'survey'
     * @param {('new'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */

  }, {
    key: "newSurveyHandler",
    value: function newSurveyHandler(context, subcontext, rhs, queryParameters) {// should not get here, as beforeNewHandler ought to have been invoked first
    }
    /**
     * called after user has confirmed add new survey dialog box
     *
     */

  }, {
    key: "addNewSurveyHandler",
    value: function addNewSurveyHandler() {
      console.log("reached addNewSurveyHandler");
      this.app.currentControllerHandle = this.handle; // when navigate back need to list need to ensure full view refresh
      // the apps occurrences should only relate to the current survey
      // (the reset are remote or in IndexedDb)

      this.app.clearCurrentSurvey();
      this.app.setNewSurvey(); // it's opportune at this point to try to ping the server again to save anything left outstanding

      this.app.syncAll();
      this.app.router.pause();
      this.app.router.navigate('/list/survey/about').resume(); // jump straight into the survey rather than to welcome stage

      this.app.router.resolve();
    }
    /**
     * called after user has confirmed reset surveys dialog box
     */

  }, {
    key: "resetSurveysHandler",
    value: function resetSurveysHandler() {
      var _this2 = this;

      this.app.clearLocalForage().then(function () {
        _this2.app.reset();

        _this2.addNewSurveyHandler();
      });
    }
    /**
     *
     * @param {string} context typically 'survey'
     * @param {('add'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */

  }, {
    key: "addSurveyHandler",
    value: function addSurveyHandler(context, subcontext, rhs, queryParameters) {
      var _this3 = this;

      console.log("reached addSurveyHandler");
      console.log({
        context: context,
        params: subcontext,
        query: queryParameters
      });
      this.app.currentControllerHandle = this.handle; // when navigate back need to list need to ensure full view refresh

      var surveyId = queryParameters.surveyId;

      if (!surveyId || !surveyId.match(UUID_REGEX)) {
        throw new NotFoundError("Failed to match survey id '".concat(surveyId, "', the id format appears to be incorrect"));
      }

      surveyId = surveyId.toLowerCase();
      this.app.restoreOccurrences(surveyId).then(function () {
        _this3.app.markAllNotPristine();

        _this3.app.router.pause();

        _this3.app.router.navigate('/list').resume();

        _this3.app.router.resolve();
      }, function (error) {
        console.log({
          'failed survey restoration': error
        }); // should display a modal error message
        // either the survey was not found or there was no network connection
        // should switch to displaying a list of available surveys and an option to start a new survey
      });
    }
    /**
     *
     * @param {string} context typically 'survey'
     * @param {('add'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */

  }, {
    key: "mainRouteHandler",
    value: function mainRouteHandler(context, subcontext, rhs, queryParameters) {
      console.log("reached special route handler for SurveyPickerController.js");
      console.log({
        context: context,
        params: subcontext,
        query: queryParameters
      });
    }
  }]);

  return SurveyPickerController;
}(AppController);

_defineProperty(SurveyPickerController, "EVENT_BACK", 'back');

/* eslint-disable es/no-string-prototype-matchall -- safe */
var $$5 = _export;
var global$5 = global$11;
var call = functionCall;
var uncurryThis$4 = functionUncurryThis;
var createIteratorConstructor = createIteratorConstructor$2;
var requireObjectCoercible$1 = requireObjectCoercible$a;
var toLength$1 = toLength$6;
var toString$3 = toString$g;
var anObject = anObject$l;
var classof$2 = classofRaw$1;
var isPrototypeOf$1 = objectIsPrototypeOf;
var isRegExp$1 = isRegexp;
var regExpFlags$1 = regexpFlags$1;
var getMethod = getMethod$7;
var redefine$1 = redefine$d.exports;
var fails$2 = fails$B;
var wellKnownSymbol$1 = wellKnownSymbol$q;
var speciesConstructor = speciesConstructor$4;
var advanceStringIndex = advanceStringIndex$4;
var regExpExec = regexpExecAbstract;
var InternalStateModule = internalState;
var IS_PURE = isPure;

var MATCH_ALL = wellKnownSymbol$1('matchAll');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState$2 = InternalStateModule.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype$3 = RegExp.prototype;
var TypeError$4 = global$5.TypeError;
var getFlags$1 = uncurryThis$4(regExpFlags$1);
var stringIndexOf$1 = uncurryThis$4(''.indexOf);
var un$MatchAll = uncurryThis$4(''.matchAll);

var WORKS_WITH_NON_GLOBAL_REGEX = !!un$MatchAll && !fails$2(function () {
  un$MatchAll('a', /./);
});

var $RegExpStringIterator = createIteratorConstructor(function RegExpStringIterator(regexp, string, $global, fullUnicode) {
  setInternalState(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: $global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState$2(this);
  if (state.done) return { value: undefined, done: true };
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec(R, S);
  if (match === null) return { value: undefined, done: state.done = true };
  if (state.global) {
    if (toString$3(match[0]) === '') R.lastIndex = advanceStringIndex(S, toLength$1(R.lastIndex), state.unicode);
    return { value: match, done: false };
  }
  state.done = true;
  return { value: match, done: false };
});

var $matchAll = function (string) {
  var R = anObject(this);
  var S = toString$3(string);
  var C, flagsValue, flags, matcher, $global, fullUnicode;
  C = speciesConstructor(R, RegExp);
  flagsValue = R.flags;
  if (flagsValue === undefined && isPrototypeOf$1(RegExpPrototype$3, R) && !('flags' in RegExpPrototype$3)) {
    flagsValue = getFlags$1(R);
  }
  flags = flagsValue === undefined ? '' : toString$3(flagsValue);
  matcher = new C(C === RegExp ? R.source : R, flags);
  $global = !!~stringIndexOf$1(flags, 'g');
  fullUnicode = !!~stringIndexOf$1(flags, 'u');
  matcher.lastIndex = toLength$1(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, $global, fullUnicode);
};

// `String.prototype.matchAll` method
// https://tc39.es/ecma262/#sec-string.prototype.matchall
$$5({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible$1(this);
    var flags, S, matcher, rx;
    if (regexp != null) {
      if (isRegExp$1(regexp)) {
        flags = toString$3(requireObjectCoercible$1('flags' in RegExpPrototype$3
          ? regexp.flags
          : getFlags$1(regexp)
        ));
        if (!~stringIndexOf$1(flags, 'g')) throw TypeError$4('`.matchAll` does not allow non-global regexes');
      }
      if (WORKS_WITH_NON_GLOBAL_REGEX) return un$MatchAll(O, regexp);
      matcher = getMethod(regexp, MATCH_ALL);
      if (matcher === undefined && IS_PURE && classof$2(regexp) == 'RegExp') matcher = $matchAll;
      if (matcher) return call(matcher, regexp, O);
    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return un$MatchAll(O, regexp);
    S = toString$3(O);
    rx = new RegExp(regexp, 'g');
    return rx[MATCH_ALL](S);
  }
});

MATCH_ALL in RegExpPrototype$3 || redefine$1(RegExpPrototype$3, MATCH_ALL, $matchAll);

var $$4 = _export;
var $map = arrayIteration.map;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$4({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3 = _export;
var uncurryThis$3 = functionUncurryThis;
var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var toLength = toLength$6;
var toString$2 = toString$g;
var notARegExp = notARegexp;
var requireObjectCoercible = requireObjectCoercible$a;
var correctIsRegExpLogic = correctIsRegexpLogic;

// eslint-disable-next-line es/no-string-prototype-startswith -- safe
var un$StartsWith = uncurryThis$3(''.startsWith);
var stringSlice$1 = uncurryThis$3(''.slice);
var min$1 = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$$3({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = toString$2(requireObjectCoercible(this));
    notARegExp(searchString);
    var index = toLength(min$1(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = toString$2(searchString);
    return un$StartsWith
      ? un$StartsWith(that, search, index)
      : stringSlice$1(that, index, index + search.length) === search;
  }
});

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
var ResponseFactory = /*#__PURE__*/function () {
  function ResponseFactory() {
    _classCallCheck(this, ResponseFactory);
  }

  _createClass(ResponseFactory, null, [{
    key: "fromPostedData",
    value:
    /**
     *
     * @param {FormData} formData
     * @returns {LocalResponse}
     */
    function fromPostedData(formData) {
      /**
       * the object that will be saved to IndexedDb
       *
       * this needs to be in scope for several stages of the promise chain
       * @type {{[saved]: string, [type]: string, [imageId]: string, [surveyId]: string, [occurrenceId]: string, [image]: file, [projectId]: number, saveState: string }}
       */
      var toSaveLocally = {
        saveState: SAVE_STATE_LOCAL // mark as not saved externally

      };

      var _iterator = _createForOfIteratorHelper(formData.entries()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pair = _step.value;
          toSaveLocally[pair[0]] = pair[1];
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      if (!toSaveLocally.type) {
        throw new Error('Missing type in form data.');
      }

      if (ResponseFactory.responses.hasOwnProperty(toSaveLocally.type)) {
        return new ResponseFactory.responses[toSaveLocally.type](toSaveLocally, {});
      } else {
        throw new Error("Unrecognised post type '".concat(toSaveLocally.type, "'"));
      }
    }
    /**
     *
     * @param {{}} returnedToClient
     */

  }, {
    key: "fromPostResponse",
    value: function fromPostResponse(returnedToClient) {
      if (!returnedToClient) {
        throw new Error('Invalid empty post response.');
      }

      if (!returnedToClient.type) {
        throw new Error('Missing type in returned response.');
      }

      if (ResponseFactory.responses.hasOwnProperty(returnedToClient.type)) {
        console.log("in fromPostResponse returning a ".concat(returnedToClient.type));
        return new ResponseFactory.responses[returnedToClient.type]({}, returnedToClient);
      } else {
        throw new Error("Unrecognised post type '".concat(returnedToClient.type, "'"));
      }
    }
  }]);

  return ResponseFactory;
}();

_defineProperty(ResponseFactory, "responses", {});

function packageClientResponse(returnedToClient) {
  var headers = new Headers();
  headers.set('Content-Type', 'application/json');
  return new Response(JSON.stringify(returnedToClient), {
    status: returnedToClient.error ? 500 : 200,
    headers: headers
  });
}

var LocalResponse = /*#__PURE__*/function () {
  /**
   * @type {Response}
   */
  function LocalResponse(toSaveLocally, returnedToClient) {
    _classCallCheck(this, LocalResponse);

    _defineProperty(this, "toSaveLocally", void 0);

    _defineProperty(this, "returnedToClient", void 0);

    _defineProperty(this, "prebuiltResponse", void 0);

    _defineProperty(this, "failureErrorMessage", 'Failed to save a local copy on your device.');

    _defineProperty(this, "failureErrorHelp", 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' + 'Please try to re-establish a network connection and try again.');

    this.toSaveLocally = toSaveLocally;
    this.returnedToClient = returnedToClient;
  }
  /**
   *
   * @param {Response} prebuiltResponse
   * @returns this
   */


  _createClass(LocalResponse, [{
    key: "setPrebuiltResponse",
    value: function setPrebuiltResponse(prebuiltResponse) {
      this.prebuiltResponse = prebuiltResponse;
      return this;
    }
    /**
     *
     * @returns {Promise<Response>}
     */

  }, {
    key: "storeLocally",
    value: function storeLocally() {
      var _this = this;

      return localforage.setItem(this.localKey(), this.toSaveLocally).then(function () {
        console.log("Stored object ".concat(_this.localKey(), " locally"));
        return _this.prebuiltResponse ? _this.prebuiltResponse : packageClientResponse(_this.returnedToClient);
      }, function (reason) {
        console.log("Failed to store object ".concat(_this.localKey(), " locally"));
        console.log({
          reason: reason
        });
        _this.returnedToClient.error = _this.failureErrorMessage;
        _this.returnedToClient.errorHelp = _this.failureErrorHelp;
        return packageClientResponse(_this.returnedToClient);
      });
    }
    /**
     * @return {string}
     */

  }, {
    key: "localKey",
    value: function localKey() {
      throw new Error("LocalKey must be implemented in a subclass for ".concat(this.toSaveLocally.type));
    }
    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     * @abstract
     */

  }, {
    key: "populateClientResponse",
    value: function populateClientResponse() {}
  }]);

  return LocalResponse;
}();

function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var ImageResponse = /*#__PURE__*/function (_LocalResponse) {
  _inherits(ImageResponse, _LocalResponse);

  var _super = _createSuper$3(ImageResponse);

  function ImageResponse() {
    var _this;

    _classCallCheck(this, ImageResponse);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "failureErrorMessage", 'Failed to store image.');

    _defineProperty(_assertThisInitialized(_this), "failureErrorHelp", 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' + 'Please try to re-establish a network connection and try again.');

    return _this;
  }

  _createClass(ImageResponse, [{
    key: "populateClientResponse",
    value:
    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    function populateClientResponse() {
      this.returnedToClient.id = this.toSaveLocally.imageId ? this.toSaveLocally.imageId : this.toSaveLocally.id;
      this.returnedToClient.imageId = this.toSaveLocally.imageId ? this.toSaveLocally.imageId : this.toSaveLocally.id;
      this.returnedToClient.type = 'image';
      this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
      this.returnedToClient.occurrenceId = this.toSaveLocally.occurrenceId;
      this.returnedToClient.created = parseInt(this.toSaveLocally.created, 10); // stamps from server always take precedence

      this.returnedToClient.modified = parseInt(this.toSaveLocally.modified, 10);
      this.returnedToClient.saveState = SAVE_STATE_LOCAL;
      this.returnedToClient.deleted = this.toSaveLocally.deleted;
      this.returnedToClient.projectId = parseInt(this.toSaveLocally.projectId, 10);
      return this;
    }
    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */

  }, {
    key: "populateLocalSave",
    value: function populateLocalSave() {
      this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
      this.toSaveLocally.type = 'image';
      this.toSaveLocally.occurrenceId = this.returnedToClient.occurrenceId;
      this.toSaveLocally.imageId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.imageId; // hedging

      this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.imageId; // hedging

      this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence

      this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
      this.toSaveLocally.saveState = SAVE_STATE_SERVER;
      this.toSaveLocally.deleted = this.returnedToClient.deleted === true || this.returnedToClient.deleted === 'true';
      this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
      return this;
    }
    /**
     *
     * @returns {string}
     */

  }, {
    key: "localKey",
    value: function localKey() {
      return "image.".concat(this.toSaveLocally.imageId);
    }
  }], [{
    key: "register",
    value: function register() {
      ResponseFactory.responses.image = ImageResponse;
    }
  }]);

  return ImageResponse;
}(LocalResponse);

function _createSuper$2(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$2(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$2() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var SurveyResponse = /*#__PURE__*/function (_LocalResponse) {
  _inherits(SurveyResponse, _LocalResponse);

  var _super = _createSuper$2(SurveyResponse);

  function SurveyResponse() {
    var _this;

    _classCallCheck(this, SurveyResponse);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "failureErrorMessage", 'Failed to store survey.');

    _defineProperty(_assertThisInitialized(_this), "failureErrorHelp", 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' + 'Please try to re-establish a network connection and try again.');

    return _this;
  }

  _createClass(SurveyResponse, [{
    key: "populateClientResponse",
    value:
    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    function populateClientResponse() {
      this.toSaveLocally.surveyId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId; // hedging

      this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId; // hedging

      this.returnedToClient.type = 'survey';
      this.returnedToClient.attributes = this.toSaveLocally.attributes;
      this.returnedToClient.created = this.toSaveLocally.created; // stamps from server always take precedence

      this.returnedToClient.modified = this.toSaveLocally.modified;
      this.returnedToClient.saveState = SAVE_STATE_LOCAL;
      this.returnedToClient.deleted = this.toSaveLocally.deleted;
      this.returnedToClient.projectId = this.toSaveLocally.projectId;
      return this;
    }
    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */

  }, {
    key: "populateLocalSave",
    value: function populateLocalSave() {
      this.toSaveLocally.surveyId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId;
      this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId;
      this.toSaveLocally.type = 'survey';
      this.toSaveLocally.attributes = this.returnedToClient.attributes;
      this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence

      this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
      this.toSaveLocally.saveState = SAVE_STATE_SERVER;
      this.toSaveLocally.deleted = this.returnedToClient.deleted;
      this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
      return this;
    }
    /**
     *
     * @returns {string}
     */

  }, {
    key: "localKey",
    value: function localKey() {
      return "survey.".concat(this.toSaveLocally.surveyId);
    }
  }], [{
    key: "register",
    value: function register() {
      ResponseFactory.responses.survey = SurveyResponse;
    }
  }]);

  return SurveyResponse;
}(LocalResponse);

function _createSuper$1(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$1(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct$1() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var OccurrenceResponse = /*#__PURE__*/function (_LocalResponse) {
  _inherits(OccurrenceResponse, _LocalResponse);

  var _super = _createSuper$1(OccurrenceResponse);

  function OccurrenceResponse() {
    var _this;

    _classCallCheck(this, OccurrenceResponse);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "failureErrorMessage", 'Failed to store occurrence.');

    _defineProperty(_assertThisInitialized(_this), "failureErrorHelp", 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' + 'Please try to re-establish a network connection and try again.');

    return _this;
  }

  _createClass(OccurrenceResponse, [{
    key: "populateClientResponse",
    value:
    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    function populateClientResponse() {
      this.returnedToClient.id = this.toSaveLocally.occurrenceId ? this.toSaveLocally.occurrenceId : this.toSaveLocally.id;
      this.returnedToClient.occurrenceId = this.toSaveLocally.occurrenceId ? this.toSaveLocally.occurrenceId : this.toSaveLocally.id;
      this.returnedToClient.type = 'occurrence';
      this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
      this.returnedToClient.attributes = this.toSaveLocally.attributes;
      this.returnedToClient.created = parseInt(this.toSaveLocally.created, 10); // stamps from server always take precedence

      this.returnedToClient.modified = parseInt(this.toSaveLocally.modified, 10);
      this.returnedToClient.saveState = SAVE_STATE_LOCAL;
      this.returnedToClient.deleted = this.toSaveLocally.deleted;
      this.returnedToClient.projectId = parseInt(this.toSaveLocally.projectId, 10);
      return this;
    }
    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */

  }, {
    key: "populateLocalSave",
    value: function populateLocalSave() {
      this.toSaveLocally.occurrenceId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.occurrenceId; // hedging

      this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.occurrenceId; // hedging

      this.toSaveLocally.type = 'occurrence';
      this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
      this.toSaveLocally.attributes = this.returnedToClient.attributes;
      this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence

      this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
      this.toSaveLocally.saveState = SAVE_STATE_SERVER;
      this.toSaveLocally.deleted = this.returnedToClient.deleted === true || this.returnedToClient.deleted === 'true';
      this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
      return this;
    }
    /**
     *
     * @returns {string}
     */

  }, {
    key: "localKey",
    value: function localKey() {
      return "occurrence.".concat(this.toSaveLocally.occurrenceId);
    }
  }], [{
    key: "register",
    value: function register() {
      ResponseFactory.responses.occurrence = OccurrenceResponse;
    }
  }]);

  return OccurrenceResponse;
}(LocalResponse);

var BSBIServiceWorker = /*#__PURE__*/function () {
  function BSBIServiceWorker() {
    _classCallCheck(this, BSBIServiceWorker);

    _defineProperty(this, "URL_CACHE_SET", void 0);
  }

  _createClass(BSBIServiceWorker, [{
    key: "initialise",
    value:
    /**
     *
     * @param {{
     *  forageName : string,
     *  postPassThroughWhitelist : RegExp,
     *  postImageUrlMatch : RegExp,
     *  getImageUrlMatch : RegExp,
     *  interceptUrlMatches : RegExp,
     *  ignoreUrlMatches : RegExp,
     *  passThroughNoCache : RegExp,
     *  indexUrl : string,
     *  urlCacheSet : Array.<string>,
     *  version : string
     * }} configuration
     */
    function initialise(configuration) {
      var _this = this;

      if (!Promise.prototype.finally) {
        Promise.prototype.finally = function (callback) {
          // must use 'function' here rather than arrow, due to this binding requirement
          return this.then(callback).catch(callback);
        };
      }

      ImageResponse.register();
      SurveyResponse.register();
      OccurrenceResponse.register();
      this.CACHE_VERSION = "version-1.0.3.1644334048-".concat(configuration.version);
      var POST_PASS_THROUGH_WHITELIST = configuration.postPassThroughWhitelist;
      var POST_IMAGE_URL_MATCH = configuration.postImageUrlMatch;
      var GET_IMAGE_URL_MATCH = configuration.getImageUrlMatch;
      var SERVICE_WORKER_INTERCEPT_URL_MATCHES = configuration.interceptUrlMatches;
      var SERVICE_WORKER_IGNORE_URL_MATCHES = configuration.ignoreUrlMatches;
      var SERVICE_WORKER_PASS_THROUGH_NO_CACHE = configuration.passThroughNoCache;
      var INDEX_URL = configuration.indexUrl;
      this.URL_CACHE_SET = configuration.urlCacheSet;
      localforage.config({
        name: configuration.forageName
      }); // On install, cache some resources.

      self.addEventListener('install', function (evt) {
        console.log('BSBI app service worker is being installed.'); // noinspection JSIgnoredPromiseFromCall

        self.skipWaiting(); // Ask the service worker to keep installing until the returning promise
        // resolves.

        evt.waitUntil(_this.precache() // see https://serviceworke.rs/immediate-claim_service-worker_doc.html
        // .finally(() => {
        //     console.log("Service worker skip waiting after precache.");
        //
        //     return self.skipWaiting();
        // })
        );
      });
      self.addEventListener('activate', function (event) {
        console.log({
          'service worker activate event': event
        });
        event.waitUntil(self.clients.matchAll({
          includeUncontrolled: true
        }).then(function (clientList) {
          var urls = clientList.map(function (client) {
            return client.url;
          });
          console.log('[ServiceWorker] Matching clients:', urls.join(', '));
        }).then(function () {
          return caches.keys();
        }).then(function (cacheNames) {
          return Promise.all(cacheNames.map(function (cacheName) {
            // test for 'version' prefix to avoid deleting mapbox tiles
            if (cacheName.startsWith('version') && cacheName !== _this.CACHE_VERSION) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          }));
        }).then(function () {
          console.log('[ServiceWorker] Claiming clients for version', _this.CACHE_VERSION);
          return self.clients.claim();
        }));
      }); // // see https://davidwalsh.name/background-sync
      // // https://developers.google.com/web/updates/2015/12/background-sync
      // self.addEventListener('sync', function(event) {
      //
      // });
      // On fetch, use cache but update the entry with the latest contents
      // from the server.

      self.addEventListener('fetch',
      /** @param {FetchEvent} evt */
      function (evt) {
        //console.log(`The service worker is serving: '${evt.request.url}'`);
        evt.preventDefault();

        if (evt.request.method === 'POST') {
          //console.log(`Got a post request`);
          //if (evt.request.url.match(POST_PASS_THROUGH_WHITELIST)) {
          if (POST_PASS_THROUGH_WHITELIST.test(evt.request.url)) {
            console.log("Passing through whitelisted post request for: ".concat(evt.request.url));
            evt.respondWith(fetch(evt.request));
          } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
            console.log("Passing through nocache list post request for: ".concat(evt.request.url));
            evt.respondWith(fetch(evt.request));
          } else {
            //if (evt.request.url.match(POST_IMAGE_URL_MATCH)) {
            if (POST_IMAGE_URL_MATCH.test(evt.request.url)) {
              console.log("Got an image post request: '".concat(evt.request.url, "'"));

              _this.handle_image_post(evt);
            } else {
              console.log("Got post request: '".concat(evt.request.url, "'"));

              _this.handle_post(evt);
            }
          }
        } else {
          // test whether this is a direct link in to a page that should be substituted by
          // the single page app
          // console.log(`about to test url '${evt.request.url}'`);
          if (SERVICE_WORKER_INTERCEPT_URL_MATCHES.test(evt.request.url) && !SERVICE_WORKER_IGNORE_URL_MATCHES.test(evt.request.url)) {
            // serving single page app instead
            console.log("redirecting to the root of the SPA for '".concat(evt.request.url, "'"));
            var spaRequest = new Request(INDEX_URL);
            evt.respondWith(_this.fromCache(spaRequest));
            evt.waitUntil(_this.update(spaRequest));
          } else if (evt.request.url.match(GET_IMAGE_URL_MATCH)) {
            console.log("request is for an image '".concat(evt.request.url, "'"));

            _this.handleImageFetch(evt);
          } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
            // typically for external content that can't/shouldn't be cached, e.g. MapBox tiles (which mapbox stores directly in the cache itself)
            evt.respondWith(fetch(evt.request));
          } else {
            console.log("request is for non-image '".concat(evt.request.url, "'")); // You can use `respondWith()` to answer immediately, without waiting for the
            // network response to reach the service worker...

            evt.respondWith(_this.fromCache(evt.request)); // ...and `waitUntil()` to prevent the worker from being killed until the
            // cache is updated.

            evt.waitUntil(_this.update(evt.request));
          }
        }
      });
    }
    /**
     * used to handle small posts (not images)
     * attempts remote save first then caches locally
     *
     * @param {FetchEvent} evt
     */

  }, {
    key: "handle_post",
    value: function handle_post(evt) {
      var clonedRequest;

      try {
        clonedRequest = evt.request.clone();
      } catch (e) {
        console.log('Failed to clone request.');
        console.log({
          'Cloning error': e
        });
      }

      evt.respondWith(fetch(evt.request).then(function (response) {
        // would get here if the server responds at all, but need to check that the response is ok (not a server error)
        if (response.ok) {
          return Promise.resolve(response).then(function (response) {
            // save the response locally
            // before returning it to the client
            console.log('About to clone the json response.');
            return response.clone().json();
          }).then(function (jsonResponseData) {
            console.log('Following successful remote post, about to save locally.');
            return ResponseFactory.fromPostResponse(jsonResponseData).setPrebuiltResponse(response).populateLocalSave().storeLocally();
          }).catch(function (error) {
            // for some reason local storage failed, after a successful server save
            console.log({
              'local storage failed': error
            });
            return Promise.resolve(response); // pass through the server response
          });
        } else {
          console.log("Failed to save, moving on to attempt IndexedDb");
          return Promise.reject('Failed to save to server.');
        }
      }).catch(function (reason) {
        console.log({
          'post fetch failed (probably no network)': reason
        }); // would get here if the network is down
        // or if got invalid response from the server

        console.log("post fetch failed (probably no network), (reason: ".concat(reason, ")")); //console.log({'post failure reason' : reason});
        // /**
        //  * simulated result of post, returned as JSON body
        //  * @type {{surveyId: string, occurrenceId: string, imageId: string, saveState: string, [error]: string, [errorHelp]: string}}
        //  */
        // let returnedToClient = {};

        return clonedRequest.formData().then(function (formData) {
          console.log('got to form data handler'); //console.log({formData});

          return ResponseFactory.fromPostedData(formData).populateClientResponse().storeLocally();
        }, function (reason) {
          console.log({
            'failed to read form data locally': reason
          });
          /**
           * simulated result of post, returned as JSON body
           * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
           */

          var returnedToClient = {
            error: 'Failed to process posted response data. (internal error)',
            errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' + 'Please try to re-establish a network connection and try again.'
          };
          return packageClientResponse(returnedToClient);
        });
      }));
    }
    /**
     * used to handle image posts, which need to respond quickly even if the network is slow
     * attempts local cache first then saves out to network
     *
     * @param {FetchEvent} event
     */

  }, {
    key: "handle_image_post",
    value: function handle_image_post(event) {
      var clonedRequest;
      console.log('posting image');

      try {
        clonedRequest = event.request.clone();
      } catch (e) {
        console.log('Failed to clone request.');
        console.log({
          'Cloning error': e
        });
      } // send back a quick response to the client from local storage (before the server request completes)


      event.respondWith(clonedRequest.formData().then(function (formData) {
        console.log('got to form data handler'); //console.log({formData});

        return ResponseFactory.fromPostedData(formData).populateClientResponse().storeLocally().then(function (response) {
          // separately send data to the server, but response goes to client before this completes
          // am unsure if the return from the wait until part ever reaches the client
          event.waitUntil(fetch(event.request).then(function (response) {
            console.log('posting image to server in waitUntil part of fetch cycle'); // would get here if the server responds at all, but need to check that the response is ok (not a server error)

            if (response.ok) {
              console.log('posted image to server in waitUntil part of fetch cycle: got OK response');
              return Promise.resolve(response).then(function (response) {
                // save the response locally
                // before returning it to the client
                return response.clone().json();
              }).then(function (jsonResponseData) {
                return ResponseFactory.fromPostResponse(jsonResponseData).setPrebuiltResponse(response).populateLocalSave().storeLocally();
              }).catch(function (error) {
                // for some reason local storage failed, after a successful server save
                console.log({
                  error: error
                });
                return Promise.resolve(response); // pass through the server response
              });
            } else {
              console.log('posted image to server in waitUntil part of fetch cycle: got Error response');
              /**
               * simulated result of post, returned as JSON body
               * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
               */

              var returnedToClient = {
                error: 'Failed to save posted response data. (internal error)',
                errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' + 'Please try to re-establish a network connection and try again.'
              };
              return packageClientResponse(returnedToClient);
            }
          }, function () {
            console.log('Rejected image post fetch from server - implies network is down');
          }));
          return response;
        });
      }, function (reason) {
        console.log('failed to read form data locally');
        console.log({
          reason: reason
        });
        /**
         * simulated result of post, returned as JSON body
         * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
         */

        var returnedToClient = {
          error: 'Failed to process posted response data. (internal error)',
          errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' + 'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' + 'Please try to re-establish a network connection and try again.'
        };
        return packageClientResponse(returnedToClient);
      }));
    }
    /**
     * Open a cache and use `addAll()` with an array of assets to add all of them
     * to the cache. Return a promise resolving when all the assets are added.
     *
     * @returns {Promise<void>}
     */

  }, {
    key: "precache",
    value: function precache() {
      var _this2 = this;

      return caches.open(this.CACHE_VERSION).then(function (cache) {
        return cache.addAll(_this2.URL_CACHE_SET);
      }).catch(function (error) {
        console.log({
          'Precache failed result': error
        });
        return Promise.resolve();
      });
    }
    /**
     * Open the cache where the assets were stored and search for the requested
     * resource. Notice that in case of no matching, the promise still resolves
     * but it does with `undefined` as value.
     *
     * @param {Request} request
     * @returns {Promise<Response | Promise<Response>>}
     */

  }, {
    key: "fromCache",
    value: function fromCache(request) {
      var _this3 = this;

      // @todo need to serve index.html in place of all Navigo-served pages
      // (an issue if someone returns to a bookmarked page within the app)
      console.log('attempting fromCache response');
      return caches.open(this.CACHE_VERSION).then(function (cache) {
        console.log('cache is open');
        return cache.match(request).then(function (matching) {
          console.log(matching ? "cache matched ".concat(request.url) : "no cache match for ".concat(request.url)); //return matching || fetch(request); // return cache match or if not cached then go out to network

          return matching || _this3.update(request); // return cache match or if not cached then go out to network (and then locally cache the response)
        });
      });
    }
    /**
     * Special case response for images
     * attempt to serve from local cache first,
     * if that fails then go out to network
     * finally see if there is an image in indexeddb
     *
     * @param {FetchEvent} evt
     */

  }, {
    key: "handleImageFetch",
    value: function handleImageFetch(evt) {
      var _this4 = this;

      evt.respondWith(this.fromCache(evt.request).then(function (response) {
        console.log('In handleImageFetch promise'); // response may be a 404

        if (response && response.ok) {
          console.log('Responding with image from cache (or remotely if no cache).');
          return response;
        } else {
          // not cached and no network access
          // try to respond from local storage
          var url = evt.request.url;
          console.log("Attempting image match for '".concat(url, "'"));
          var matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

          if (matches) {
            var imageId = matches[1];
            console.log("Returning image match for '".concat(url, "' from local database"));
            return _this4.imageFromLocalDatabase(imageId);
          } else {
            console.log("Failed to match image id in url '".concat(url, "'"));
          }
        }
      }).catch(function (error) {
        var url = evt.request.url;
        console.log({
          'caught': error
        });
        console.log("In catch following failed network fetch, attempting image match for '".concat(url, "'"));
        var matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

        if (matches) {
          var imageId = matches[1];
          console.log("(via catch) Returning image match for '".concat(url, "' from local database"));
          return _this4.imageFromLocalDatabase(imageId);
        } else {
          console.log("(via catch) Failed to match image id in url '".concat(url, "'"));
          return Promise.reject(null);
        }
      }));
    }
    /**
     *
     * @param {string} imageId
     * @returns {Promise}
     */

  }, {
    key: "imageFromLocalDatabase",
    value: function imageFromLocalDatabase(imageId) {
      var image = new OccurrenceImage();
      console.log('attempting retrieval of image data from local database');
      return Model.retrieveFromLocal(imageId, image).then(function (image) {
        console.log("Retrieved image '".concat(imageId, "' from indexeddb."));

        if (image.file) {
          var headers = new Headers();
          headers.append('Content-Type', image.file.type);
          return new Response(image.file, {
            "status": 200,
            "statusText": "OK image response from IndexedDb"
          });
        } else {
          console.log("No local file object associated with retrieved image '".concat(imageId, "' from indexeddb."));
          return Promise.reject("No local file object associated with retrieved image '".concat(imageId, "' from indexeddb."));
        }
      });
    }
    /**
     * Update consists in opening the cache, performing a network request and
     * storing the new response data.
     *
     * @param {Request} request
     * @returns {Promise<Response>}
     */

  }, {
    key: "update",
    value: function update(request) {
      request = new Request(request, {
        mode: 'cors',
        credentials: 'omit'
      });
      console.log("Attempting fetch and cache update of ".concat(request.url));
      return caches.open(this.CACHE_VERSION).then(function (cache) {
        return fetch(request, {
          cache: "no-cache"
        }).then(function (response) {
          if (response.ok) {
            console.log("(re-)caching ".concat(request.url));
            return cache.put(request, response).then(function () {
              return cache.match(request);
            });
          } else {
            console.log("Request during cache update failed for ".concat(request.url));
            console.log({
              'failed cache response': response
            });
            return Promise.reject('Request during cache update failed, not caching.');
          }
        }).catch(function (error) {
          console.log("Cache attempt failed for ".concat(request.url, ": error was ").concat(error));
          return Promise.reject("Cache attempt failed for ".concat(request.url, ": error was ").concat(error));
        });
      });
    }
  }]);

  return BSBIServiceWorker;
}();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function isPushStateAvailable() {
  return !!(typeof window !== 'undefined' && window.history && window.history.pushState);
}

function Navigo(r, useHash, hash) {
  this.root = null;
  this._routes = [];
  this._useHash = useHash;
  this._hash = typeof hash === 'undefined' ? '#' : hash;
  this._paused = false;
  this._destroyed = false;
  this._lastRouteResolved = null;
  this._notFoundHandler = null;
  this._defaultHandler = null;
  this._usePushState = !useHash && isPushStateAvailable();
  this._onLocationChange = this._onLocationChange.bind(this);
  this._genericHooks = null;
  this._historyAPIUpdateMethod = 'pushState';

  if (r) {
    this.root = useHash ? r.replace(/\/$/, '/' + this._hash) : r.replace(/\/$/, '');
  } else if (useHash) {
    this.root = this._cLoc().split(this._hash)[0].replace(/\/$/, '/' + this._hash);
  }

  this._listen();
  this.updatePageLinks();
}

function clean(s) {
  if (s instanceof RegExp) return s;
  return s.replace(/\/+$/, '').replace(/^\/+/, '^/');
}

function regExpResultToParams(match, names) {
  if (names.length === 0) return null;
  if (!match) return null;
  return match.slice(1, match.length).reduce(function (params, value, index) {
    if (params === null) params = {};
    params[names[index]] = decodeURIComponent(value);
    return params;
  }, null);
}

function replaceDynamicURLParts(route) {
  var paramNames = [],
      regexp;

  if (route instanceof RegExp) {
    regexp = route;
  } else {
    regexp = new RegExp(route.replace(Navigo.PARAMETER_REGEXP, function (full, dots, name) {
      paramNames.push(name);
      return Navigo.REPLACE_VARIABLE_REGEXP;
    }).replace(Navigo.WILDCARD_REGEXP, Navigo.REPLACE_WILDCARD) + Navigo.FOLLOWED_BY_SLASH_REGEXP, Navigo.MATCH_REGEXP_FLAGS);
  }
  return { regexp: regexp, paramNames: paramNames };
}

function getUrlDepth(url) {
  return url.replace(/\/$/, '').split('/').length;
}

function compareUrlDepth(urlA, urlB) {
  return getUrlDepth(urlB) - getUrlDepth(urlA);
}

function findMatchedRoutes(url) {
  var routes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  return routes.map(function (route) {
    var _replaceDynamicURLPar = replaceDynamicURLParts(clean(route.route)),
        regexp = _replaceDynamicURLPar.regexp,
        paramNames = _replaceDynamicURLPar.paramNames;

    var match = url.replace(/^\/+/, '/').match(regexp);
    var params = regExpResultToParams(match, paramNames);

    return match ? { match: match, route: route, params: params } : false;
  }).filter(function (m) {
    return m;
  });
}

function match(url, routes) {
  return findMatchedRoutes(url, routes)[0] || false;
}

function root(url, routes) {
  var matched = routes.map(function (route) {
    return route.route === '' || route.route === '*' ? url : url.split(new RegExp(route.route + '($|\/)'))[0];
  });
  var fallbackURL = clean(url);

  if (matched.length > 1) {
    return matched.reduce(function (result, url) {
      if (result.length > url.length) result = url;
      return result;
    }, matched[0]);
  } else if (matched.length === 1) {
    return matched[0];
  }
  return fallbackURL;
}

function isHashChangeAPIAvailable() {
  return typeof window !== 'undefined' && 'onhashchange' in window;
}

function extractGETParameters(url) {
  return url.split(/\?(.*)?$/).slice(1).join('');
}

function getOnlyURL(url, useHash, hash) {
  var onlyURL = url,
      split;
  var cleanGETParam = function cleanGETParam(str) {
    return str.split(/\?(.*)?$/)[0];
  };

  if (typeof hash === 'undefined') {
    // To preserve BC
    hash = '#';
  }

  if (isPushStateAvailable() && !useHash) {
    onlyURL = cleanGETParam(url).split(hash)[0];
  } else {
    split = url.split(hash);
    onlyURL = split.length > 1 ? cleanGETParam(split[1]) : cleanGETParam(split[0]);
  }

  return onlyURL;
}

function manageHooks(handler, hooks, params) {
  if (hooks && (typeof hooks === 'undefined' ? 'undefined' : _typeof(hooks)) === 'object') {
    if (hooks.before) {
      hooks.before(function () {
        var shouldRoute = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (!shouldRoute) return;
        handler();
        hooks.after && hooks.after(params);
      }, params);
      return;
    } else if (hooks.after) {
      handler();
      hooks.after && hooks.after(params);
      return;
    }
  }
  handler();
}

function isHashedRoot(url, useHash, hash) {
  if (isPushStateAvailable() && !useHash) {
    return false;
  }

  if (!url.match(hash)) {
    return false;
  }

  var split = url.split(hash);

  return split.length < 2 || split[1] === '';
}

Navigo.prototype = {
  helpers: {
    match: match,
    root: root,
    clean: clean,
    getOnlyURL: getOnlyURL
  },
  navigate: function navigate(path, absolute) {
    var to;

    path = path || '';
    if (this._usePushState) {
      to = (!absolute ? this._getRoot() + '/' : '') + path.replace(/^\/+/, '/');
      to = to.replace(/([^:])(\/{2,})/g, '$1/');
      history[this._historyAPIUpdateMethod]({}, '', to);
      this.resolve();
    } else if (typeof window !== 'undefined') {
      path = path.replace(new RegExp('^' + this._hash), '');
      window.location.href = window.location.href.replace(/#$/, '').replace(new RegExp(this._hash + '.*$'), '') + this._hash + path;
    }
    return this;
  },
  on: function on() {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (typeof args[0] === 'function') {
      this._defaultHandler = { handler: args[0], hooks: args[1] };
    } else if (args.length >= 2) {
      if (args[0] === '/') {
        var func = args[1];

        if (_typeof(args[1]) === 'object') {
          func = args[1].uses;
        }

        this._defaultHandler = { handler: func, hooks: args[2] };
      } else {
        this._add(args[0], args[1], args[2]);
      }
    } else if (_typeof(args[0]) === 'object') {
      var orderedRoutes = Object.keys(args[0]).sort(compareUrlDepth);

      orderedRoutes.forEach(function (route) {
        _this.on(route, args[0][route]);
      });
    }
    return this;
  },
  off: function off(handler) {
    if (this._defaultHandler !== null && handler === this._defaultHandler.handler) {
      this._defaultHandler = null;
    } else if (this._notFoundHandler !== null && handler === this._notFoundHandler.handler) {
      this._notFoundHandler = null;
    }
    this._routes = this._routes.reduce(function (result, r) {
      if (r.handler !== handler) result.push(r);
      return result;
    }, []);
    return this;
  },
  notFound: function notFound(handler, hooks) {
    this._notFoundHandler = { handler: handler, hooks: hooks };
    return this;
  },
  resolve: function resolve(current) {
    var _this2 = this;

    var handler, m;
    var url = (current || this._cLoc()).replace(this._getRoot(), '');

    if (this._useHash) {
      url = url.replace(new RegExp('^\/' + this._hash), '/');
    }

    var GETParameters = extractGETParameters(current || this._cLoc());
    var onlyURL = getOnlyURL(url, this._useHash, this._hash);

    if (this._paused) return false;

    if (this._lastRouteResolved && onlyURL === this._lastRouteResolved.url && GETParameters === this._lastRouteResolved.query) {
      if (this._lastRouteResolved.hooks && this._lastRouteResolved.hooks.already) {
        this._lastRouteResolved.hooks.already(this._lastRouteResolved.params);
      }
      return false;
    }

    m = match(onlyURL, this._routes);

    if (m) {
      this._callLeave();
      this._lastRouteResolved = {
        url: onlyURL,
        query: GETParameters,
        hooks: m.route.hooks,
        params: m.params,
        name: m.route.name
      };
      handler = m.route.handler;
      manageHooks(function () {
        manageHooks(function () {
          m.route.route instanceof RegExp ? handler.apply(undefined, m.match.slice(1, m.match.length)) : handler(m.params, GETParameters);
        }, m.route.hooks, m.params, _this2._genericHooks);
      }, this._genericHooks, m.params);
      return m;
    } else if (this._defaultHandler && (onlyURL === '' || onlyURL === '/' || onlyURL === this._hash || isHashedRoot(onlyURL, this._useHash, this._hash))) {
      manageHooks(function () {
        manageHooks(function () {
          _this2._callLeave();
          _this2._lastRouteResolved = { url: onlyURL, query: GETParameters, hooks: _this2._defaultHandler.hooks };
          _this2._defaultHandler.handler(GETParameters);
        }, _this2._defaultHandler.hooks);
      }, this._genericHooks);
      return true;
    } else if (this._notFoundHandler) {
      manageHooks(function () {
        manageHooks(function () {
          _this2._callLeave();
          _this2._lastRouteResolved = { url: onlyURL, query: GETParameters, hooks: _this2._notFoundHandler.hooks };
          _this2._notFoundHandler.handler(GETParameters);
        }, _this2._notFoundHandler.hooks);
      }, this._genericHooks);
    }
    return false;
  },
  destroy: function destroy() {
    this._routes = [];
    this._destroyed = true;
    this._lastRouteResolved = null;
    this._genericHooks = null;
    clearTimeout(this._listeningInterval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this._onLocationChange);
      window.removeEventListener('hashchange', this._onLocationChange);
    }
  },
  updatePageLinks: function updatePageLinks() {
    var self = this;

    if (typeof document === 'undefined') return;

    this._findLinks().forEach(function (link) {
      if (!link.hasListenerAttached) {
        link.addEventListener('click', function (e) {
          if ((e.ctrlKey || e.metaKey) && e.target.tagName.toLowerCase() == 'a') {
            return false;
          }
          var location = self.getLinkPath(link);

          if (!self._destroyed) {
            e.preventDefault();
            self.navigate(location.replace(/\/+$/, '').replace(/^\/+/, '/'));
          }
        });
        link.hasListenerAttached = true;
      }
    });
  },
  generate: function generate(name) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var result = this._routes.reduce(function (result, route) {
      var key;

      if (route.name === name) {
        result = route.route;
        for (key in data) {
          result = result.toString().replace(':' + key, data[key]);
        }
      }
      return result;
    }, '');

    return this._useHash ? this._hash + result : result;
  },
  link: function link(path) {
    return this._getRoot() + path;
  },
  pause: function pause() {
    var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    this._paused = status;
    if (status) {
      this._historyAPIUpdateMethod = 'replaceState';
    } else {
      this._historyAPIUpdateMethod = 'pushState';
    }
  },
  resume: function resume() {
    this.pause(false);
  },
  historyAPIUpdateMethod: function historyAPIUpdateMethod(value) {
    if (typeof value === 'undefined') return this._historyAPIUpdateMethod;
    this._historyAPIUpdateMethod = value;
    return value;
  },
  disableIfAPINotAvailable: function disableIfAPINotAvailable() {
    if (!isPushStateAvailable()) {
      this.destroy();
    }
  },
  lastRouteResolved: function lastRouteResolved() {
    return this._lastRouteResolved;
  },
  getLinkPath: function getLinkPath(link) {
    return link.getAttribute('href');
  },
  hooks: function hooks(_hooks) {
    this._genericHooks = _hooks;
  },

  _add: function _add(route) {
    var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var hooks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (typeof route === 'string') {
      route = encodeURI(route);
    }
    this._routes.push((typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === 'object' ? {
      route: route,
      handler: handler.uses,
      name: handler.as,
      hooks: hooks || handler.hooks
    } : { route: route, handler: handler, hooks: hooks });

    return this._add;
  },
  _getRoot: function _getRoot() {
    if (this.root !== null) return this.root;
    this.root = root(this._cLoc().split('?')[0], this._routes);
    return this.root;
  },
  _listen: function _listen() {
    var _this3 = this;

    if (this._usePushState) {
      window.addEventListener('popstate', this._onLocationChange);
    } else if (isHashChangeAPIAvailable()) {
      window.addEventListener('hashchange', this._onLocationChange);
    } else {
      var cached = this._cLoc(),
          current = void 0,
          _check = void 0;

      _check = function check() {
        current = _this3._cLoc();
        if (cached !== current) {
          cached = current;
          _this3.resolve();
        }
        _this3._listeningInterval = setTimeout(_check, 200);
      };
      _check();
    }
  },
  _cLoc: function _cLoc() {
    if (typeof window !== 'undefined') {
      if (typeof window.__NAVIGO_WINDOW_LOCATION_MOCK__ !== 'undefined') {
        return window.__NAVIGO_WINDOW_LOCATION_MOCK__;
      }
      return clean(window.location.href);
    }
    return '';
  },
  _findLinks: function _findLinks() {
    return [].slice.call(document.querySelectorAll('[data-navigo]'));
  },
  _onLocationChange: function _onLocationChange() {
    this.resolve();
  },
  _callLeave: function _callLeave() {
    var lastRouteResolved = this._lastRouteResolved;

    if (lastRouteResolved && lastRouteResolved.hooks && lastRouteResolved.hooks.leave) {
      lastRouteResolved.hooks.leave(lastRouteResolved.params);
    }
  }
};

Navigo.PARAMETER_REGEXP = /([:*])(\w+)/g;
Navigo.WILDCARD_REGEXP = /\*/g;
Navigo.REPLACE_VARIABLE_REGEXP = '([^\/]+)';
Navigo.REPLACE_WILDCARD = '(?:.*)';
Navigo.FOLLOWED_BY_SLASH_REGEXP = '(?:\/$|$)';
Navigo.MATCH_REGEXP_FLAGS = '';

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var PatchedNavigo = /*#__PURE__*/function (_Navigo) {
  _inherits(PatchedNavigo, _Navigo);

  var _super = _createSuper(PatchedNavigo);

  function PatchedNavigo() {
    _classCallCheck(this, PatchedNavigo);

    return _super.apply(this, arguments);
  }

  _createClass(PatchedNavigo, [{
    key: "updatePageLinks",
    value: function updatePageLinks() {
      var _this = this;

      if (typeof document === 'undefined') {
        return;
      }

      var l = document.createElement("a");
      l.href = this.root;
      var rootPath = l.pathname;

      this._findLinks().forEach(function (link) {
        if (!link.hasListenerAttached) {
          link.addEventListener('click',
          /** @param {MouseEvent} e */
          function (e) {
            if (doubleClickIntercepted(e)) {
              return;
            }

            if ((e.ctrlKey || e.metaKey) && e.target.tagName.toLowerCase() === 'a') {
              return false;
            }

            if (!_this._destroyed) {
              var path = link.pathname; // console.log({path});

              var leaf = path.replace(rootPath, ''); // console.log({leaf});
              //var location = self.getLinkPath(link);

              e.preventDefault(); //self.navigate(location.replace(/\/+$/, '').replace(/^\/+/, '/'));

              _this.navigate(leaf);
            }
          });
          link.hasListenerAttached = true;
        }
      });
    }
  }]);

  return PatchedNavigo;
}(Navigo);

var DESCRIPTORS$2 = descriptors;
var global$4 = global$11;
var uncurryThis$2 = functionUncurryThis;
var isForced = isForced_1;
var inheritIfRequired = inheritIfRequired$3;
var createNonEnumerableProperty = createNonEnumerableProperty$a;
var defineProperty$2 = objectDefineProperty.f;
var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var isPrototypeOf = objectIsPrototypeOf;
var isRegExp = isRegexp;
var toString$1 = toString$g;
var regExpFlags = regexpFlags$1;
var stickyHelpers = regexpStickyHelpers;
var redefine = redefine$d.exports;
var fails$1 = fails$B;
var hasOwn = hasOwnProperty_1;
var enforceInternalState = internalState.enforce;
var setSpecies = setSpecies$3;
var wellKnownSymbol = wellKnownSymbol$q;
var UNSUPPORTED_DOT_ALL$1 = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG = regexpUnsupportedNcg;

var MATCH = wellKnownSymbol('match');
var NativeRegExp = global$4.RegExp;
var RegExpPrototype$2 = NativeRegExp.prototype;
var SyntaxError = global$4.SyntaxError;
var getFlags = uncurryThis$2(regExpFlags);
var exec = uncurryThis$2(RegExpPrototype$2.exec);
var charAt = uncurryThis$2(''.charAt);
var replace = uncurryThis$2(''.replace);
var stringIndexOf = uncurryThis$2(''.indexOf);
var stringSlice = uncurryThis$2(''.slice);
// TODO: Use only propper RegExpIdentifierName
var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var MISSED_STICKY$1 = stickyHelpers.MISSED_STICKY;
var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;

var BASE_FORCED = DESCRIPTORS$2 &&
  (!CORRECT_NEW || MISSED_STICKY$1 || UNSUPPORTED_DOT_ALL$1 || UNSUPPORTED_NCG || fails$1(function () {
    re2[MATCH] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
  }));

var handleDotAll = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var brackets = false;
  var chr;
  for (; index <= length; index++) {
    chr = charAt(string, index);
    if (chr === '\\') {
      result += chr + charAt(string, ++index);
      continue;
    }
    if (!brackets && chr === '.') {
      result += '[\\s\\S]';
    } else {
      if (chr === '[') {
        brackets = true;
      } else if (chr === ']') {
        brackets = false;
      } result += chr;
    }
  } return result;
};

var handleNCG = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var named = [];
  var names = {};
  var brackets = false;
  var ncg = false;
  var groupid = 0;
  var groupname = '';
  var chr;
  for (; index <= length; index++) {
    chr = charAt(string, index);
    if (chr === '\\') {
      chr = chr + charAt(string, ++index);
    } else if (chr === ']') {
      brackets = false;
    } else if (!brackets) switch (true) {
      case chr === '[':
        brackets = true;
        break;
      case chr === '(':
        if (exec(IS_NCG, stringSlice(string, index + 1))) {
          index += 2;
          ncg = true;
        }
        result += chr;
        groupid++;
        continue;
      case chr === '>' && ncg:
        if (groupname === '' || hasOwn(names, groupname)) {
          throw new SyntaxError('Invalid capture group name');
        }
        names[groupname] = true;
        named[named.length] = [groupname, groupid];
        ncg = false;
        groupname = '';
        continue;
    }
    if (ncg) groupname += chr;
    else result += chr;
  } return [result, named];
};

// `RegExp` constructor
// https://tc39.es/ecma262/#sec-regexp-constructor
if (isForced('RegExp', BASE_FORCED)) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = isPrototypeOf(RegExpPrototype$2, this);
    var patternIsRegExp = isRegExp(pattern);
    var flagsAreUndefined = flags === undefined;
    var groups = [];
    var rawPattern = pattern;
    var rawFlags, dotAll, sticky, handled, result, state;

    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
      return pattern;
    }

    if (patternIsRegExp || isPrototypeOf(RegExpPrototype$2, pattern)) {
      pattern = pattern.source;
      if (flagsAreUndefined) flags = 'flags' in rawPattern ? rawPattern.flags : getFlags(rawPattern);
    }

    pattern = pattern === undefined ? '' : toString$1(pattern);
    flags = flags === undefined ? '' : toString$1(flags);
    rawPattern = pattern;

    if (UNSUPPORTED_DOT_ALL$1 && 'dotAll' in re1) {
      dotAll = !!flags && stringIndexOf(flags, 's') > -1;
      if (dotAll) flags = replace(flags, /s/g, '');
    }

    rawFlags = flags;

    if (MISSED_STICKY$1 && 'sticky' in re1) {
      sticky = !!flags && stringIndexOf(flags, 'y') > -1;
      if (sticky && UNSUPPORTED_Y) flags = replace(flags, /y/g, '');
    }

    if (UNSUPPORTED_NCG) {
      handled = handleNCG(pattern);
      pattern = handled[0];
      groups = handled[1];
    }

    result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$2, RegExpWrapper);

    if (dotAll || sticky || groups.length) {
      state = enforceInternalState(result);
      if (dotAll) {
        state.dotAll = true;
        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
      }
      if (sticky) state.sticky = true;
      if (groups.length) state.groups = groups;
    }

    if (pattern !== rawPattern) try {
      // fails in old engines, but we have no alternatives for unsupported regex syntax
      createNonEnumerableProperty(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
    } catch (error) { /* empty */ }

    return result;
  };

  var proxy = function (key) {
    key in RegExpWrapper || defineProperty$2(RegExpWrapper, key, {
      configurable: true,
      get: function () { return NativeRegExp[key]; },
      set: function (it) { NativeRegExp[key] = it; }
    });
  };

  for (var keys = getOwnPropertyNames(NativeRegExp), index = 0; keys.length > index;) {
    proxy(keys[index++]);
  }

  RegExpPrototype$2.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$2;
  redefine(global$4, 'RegExp', RegExpWrapper);
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies('RegExp');

var global$3 = global$11;
var DESCRIPTORS$1 = descriptors;
var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
var classof$1 = classofRaw$1;
var defineProperty$1 = objectDefineProperty.f;
var getInternalState$1 = internalState.get;

var RegExpPrototype$1 = RegExp.prototype;
var TypeError$3 = global$3.TypeError;

// `RegExp.prototype.dotAll` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
if (DESCRIPTORS$1 && UNSUPPORTED_DOT_ALL) {
  defineProperty$1(RegExpPrototype$1, 'dotAll', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype$1) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof$1(this) === 'RegExp') {
        return !!getInternalState$1(this).dotAll;
      }
      throw TypeError$3('Incompatible receiver, RegExp required');
    }
  });
}

var global$2 = global$11;
var DESCRIPTORS = descriptors;
var MISSED_STICKY = regexpStickyHelpers.MISSED_STICKY;
var classof = classofRaw$1;
var defineProperty = objectDefineProperty.f;
var getInternalState = internalState.get;

var RegExpPrototype = RegExp.prototype;
var TypeError$2 = global$2.TypeError;

// `RegExp.prototype.sticky` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
if (DESCRIPTORS && MISSED_STICKY) {
  defineProperty(RegExpPrototype, 'sticky', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof(this) === 'RegExp') {
        return !!getInternalState(this).sticky;
      }
      throw TypeError$2('Incompatible receiver, RegExp required');
    }
  });
}

/* eslint-disable es/no-array-prototype-indexof -- required for testing */
var $$2 = _export;
var uncurryThis$1 = functionUncurryThis;
var $IndexOf = arrayIncludes.indexOf;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$4;

var un$IndexOf = uncurryThis$1([].indexOf);

var NEGATIVE_ZERO = !!un$IndexOf && 1 / un$IndexOf([1], 1, -0) < 0;
var STRICT_METHOD$1 = arrayMethodIsStrict$1('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$2({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$1 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? un$IndexOf(this, searchElement, fromIndex) || 0
      : $IndexOf(this, searchElement, fromIndex);
  }
});

var arraySlice = arraySliceSimple;

var floor = Math.floor;

var mergeSort = function (array, comparefn) {
  var length = array.length;
  var middle = floor(length / 2);
  return length < 8 ? insertionSort(array, comparefn) : merge(
    array,
    mergeSort(arraySlice(array, 0, middle), comparefn),
    mergeSort(arraySlice(array, middle), comparefn),
    comparefn
  );
};

var insertionSort = function (array, comparefn) {
  var length = array.length;
  var i = 1;
  var element, j;

  while (i < length) {
    j = i;
    element = array[i];
    while (j && comparefn(array[j - 1], element) > 0) {
      array[j] = array[--j];
    }
    if (j !== i++) array[j] = element;
  } return array;
};

var merge = function (array, left, right, comparefn) {
  var llength = left.length;
  var rlength = right.length;
  var lindex = 0;
  var rindex = 0;

  while (lindex < llength || rindex < rlength) {
    array[lindex + rindex] = (lindex < llength && rindex < rlength)
      ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
      : lindex < llength ? left[lindex++] : right[rindex++];
  } return array;
};

var arraySort = mergeSort;

var userAgent$1 = engineUserAgent;

var firefox = userAgent$1.match(/firefox\/(\d+)/i);

var engineFfVersion = !!firefox && +firefox[1];

var UA = engineUserAgent;

var engineIsIeOrEdge = /MSIE|Trident/.test(UA);

var userAgent = engineUserAgent;

var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);

var engineWebkitVersion = !!webkit && +webkit[1];

var $$1 = _export;
var uncurryThis = functionUncurryThis;
var aCallable = aCallable$7;
var toObject$1 = toObject$a;
var lengthOfArrayLike$1 = lengthOfArrayLike$9;
var toString = toString$g;
var fails = fails$B;
var internalSort = arraySort;
var arrayMethodIsStrict = arrayMethodIsStrict$4;
var FF = engineFfVersion;
var IE_OR_EDGE = engineIsIeOrEdge;
var V8 = engineV8Version;
var WEBKIT = engineWebkitVersion;

var test = [];
var un$Sort = uncurryThis(test.sort);
var push = uncurryThis(test.push);

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var STABLE_SORT = !fails(function () {
  // feature detection can be too slow, so check engines versions
  if (V8) return V8 < 70;
  if (FF && FF > 3) return;
  if (IE_OR_EDGE) return true;
  if (WEBKIT) return WEBKIT < 603;

  var result = '';
  var code, chr, value, index;

  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
  for (code = 65; code < 76; code++) {
    chr = String.fromCharCode(code);

    switch (code) {
      case 66: case 69: case 70: case 72: value = 3; break;
      case 68: case 71: value = 4; break;
      default: value = 2;
    }

    for (index = 0; index < 47; index++) {
      test.push({ k: chr + index, v: value });
    }
  }

  test.sort(function (a, b) { return b.v - a.v; });

  for (index = 0; index < test.length; index++) {
    chr = test[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  return result !== 'DGBEFHACIJK';
});

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT;

var getSortCompare = function (comparefn) {
  return function (x, y) {
    if (y === undefined) return -1;
    if (x === undefined) return 1;
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    return toString(x) > toString(y) ? 1 : -1;
  };
};

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$1({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    if (comparefn !== undefined) aCallable(comparefn);

    var array = toObject$1(this);

    if (STABLE_SORT) return comparefn === undefined ? un$Sort(array) : un$Sort(array, comparefn);

    var items = [];
    var arrayLength = lengthOfArrayLike$1(array);
    var itemsLength, index;

    for (index = 0; index < arrayLength; index++) {
      if (index in array) push(items, array[index]);
    }

    internalSort(items, getSortCompare(comparefn));

    itemsLength = items.length;
    index = 0;

    while (index < itemsLength) array[index] = items[index++];
    while (index < arrayLength) delete array[index++];

    return array;
  }
});

var $ = _export;
var global$1 = global$11;
var toAbsoluteIndex = toAbsoluteIndex$4;
var toIntegerOrInfinity = toIntegerOrInfinity$5;
var lengthOfArrayLike = lengthOfArrayLike$9;
var toObject = toObject$a;
var arraySpeciesCreate = arraySpeciesCreate$3;
var createProperty = createProperty$6;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

var TypeError$1 = global$1.TypeError;
var max = Math.max;
var min = Math.min;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
      throw TypeError$1(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
    }
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    O.length = len - actualDeleteCount + insertCount;
    return A;
  }
});

/**
 * @external BsbiDb
 */

var TaxonSearch = /*#__PURE__*/function () {
  /**
   * see TaxonRank::sort
   *
   * @type int|null
   */

  /**
   * if set then only taxa with records are returned
   *
   * @type boolean
   */
  // /**
  //  * if set then only taxa with records present in the specified status scheme (scheme id code)
  //  * (default null)
  //  *
  //  * @type string|null
  //  */
  // requiredStatusSchemeId = null;

  /**
   * if set then require that returned taxon names are >= 3 letters
   * and don't contain numerals
   *
   * @type boolean
   */

  /**
   * (static config setting)
   *
   * @type {boolean}
   */
  function TaxonSearch() {
    _classCallCheck(this, TaxonSearch);

    _defineProperty(this, "minimumRankSort", null);

    _defineProperty(this, "requireExtantDDbRecords", false);

    _defineProperty(this, "skipJunk", true);

    if (!Taxon.rawTaxa) {
      Taxon.rawTaxa = BsbiDb.TaxonNames;

      if (!Taxon.rawTaxa) {
        throw new Error('Taxon list has failed to load in TaxonSearch');
      }
    }
  }
  /**
   *
   * @param {object} taxonResult
   * @param {string} queryString
   * @returns {string}
   */


  _createClass(TaxonSearch, [{
    key: "lookup",
    value:
    /**
     *
     * @param {string} query
     * @returns {Array.<{entityId: string,
                        vernacular: string,
                        qname: string,
                        name: string,
                        qualifier: string,
                        authority: string,
                        uname: string,
                        vernacularMatched: boolean,
                        exact: boolean,
                        near: boolean,
                        formatted: string,
                        acceptedEntityId: string,
                        acceptedNameString: string,
                        acceptedQualifier: string,
                        acceptedAuthority: string
                        }>}
     */
    function lookup(query) {
      var results,
          taxonString,
          canonical,
          matchedIds = {},
          preferHybrids; // ignore trailing ' x' from string which would just muck up result matching

      taxonString = TaxonSearch.normaliseTaxonName(decodeURIComponent(query).trim()).replace(/\s+x$/i, '');
      preferHybrids = / x\b/.test(taxonString);

      if (taxonString !== '') {
        var abbreviatedMatches = taxonString.match(TaxonSearch.abbreviatedGenusRegex);

        if (abbreviatedMatches) {
          // matched an abbreviated genus name (or an abbreviated hybrid genus)
          var exp, nearMatchExp;

          if (abbreviatedMatches[2] === 'X' || abbreviatedMatches[2] === 'x') {
            // either have a genus name beginning 'X' or a hybrid genus
            exp = new RegExp("^(X\\s|X[a-z]+\\s+)(x )?\\b".concat(TaxonSearch.generate_hybrid_combinations_regex(abbreviatedMatches[3]), ".*"), 'i');
            nearMatchExp = exp;
          } else {
            exp = new RegExp("^(X )?".concat(TaxonSearch.escapeRegExp(abbreviatedMatches[2]), "[a-z]+ (x )?.*\\b").concat(TaxonSearch.generate_hybrid_combinations_regex(abbreviatedMatches[3]), ".*"), 'i');
            /**
             * Similar to exp but without flexibility (.*) after genus part
             * used only for result ranking (exact>near>vague)
             */

            nearMatchExp = new RegExp("^(X )?".concat(TaxonSearch.escapeRegExp(abbreviatedMatches[2]), "[a-z]+ (x )?\\b").concat(TaxonSearch.generate_hybrid_combinations_regex(abbreviatedMatches[3]), ".*"), 'i');
          }

          for (var id in Taxon.rawTaxa) {
            // noinspection JSUnfilteredForInLoop (assume is safe for rawTaxa object)
            var testTaxon = Taxon.rawTaxa[id];
            /**
             * The canonical name may be identical to the nameString in which case JSON taxon list stores
             * zero instead to save file space (and to mark that canonical name should be ignored)
             */

            canonical = testTaxon[TaxonSearch.canonicalColumn] === 0 ? testTaxon[TaxonSearch.nameStringColumn] : testTaxon[TaxonSearch.canonicalColumn];

            if (exp.test(canonical) || testTaxon[TaxonSearch.hybridCanonicalColumn] !== '' && exp.test(testTaxon[TaxonSearch.hybridCanonicalColumn])) {
              matchedIds[id] = {
                exact: testTaxon[TaxonSearch.nameStringColumn] === taxonString,
                near: nearMatchExp.test(testTaxon[TaxonSearch.nameStringColumn])
              };
            }
          }

          results = this.compile_results(matchedIds, preferHybrids);
        } else {
          // genus is not abbreviated
          var canonicalQuery, nearMatchRegex;
          var escapedTaxonString = TaxonSearch.escapeRegExp(taxonString);

          if (taxonString.indexOf(' ') !== -1) {
            // hybrids of the form Species x nothoname or Species nothoname should be seen as equivalent
            canonicalQuery = "".concat(TaxonSearch.escapeRegExp(taxonString.substr(0, taxonString.indexOf(' '))), " (x )?.*\\b").concat(TaxonSearch.generate_hybrid_combinations_regex(taxonString.substr(taxonString.indexOf(' ') + 1)), ".*");
            /**
             * Similar to canonicalQuery/hybridCanonicalQuery but without flexibility (.*) after genus part
             * used only for result ranking (exact>near>vague)
             */

            nearMatchRegex = new RegExp("^(?:Xs+)?".concat(TaxonSearch.escapeRegExp(taxonString.substr(0, taxonString.indexOf(' '))), " (x )?\\b").concat(TaxonSearch.generate_hybrid_combinations_regex(taxonString.substr(taxonString.indexOf(' ') + 1)), ".*"), 'i');
          } else {
            canonicalQuery = "".concat(escapedTaxonString, ".*");
            nearMatchRegex = new RegExp("^".concat(escapedTaxonString, ".*"));
          }

          var strictEscapedTaxonString = "^".concat(escapedTaxonString, ".*"); // var escapedTaxonStringRegExp = new RegExp(strictEscapedTaxonString, 'i');
          // var canonicalQueryRegExp = new RegExp('^' + canonicalQuery, 'i');
          // var hybridCanonicalQueryregExp = new RegExp('^X ' + canonicalQuery, 'i');

          var canonicalQueryRegExp = new RegExp("^(?:Xs+)?".concat(canonicalQuery), 'i');

          if (!TaxonSearch.showVernacular) {
            // no vernacular
            for (var _id in Taxon.rawTaxa) {
              // noinspection JSUnfilteredForInLoop (assume is safe for rawTaxa object)
              var _testTaxon = Taxon.rawTaxa[_id];
              canonical = _testTaxon[TaxonSearch.canonicalColumn] === 0 ? _testTaxon[TaxonSearch.nameStringColumn] : _testTaxon[TaxonSearch.canonicalColumn];

              if ( // testTaxon[TaxonSearch.nameStringColumn].search(escapedTaxonStringRegExp) !== -1 ||
              canonicalQueryRegExp.test(_testTaxon[TaxonSearch.nameStringColumn]) || canonical !== _testTaxon[TaxonSearch.nameStringColumn] && canonicalQueryRegExp.test(canonical) // testTaxon[TaxonSearch.nameStringColumn].search(hybridCanonicalQueryregExp) !== -1
              ) {
                matchedIds[_id] = {
                  exact: _testTaxon[TaxonSearch.nameStringColumn] === taxonString
                };
              }
            }

            results = this.compile_results(matchedIds, preferHybrids);
          } else {
            var caseInsensitiveEscapedTaxonRegex = new RegExp(strictEscapedTaxonString, 'i');

            for (var _id2 in Taxon.rawTaxa) {
              // noinspection JSUnfilteredForInLoop (assume is safe for rawTaxa object)
              var _testTaxon2 = Taxon.rawTaxa[_id2];
              canonical = _testTaxon2[TaxonSearch.canonicalColumn] === 0 ? _testTaxon2[TaxonSearch.nameStringColumn] : _testTaxon2[TaxonSearch.canonicalColumn];

              if ( // testTaxon[TaxonSearch.nameStringColumn].search(escapedTaxonStringRegExp) !== -1 ||
              canonicalQueryRegExp.test(_testTaxon2[TaxonSearch.nameStringColumn]) || canonical !== _testTaxon2[TaxonSearch.nameStringColumn] && canonicalQueryRegExp.test(canonical) // testTaxon[TaxonSearch.nameStringColumn].search(hybridCanonicalQueryregExp) !== -1
              ) {
                matchedIds[_id2] = {
                  exact: _testTaxon2[TaxonSearch.nameStringColumn] === taxonString,
                  near: nearMatchRegex.test(_testTaxon2[TaxonSearch.nameStringColumn]) || nearMatchRegex.test(canonical)
                };
              } else if (caseInsensitiveEscapedTaxonRegex.test(_testTaxon2[TaxonSearch.vernacularColumn]) || caseInsensitiveEscapedTaxonRegex.test(_testTaxon2[TaxonSearch.vernacularRootColumn])) {
                matchedIds[_id2] = {
                  exact: _testTaxon2[TaxonSearch.vernacularColumn] === taxonString,
                  vernacular: true
                };
              }
            }

            results = this.compile_results(matchedIds, preferHybrids);
            /**
             * if very few matches then retry searching using much fuzzier matching
             */

            if (results.length < 5) {
              var broadRegExp = new RegExp("\\b".concat(escapedTaxonString, ".*"), 'i'); // match anywhere in string

              for (var _id3 in Taxon.rawTaxa) {
                // noinspection JSUnfilteredForInLoop (assume is safe for rawTaxa object)
                if (!matchedIds.hasOwnProperty(_id3)) {
                  var _testTaxon3 = Taxon.rawTaxa[_id3];

                  if (broadRegExp.test(_testTaxon3[TaxonSearch.nameStringColumn])) {
                    matchedIds[_id3] = {
                      exact: _testTaxon3[TaxonSearch.nameStringColumn] === taxonString
                    };
                  } else if (_testTaxon3[TaxonSearch.canonicalColumn] !== 0 && broadRegExp.test(_testTaxon3[TaxonSearch.canonicalColumn]) || broadRegExp.test(_testTaxon3[TaxonSearch.vernacularColumn])) {
                    matchedIds[_id3] = {
                      exact: _testTaxon3[TaxonSearch.nameStringColumn] === taxonString,
                      vernacular: true
                    };
                  }
                }
              }

              results = this.compile_results(matchedIds, preferHybrids);
            }
          }
        }
      } else {
        results = [];
      }

      return results;
    }
  }, {
    key: "compile_results",
    value: function compile_results(matchedIds, preferHybrids) {
      var results = [];

      for (var id in matchedIds) {
        if (matchedIds.hasOwnProperty(id)) {
          var taxon = Taxon.rawTaxa[id];

          if ((!this.requireExtantDDbRecords || this.requireExtantDDbRecords && taxon[TaxonSearch.usedColumn] === 1) && (!this.minimumRankSort || this.minimumRankSort > 0 && taxon[TaxonSearch.minRankColumn] >= this.minimumRankSort)) {
            var qname = taxon[TaxonSearch.nameStringColumn] + (taxon[TaxonSearch.qualifierColumn] ? " ".concat(taxon[TaxonSearch.qualifierColumn]) : '');
            var row = {
              entityId: id,
              vernacular: taxon[TaxonSearch.vernacularColumn],
              qname: qname,
              name: qname,
              // use qualified name for the generic name field
              qualifier: taxon[TaxonSearch.qualifierColumn],
              authority: taxon[TaxonSearch.authorityColumn],
              uname: taxon[TaxonSearch.nameStringColumn],
              vernacularMatched: matchedIds[id].hasOwnProperty('vernacular'),
              exact: matchedIds[id].hasOwnProperty('exact') && matchedIds[id].exact,
              near: matchedIds[id].hasOwnProperty('near') && matchedIds[id].near
            };
            row.formatted = TaxonSearch.formatter(row);

            if (taxon[TaxonSearch.acceptedEntityIdColumn]) {
              var acceptedTaxon = Taxon.rawTaxa[taxon[TaxonSearch.acceptedEntityIdColumn]];

              if (!acceptedTaxon) {
                if (!Taxon.rawTaxa) {
                  throw new Error("Taxon.rawTaxa set is undefined, when trying to find taxon for accepted entity id ".concat(taxon[TaxonSearch.acceptedEntityIdColumn]));
                } else {
                  throw new Error("Failed to find taxon for accepted entity id ".concat(taxon[TaxonSearch.acceptedEntityIdColumn]));
                }
              }

              row.acceptedEntityId = taxon[TaxonSearch.acceptedEntityIdColumn];
              row.acceptedNameString = acceptedTaxon[TaxonSearch.nameStringColumn];
              row.acceptedQualifier = acceptedTaxon[TaxonSearch.qualifierColumn];
              row.acceptedAuthority = acceptedTaxon[TaxonSearch.authorityColumn];
            }

            results.push(row);
          }
        }
      }

      if (results.length) {
        results.sort(function (a, b) {
          // if (a.uname == 'Taraxacum \'Irish cambricum\'' || b.uname == 'Taraxacum \'Irish cambricum\'') {
          //   console.log(a.uname + " with " + b.uname);
          // }
          if (a.exact) {
            // logger('exact test a: ' + a.uname + ' vs ' + b.uname);
            // logger(b);
            if (b.exact) {
              return a.acceptedEntityId ? 1 : 0; // prefer accepted name
            }

            return -1; // return b.exact ? 0 : -1;
          } else if (b.exact) {
            // logger('exact test b: ' + b.uname);
            return 1;
          }

          if (a.near) {
            if (!b.near) {
              return -1;
            }
          } else if (b.near) {
            // logger('exact test b: ' + b.uname);
            return 1;
          }

          var aIsHybrid = a.uname.match(/\bx\b/i) !== null;
          var bIsHybrid = b.uname.match(/\bx\b/i) !== null;

          if (aIsHybrid) {
            // logger('hybrid test: ' + a.qname + ' vs ' + b.qname);
            // logger('hybrid test: ' + a.uname + ' vs ' + b.uname);
            if (bIsHybrid) {
              if (a.uname === b.uname) {
                return a.acceptedEntityId ? 1 : 0; // prefer accepted name
              }

              return a.qname < b.qname ? -1 : 1;
            }

            return preferHybrids ? -1 : 1;
          } else if (bIsHybrid) {
            return preferHybrids ? 1 : -1;
          } else if (a.uname === b.uname) {
            if ((a.acceptedEntityId || b.acceptedEntityId) && !(a.acceptedEntityId && b.acceptedEntityId)) {
              // one of the pair is not an accepted name
              return a.acceptedEntityId ? 1 : -1; // prefer accepted name
            } else {
              // for NYPH purposes agg. and s.l. should be prioritised over
              // agg., s.l., empty, s.s.
              var aQIndex = ['s.s.', '', null, 's.l.', 'agg.'].indexOf(a.qualifier);
              var bQIndex = ['s.s.', '', null, 's.l.', 'agg.'].indexOf(b.qualifier);
              return aQIndex === bQIndex ? 0 : aQIndex < bQIndex ? 1 : -1;
            }
          } else if (a.vernacularMatched && b.vernacularMatched) {
            // matching both names using vernacular
            // so sort by this
            if (a.vernacular !== b.vernacular) {
              return a.vernacular.length < b.vernacular.length ? -1 : 1;
            }
          }

          return a.uname < b.uname ? -1 : 1;
        }); // truncate results

        if (results.length > TaxonSearch.MAXIMUM_RESULTS) {
          results.length = TaxonSearch.MAXIMUM_RESULTS;
        }
      }

      return results;
    }
  }], [{
    key: "formatter",
    value: function formatter(taxonResult) {

      if (TaxonSearch.showVernacular) {
        if (taxonResult.vernacularMatched) {
          if (taxonResult.acceptedEntityId) {
            return "<q><b>".concat(taxonResult.vernacular, "</b></q> <span class=\"italictaxon\">").concat(taxonResult.uname).concat(taxonResult.qualifier ? " <b>".concat(taxonResult.qualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.authority, "</span>") + " = <span class=\"italictaxon\">".concat(taxonResult.acceptedNameString).concat(taxonResult.acceptedQualifier ? " <b>".concat(taxonResult.acceptedQualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.acceptedAuthority, "</span>");
          }

          return "<q><b>".concat(taxonResult.vernacular, "</b></q> <span class=\"italictaxon\">").concat(taxonResult.uname).concat(taxonResult.qualifier ? " <b>".concat(taxonResult.qualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.authority, "</span>");
        }

        if (taxonResult.acceptedEntityId) {
          return "<span class=\"italictaxon\">".concat(taxonResult.uname).concat(taxonResult.qualifier ? " <b>".concat(taxonResult.qualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.authority, "</span>").concat(taxonResult.vernacular ? " <q><b>".concat(taxonResult.vernacular, "</b></q>") : '', " = <span class=\"italictaxon\">").concat(taxonResult.acceptedNameString).concat(taxonResult.acceptedQualifier ? " <b>".concat(taxonResult.acceptedQualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.acceptedAuthority, "</span>");
        }

        return "<span class=\"italictaxon\">".concat(taxonResult.uname).concat(taxonResult.qualifier ? " <b>".concat(taxonResult.qualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.authority, "</span>").concat(taxonResult.vernacular ? " <q><b>".concat(taxonResult.vernacular, "</b></q>") : '');
      }

      if (taxonResult.acceptedEntityId) {
        return "<span class=\"italictaxon\">".concat(taxonResult.uname).concat(taxonResult.qualifier ? " <b>".concat(taxonResult.qualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.authority, "</span>") + " = <span class=\"italictaxon\">".concat(taxonResult.acceptedNameString).concat(taxonResult.acceptedQualifier ? " <b>".concat(taxonResult.acceptedQualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.acceptedAuthority, "</span>");
      }

      return "<span class=\"italictaxon\">".concat(taxonResult.uname).concat(taxonResult.qualifier ? " <b>".concat(taxonResult.qualifier, "</b>") : '', "</span> <span class=\"taxauthority\">").concat(taxonResult.authority, "</span>");
    }
  }, {
    key: "normaliseTaxonName",
    value:
    /**
     *
     * @param {string} taxonString
     * @returns {string}
     */
    function normaliseTaxonName(taxonString) {
      for (var i = 0, l = TaxonSearch.taxonRankNameSearchRegex.length; i < l; i++) {
        taxonString = taxonString.replace(TaxonSearch.taxonRankNameSearchRegex[i], TaxonSearch.taxonRankNameReplacement[i]);
      }

      for (var _i = 0, _l = TaxonSearch.taxonQualifierSearchRegex.length; _i < _l; _i++) {
        taxonString = taxonString.replace(TaxonSearch.taxonQualifierSearchRegex[_i], TaxonSearch.taxonQualifierReplacement[_i]);
      }

      return taxonString;
    }
    /**
     * from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
     *
     * @param {string} literal
     * @return string
     */

  }, {
    key: "escapeRegExp",
    value: function escapeRegExp(literal) {
      return literal.replace(TaxonSearch.cleanRegex, '\\$&');
    }
  }, {
    key: "generate_hybrid_combinations_regex",
    value:
    /**
     * generate hybrid name permutations
     *
     * @param {string} names unescaped series of species e.g. "glandulifera" or "carex x nigra"
     * @returns {string} name permutations formatted as a regular expression
     */
    function generate_hybrid_combinations_regex(names) {
      var splitParts = TaxonSearch.escapeRegExp(names).split(/\s+x\s+/i);

      if (splitParts.length < 2) {
        return splitParts[0];
      }

      var hybridPermutations = [];
      /**
       * generate hybrid name permutations
       *
       * modified from O'Reilly PHP Cookbook
       * http://docstore.mik.ua/orelly/webprog/pcook/ch04_26.htm
       *
       * @param {Array.<string>} items
       * @param {Array.<string>} perms
       */

      var permutate = function permutate(items, perms) {
        if (items.length === 0) {
          hybridPermutations[hybridPermutations.length] = perms.join('[a-zA-Z]* x ');
        } else {
          for (var i = items.length - 1; i >= 0; --i) {
            var newItems = items.slice(0);
            var newPerms = perms.slice(0); // take copies of the array

            newPerms.unshift(newItems.splice(i, 1)[0]);
            permutate(newItems, newPerms);
          }
        }
      };

      permutate(splitParts, []);
      return "(?:".concat(hybridPermutations.join('|'), ")");
    }
  }]);

  return TaxonSearch;
}();

_defineProperty(TaxonSearch, "showVernacular", true);

_defineProperty(TaxonSearch, "MIN_SEARCH_LENGTH", 2);

_defineProperty(TaxonSearch, "MAXIMUM_RESULTS", 25);

_defineProperty(TaxonSearch, "abbreviatedGenusRegex", /^(X\s+)?([a-z])[.\s]+(.*?)$/i);

_defineProperty(TaxonSearch, "nameStringColumn", 0);

_defineProperty(TaxonSearch, "canonicalColumn", 1);

_defineProperty(TaxonSearch, "hybridCanonicalColumn", 2);

_defineProperty(TaxonSearch, "acceptedEntityIdColumn", 3);

_defineProperty(TaxonSearch, "qualifierColumn", 4);

_defineProperty(TaxonSearch, "authorityColumn", 5);

_defineProperty(TaxonSearch, "vernacularColumn", 6);

_defineProperty(TaxonSearch, "vernacularRootColumn", 7);

_defineProperty(TaxonSearch, "usedColumn", 8);

_defineProperty(TaxonSearch, "minRankColumn", 9);

_defineProperty(TaxonSearch, "taxonRankNameSearchRegex", [/\s+sub-?g(?:en(?:us)?)?[.\s]+/i, /\s+sect(?:ion)?[.\s]+/i, /\s+subsect(?:ion)?[.\s]+/i, /\s+ser(?:ies)?[.\s]+/i, /\s+gp[.\s]+/i, /\s+s(?:ub)?-?sp(?:ecies)?[.\s]+/i, /\s+morphotype\s+/i, /\s+var[.\s]+/i, /\s+cv[.\s]+/i, /\s+n(?:otho)?v(?:ar)?[.\s]+/i, /\s+f[.\s]+|\s+forma?\s+/i, /\s+n(?:otho)?ssp[.\s]+/i]);

_defineProperty(TaxonSearch, "taxonRankNameReplacement", [' subg. ', ' sect. ', ' subsect. ', ' ser. ', ' group ', ' subsp. ', ' morph. ', ' var. ', ' cv. ', // ddb preference is for single quotes for cultivars
' nothovar. ', ' f. ', ' nothosubsp. ']);

_defineProperty(TaxonSearch, "cleanRankNamesRegex", /\s(subfam\.|subg\.|sect\.|subsect\.|ser\.|subser\.|subsp\.|nothosubsp\.|microsp\.|praesp\.|agsp\.|race|convar\.|nm\.|microgene|f\.|subvar\.|var\.|nothovar\.|cv\.|sublusus|taxon|morph\.|group|sp\.)\s/);

_defineProperty(TaxonSearch, "taxonQualifierSearchRegex", [/\s*\(?\bf\s*x\s*m or m\s*x\s*f\)?\s*$/i, /\s*\(?\bm\s*x\s*f or f\s*x\s*m\)?\s*$/i, /\s*\(?\bf\s*x\s*m\)?\s*$/i, /\s*\(?\bm\s*x\s*f\)?\s*$/i, /\s*\(?\bfemale\s*x\s*male\)?\s*$/i, /\s*\(?\bmale\s*x\s*female\)?\s*$/i, // stand-alone male/female qualifier (e.g. applied to Petasites hybridus)
// removes single quotes
/\s*'male'\s*$/i, /\s*'female'\s*$/i, // mid-string ss/sl qualifiers
/\b\s*sens\.?\s*lat[.\s]+/i, /\b\s*s\.\s*lat\.?\s*\b/i, /\b\s*s\.?\s*l\.?\s+\b/i, /\b\s*sensu\s*lato\s+\b|\(\s*sensu\s*lato\s*\)/i, /\b\s*sensu\s*stricto\s+\b|\(\s*sensu\s*stricto\s*\)/i, /\b\s*sens\.?\s*strict[.\s]+/i, // '/\b\s*sens\.?\s*str\.?\s*(?=\))|\b\s*sens\.?\s*str\.?\s*\b/i', // the first look-ahead option matches before a closing-paren (\b fails between '.)' )
/\b\s*sens\.?\s*str\.?\s*(?=\))|\b\s*sens\.?\s*str[.\s]+/i, // '/\b\s*s\.\s*str\.?\s*\b/i',
/\b\s*s\.\s*str[.\s]+/i, /\b\s*s\.?\s*s\.?\s+\b/i, // end-of-string ss/sl qualifiers
/\b\s*sens\.?\s*lat\.?\s*$/i, /\b\s*s\.\s*lat\.?\s*$/i, /\b\s*s\.?\s*l\.?\s*$/i, /\b\s*sensu\s*lato\s*$/i, /\b\s*sensu\s*stricto\s*$/i, /\b\s*sens\.?\s*strict\.?\s*$/i, /\b\s*sens\.?\s*str\.?\s*$/i, /\b\s*s\.\s*str\.?\s*$/i, /\b\s*s\.?\s*s\.?\s*$/i, /\b\s*agg\.?\s*$/i, /\b\s*aggregate\s*$/i, /\b\s*sp\.?\s*cultivar\s*$/i, /\b\s*sp\.?\s*cv\.?\s*$/i, /\b\s*cultivars?\s*$/i, /\b\s*cv\s+$/i, /\b\s*cv$/i, /\b\s*cf\s*$/i, /\b\s*aff\s*$/i, /\b\s*s\.?n\.?\s*$/i, /\b\s*sp\.?\s*nov\.?\s*$/i, /\b\s*auct[.\s]*$/i, /\b\s*ined[.\s]*$/i, /\b\s*nom\.?\snud[.\s]*$/i, /\b\s*p\.p[.\s?]*$/i, /\b\s*spp?\.?[\s?]*$/i, /\b\s*species\s*$/i, /\b\s*spp?\.?\s*\(/i, // catch e.g. Ulmus sp. (excluding Ulmus glabra)
/\b\s*species\s*\(/i]);

_defineProperty(TaxonSearch, "taxonQualifierReplacement", [' ', // (f x m or m x f) is the default so an explicit qualifier isn't used
' ', // (m x f or f x m) is the default so an explicit qualifier isn't used
' (f x m)', ' (m x f)', ' (f x m)', ' (m x f)', // stand-alone male/female qualifier (e.g. applied to Petasites hybridus)
// removed single quotes
' male', ' female', // mid-string ss/sl qualifiers
' s.l. ', ' s.l. ', ' s.l. ', ' s.l. ', ' s.s. ', ' s.s. ', ' s.s. ', ' s.s. ', ' s.s. ', // end-of-string ss/sl qualifiers
' s.l.', ' s.l.', ' s.l.', ' s.l.', ' s.s.', ' s.s.', ' s.s.', ' s.s.', ' s.s.', ' agg.', ' agg.', ' cv. ', ' cv. ', ' cv. ', ' cv. ', ' cv. ', ' cf.', ' aff.', ' sp.nov.', ' sp.nov.', ' auct.', ' ined.', ' nom. nud.', ' pro parte', '', '', ' (', ' (']);

_defineProperty(TaxonSearch, "cleanRegex", /[.*+?^${}()|[\]\\]/g);

/**
 * @external BsbiDb
 */

/**
 *
 */

var TaxaLoadedHook = /*#__PURE__*/function () {
  function TaxaLoadedHook() {
    _classCallCheck(this, TaxaLoadedHook);
  }

  _createClass(TaxaLoadedHook, null, [{
    key: "taxaLoadedEntryPoint",
    value: function taxaLoadedEntryPoint() {
      Taxon.rawTaxa = BsbiDb.TaxonNames;

      while (TaxaLoadedHook.callbackStack.length) {
        var callback = TaxaLoadedHook.callbackStack.shift();

        try {
          callback();
        } catch (e) {
          console.log({
            'Exception after taxon load': e
          });
        }
      }
    }
    /**
     *
     * @returns {Promise<any>|Promise<void>}
     */

  }, {
    key: "onceTaxaLoaded",
    value: function onceTaxaLoaded() {
      if (BsbiDb.hasOwnProperty('TaxonNames')) {
        return Promise.resolve();
      } else {
        if (!BsbiDb.taxonNamesLoadedEntryPoint) {
          BsbiDb.taxonNamesLoadedEntryPoint = TaxaLoadedHook.taxaLoadedEntryPoint;
        }

        return new Promise(function (resolve) {
          TaxaLoadedHook.callbackStack.push(resolve);
        });
      }
    }
  }]);

  return TaxaLoadedHook;
}();

_defineProperty(TaxaLoadedHook, "callbackStack", []);

/**
 *
 * @param {string} separator
 * @param {string} finalSeparator
 * @param {Array.<string>} list
 * @return string
 */
function formattedImplode(separator, finalSeparator, list) {
  if (list.length > 2) {
    var last = list.pop();
    return "".concat(list.join(separator + ' '), " ").concat(finalSeparator, " ").concat(last);
  } else {
    return list.join(" ".concat(finalSeparator, " "));
  }
}

export { App, AppController, BSBIServiceWorker, EventHarness, GPSRequest, h as GridCoords, u as GridCoordsCI, c as GridCoordsGB, U as GridCoordsIE, S as GridRef, M as GridRefCI, O as GridRefGB, J as GridRefIE, InternalAppError, C as LatLngCI, g as LatLngGB, L as LatLngIE, T as LatLngWGS84, MainController, Model, NotFoundError, Occurrence, OccurrenceImage, PatchedNavigo, StaticContentController, Survey, SurveyPickerController, TaxaLoadedHook, Taxon, TaxonError, TaxonSearch, UUID_REGEX, doubleClickIntercepted, escapeHTML, formattedImplode, uuid };
//# sourceMappingURL=bsbiappframework.js.map
