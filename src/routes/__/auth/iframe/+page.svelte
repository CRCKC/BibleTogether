<!-- <script lang="ts">
    import iframe from '$lib/firebase/helper/iframe?raw'
</script>

{@html iframe} -->

<svelte:head>
    <meta name=viewport content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <script type="text/javascript" src="iframe.js"></script>
    <script type="text/javascript" nonce="firebase-auth-helper">
    fireauth.iframe.AuthRelay.initialize();
    </script>
</svelte:head>

Hello, world! This is an iframe.