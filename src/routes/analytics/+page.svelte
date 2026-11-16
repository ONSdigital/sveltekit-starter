<script>
	import {
		AnalyticsBanner,
		analyticsEvent,
		Header,
		Breadcrumb,
		Hero,
		Main,
		Section,
		Select,
		Button,
		Footer
	} from "@onsvisual/svelte-components";
	import { pageUrl } from "$lib/paths.js";
	import { analyticsId, analyticsProps, regions } from "$lib/config.js";

	// true once the user accepts usage cookies in the banner
	let usageCookies = $state(false);

	// The events sent from this page, listed below so you can see what's sent
	/** @type {Record<string, unknown>[]} */
	let events = $state([]);

	/**
	 * Send an event to Google Tag Manager. analyticsEvent() only sends it if analytics has started,
	 * which needs the user to have accepted usage cookies.
	 * @param {Record<string, unknown>} event
	 */
	function track(event) {
		analyticsEvent(event);
		events = [...events, event];
	}

	const options = regions.map((region) => ({ id: region.cd, label: region.nm }));
	let selected = $state(null);

	// For testing: forget this browser's cookie choice for this site, so the banner shows again. The
	// banner stores the choice in two cookies, for the site's hostname.
	function resetCookieChoice() {
		for (const name of ["ons_cookie_message_displayed", "ons_cookie_policy"])
			document.cookie = `${name}=;max-age=0;domain=${location.hostname};path=/;`;
		location.reload();
	}

	/** @param {{ id: string; label: string } | null} option the chosen option */
	function trackSelection(option) {
		track({ event: "interaction", interactionType: "select", interactionValue: option?.label });
	}
</script>

<!-- In an app, put AnalyticsBanner once in src/routes/+layout.svelte instead (see below) -->
<AnalyticsBanner {analyticsId} {analyticsProps} bind:usageCookies />
<Header />
<Breadcrumb
	links={[{ label: "Home", href: pageUrl("/") }]}
	background="var(--ons-color-banner-bg)"
/>
<Main>
	<Hero
		title="Page analytics"
		lede="An example of the ONS cookie banner, and of recording how people use a page."
		theme="grey"
	/>

	<Section title="The cookie banner" marginTop={true}>
		<p>
			The <code>AnalyticsBanner</code> component shows the ONS cookie banner at the top of the page,
			until the user accepts or rejects additional cookies. Only if they accept does it start Google
			Tag Manager, with the <code>analyticsId</code> and
			<code>analyticsProps</code> set in <code>src/lib/config.js</code>. It also records a page view
			each time the user moves to another page in the app.
		</p>
		<p>
			So put it once, in <code>src/routes/+layout.svelte</code> before the
			<code>{"{@render children()}"}</code>, rather than on each page. This page has its own, as an
			example.
		</p>
		<p>
			Usage cookies on this site: <strong>{usageCookies ? "accepted" : "not accepted"}</strong>. The
			banner only shows until you make a choice, which is stored in cookies for the site.
		</p>
		<Button variant="secondary" small onClick={resetCookieChoice}
			>Show the cookie banner again</Button
		>
		<p class="ons-u-mt-l">
			The <code>analyticsProps</code> describe the product. Fill them in for each app:
		</p>
		<pre class="config"><code>analyticsProps = {JSON.stringify(analyticsProps, null, 2)}</code
			></pre>
	</Section>

	<Section title="Recording interactions">
		<p>
			To record how people use the page, call <code>analyticsEvent()</code> with an event object, for
			example when someone chooses an option or presses a button. The events are only sent if the user
			has accepted usage cookies.
		</p>
		<Select
			id="region"
			label="Choose a region"
			{options}
			bind:value={selected}
			onChange={trackSelection}
		/>
		<Button
			cls="ons-u-mt-m"
			variant="secondary"
			small={true}
			onClick={() =>
				track({ event: "interaction", interactionType: "button", interactionValue: "example" })}
			>Record a button press</Button
		>

		{#if events.length}
			<p class="ons-u-mt-l">Events recorded on this page:</p>
			<ol>
				{#each events as event, i (i)}
					<li><code>{JSON.stringify(event)}</code></li>
				{/each}
			</ol>
		{/if}
	</Section>
</Main>
<Footer compact />

<style>
	/* Inline code, styled as on the ONS website (the analyticsProps block below is excluded) */
	:not(pre) > code {
		background: var(--ons-color-grey-5);
		color: var(--ons-color-ruby-red);
		padding: 0.05rem 0.25rem;
	}

	.config {
		background: var(--ons-color-grey-5);
		padding: 12px 16px;
		overflow-x: auto;
	}
</style>
