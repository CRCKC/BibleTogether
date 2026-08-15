<script lang="ts">
	import { onMount } from 'svelte';
	import {
		DEFAULT_HIGHLIGHT_COLOR,
		HIGHLIGHT_PRESETS,
		MAX_SAVED_HIGHLIGHT_COLORS,
		hexToHsv,
		hsvToHex,
		normalizeHighlightColor,
		type HSV
	} from '$lib/bible/highlights';

	export interface HighlightPaletteLabels {
		title: string;
		custom: string;
		remove: string;
		apply: string;
		cancel: string;
		hex: string;
		hue: string;
		saturation: string;
		brightness: string;
		invalidHex: string;
		setDefault: string;
		savedColors: string;
		deleteCustom: string;
		saveCustom: string;
		chooseReplacement: string;
		replaceColor: (color: string) => string;
		preset: (id: string) => string;
	}

	interface Props {
		anchor: HTMLElement;
		initialColor: string;
		labels: HighlightPaletteLabels;
		defaultColor: string;
		savedColors: readonly string[];
		onApply: (color: string) => void;
		onSetDefault: (color: string) => void;
		onSaveCustom: (color: string, replaceIndex?: number) => void;
		onDeleteCustom: (color: string) => void;
		onRemove: () => void;
		onClose: () => void;
	}

	let {
		anchor,
		initialColor,
		labels,
		defaultColor,
		savedColors,
		onApply,
		onSetDefault,
		onSaveCustom,
		onDeleteCustom,
		onRemove,
		onClose
	}: Props = $props();
	let panel = $state<HTMLDivElement>();
	let custom = $state(false);
	let replaceMode = $state(false);
	let activeDrag = $state<{ picker: 'hue' | 'square'; pointerId: number } | null>(null);
	let hsv = $state<HSV>(hexToHsv(DEFAULT_HIGHLIGHT_COLOR));
	let draftColor = $state(DEFAULT_HIGHLIGHT_COLOR);
	let hexInput = $state(DEFAULT_HIGHLIGHT_COLOR);
	let hexValid = $derived(/^#[0-9a-f]{6}$/i.test(hexInput));

	function setHsv(next: HSV) {
		hsv = {
			h: Math.max(0, Math.min(360, next.h)),
			s: Math.max(0, Math.min(1, next.s)),
			v: Math.max(0, Math.min(1, next.v))
		};
		draftColor = hsvToHex(hsv);
		hexInput = draftColor;
	}

	function hueThumbPosition(hue: number) {
		const radians = (hue * Math.PI) / 180;
		return `left: calc(50% + ${Math.sin(radians) * 102}px); top: calc(50% - ${Math.cos(radians) * 102}px)`;
	}

	function updateHue(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const angle =
			(Math.atan2(
				event.clientY - (rect.top + rect.height / 2),
				event.clientX - (rect.left + rect.width / 2)
			) *
				180) /
				Math.PI +
			90;
		setHsv({ ...hsv, h: (angle + 360) % 360 });
	}

	function updateSquare(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		setHsv({
			...hsv,
			s: (event.clientX - rect.left) / rect.width,
			v: 1 - (event.clientY - rect.top) / rect.height
		});
	}

	function startDrag(event: PointerEvent, picker: 'hue' | 'square') {
		if (activeDrag) return;
		event.stopPropagation();
		activeDrag = { picker, pointerId: event.pointerId };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		if (picker === 'hue') updateHue(event);
		else updateSquare(event);
	}

	function moveDrag(event: PointerEvent, picker: 'hue' | 'square') {
		event.stopPropagation();
		if (!activeDrag || activeDrag.picker !== picker || activeDrag.pointerId !== event.pointerId)
			return;
		if (picker === 'hue') updateHue(event);
		else updateSquare(event);
	}

	function endDrag(event: PointerEvent, picker: 'hue' | 'square') {
		if (!activeDrag || activeDrag.picker !== picker || activeDrag.pointerId !== event.pointerId)
			return;
		activeDrag = null;
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
	}

	function onHexInput(event: Event) {
		hexInput = (event.currentTarget as HTMLInputElement).value;
		const normalized = /^#[0-9a-f]{6}$/i.test(hexInput) ? normalizeHighlightColor(hexInput) : null;
		if (normalized) {
			draftColor = normalized;
			hsv = hexToHsv(normalized);
		}
	}

	function onHueKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		setHsv({ ...hsv, h: hsv.h + (event.key === 'ArrowRight' ? 1 : -1) });
	}

	function onSquareKeydown(event: KeyboardEvent) {
		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
		event.preventDefault();
		const step = 0.02;
		setHsv({
			...hsv,
			s: hsv.s + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0),
			v: hsv.v + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0)
		});
	}

	function position() {
		if (!panel || !anchor.isConnected) return;
		const rect = anchor.getBoundingClientRect();
		const width = panel.offsetWidth || 280;
		const height = panel.offsetHeight || 360;
		const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
		const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
		panel.style.left = `${Math.max(8, Math.min(viewportWidth - width - 8, rect.left))}px`;
		panel.style.top = `${Math.max(8, Math.min(viewportHeight - height - 8, rect.bottom + 8))}px`;
	}

	onMount(() => {
		const startingColor = normalizeHighlightColor(initialColor) ?? DEFAULT_HIGHLIGHT_COLOR;
		hsv = hexToHsv(startingColor);
		draftColor = startingColor;
		hexInput = startingColor;
		const onOutside = (event: PointerEvent) => {
			if (panel && (!(event.target instanceof Node) || !panel.contains(event.target))) onClose();
		};
		const onEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
			}
		};
		window.addEventListener('pointerdown', onOutside);
		window.addEventListener('keydown', onEscape);
		window.addEventListener('resize', position);
		window.addEventListener('scroll', position, true);
		window.visualViewport?.addEventListener('resize', position);
		window.visualViewport?.addEventListener('scroll', position);
		const resizeObserver = new ResizeObserver(position);
		if (panel) resizeObserver.observe(panel);
		requestAnimationFrame(() => {
			position();
			panel?.querySelector<HTMLElement>('button, input, [tabindex="0"]')?.focus();
		});
		return () => {
			window.removeEventListener('pointerdown', onOutside);
			window.removeEventListener('keydown', onEscape);
			window.removeEventListener('resize', position);
			window.removeEventListener('scroll', position, true);
			window.visualViewport?.removeEventListener('resize', position);
			window.visualViewport?.removeEventListener('scroll', position);
			resizeObserver.disconnect();
		};
	});
