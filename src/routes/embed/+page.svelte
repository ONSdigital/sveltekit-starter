<script>
  import { Embed, Highlight, Select, Section, Grid } from "@onsvisual/svelte-components";
</script>

<Embed>
  <Highlight bigText={false} marginBottom={false}>
    <div style:padding="0 12px">
      <h2>This is a sub-headline</h2>
      <p>This is a description of the embedded interactive.</p>
      <Select label="Select your area" />
    </div>
  </Highlight>

  <Section title="Section title" marginTop={true}>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat..
    </p>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
  </Section>

  <Grid width="medium" caption="This is a caption text">
    <div class="placeholder"></div>
  </Grid>

  <Section title="Another section title">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    </p>
  </Section>

  <Section title="Yet another section title">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
  </Section>
</Embed>

<style>
  .placeholder {
		background: var(--ons-color-grey-10);
		padding: 12px;
		height: 300px;
    width: 100%;
	}
</style>