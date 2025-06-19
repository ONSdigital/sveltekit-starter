<script>
  import {
    Header,
    Breadcrumb,
    Hero,
    Theme,
    Main,
    Section,
    Grid,
    Blockquote,
    Footer,
  } from "@onsvisual/svelte-components";
  import { BarChart } from "@onsvisual/svelte-charts";

  const data = [
    { year: 2017, value: 320 },
    { year: 2018, value: 640 },
    { year: 2019, value: 1600 },
    { year: 2020, value: 3840 },
  ];
</script>

<Header />
<Breadcrumb
  links="{[
    { label: 'Home', href: '/' },
    { label: 'This is a regular article' },
  ]}"
  background="var(--ons-color-banner-bg)"`/>
<Main>
  <Hero title="Regular article" theme="grey" meta={[{key: "Released", value: "1 January 2025"}]}/>

  <Section title="Section title" marginTop="{true}">
     <p class="ons-u-mb-xl">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <BarChart
      {data}
      xKey="value"
      yKey="year"
      title="Bar chart example"
      subtitle="This is a subtitle"
      footer="Source: Office for National Statistics" />
    <p>
      Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <Blockquote attribution="A. Person"
      >This is a blockquote, white comprises of a large block of inset text.</Blockquote
    >
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
  </Section>

  <Grid width="medium" caption="This is a caption text">
    <div class="placeholder"></div>
  </Grid>

  <Section title="Another section title">
    <p>
      Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
  </Section>

  <Section title="Yet another section title">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p>
      Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
  </Section>
</Main>
<Footer theme="dark" />

<style>
  :global(.chart-footer) {
    margin: 0 0 2rem !important;
  }
</style>