</script>

<div bind:this={panel} class="highlight-palette" role="dialog" aria-label={labels.title}>
	<div class="palette-header">
		<strong>{labels.title}</strong>
		<span class="palette-preview" style={`--preview-color: ${draftColor}`} aria-hidden="true"
		></span>
	</div>

	{#if !custom}
		<div class="swatches" aria-label={labels.title}>
			{#each HIGHLIGHT_PRESETS as preset}
				<div class="color-option">
					<button
						type="button"
						class="color-swatch"
						class:selected={draftColor === preset.color}
						style={`--swatch-color: ${preset.color}`}
						aria-label={labels.preset(preset.id)}
						aria-pressed={draftColor === preset.color}
						onclick={() => onApply(preset.color)}
					>
						<span aria-hidden="true">{draftColor === preset.color ? '✓' : ''}</span>
					</button>
					<button
						type="button"
						class="default-toggle"
						class:selected={defaultColor === preset.color}
						aria-label={`${labels.setDefault}: ${labels.preset(preset.id)}`}
						aria-pressed={defaultColor === preset.color}
						onclick={() => onSetDefault(preset.color)}
						>{defaultColor === preset.color ? '✓' : '☆'}</button
					>
				</div>
			{/each}
		</div>
		{#if savedColors.length}
			<strong class="saved-heading">{labels.savedColors}</strong>
			<div class="saved-colors">
				{#each savedColors as color}
					<div class="saved-color-row">
						<button
							type="button"
							class="color-swatch"
							class:selected={draftColor === color}
							style={`--swatch-color: ${color}`}
							aria-label={color}
							aria-pressed={draftColor === color}
							onclick={() => onApply(color)}>{draftColor === color ? '✓' : ''}</button
						>
						<button
							type="button"
							class="default-toggle"
							class:selected={defaultColor === color}
							aria-label={`${labels.setDefault}: ${color}`}
							aria-pressed={defaultColor === color}
							onclick={() => onSetDefault(color)}>{defaultColor === color ? '✓' : '☆'}</button
						>
						<button
							type="button"
							class="delete-custom"
							aria-label={`${labels.deleteCustom}: ${color}`}
							onclick={() => onDeleteCustom(color)}>×</button
						>
					</div>
				{/each}
			</div>
		{/if}
		<button
			type="button"
			class="palette-action"
			onclick={() => {
				custom = true;
				replaceMode = false;
			}}>{labels.custom}</button
		>
		<button type="button" class="palette-action remove" onclick={onRemove}>{labels.remove}</button>
	{:else}
		<div
			class="hue-ring"
			role="slider"
			tabindex="0"
			aria-label={labels.hue}
			aria-valuemin="0"
			aria-valuemax="360"
			aria-valuenow={Math.round(hsv.h)}
			onpointerdown={(event) => startDrag(event, 'hue')}
			onpointermove={(event) => moveDrag(event, 'hue')}
			onpointerup={(event) => endDrag(event, 'hue')}
			onpointercancel={(event) => endDrag(event, 'hue')}
			onkeydown={onHueKeydown}
		>
			<span class="hue-thumb" style={hueThumbPosition(hsv.h)} aria-hidden="true"></span>
			<div
				class="sv-square"
				role="slider"
				tabindex="0"
				aria-label={labels.saturation}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={Math.round(hsv.s * 100)}
				style={`--hue-color: hsl(${hsv.h} 100% 50%)`}
				onpointerdown={(event) => startDrag(event, 'square')}
				onpointermove={(event) => moveDrag(event, 'square')}
				onpointerup={(event) => endDrag(event, 'square')}
				onpointercancel={(event) => endDrag(event, 'square')}
				onkeydown={onSquareKeydown}
			>
				<span
					class="picker-thumb"
					style={`left: ${hsv.s * 100}%; top: ${(1 - hsv.v) * 100}%`}
					aria-hidden="true"
				></span>
			</div>
		</div>
		<label class="range-label">
			<span>{labels.hue}</span>
			<input
				type="range"
				min="0"
				max="360"
				step="1"
				value={hsv.h}
				aria-label={labels.hue}
				oninput={(event) =>
					setHsv({ ...hsv, h: Number((event.currentTarget as HTMLInputElement).value) })}
			/>
		</label>
		<label class="range-label">
			<span>{labels.saturation}</span>
			<input
				type="range"
				min="0"
				max="100"
				step="1"
				value={hsv.s * 100}
				aria-label={labels.saturation}
				oninput={(event) =>
					setHsv({ ...hsv, s: Number((event.currentTarget as HTMLInputElement).value) / 100 })}
			/>
		</label>
		<label class="range-label">
			<span>{labels.brightness}</span>
			<input
				type="range"
				min="0"
				max="100"
				step="1"
				value={hsv.v * 100}
				aria-label={labels.brightness}
				oninput={(event) =>
					setHsv({ ...hsv, v: Number((event.currentTarget as HTMLInputElement).value) / 100 })}
			/>
		</label>
		<label class="hex-label">
			<span>{labels.hex}</span>
			<input
				value={hexInput}
				maxlength="7"
				spellcheck="false"
				aria-invalid={!hexValid}
				oninput={onHexInput}
			/>
		</label>
		{#if !hexValid}<p class="invalid-message">{labels.invalidHex}</p>{/if}
		{#if replaceMode}
			<p class="replace-heading">{labels.chooseReplacement}</p>
			<div class="replacement-list">
				{#each savedColors as color, index}
					<button
						type="button"
						class="palette-action"
						onclick={() => {
							onSaveCustom(normalizeHighlightColor(hexInput)!, index);
							replaceMode = false;
						}}
					>
						{labels.replaceColor(color)}
					</button>
				{/each}
			</div>
			<button type="button" class="palette-action" onclick={() => (replaceMode = false)}
				>{labels.cancel}</button
			>
		{:else}
			<div class="palette-footer">
				<button type="button" class="palette-action" onclick={onClose}>{labels.cancel}</button>
				<button
					type="button"
					class="palette-action apply"
					disabled={!hexValid}
					onclick={() => onApply(normalizeHighlightColor(hexInput)!)}>{labels.apply}</button
				>
				<button
					type="button"
					class="palette-action save"
					disabled={!hexValid}
					onclick={() => {
						const color = normalizeHighlightColor(hexInput)!;
						if (savedColors.length >= MAX_SAVED_HIGHLIGHT_COLORS && !savedColors.includes(color))
							replaceMode = true;
						else onSaveCustom(color);
					}}>{labels.saveCustom}</button
				>
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(.highlight-palette) {
		position: fixed;
		z-index: 50;
		box-sizing: border-box;
		width: min(280px, calc(100vw - 16px));
		max-height: calc(100vh - 16px);
		max-height: calc(100dvh - 16px);
		overflow-y: auto;
		padding: 12px;
		border: 1px solid rgb(205 213 224 / 35%);
		border-radius: 8px;
		background: #1e232b;
		color: #f5f7fa;
		font:
			14px/1.4 system-ui,
			sans-serif;
	}

	.palette-header,
	.palette-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.palette-header {
		margin-bottom: 10px;
	}

	.palette-preview,
	.color-swatch {
		background: var(--preview-color, var(--swatch-color));
	}

	.palette-preview {
		width: 20px;
		height: 20px;
		border: 2px solid #f5f7fa;
		border-radius: 50%;
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 10px;
	}

	.color-option,
	.saved-color-row {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	.saved-heading,
	.replace-heading {
		display: block;
		margin: 8px 0 4px;
	}

	.saved-colors,
	.replacement-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 8px;
	}

	.color-swatch {
		position: relative;
		min-width: 40px;
		height: 40px;
		border: 2px solid transparent;
		border-radius: 50%;
		color: #0a0d14;
		font-size: 18px;
		cursor: pointer;
	}

	.color-swatch.selected {
		border-color: #f5f7fa;
		outline: 2px solid #8896a6;
		outline-offset: 2px;
	}

	.default-toggle,
	.delete-custom {
		width: 24px;
		height: 24px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: #8896a6;
		cursor: pointer;
	}

	.default-toggle.selected {
		color: #facc15;
	}

	.default-toggle:hover,
	.default-toggle:focus-visible,
	.delete-custom:hover,
	.delete-custom:focus-visible {
		background: #2a313c;
		color: #f5f7fa;
	}

	.palette-action {
		width: 100%;
		min-height: 36px;
		margin-top: 6px;
		border: 1px solid rgb(205 213 224 / 45%);
		border-radius: 6px;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.palette-action:hover,
	.palette-action:focus-visible {
		background: #2a313c;
	}

	.palette-action.remove {
		color: #fca5a5;
	}

	.palette-action.apply {
		background: #f5f7fa;
		color: #0a0d14;
	}

	.palette-action:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.hue-ring {
		box-sizing: border-box;
		touch-action: none;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 220px;
		height: 220px;
		margin: 4px auto 12px;
		padding: 15px;
		border-radius: 50%;
	}

	.hue-ring::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
		mask: radial-gradient(farthest-side, transparent calc(100% - 15px), #000 calc(100% - 14px));
		-webkit-mask: radial-gradient(
			farthest-side,
			transparent calc(100% - 15px),
			#000 calc(100% - 14px)
		);
		pointer-events: none;
	}

	.hue-thumb {
		position: absolute;
		z-index: 2;
		width: 14px;
		height: 14px;
		border: 2px solid #f5f7fa;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 0 1px #0a0d14;
		pointer-events: none;
	}

	.sv-square {
		position: relative;
		z-index: 1;
		width: 60%;
		margin: auto;
		height: 60%;
		background:
			linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, var(--hue-color));
		cursor: crosshair;
	}

	.picker-thumb {
		position: absolute;
		width: 14px;
		height: 14px;
		border: 2px solid #f5f7fa;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 0 1px #0a0d14;
	}

	.range-label,
	.hex-label {
		display: grid;
		grid-template-columns: 82px 1fr;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
	}

	.hex-label input {
		min-width: 0;
		padding: 6px 8px;
		border: 1px solid rgb(205 213 224 / 45%);
		border-radius: 6px;
		background: #0a0d14;
		color: #f5f7fa;
		font: inherit;
	}

	.invalid-message {
		margin: 6px 0 0;
		color: #fca5a5;
	}

	.palette-footer {
		margin-top: 10px;
	}

	.palette-footer .palette-action {
		width: auto;
		min-width: 0;
		flex: 1;
		margin-top: 0;
		padding: 0 6px;
	}

	button:focus-visible,
	input:focus-visible,
	[role='slider']:focus-visible {
		outline: 2px solid #cdd5e0;
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.highlight-palette) * {
			transition: none !important;
		}
	}
</style>
