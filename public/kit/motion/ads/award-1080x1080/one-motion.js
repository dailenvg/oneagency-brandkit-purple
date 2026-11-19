var OneMotion = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	// src/lib/motion.ts
	/**
	* ONE Agency motion tokens, taken from the film "ONE Agency: The Free Business Audit" (modules/shared.js and the scene
	* files). Quick and confident, left-to-right and upward, plays once and holds on the result.
	*
	* Framework-free on purpose (type-only import above): src/kit/motion/vanilla.ts imports these for the HTML5 ad runtime.
	*/
	var clamp01 = (x) => Math.min(1, Math.max(0, x));
	/** Film `eo`: ease-out cubic. Word rise, line draw, bar grow. */
	var easeOutCubic = (p) => 1 - (1 - p) ** 3;
	/** Film `eio`: ease-in-out cubic. The gradient wipe sweep. */
	var easeInOutCubic = (p) => p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
	/** Film `out`: quadratic ease-in for exits. */
	var easeInQuad = (p) => p * p;
	/**
	* Film `eob(p, s)`: back-out with overshoot `s` (1.6 letter hop and logo, 1.7 pop, 1.8 to 1.9 dots and checks).
	* Returns a plain easing function so it can be passed to motion/react as `ease`.
	*/
	var backOut = (overshoot = 1.7) => (p) => {
		const x = p - 1;
		return 1 + (overshoot + 1) * x ** 3 + overshoot * x ** 2;
	};
	/** Seconds. Micro 150 to 250 ms, component 250 to 400 ms, page 300 to 600 ms; film moves noted. */
	var duration = {
		micro: .2,
		component: .32,
		page: .5,
		/** Word rise, letter hop and pop: each element's own move. */
		move: .5,
		/** Exit: rise up and fade. */
		out: .35,
		/** Word exit inside a line that leaves word by word. */
		wordOut: .3,
		/** Gradient bar grow under the logo. */
		bar: .6,
		/** Gradient wipe sweep into the next line. */
		wipe: .65,
		/** Line draw across the chart, before the dot lands. */
		draw: 1.1,
		/** Logo scale-in with blur. */
		logo: 1.1,
		/** End-dot pop and ring pulse. */
		dot: .35,
		ring: .65,
		/** Halo swell: opacity settles first, scale keeps growing. */
		haloFade: 1.7,
		haloScale: 3.5,
		/** Final still: the last beat of an ad holds dead still this long. */
		hold: 4
	};
	/** Cubic-bezier fallbacks for CSS and for tweens where a function ease is not accepted. */
	var ease = {
		outCubic: [
			.33,
			1,
			.68,
			1
		],
		inOutCubic: [
			.65,
			0,
			.35,
			1
		],
		inQuad: [
			.11,
			0,
			.5,
			0
		],
		backOut: [
			.34,
			1.56,
			.64,
			1
		],
		/** The live site's --v2-ease. */
		site: [
			.2,
			.7,
			.2,
			1
		]
	};
	/** Back-out overshoot amounts used across the film. */
	var overshoot = {
		hop: 1.6,
		logo: 1.6,
		pop: 1.7,
		dot: 1.8,
		check: 1.9
	};
	/** Seconds between siblings. */
	var stagger = {
		word: .07,
		/** Looser word step for short accent lines. */
		wordLoose: .1,
		letter: .035,
		wordOut: .03,
		/** The live site's --v2-stagger (cards, list items). */
		children: .1
	};
	/** Pixels, degrees and scales the moves travel. */
	var distance = {
		riseY: 34,
		riseBlur: 8,
		wordOutY: 40,
		outY: -30,
		hopY: [50, 80],
		hopRotate: [-5, 7],
		popFrom: .6,
		logoFrom: .8,
		logoBlur: 10,
		ringScale: 3.2,
		haloScale: [.85, 1.05],
		haloOpacity: [.55, .9]
	};
	duration.component, ease.outCubic;
	distance.riseY, `${distance.riseBlur}`, duration.move;
	duration.move, overshoot.hop, duration.move / 4;
	distance.popFrom, duration.move, overshoot.pop, duration.move / 3;
	distance.outY, duration.out;
	duration.micro, ease.outCubic;
	duration.page, ease.outCubic, duration.out;
	// src/kit/motion/vanilla.ts
	/**
	* ONE Agency motion, framework-free. The same moves as the React components in this folder, written as pure functions
	* of time so HTML5 ads render frame-exact: call a move with the current time `t` and its start time `t0` (seconds) and
	* it writes that frame's styles. Seeking to any `t` always gives the same frame, which is what video and GIF export
	* need. Ported from the film's `UI.rise / UI.hop / UI.pop / UI.out / UI.draw`.
	*
	* Built to public/kit/motion/one-motion.js (global `OneMotion`) and one-motion.mjs by scripts/build-motion.mjs.
	*/
	/** Progress of `t` through the window [a, b], clamped to 0..1 (film `seg`). */
	var seg = (t, a, b) => clamp01((t - a) / (b - a));
	var lerp = (a, b, k) => a + (b - a) * k;
	var fixed = (n, digits = 3) => n.toFixed(digits);
	var translateY = (y) => Math.abs(y) < .01 ? "none" : `translateY(${fixed(y, 2)}px)`;
	var wordCache = /* @__PURE__ */ new WeakMap();
	var letterCache = /* @__PURE__ */ new WeakMap();
	/** Splits an element's text into inline-block word spans once. Words at `accent` indices get `accentClass`. */
	function splitWords(el, accent = [], accentClass = "acc") {
		const cached = wordCache.get(el);
		if (cached) return cached;
		const words = (el.textContent ?? "").trim().split(/\s+/);
		el.setAttribute("aria-label", words.join(" "));
		el.textContent = "";
		const spans = words.map((word, i) => {
			const span = document.createElement("span");
			span.textContent = word;
			span.style.display = "inline-block";
			span.setAttribute("aria-hidden", "true");
			if (accent.includes(i)) span.className = accentClass;
			el.append(span);
			if (i < words.length - 1) el.append(" ");
			return span;
		});
		wordCache.set(el, spans);
		return spans;
	}
	/** Splits an element's text into inline-block letter spans once, keeping each word unbreakable. */
	function splitLetters(el) {
		const cached = letterCache.get(el);
		if (cached) return cached;
		const words = (el.textContent ?? "").trim().split(/\s+/);
		el.setAttribute("aria-label", words.join(" "));
		el.textContent = "";
		const letters = [];
		words.forEach((word, wi) => {
			const wrap = document.createElement("span");
			wrap.style.display = "inline-block";
			wrap.style.whiteSpace = "nowrap";
			wrap.setAttribute("aria-hidden", "true");
			for (const ch of word) {
				const span = document.createElement("span");
				span.textContent = ch;
				span.style.display = "inline-block";
				wrap.append(span);
				letters.push(span);
			}
			el.append(wrap);
			if (wi < words.length - 1) el.append(" ");
		});
		letterCache.set(el, letters);
		return letters;
	}
	/** Word rise: each word blurs and rises 34px in over 0.5s, ease-out cubic, 70ms apart. */
	function rise(el, t, t0, options = {}) {
		const step = options.stagger ?? stagger.word;
		splitWords(el, options.accent).forEach((span, i) => {
			const e = easeOutCubic(seg(t, t0 + i * step, t0 + i * step + duration.move));
			let opacity = e;
			let y = distance.riseY * (1 - e);
			if (options.out != null) {
				const q = seg(t, options.out + i * stagger.wordOut, options.out + i * stagger.wordOut + duration.wordOut);
				opacity *= 1 - q;
				y -= distance.wordOutY * q * q;
			}
			span.style.opacity = fixed(opacity);
			span.style.transform = translateY(y);
			span.style.filter = e > .995 ? "none" : `blur(${fixed(distance.riseBlur * (1 - e), 1)}px)`;
		});
	}
	/** Letter hop: letters land with a back-out overshoot from alternating 50/80px lifts and -5/7 degree tilts. */
	function hop(el, t, t0, step = stagger.letter) {
		const ease = backOut(overshoot.hop);
		splitLetters(el).forEach((span, i) => {
			const p = seg(t, t0 + i * step, t0 + i * step + duration.move);
			const e = ease(p);
			const y = (1 - e) * distance.hopY[i % 2];
			const r = (1 - e) * distance.hopRotate[i % 2];
			span.style.opacity = fixed(clamp01(p * 4));
			span.style.transform = Math.abs(y) < .01 ? "none" : `translateY(${fixed(y, 2)}px) rotate(${fixed(r, 2)}deg)`;
		});
	}
	/** Pop: scale in with a back-out overshoot; opacity lands in the first third. */
	function pop(el, t, t0, options = {}) {
		const d = options.duration ?? duration.move;
		const from = options.from ?? distance.popFrom;
		const p = seg(t, t0, t0 + d);
		const e = backOut(options.overshoot ?? overshoot.pop)(p);
		el.style.opacity = fixed(clamp01(p * 3));
		el.style.transform = p >= 1 ? "none" : `scale(${fixed(lerp(from, 1, e), 4)})`;
		if (options.blur) el.style.filter = p >= 1 ? "none" : `blur(${fixed(options.blur * (1 - easeOutCubic(p)), 1)}px)`;
	}
	/** Logo scale-in: from 80% and 10px blur, settling with a gentle overshoot over 1.1s. */
	function logoIn(el, t, t0) {
		pop(el, t, t0, {
			duration: duration.logo,
			from: distance.logoFrom,
			blur: distance.logoBlur,
			overshoot: overshoot.logo
		});
	}
	/** Exit: rises 30px and fades over 0.35s, accelerating. Call after the element's entrance move for the same frame. */
	function out(el, t, t0) {
		const p = seg(t, t0, t0 + duration.out);
		if (p <= 0) return;
		const e = easeInQuad(p);
		const current = el.style.transform === "none" ? "" : el.style.transform;
		el.style.opacity = fixed((1 - e) * parseFloat(el.style.opacity || "1"));
		el.style.transform = `${current} translateY(${fixed(distance.outY * e, 2)}px)`.trim();
	}
	/** Line draw: strokes a path from start to end between a and b. The path needs pathLength="1". */
	function draw(path, t, a, b) {
		const p = seg(t, a, b);
		path.style.strokeDasharray = "1";
		path.style.strokeDashoffset = fixed(1 - easeOutCubic(p), 4);
		path.style.opacity = p > 0 ? "1" : "0";
	}
	/** The full line move: draw over 1.1s, the end dot pops as the line arrives, then the ring pulses out once. */
	function lineDraw(parts, t, t0) {
		draw(parts.path, t, t0, t0 + duration.draw);
		const dotStart = t0 + duration.draw - .15;
		const d = seg(t, dotStart, dotStart + duration.dot);
		parts.dot.style.opacity = d > 0 ? "1" : "0";
		parts.dot.style.transform = `scale(${fixed(backOut(overshoot.dot)(d), 4)})`;
		const r = seg(t, dotStart + .2, dotStart + .2 + duration.ring);
		parts.ring.style.opacity = fixed(r > 0 ? 1 - r : 0);
		parts.ring.style.transform = `scale(${fixed(1 + (distance.ringScale - 1) * easeOutCubic(r))})`;
	}
	/** Halo: the soft glow behind the logo swells once (opacity 0.55 to 0.9, scale 0.85 to 1.05) and holds. */
	function halo(el, t, t0) {
		const [o0, o1] = distance.haloOpacity;
		const [s0, s1] = distance.haloScale;
		el.style.opacity = fixed(lerp(o0, o1, easeOutCubic(seg(t, t0, t0 + duration.haloFade))) * clamp01((t - t0) * 4));
		el.style.transform = `scale(${fixed(lerp(s0, s1, easeOutCubic(seg(t, t0, t0 + duration.haloScale))), 4)})`;
	}
	/** Gradient bar: the --bar rule grows from the left. Set transform-origin: left center. */
	function bar(el, t, t0) {
		el.style.transform = `scaleX(${fixed(easeOutCubic(seg(t, t0, t0 + duration.bar)), 4)})`;
	}
	/** Gradient wipe: a bar sweeps left to right (ease-in-out, 0.65s), revealing `to` and clipping `from` behind it. */
	function wipe(parts, t, t0) {
		const x = easeInOutCubic(seg(t, t0, t0 + duration.wipe));
		const X = lerp(-20, parts.width + 20, x);
		parts.sweep.style.transform = `translateX(${fixed(X, 1)}px)`;
		parts.sweep.style.opacity = x > 0 && x < 1 ? "1" : "0";
		if (parts.from) parts.from.style.clipPath = x <= 0 ? "none" : `inset(0 0 0 ${fixed(X, 1)}px)`;
		parts.to.style.clipPath = x >= 1 ? "none" : `inset(0 ${fixed(Math.max(0, parts.width - X), 1)}px 0 0)`;
	}
	/**
	* Drives a `render(t)` function in real time. Plays once and holds the last frame, per the brand's motion rule.
	* Under prefers-reduced-motion it renders the final frame straight away: the end state, no movement.
	*/
	function player(render, options) {
		let time = 0;
		let start = 0;
		let frame = 0;
		const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
		const seek = (t) => {
			time = Math.min(Math.max(0, t), options.duration);
			render(time);
		};
		const tick = (now) => {
			seek((now - start) / 1e3);
			frame = time < options.duration ? requestAnimationFrame(tick) : 0;
		};
		const play = () => {
			if (reduced) return seek(options.duration);
			cancelAnimationFrame(frame);
			start = performance.now() - time * 1e3;
			frame = requestAnimationFrame(tick);
		};
		const pause = () => {
			cancelAnimationFrame(frame);
			frame = 0;
		};
		seek(0);
		if (options.autoplay !== false) play();
		return {
			play,
			pause,
			seek: (t) => {
				pause();
				seek(t);
			},
			get time() {
				return time;
			}
		};
	}
	exports.backOut = backOut;
	exports.bar = bar;
	exports.clamp01 = clamp01;
	exports.distance = distance;
	exports.draw = draw;
	exports.duration = duration;
	exports.easeInOutCubic = easeInOutCubic;
	exports.easeInQuad = easeInQuad;
	exports.easeOutCubic = easeOutCubic;
	exports.halo = halo;
	exports.hop = hop;
	exports.lerp = lerp;
	exports.lineDraw = lineDraw;
	exports.logoIn = logoIn;
	exports.out = out;
	exports.overshoot = overshoot;
	exports.player = player;
	exports.pop = pop;
	exports.rise = rise;
	exports.seg = seg;
	exports.splitLetters = splitLetters;
	exports.splitWords = splitWords;
	exports.stagger = stagger;
	exports.wipe = wipe;
	return exports;
})({});
