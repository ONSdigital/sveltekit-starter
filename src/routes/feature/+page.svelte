<script>
  import {
    Header,
    Hero,
    Highlight,
    Section,
    Grid,
    GridCell,
    Container,
    Divider,
    Main,
    Blockquote,
    Em,
    Scroller,
    ScrollerSection,
    Footer,
  } from "@onsvisual/svelte-components";

  const scrollerColors = ["#ddd", "#777", "#222"];
  let scrollerColor = scrollerColors[0];
</script>

<Header compact />
	<Main>
		<Hero
			theme="blue"
			title="This is an article title"
			lede="This is a short, introductory sentence"
			height={400}
		>
			1 January 2025
		</Hero>

		<Highlight height={400} marginBottom={false}>
			<p>This is a test paragraph.</p>
			<p>This is another test paragraph.</p>
		</Highlight>

		<Section title="Section title" marginTop={true}>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
				voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
				cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
			<Blockquote attribution="A. Person"
				>This is a blockquote, white comprises of a large block of inset text.</Blockquote
			>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
				voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
				cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		</Section>

		<Grid colWidth="medium" caption="This is a caption text">
			<GridCell><div class="placeholder"></div></GridCell>
			<GridCell><div class="placeholder"></div></GridCell>
			<GridCell><div class="placeholder"></div></GridCell>
		</Grid>

		<Divider width="narrow" />

		<Section title="Another section title">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
				voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
				cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		</Section>

		<Scroller
			id="scroller"
			splitscreen
			on:change={(e) => {
				scrollerColor = scrollerColors[e.detail.index];
				console.debug("change", e);
			}}
			on:enter={(e) => console.debug("enter", e)}
			on:exit={(e) => console.debug("exit", e)}
		>
			<div slot="background">
				<Container width="full" height="full" background={scrollerColor} />
			</div>
			<div slot="foreground">
				<ScrollerSection>
					<p>
						When this first caption is visible, the background will appear <Em
							color={scrollerColors[0]}>light grey</Em
						>.
					</p>
				</ScrollerSection>
				<ScrollerSection>
					<p>
						When this section caption is visible, the background will appear <Em
							color={scrollerColors[1]}>dark grey</Em
						>.
					</p>
				</ScrollerSection>
				<ScrollerSection>
					<p>
						When this third caption is visible, the background will appear <Em
							color={scrollerColors[2]}>black</Em
						>.
					</p>
				</ScrollerSection>
			</div>
		</Scroller>

		<Section title="Yet another section title">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
				voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
				cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		</Section>
	</Main>
<Footer compact />

<style>
  .placeholder {
		background: var(--ons-color-grey-10);
		padding: 12px;
		height: 200px;
	}
</style>