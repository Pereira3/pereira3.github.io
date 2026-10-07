import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { useTimeout } from "@/hooks/useTimeout";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { randomBetween, randomInt } from "@/projects/AreYouHuman/random";
import shared from "@/projects/AreYouHuman/AreYouHuman.module.css";
import styles from "@/projects/AreYouHuman/PuzzleStep.module.css";

const WIDTH = 320;
const HEIGHT = 180;
const SLIDER_MAX = 1000;
const TOLERANCE = 20; // how close to the right spot counts as a fit, in slider steps
const ROUNDS = 3; // round 1 has one piece, round 2 has two, round 3 has three
const ROUND_PAUSE_MS = 600; // time to see the pieces in place before the next round
const REST_MS = 700; // how long a slider rests before a piece close enough snaps in
const GAP_DISTANCE = 52; // the least distance between two gaps, so they never overlap

// One color per piece, for its outline, its gap's outline and its slider's handle,
// so it's clear which slider moves which piece.
const PIECE_COLORS = ["#4dd0e1", "#ffd84d", "#ff8ad8"];
const PIECE_NAMES = ["blue", "yellow", "pink"]; // for screen readers

// Outline of a piece, centred on 0,0: a square with a knob on top and one on the right.
const PIECE =
	"M -18 -18 H -6 a 6 6 0 1 1 12 0 H 18 V -6 a 6 6 0 1 1 0 12 V 18 H -18 Z";

type Point = { x: number; y: number };

type Hill = { path: string; color: string };

// A piece and the curved path its slider moves it along.
type Piece = {
	start: Point;
	control: Point;
	end: Point;
	wobble: number; // how far the piece swings sideways from its curve, in pixels
	waves: number; // how many times it swings over the whole slider
	turns: number; // how many full turns it spins over the whole slider
	fit: number; // the slider value where the piece fits its gap
};

type Puzzle = {
	sky: [string, string];
	sun: Point & { r: number };
	hills: Hill[];
	pieces: Piece[];
};

// Where a piece is at slider position t (0 to 1): along a quadratic Bézier curve from
// left to right, swinging sideways (at right angles to the start→end line) as it goes.
function pointAt(p: Piece, t: number): Point {
	const u = 1 - t;
	const x = u * u * p.start.x + 2 * u * t * p.control.x + t * t * p.end.x;
	const y = u * u * p.start.y + 2 * u * t * p.control.y + t * t * p.end.y;
	const dx = p.end.x - p.start.x;
	const dy = p.end.y - p.start.y;
	const length = Math.hypot(dx, dy);
	const swing = p.wobble * Math.sin(t * Math.PI * 2 * p.waves);
	return { x: x + (-dy / length) * swing, y: y + (dx / length) * swing };
}

function gapOf(piece: Piece): Point {
	return pointAt(piece, piece.fit / SLIDER_MAX);
}

// A row of rolling hills across the picture, as a closed shape.
function hillPath(baseY: number, roughness: number): string {
	let path = `M 0 ${HEIGHT} L 0 ${baseY}`;
	for (let x = 0; x < WIDTH; x += 40) {
		const peak = baseY - randomBetween(0, roughness);
		path += ` Q ${x + 20} ${peak} ${x + 40} ${baseY + randomBetween(-6, 6)}`;
	}
	return `${path} L ${WIDTH} ${HEIGHT} Z`;
}

// Piece `index` of `count`. Each starts in its own band down the left edge, so they
// don't start on top of each other. Its gap is placed where the whole piece stays
// inside the picture and away from the other pieces' gaps.
function makePiece(index: number, count: number, taken: Point[]): Piece {
	const band = (HEIGHT - 48) / count;
	for (;;) {
		const piece: Piece = {
			start: {
				x: 24,
				y: 24 + band * (index + 0.5) + randomBetween(-6, 6),
			},
			control: { x: randomBetween(80, 240), y: randomBetween(-40, 220) },
			end: { x: 300, y: randomBetween(20, HEIGHT - 20) },
			wobble: randomBetween(10, 22),
			waves: randomBetween(1.5, 3),
			turns: randomBetween(1.5, 2.5) * (Math.random() < 0.5 ? -1 : 1),
			fit: randomInt(450, 850),
		};
		const gap = gapOf(piece);
		const inside =
			gap.x > 32 &&
			gap.x < WIDTH - 32 &&
			gap.y > 32 &&
			gap.y < HEIGHT - 32;
		const apart = taken.every(
			(other) =>
				Math.hypot(other.x - gap.x, other.y - gap.y) > GAP_DISTANCE,
		);
		if (inside && apart) return piece;
	}
}

