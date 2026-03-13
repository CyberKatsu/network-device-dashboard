<script lang="ts">
  import { workingConfig, savedConfig, isDirty, saveConfig, discardChanges } from '$lib/stores/device'

  let saving  = false
  let toast   = null

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

  $: errors   = validate($workingConfig)
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
    toast = null
  }

  function set(key, value) {
    workingConfig.update(c => ({ ...c, [key]: value }))
  }
</script>

<!-- Unsaved changes banner -->
{#if $isDirty}
  <div class="sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5
              bg-surface-800 border-b border-surface-500 text-sm animate-slide-in">
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
          <label for="cfg-hostname" class="section-label block mb-1.5">Hostname</label>
          <input id="cfg-hostname" class="field" class:border-status-down={errors.hostname}
                 value={$workingConfig.hostname}
                 on:input={e => set('hostname', e.target.value)} />
          {#if errors.hostname}<p class="text-2xs text-status-down mt-1 font-mono">{errors.hostname}</p>{/if}
        </div>

        <div>
          <label for="cfg-snmp-community" class="section-label block mb-1.5">SNMP Community String</label>
          <input id="cfg-snmp-community" class="field" type="password"
                 class:border-status-down={errors.snmpCommunity}
                 value={$workingConfig.snmpCommunity}
                 on:input={e => set('snmpCommunity', e.target.value)} />
          {#if errors.snmpCommunity}<p class="text-2xs text-status-down mt-1 font-mono">{errors.snmpCommunity}</p>{/if}
        </div>

        <div>
          <label for="cfg-snmp-trap" class="section-label block mb-1.5">SNMP Trap Host</label>
          <input id="cfg-snmp-trap" class="field" placeholder="10.0.0.50"
                 class:border-status-down={errors.snmpTrapHost}
                 value={$workingConfig.snmpTrapHost}
                 on:input={e => set('snmpTrapHost', e.target.value)} />
          {#if errors.snmpTrapHost}<p class="text-2xs text-status-down mt-1 font-mono">{errors.snmpTrapHost}</p>{/if}
        </div>

        <div>
          <label for="cfg-syslog" class="section-label block mb-1.5">Syslog Host</label>
          <input id="cfg-syslog" class="field" placeholder="10.0.0.51"
                 class:border-status-down={errors.syslogHost}
                 value={$workingConfig.syslogHost}
                 on:input={e => set('syslogHost', e.target.value)} />
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

        <div>
          <label for="cfg-mgmt-vlan" class="section-label block mb-1.5">Management VLAN</label>
          <input id="cfg-mgmt-vlan" class="field" type="number" min="1" max="4094"
                 class:border-status-down={errors.managementVlan}
                 value={$workingConfig.managementVlan}
                 on:input={e => set('managementVlan', e.target.value)} />
          {#if errors.managementVlan}<p class="text-2xs text-status-down mt-1 font-mono">{errors.managementVlan}</p>{/if}
        </div>

        <div>
          <label for="cfg-svc-vlan" class="section-label block mb-1.5">Default Service VLAN</label>
          <input id="cfg-svc-vlan" class="field" type="number" min="1" max="4094"
                 class:border-status-down={errors.defaultServiceVlan}
                 value={$workingConfig.defaultServiceVlan}
                 on:input={e => set('defaultServiceVlan', e.target.value)} />
          {#if errors.defaultServiceVlan}<p class="text-2xs text-status-down mt-1 font-mono">{errors.defaultServiceVlan}</p>{/if}
        </div>

        <div>
          <label for="cfg-igmp-vlan" class="section-label block mb-1.5">IGMP VLAN</label>
          <input id="cfg-igmp-vlan" class="field" type="number" min="1" max="4094"
                 value={$workingConfig.igmpVlan}
                 on:input={e => set('igmpVlan', e.target.value)} />
        </div>

      </div>
    </div>

    <!-- ── Bandwidth Profiles ─────────────────────────────────────────────── -->
    <div class="panel overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-500">
        <p class="text-sm font-medium text-gray-200">Bandwidth Profiles</p>
        <p class="text-2xs font-mono text-gray-500">Upstream / downstream rate limits (Mbps)</p>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label for="cfg-default-profile" class="section-label block mb-1.5">Default Profile</label>
          <input id="cfg-default-profile" class="field" placeholder="100/50"
                 value={$workingConfig.defaultUsProfile}
                 on:input={e => set('defaultUsProfile', e.target.value)} />
          <p class="text-2xs font-mono text-gray-600 mt-1">Format: upstream/downstream</p>
        </div>

        <div>
          <label for="cfg-premium-profile" class="section-label block mb-1.5">Premium Profile</label>
          <input id="cfg-premium-profile" class="field" placeholder="1000/500"
                 value={$workingConfig.premiumUsProfile}
                 on:input={e => set('premiumUsProfile', e.target.value)} />
          <p class="text-2xs font-mono text-gray-600 mt-1">Format: upstream/downstream</p>
        </div>

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
            aria-label="{$workingConfig.igmpEnabled ? 'Disable' : 'Enable'} IGMP Snooping"
            aria-pressed={$workingConfig.igmpEnabled}
            class="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full
                   transition-colors duration-200 focus:outline-none mt-0.5"
            class:bg-cyan-DEFAULT={$workingConfig.igmpEnabled}
            class:bg-surface-500={!$workingConfig.igmpEnabled}
            on:click={() => set('igmpEnabled', !$workingConfig.igmpEnabled)}>
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
          <label for="cfg-igmp-version" class="section-label block mb-1.5">IGMP Version</label>
          <select id="cfg-igmp-version" class="field"
                  value={$workingConfig.igmpVersion}
                  on:change={e => set('igmpVersion', e.target.value)}>
            <option>IGMPv2</option>
            <option>IGMPv3</option>
          </select>
        </div>

        <!-- Max groups -->
        <div>
          <label for="cfg-max-groups" class="section-label block mb-1.5">Max Multicast Groups</label>
          <input id="cfg-max-groups" class="field" type="number" min="1" max="1024"
                 class:border-status-down={errors.maxMulticastGroups}
                 value={$workingConfig.maxMulticastGroups}
                 on:input={e => set('maxMulticastGroups', e.target.value)} />
          {#if errors.maxMulticastGroups}<p class="text-2xs text-status-down mt-1 font-mono">{errors.maxMulticastGroups}</p>{/if}
        </div>

      </div>
    </div>

    <!-- ── ONU Provisioning ───────────────────────────────────────────────── -->
    <div class="panel p-4">
      <p class="text-sm font-medium text-gray-200 mb-3">ONU Provisioning</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div class="flex items-start gap-3">
          <button type="button"
            aria-label="{$workingConfig.autoProvision ? 'Disable' : 'Enable'} auto-provision ONUs"
            aria-pressed={$workingConfig.autoProvision}
            class="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full
                   transition-colors duration-200 mt-0.5"
            class:bg-cyan-DEFAULT={$workingConfig.autoProvision}
            class:bg-surface-500={!$workingConfig.autoProvision}
            on:click={() => set('autoProvision', !$workingConfig.autoProvision)}>
            <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                  class:translate-x-4={$workingConfig.autoProvision}
                  class:translate-x-1={!$workingConfig.autoProvision}>
            </span>
          </button>
          <div>
            <p class="text-sm text-gray-200">Auto-provision ONUs</p>
            <p class="text-2xs font-mono text-gray-500">Automatically register new ONUs using default profile</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <button type="button"
            aria-label="{$workingConfig.zerotouch ? 'Disable' : 'Enable'} zero-touch activation"
            aria-pressed={$workingConfig.zerotouch}
            class="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full
                   transition-colors duration-200 mt-0.5"
            class:bg-cyan-DEFAULT={$workingConfig.zerotouch}
            class:bg-surface-500={!$workingConfig.zerotouch}
            on:click={() => set('zerotouch', !$workingConfig.zerotouch)}>
            <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                  class:translate-x-4={$workingConfig.zerotouch}
                  class:translate-x-1={!$workingConfig.zerotouch}>
            </span>
          </button>
          <div>
            <p class="text-sm text-gray-200">Zero-touch activation</p>
            <p class="text-2xs font-mono text-gray-500">Apply service profile on first registration without manual approval</p>
          </div>
        </div>

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
