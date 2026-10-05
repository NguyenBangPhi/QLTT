// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Props optional khai báo bằng TypeScript đã ngầm định mặc định là undefined,
    // ép khai báo withDefaults chỉ để thoả rule sẽ thêm code thừa.
    'vue/require-default-prop': 'off',
  },
})