// A new random picture with `count` pieces, on every round of every attempt.
function makePuzzle(count: number): Puzzle {
	const hue = randomInt(0, 359);
	const pieces: Piece[] = [];
	for (let index = 0; index < count; index++)
		pieces.push(makePiece(index, count, pieces.map(gapOf)));
	return {
		sky: [`hsl(${hue} 70% 72%)`, `hsl(${(hue + 40) % 360} 75% 88%)`],
		sun: {
			x: randomBetween(40, 280),
			y: randomBetween(25, 60),
			r: randomBetween(14, 24),
		},
		hills: [0, 1, 2].map((layer) => ({
			path: hillPath(95 + layer * 28, 40 - layer * 10),
			color: `hsl(${(hue + 120 + layer * 15) % 360} ${45 + layer * 5}% ${55 - layer * 13}%)`,
		})),
		pieces,
	};
}

// Slide the missing pieces into their gaps, in three rounds: one piece, then two, then
// three, each on a new picture. A piece doesn't move in a straight line: it curves,
// swings and spins, and only sits upright when it reaches its spot. Each piece has its
// own slider, in its color. Letting go in the wrong place doesn't fail: the visitor keeps
// trying until the time runs out. Resting on the right spot places the piece too.
export function PuzzleStep({ pass, pauseTimer }: StepProps) {
	const [round, setRound] = useState(0);
	const [puzzle, setPuzzle] = useState(() => makePuzzle(1));
	const [values, setValues] = useState([0]); // each piece's slider
	const [solved, setSolved] = useState([false]); // each piece in its gap
	const [missed, setMissed] = useState(false); // the last slider let go in the wrong place
	const [moved, setMoved] = useState<number | null>(null); // the last slider moved, until placed
	// Unique ids for the SVG references and the hint, in case the step is ever shown twice.
	const id = useId();
	const skyId = `${id}sky`;
	const pieceId = `${id}piece`;
	const sceneId = `${id}scene`;
	const hintId = `${id}hint`;

	const roundSolved = solved.every(Boolean);

	// Leaves the pieces in place for a moment, then the next round or the next check.
	function nextRound() {
		if (round + 1 === ROUNDS) return pass();
		const count = round + 2;
		setRound(round + 1);
		setPuzzle(makePuzzle(count));
		setValues(Array(count).fill(0));
		setSolved(Array(count).fill(false));
		setMissed(false);
		setMoved(null);
	}

	useTimeout(nextRound, roundSolved ? ROUND_PAUSE_MS : null);

	// A slider that rests for a moment places its piece if it's close enough, and says
	// nothing if it isn't. Screen readers on phones move sliders with swipes, without a
	// pointer to let go or an Enter key, so this is how they place a piece. Anyone else
	// can leave a slider halfway to look at the picture: nothing happens.
	// Every move changes `values`, which starts the wait over.
	function settle() {
		if (moved !== null && fits(moved)) place(moved);
	}

	useTimeout(settle, moved === null ? null : REST_MS, values);

	function move(index: number, value: number) {
		setValues(values.map((each, i) => (i === index ? value : each)));
		setMissed(false);
		setMoved(index);
	}

	function fits(index: number): boolean {
		const { fit } = puzzle.pieces[index];
		return !solved[index] && Math.abs(values[index] - fit) <= TOLERANCE;
	}

	// Puts the piece in its gap and its slider on the exact spot.
	function place(index: number) {
		const { fit } = puzzle.pieces[index];
		const nowSolved = solved.map((each, i) => each || i === index);
		// The last piece of the last round: the visitor is done, so the countdown
		// shouldn't run out while they see the finished picture.
		if (round + 1 === ROUNDS && nowSolved.every(Boolean)) pauseTimer();
		setValues(values.map((each, i) => (i === index ? fit : each)));
		setSolved(nowSolved);
		setMoved(null);
	}

	// Checked when a slider is let go (or Enter is pressed). Close enough puts the piece
	// in place; anywhere else just asks the visitor to try again.
	function check(index: number) {
		if (solved[index] || values[index] === 0) return;
		if (fits(index)) place(index);
		else setMissed(true);
	}

	function hint() {
		if (roundSolved) {
			return (
				<span className={styles.success}>
					<Check size={16} aria-hidden="true" />{" "}
					{puzzle.pieces.length === 1
						? "Piece in place"
						: "Pieces in place"}
				</span>
			);
		}
		if (missed)
			return (
				<span className={styles.missed}>Not quite. Keep sliding.</span>
			);
		return "Using a keyboard? Move with the arrow keys, then press Enter.";
	}

	const many = puzzle.pieces.length > 1;

	return (
		<>
			<p className={shared.instruction}>
				{many
					? "Drag each slider until its piece fits its gap."
					: "Drag the slider until the piece fits the gap."}
			</p>

			<svg
				className={styles.picture}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role="img"
				aria-label={
					many
						? `A landscape with ${puzzle.pieces.length} missing puzzle pieces`
						: "A landscape with a missing puzzle piece"
				}
			>
				<defs>
					<linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={puzzle.sky[0]} />
						<stop offset="1" stopColor={puzzle.sky[1]} />
					</linearGradient>
					<clipPath id={pieceId}>
						<path d={PIECE} />
					</clipPath>
					<g id={sceneId}>
						<rect
							width={WIDTH}
							height={HEIGHT}
							fill={`url(#${skyId})`}
						/>
						<circle
							cx={puzzle.sun.x}
							cy={puzzle.sun.y}
							r={puzzle.sun.r}
							fill="#fff7d6"
						/>
						{puzzle.hills.map((hill) => (
							<path
								key={hill.path}
								d={hill.path}
								fill={hill.color}
							/>
						))}
					</g>
				</defs>

				<use href={`#${sceneId}`} />

				{puzzle.pieces.map((piece, index) => {
					const gap = gapOf(piece);
					return (
						<path
							key={`gap-${index}`}
							className={styles.gap}
							d={PIECE}
							style={{ stroke: PIECE_COLORS[index] }}
							transform={`translate(${gap.x} ${gap.y})`}
						/>
					);
				})}

				{/* Each piece shows the part of the picture that belongs in its gap. */}
				{puzzle.pieces.map((piece, index) => {
					const t = values[index] / SLIDER_MAX;
					const at = pointAt(piece, t);
					const angle =
						piece.turns * 360 * (t - piece.fit / SLIDER_MAX);
					const gap = gapOf(piece);
					return (
						<g
							key={`piece-${index}`}
							transform={`translate(${at.x} ${at.y}) rotate(${angle})`}
						>
							<g clipPath={`url(#${pieceId})`}>
								<use
									href={`#${sceneId}`}
									x={-gap.x}
									y={-gap.y}
								/>
							</g>
							{/* Its color is inline, since CSS beats SVG attributes;
							    once in place, the edgeSolved class turns it green. */}
							<path
								className={
									solved[index]
										? `${styles.edge} ${styles.edgeSolved}`
										: styles.edge
								}
								d={PIECE}
								style={
									solved[index]
										? undefined
										: { stroke: PIECE_COLORS[index] }
								}
							/>
						</g>
					);
				})}
			</svg>

			{puzzle.pieces.map((_, index) => (
				<input
					// A fresh slider for every round.
					key={`${round}-${index}`}
					className={styles.slider}
					style={{ "--piece": PIECE_COLORS[index] } as CSSProperties}
					type="range"
					min={0}
					max={SLIDER_MAX}
					value={values[index]}
					disabled={solved[index]}
					aria-label={
						many
							? `Slider for the ${PIECE_NAMES[index]} piece`
							: "Puzzle slider"
					}
					aria-describedby={hintId}
					onChange={(event) =>
						move(index, Number(event.target.value))
					}
					onPointerUp={() => check(index)}
					onKeyDown={(event) => event.key === "Enter" && check(index)}
				/>
			))}

			<p className={styles.hint} id={hintId} aria-live="polite">
				{hint()}
			</p>
			<p className={shared.counter}>
				Puzzle {round + 1} of {ROUNDS}
			</p>
		</>
	);
}
