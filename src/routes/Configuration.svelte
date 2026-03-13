<script>
  import { workingConfig, savedConfig, isDirty, saveConfig, discardChanges } from '$lib/stores/device.js'

  let saving  = false
  let toast   = null  // { type: 'success'|'error', message: string }
  let errors  = {}

  // ─── Validation ────────────────────────────────────────────────────────────

  function validate(cfg) {
    const e = {}

    if (!cfg.hostname || !/^[a-z0-9-]{1,63}$/.test(cfg.hostname))
      e.hostname = 'Must be lowercase alphanumeric with hyphens, max 63 chars'

    if (!cfg.snmpCommunity || cfg.snmpCommunity.length < 4)
      e.snmpCommunity = 'Minimum 4 characters'

    if (cfg.snmpTrapHost && !/^(\d{1,3}\.){3}\d{1,3}$/.test(cfg.snmpTrapHost))
      e.snmpTrapHost = 'Must be a valid IPv4 address'

    if (cfg.syslogHost && !/^(\d{1,3}\.){3}\d{1,3}$/.test(cfg.syslogHost))
      e.syslogHost = 'Must be a valid IPv4 address'

    const vlan = Number(cfg.managementVlan)
    if (!vlan || vlan < 1 || vlan > 4094)
      e.managementVlan = 'VLAN ID must be 1–4094'

    const svlan = Number(cfg.defaultServiceVlan)
    if (!svlan || svlan < 1 || svlan > 4094)
      e.defaultServiceVlan = 'VLAN ID must be 1–4094'

    if (Number(cfg.maxMulticastGroups) > 1024)
      e.maxMulticastGroups = 'Maximum 1024 groups'

    return e
  }

  // Validate on every change
  $: errors = validate($workingConfig)
  $: hasErrors = Object.keys(errors).length > 0

  // ─── Actions ───────────────────────────────────────────────────────────────

  async function handleSave() {
    if (hasErrors) return
    saving = true
    toast  = null

    try {
      await saveConfig()
      toast = { type: 'success', message: 'Configuration saved successfully.' }
    } catch {
      toast = { type: 'error', message: 'Save failed. Check device connectivity.' }
    } finally {
      saving = false
      setTimeout(() => toast = null, 4000)
    }
  }

  function handleDiscard() {
    discardChanges()
    errors = {}
    toast  = null
  }

  // Helper for two-way binding on store (Svelte stores aren't directly two-way bindable on properties)
  function field(key) {
    return {
      value:  $workingConfig[key],
      oninput: (e) => workingConfig.update(c => ({ ...c, [key]: e.target.value })),
    }
  }
</script>

