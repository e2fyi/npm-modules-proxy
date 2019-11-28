# @e2fyi/npm-modules-proxy

`@e2fyi/npm-modules-proxy` is a nodejs app to proxy es6 modules from [jsdelivr](https://www.jsdelivr.com/) cdn, so that you can load es6 modules natively in the browser (e.g. inside jsfiddle). The proxy will automatically handles the `imports` inside the package to load from the proxy (instead of npm).

```html
<!-- loads webcomponent @material/mwc-button from jsdelivr -->
<script type="module" src="https://npm.e2.fyi/@material/mwc-button"></script>

<!-- use the component -->
<mwc-button label="standard"></mwc-button>
```

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)
