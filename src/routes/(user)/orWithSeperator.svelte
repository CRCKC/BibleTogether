<script>
	import { t } from 'svelte-i18n';
</script>

<!-- an ----------------Or With------------ seperator for login button and google login -->
<div class="relative py-4 w-80">
	<div class="absolute inset-0 flex items-center">
		<div class="w-full border border-t border-white"></div>
	</div>
	<div class="relative flex justify-center text-sm">
		<span class="px-2 text-sm text-white bg-black text-foreground">{$t('orWith')}</span>
	</div>
</div>
