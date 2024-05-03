<script>
  import { base } from "$app/paths";
  import {
    Header,
    Section,
    Cards,
    Card,
    Footer,
  } from "@onsvisual/svelte-components";
</script>

<Header compact title="Svelte Kit starter templates" />

<Section marginTop="{true}">
  <p>
    Select a template below to preview. These templates are created using the <a href="https://github.com/ONSvisual/svelte-components/">ONS svelte-components library</a>. To use them in Svelte Kit projects, follow the <a href="https://github.com/ONSvisual/sveltekit-starter/">guidance in this readme</a>.
  </p>
</Section>

<Cards>
  <Card title="Regular article" href="{base}/article">
    An article page in a style that matches the ONS website.
  </Card>
  <Card title="Feature article" href="{base}/feature">
    A full page template for scrollytelling or media-rich articles.
  </Card>
  <Card title="Embedded interactive" href="{base}/embed">
    A template for interactive content to be embedded within an iframe.
  </Card>
</Cards>

<Section>
  <p>
    For more documentation and usage examples for the ONS svelte-components library, you can visit the <a href="https://onsvisual.github.io/svelte-components/">Storybook pages</a>.
  </p>
</Section>

<Footer compact />