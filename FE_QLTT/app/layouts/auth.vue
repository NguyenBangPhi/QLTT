<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
    <div
      class="pointer-events-none absolute -top-40 -right-32 size-[32rem] rounded-full bg-primary/10 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-40 -left-32 size-[32rem] rounded-full bg-accent/40 blur-3xl"
      aria-hidden="true"
    />
    <div class="relative w-full max-w-sm">
      <slot />
    </div>
  </div>
</template>
