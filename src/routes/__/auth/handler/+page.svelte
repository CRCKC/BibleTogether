<!-- <script lang="ts">
    import handler from '$lib/firebase/helper/handler?raw'
</script>

{@html handler} -->

<svelte:head>
    <meta name=viewport content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <script type="text/javascript" src="experiments.js"></script>
    <script type="text/javascript" src="handler.js"></script>
    <script type="text/javascript" nonce="firebase-auth-helper">
    var POST_BODY = '{{POST_BODY}}';
    fireauth.oauthhelper.widget.initialize();
    </script>
</svelte:head>