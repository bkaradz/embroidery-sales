import ArrowDown from "svelte-radix/ArrowDown.svelte";
import ArrowRight from "svelte-radix/ArrowRight.svelte";
import ArrowUp from "svelte-radix/ArrowUp.svelte";
import Circle from "svelte-radix/Circle.svelte";
import QuestionMarkCircled from "svelte-radix/QuestionMarkCircled.svelte";
import Stopwatch from "svelte-radix/Stopwatch.svelte";

// 'Pending', 'Expired', 'On Hold'
export const statuses = [
	{
		value: "Pending",
		label: "Pending",
		icon: QuestionMarkCircled,
	},
	{
		value: "Expired",
		label: "Expired",
		icon: Circle,
	},
	{
		value: "On Hold",
		label: "On Hold",
		icon: Stopwatch,
	},
];

export type Statuses = typeof statuses

export const priorities = [
	{
		label: "Low",
		value: "low",
		icon: ArrowDown,
	},
	{
		label: "Medium",
		value: "medium",
		icon: ArrowRight,
	},
	{
		label: "High",
		value: "high",
		icon: ArrowUp,
	},
];

export const labels = [
	{
		value: "bug",
		label: "Bug",
	},
	{
		value: "feature",
		label: "Feature",
	},
	{
		value: "documentation",
		label: "Documentation",
	},
];