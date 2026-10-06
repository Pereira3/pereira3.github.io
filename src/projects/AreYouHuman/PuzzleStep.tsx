import { useEffect, useEffectEvent, useId, useState } from "react";
import { Check } from "lucide-react";
import type { StepProps } from "@/projects/AreYouHuman/steps";
import { randomBetween, randomInt } from "@/projects/AreYouHuman/random";
import styles from "@/projects/AreYouHuman/PuzzleStep.module.css";

const WIDTH = 320;
const HEIGHT = 180;
const SLIDER_MAX = 1000;
const TOLERANCE = 20; // how close to the right spot counts as a fit, in slider steps

// Outline of the piece, centred on 0,0: a square with a knob on top and one on the right.
const PIECE =
	"M -18 -18 H -6 a 6 6 0 1 1 12 0 H 18 V -6 a 6 6 0 1 1 0 12 V 18 H -18 Z";

type Point = { x: number; y: number };

type Hill = { path: string; color: string };

type Puzzle = {
	start: Point;
	control: Point;
	end: Point;
	wobble: number; // how far the piece swings sideways from its curve, in pixels
	waves: number; // how many times it swings over the whole slider
	turns: number; // how many full turns it spins over the whole slider
	fit: number; // the slider value where the piece fits the gap
	sky: [string, string];
	sun: Point & { r: number };
	hills: Hill[];
};

// Where the piece is at slider position t (0 to 1): along a curve from bottom left
// to top right, swinging sideways as it goes.
function pointAt(p: Puzzle, t: number): Point {
	const u = 1 - t;
	const x = u * u * p.start.x + 2 * u * t * p.control.x + t * t * p.end.x;
	const y = u * u * p.start.y + 2 * u * t * p.control.y + t * t * p.end.y;
	const dx = p.end.x - p.start.x;
	const dy = p.end.y - p.start.y;
	const length = Math.hypot(dx, dy);
	const swing = p.wobble * Math.sin(t * Math.PI * 2 * p.waves);
	return { x: x + (-dy / length) * swing, y: y + (dx / length) * swing };
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

// A new random picture and path on every attempt. The fit is placed where the
// whole piece stays inside the picture.
function makePuzzle(): Puzzle {
	const hue = randomInt(0, 359);
	for (;;) {
		const puzzle: Puzzle = {
			start: { x: 24, y: randomBetween(130, 160) },
			control: { x: randomBetween(80, 240), y: randomBetween(-40, 200) },
			end: { x: 300, y: randomBetween(20, 60) },
			wobble: randomBetween(10, 22),
			waves: randomBetween(1.5, 3),
			turns: randomBetween(1.5, 2.5) * (Math.random() < 0.5 ? -1 : 1),
			fit: randomInt(450, 850),
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
		};
		const fit = pointAt(puzzle, puzzle.fit / SLIDER_MAX);
		if (
			fit.x > 32 &&
			fit.x < WIDTH - 32 &&
			fit.y > 32 &&
			fit.y < HEIGHT - 32
		)
			return puzzle;
	}
}

// Slide the missing piece into its gap. The piece doesn't move in a straight line:
// it curves, swings and spins, and only sits upright when it reaches the right spot.
// Letting go in the wrong place doesn't fail: the visitor keeps trying until the time runs out.
export function PuzzleStep({ pass, pauseTimer }: StepProps) {
	const [puzzle] = useState(makePuzzle);
	const [value, setValue] = useState(0);
	const [solved, setSolved] = useState(false);
	const [missed, setMissed] = useState(false);
	const onSolved = useEffectEvent(pass);
	// Unique ids for the SVG references and the hint, in case the step is ever shown twice.
	const id = useId();
	const skyId = `${id}sky`;
	const pieceId = `${id}piece`;
	const sceneId = `${id}scene`;
	const hintId = `${id}hint`;

	// Leaves the piece in place for a moment before moving on to the next check.
	useEffect(() => {
		if (!solved) return;
		const timer = window.setTimeout(onSolved, 600);
		return () => window.clearTimeout(timer);
	}, [solved]);

	const t = value / SLIDER_MAX;
	const piece = pointAt(puzzle, t);
	const angle = puzzle.turns * 360 * (t - puzzle.fit / SLIDER_MAX);
	const gap = pointAt(puzzle, puzzle.fit / SLIDER_MAX);

	// Checked when the slider is let go (or Enter is pressed). Close enough passes;
	// anywhere else just asks the visitor to try again.
	function check() {
		if (solved || value === 0) return;
		if (Math.abs(value - puzzle.fit) <= TOLERANCE) {
			pauseTimer();
			setValue(puzzle.fit);
			setSolved(true);
		} else {
			setMissed(true);
		}
	}

	function hint() {
		if (solved) {
			return (
				<span className={styles.success}>
					<Check size={16} aria-hidden="true" /> Piece in place
				</span>
			);
		}
		if (missed)
			return (
				<span className={styles.missed}>Not quite. Keep sliding.</span>
			);
		return "Using a keyboard? Move with the arrow keys, then press Enter.";
	}

	return (
		<>
			<p className={styles.instruction}>
				Drag the slider until the piece fits the gap.
			</p>

			<svg
				className={styles.picture}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				role="img"
				aria-label="A landscape with a missing puzzle piece"
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
				<path
					className={styles.gap}
					d={PIECE}
					transform={`translate(${gap.x} ${gap.y})`}
				/>

				{/* The piece shows the part of the picture that belongs in the gap. */}
				<g
					transform={`translate(${piece.x} ${piece.y}) rotate(${angle})`}
				>
					<g clipPath={`url(#${pieceId})`}>
						<use href={`#${sceneId}`} x={-gap.x} y={-gap.y} />
					</g>
					<path
						className={
							solved
								? `${styles.edge} ${styles.edgeSolved}`
								: styles.edge
						}
						d={PIECE}
					/>
				</g>
			</svg>

			<input
				className={styles.slider}
				type="range"
				min={0}
				max={SLIDER_MAX}
				value={value}
				disabled={solved}
				aria-label="Puzzle slider"
				aria-describedby={hintId}
				onChange={(event) => {
					setValue(Number(event.target.value));
					setMissed(false);
				}}
				onPointerUp={check}
				onKeyDown={(event) => event.key === "Enter" && check()}
			/>
			<p className={styles.hint} id={hintId} aria-live="polite">
				{hint()}
			</p>
		</>
	);
}
