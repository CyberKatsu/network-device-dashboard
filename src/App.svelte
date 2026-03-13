<script>
  import { onMount, onDestroy } from 'svelte'
  import { startTelemetry, stopTelemetry } from '$lib/stores/telemetry.js'

  import Sidebar       from '$lib/components/layout/Sidebar.svelte'
  import Header        from '$lib/components/layout/Header.svelte'
  import Dashboard     from './routes/Dashboard.svelte'
  import Ports         from './routes/Ports.svelte'
  import Configuration from './routes/Configuration.svelte'
  import Alarms        from './routes/Alarms.svelte'

  let currentRoute  = 'dashboard'
  let sidebarCollapsed = false

  // Start the telemetry worker when the app mounts
  onMount(() => {
    startTelemetry()
  })

  onDestroy(() => {
    stopTelemetry()
  })
</script>

<!--
  Root layout:
  ┌──────────────────────────────┐
  │  Sidebar  │  Header          │
  │           ├──────────────────│
  │           │  Route content   │
  └──────────────────────────────┘
-->
<div class="flex h-screen overflow-hidden bg-surface-900">

  <!-- Sidebar -->
  <Sidebar bind:currentRoute bind:collapsed={sidebarCollapsed} />

  <!-- Main content area -->
  <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

    <!-- Header -->
    <Header bind:currentRoute />

    <!-- Scrollable route content -->
    <main class="flex-1 overflow-y-auto">
      {#if currentRoute === 'dashboard'}
        <Dashboard />
      {:else if currentRoute === 'ports'}
        <Ports />
      {:else if currentRoute === 'configuration'}
        <Configuration />
      {:else if currentRoute === 'alarms'}
        <Alarms />
      {/if}
    </main>

  </div>
</div>