<!-- Unsaved changes guard banner -->
{#if $isDirty}
  <div class="sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5
              bg-status-ranging/10 border-b border-status-ranging/30 text-sm animate-slide-in">
    <svg class="w-4 h-4 text-status-ranging flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
    <span class="text-status-ranging font-medium">Unsaved changes</span>
    <span class="text-gray-400 text-xs flex-1">Changes will not be applied until saved.</span>
    <button class="btn-primary text-xs" on:click={handleSave} disabled={hasErrors || saving}>
      {saving ? 'Saving…' : 'Save Now'}
    </button>
    <button class="btn-ghost text-xs" on:click={handleDiscard}>Discard</button>
  </div>
{/if}

<div class="p-4 space-y-4 animate-fade-in">

  <!-- Toast -->
  {#if toast}
    <div class="panel px-4 py-3 flex items-center gap-3 animate-slide-in"
         class:border-status-up={toast.type === 'success'}
         class:border-status-down={toast.type === 'error'}>
      <span class:text-status-up={toast.type === 'success'} class:text-status-down={toast.type === 'error'}>
        {toast.type === 'success' ? '✓' : '✗'}
      </span>
      <p class="text-sm font-mono text-gray-200">{toast.message}</p>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSave} class="space-y-4">

    <!-- ── Management ─────────────────────────────────────────────────────── -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500">
        <p class="text-sm font-medium text-gray-200">Management</p>
        <p class="text-2xs font-mono text-gray-500">Device identity and remote management endpoints</p>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label class="section-label block mb-1.5">Hostname</label>
          <input class="field" class:border-status-down={errors.hostname}
                 value={$workingConfig.hostname}
                 on:input={e => workingConfig.update(c => ({ ...c, hostname: e.target.value }))} />
          {#if errors.hostname}<p class="text-2xs text-status-down mt-1 font-mono">{errors.hostname}</p>{/if}
        </div>

        <div>
          <label class="section-label block mb-1.5">SNMP Community String</label>
          <input class="field" type="password" class:border-status-down={errors.snmpCommunity}
                 value={$workingConfig.snmpCommunity}
                 on:input={e => workingConfig.update(c => ({ ...c, snmpCommunity: e.target.value }))} />
          {#if errors.snmpCommunity}<p class="text-2xs text-status-down mt-1 font-mono">{errors.snmpCommunity}</p>{/if}
        </div>

        <div>
          <label class="section-label block mb-1.5">SNMP Trap Host</label>
          <input class="field" placeholder="10.0.0.50" class:border-status-down={errors.snmpTrapHost}
                 value={$workingConfig.snmpTrapHost}
                 on:input={e => workingConfig.update(c => ({ ...c, snmpTrapHost: e.target.value }))} />
          {#if errors.snmpTrapHost}<p class="text-2xs text-status-down mt-1 font-mono">{errors.snmpTrapHost}</p>{/if}
        </div>

        <div>
          <label class="section-label block mb-1.5">Syslog Host</label>
          <input class="field" placeholder="10.0.0.51" class:border-status-down={errors.syslogHost}
                 value={$workingConfig.syslogHost}
                 on:input={e => workingConfig.update(c => ({ ...c, syslogHost: e.target.value }))} />
          {#if errors.syslogHost}<p class="text-2xs text-status-down mt-1 font-mono">{errors.syslogHost}</p>{/if}
        </div>
      </div>
    </div>

    <!-- ── VLAN ───────────────────────────────────────────────────────────── -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500">
        <p class="text-sm font-medium text-gray-200">VLAN Configuration</p>
        <p class="text-2xs font-mono text-gray-500">IEEE 802.1Q VLAN assignments</p>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each [
          ['Management VLAN',      'managementVlan'],
          ['Default Service VLAN', 'defaultServiceVlan'],
          ['IGMP VLAN',            'igmpVlan'],
        ] as [label, key]}
          <div>
            <label class="section-label block mb-1.5">{label}</label>
            <input class="field" type="number" min="1" max="4094"
                   class:border-status-down={errors[key]}
                   value={$workingConfig[key]}
                   on:input={e => workingConfig.update(c => ({ ...c, [key]: e.target.value }))} />
            {#if errors[key]}<p class="text-2xs text-status-down mt-1 font-mono">{errors[key]}</p>{/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- ── Bandwidth Profiles ─────────────────────────────────────────────── -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500">
        <p class="text-sm font-medium text-gray-200">Bandwidth Profiles</p>
        <p class="text-2xs font-mono text-gray-500">Upstream / downstream rate limits (Mbps)</p>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each [
          ['Default Profile', 'defaultUsProfile'],
          ['Premium Profile', 'premiumUsProfile'],
        ] as [label, key]}
          <div>
            <label class="section-label block mb-1.5">{label}</label>
            <input class="field" placeholder="100/50"
                   value={$workingConfig[key]}
                   on:input={e => workingConfig.update(c => ({ ...c, [key]: e.target.value }))} />
            <p class="text-2xs font-mono text-gray-600 mt-1">Format: upstream/downstream</p>
          </div>
        {/each}
      </div>
    </div>

    <!-- ── IGMP ───────────────────────────────────────────────────────────── -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500">
        <p class="text-sm font-medium text-gray-200">IGMP / Multicast</p>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">

        <!-- Enable toggle -->
        <div class="flex items-start gap-3">
          <button type="button"
            class="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full
                   transition-colors duration-200 focus:outline-none mt-0.5"
            class:bg-cyan-DEFAULT={$workingConfig.igmpEnabled}
            class:bg-surface-500={!$workingConfig.igmpEnabled}
            on:click={() => workingConfig.update(c => ({ ...c, igmpEnabled: !c.igmpEnabled }))}>
            <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                  class:translate-x-4={$workingConfig.igmpEnabled}
                  class:translate-x-1={!$workingConfig.igmpEnabled}>
            </span>
          </button>
          <div>
            <p class="text-sm text-gray-200">IGMP Snooping</p>
            <p class="text-2xs font-mono text-gray-500">Multicast group management</p>
          </div>
        </div>

        <!-- Version -->
        <div>
          <label class="section-label block mb-1.5">IGMP Version</label>
          <select class="field"
                  value={$workingConfig.igmpVersion}
                  on:change={e => workingConfig.update(c => ({ ...c, igmpVersion: e.target.value }))}>
            <option>IGMPv2</option>
            <option>IGMPv3</option>
          </select>
        </div>

        <!-- Max groups -->
        <div>
          <label class="section-label block mb-1.5">Max Multicast Groups</label>
          <input class="field" type="number" min="1" max="1024"
                 class:border-status-down={errors.maxMulticastGroups}
                 value={$workingConfig.maxMulticastGroups}
                 on:input={e => workingConfig.update(c => ({ ...c, maxMulticastGroups: e.target.value }))} />
          {#if errors.maxMulticastGroups}<p class="text-2xs text-status-down mt-1 font-mono">{errors.maxMulticastGroups}</p>{/if}
        </div>
      </div>
    </div>

    <!-- ── ONU Provisioning ───────────────────────────────────────────────── -->
    <div class="panel p-4">
      <p class="text-sm font-medium text-gray-200 mb-3">ONU Provisioning</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each [
          ['autoProvision', 'Auto-provision ONUs', 'Automatically register new ONUs using default profile'],
          ['zerotouch',     'Zero-touch activation', 'Apply service profile on first registration without manual approval'],
        ] as [key, label, desc]}
          <div class="flex items-start gap-3">
            <button type="button"
              class="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full
                     transition-colors duration-200 mt-0.5"
              class:bg-cyan-DEFAULT={$workingConfig[key]}
              class:bg-surface-500={!$workingConfig[key]}
              on:click={() => workingConfig.update(c => ({ ...c, [key]: !c[key] }))}>
              <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                    class:translate-x-4={$workingConfig[key]}
                    class:translate-x-1={!$workingConfig[key]}>
              </span>
            </button>
            <div>
              <p class="text-sm text-gray-200">{label}</p>
              <p class="text-2xs font-mono text-gray-500">{desc}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- ── Action buttons ────────────────────────────────────────────────── -->
    <div class="flex items-center gap-3 justify-end">
      {#if hasErrors}
        <p class="text-xs font-mono text-status-down mr-auto">
          Fix {Object.keys(errors).length} validation error{Object.keys(errors).length > 1 ? 's' : ''} before saving
        </p>
      {/if}
      <button type="button" class="btn-ghost" on:click={handleDiscard} disabled={!$isDirty}>
        Discard Changes
      </button>
      <button type="submit" class="btn-primary" disabled={!$isDirty || hasErrors || saving}>
        {saving ? 'Saving…' : 'Save Configuration'}
      </button>
    </div>

  </form>
</div>
