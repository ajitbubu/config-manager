// Feature Control Center — seed data + resolution engine
// All fabricated. No real brands.

export const FCC_DATA = (() => {
  const TENANTS = [
    { id: 'acme',     name: 'Acme Retail',      slug: 'acme',     industry: 'Commerce',   envs: ['dev','qa','stage','prod'], modules: ['checkout','home','pricing','support','account'], theme: 'acme-light' },
    { id: 'northwind',name: 'Northwind Logistics', slug: 'northwind', industry: 'Logistics', envs: ['dev','qa','stage','prod'], modules: ['tracking','dispatch','billing','support'], theme: 'northwind' },
    { id: 'helios',   name: 'Helios Financial', slug: 'helios',   industry: 'Fintech',    envs: ['dev','qa','stage','prod'], modules: ['onboarding','transfer','cards','support'], theme: 'helios-dark' },
    { id: 'orbit',    name: 'Orbit Media',      slug: 'orbit',    industry: 'Media',      envs: ['dev','qa','prod'],          modules: ['player','library','discovery'], theme: 'orbit' },
    { id: 'vanta',    name: 'Vanta Health',     slug: 'vanta',    industry: 'Healthcare', envs: ['dev','qa','stage','prod'], modules: ['appointments','records','billing'], theme: 'vanta' },
  ];

  const ENVS = [
    { id: 'dev',   name: 'Development', color: '#6B7280', order: 0 },
    { id: 'qa',    name: 'QA',          color: '#A855F7', order: 1 },
    { id: 'stage', name: 'Stage',       color: '#F59E0B', order: 2 },
    { id: 'prod',  name: 'Production',  color: '#10B981', order: 3 },
  ];

  const ROLES = ['Admin','Developer','DevOps','Approver','Viewer'];

  const USERS = [
    { id: 'u_1', name: 'Priya Natarajan', role: 'Admin',     email: 'priya@fcc.internal',   avatar: 'PN' },
    { id: 'u_2', name: 'Marco Alvarez',   role: 'Developer', email: 'marco@fcc.internal',   avatar: 'MA' },
    { id: 'u_3', name: 'Hana Okafor',     role: 'DevOps',    email: 'hana@fcc.internal',    avatar: 'HO' },
    { id: 'u_4', name: 'Søren Lind',      role: 'Approver',  email: 'soren@fcc.internal',   avatar: 'SL' },
    { id: 'u_5', name: 'Yuki Tanabe',     role: 'Developer', email: 'yuki@fcc.internal',    avatar: 'YT' },
    { id: 'u_6', name: 'Ravi Shah',       role: 'Viewer',    email: 'ravi@fcc.internal',    avatar: 'RS' },
  ];

  const FLAGS = [
    {
      key: 'checkout.newPaymentFlow',
      name: 'New payment flow',
      description: 'Rewritten PCI-compliant checkout with tokenized card entry and 3DS2.',
      type: 'boolean',
      default: false,
      module: 'checkout',
      tags: ['payments','pci','frontend'],
      owner: 'u_2',
      status: 'active',
      createdAt: '2026-02-11T09:14:00Z',
      updatedAt: '2026-04-21T17:22:00Z',
      updatedBy: 'u_2',
      dependencies: [],
      overrides: {
        env:   { dev: true, qa: true, stage: true, prod: false },
        tenant:{ acme: { prod: true } },
        platform: { ios: true, android: true, web: true, mweb: false },
        browser: {},
      },
      rollout: { enabled: true, percentage: 35, seed: 'checkout-np' },
    },
    {
      key: 'home.heroVariant',
      name: 'Home hero variant',
      description: 'A/B/C variant for the primary above-the-fold hero on the home page.',
      type: 'enum',
      options: ['A','B','C'],
      default: 'A',
      module: 'home',
      tags: ['experiment','marketing'],
      owner: 'u_5',
      status: 'active',
      createdAt: '2026-01-30T11:00:00Z',
      updatedAt: '2026-04-19T10:05:00Z',
      updatedBy: 'u_5',
      dependencies: [],
      overrides: {
        env:   { dev: 'C', qa: 'B', stage: 'B', prod: 'B' },
        tenant:{ orbit: { prod: 'C' } },
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
    },
    {
      key: 'pricing.discountPercentage',
      name: 'Site-wide discount',
      description: 'Percentage applied at cart. 0 disables the banner.',
      type: 'number',
      default: 0,
      min: 0, max: 60,
      module: 'pricing',
      tags: ['commerce','promo'],
      owner: 'u_2',
      status: 'active',
      createdAt: '2026-03-02T08:00:00Z',
      updatedAt: '2026-04-22T06:10:00Z',
      updatedBy: 'u_2',
      dependencies: [],
      overrides: {
        env:   { dev: 25, qa: 15, stage: 15, prod: 15 },
        tenant:{ acme: { prod: 20 }, vanta: { prod: 0 } },
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
    },
    {
      key: 'mobile.enableBiometricLogin',
      name: 'Biometric login',
      description: 'FaceID / fingerprint login on native apps.',
      type: 'boolean',
      default: false,
      module: 'account',
      tags: ['mobile','auth','security'],
      owner: 'u_3',
      status: 'active',
      createdAt: '2025-11-20T13:00:00Z',
      updatedAt: '2026-04-18T09:30:00Z',
      updatedBy: 'u_3',
      dependencies: [],
      overrides: {
        env:   { dev: true, qa: true, stage: true, prod: true },
        tenant:{},
        platform: { ios: true, android: true, web: false, mweb: false },
        browser: {},
      },
      rollout: { enabled: false, percentage: 100 },
    },
    {
      key: 'support.chatbotRollout',
      name: 'AI chatbot rollout',
      description: 'Gradual rollout of the Atlas chatbot on the support surface.',
      type: 'percentage',
      default: 0,
      module: 'support',
      tags: ['ai','support','rollout'],
      owner: 'u_5',
      status: 'active',
      createdAt: '2026-03-18T14:00:00Z',
      updatedAt: '2026-04-22T05:02:00Z',
      updatedBy: 'u_5',
      dependencies: [],
      overrides: {
        env:   { dev: 100, qa: 100, stage: 50, prod: 25 },
        tenant:{ helios: { prod: 10 } },
        platform: {},
        browser: {},
      },
      rollout: { enabled: true, percentage: 25 },
    },
    {
      key: 'checkout.applePayEnabled',
      name: 'Apple Pay',
      description: 'Show Apple Pay as an express checkout option on supported devices.',
      type: 'boolean',
      default: true,
      module: 'checkout',
      tags: ['payments','ios','safari'],
      owner: 'u_2',
      status: 'active',
      createdAt: '2025-09-04T09:00:00Z',
      updatedAt: '2026-04-11T16:40:00Z',
      updatedBy: 'u_2',
      dependencies: ['checkout.newPaymentFlow'],
      overrides: {
        env:   { dev: true, qa: true, stage: true, prod: true },
        tenant:{},
        platform: { ios: true, mweb: true, web: true, android: false },
        browser: { safari: true, chrome: true, firefox: false, edge: true },
      },
      rollout: { enabled: false, percentage: 100 },
    },
    {
      key: 'home.showReferralBanner',
      name: 'Referral banner',
      description: 'Top-of-home banner promoting the $20 referral offer.',
      type: 'boolean',
      default: false,
      module: 'home',
      tags: ['growth','marketing'],
      owner: 'u_5',
      status: 'stale',
      createdAt: '2025-06-15T10:00:00Z',
      updatedAt: '2026-01-04T10:00:00Z',
      updatedBy: 'u_5',
      dependencies: [],
      overrides: {
        env:   { dev: true, qa: false, stage: false, prod: false },
        tenant:{},
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
    },
    {
      key: 'search.useVectorIndex',
      name: 'Vector search index',
      description: 'Use pgvector-backed semantic retrieval for product search.',
      type: 'boolean',
      default: false,
      module: 'home',
      tags: ['search','ml','infra'],
      owner: 'u_2',
      status: 'active',
      createdAt: '2026-04-01T12:00:00Z',
      updatedAt: '2026-04-22T04:48:00Z',
      updatedBy: 'u_2',
      dependencies: [],
      overrides: {
        env:   { dev: true, qa: true, stage: false, prod: false },
        tenant:{},
        platform: {},
        browser: {},
      },
      rollout: { enabled: true, percentage: 5, seed: 'vector-search' },
    },
    {
      key: 'checkout.killSwitch',
      name: 'Checkout kill switch',
      description: 'Emergency disable for the entire checkout surface. Shows maintenance page.',
      type: 'boolean',
      default: false,
      module: 'checkout',
      tags: ['safety','kill-switch','ops'],
      owner: 'u_3',
      status: 'active',
      createdAt: '2025-05-10T08:00:00Z',
      updatedAt: '2026-02-02T03:12:00Z',
      updatedBy: 'u_3',
      dependencies: [],
      overrides: {
        env:   { dev: false, qa: false, stage: false, prod: false },
        tenant:{},
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
      killSwitch: true,
    },
    {
      key: 'account.passkeyEnrollment',
      name: 'Passkey enrollment',
      description: 'Prompt users to register a passkey after successful login.',
      type: 'boolean',
      default: false,
      module: 'account',
      tags: ['auth','security'],
      owner: 'u_2',
      status: 'active',
      createdAt: '2026-02-22T09:20:00Z',
      updatedAt: '2026-04-20T11:00:00Z',
      updatedBy: 'u_2',
      dependencies: [],
      overrides: {
        env:   { dev: true, qa: true, stage: true, prod: false },
        tenant:{},
        platform: {},
        browser: { chrome: true, edge: true, safari: true, firefox: false },
      },
      rollout: { enabled: true, percentage: 10 },
    },
    {
      key: 'pricing.currencyDisplay',
      name: 'Currency display format',
      description: 'Symbol-first vs code-first rendering of prices.',
      type: 'enum',
      options: ['symbol','code','both'],
      default: 'symbol',
      module: 'pricing',
      tags: ['i18n','pricing'],
      owner: 'u_5',
      status: 'active',
      createdAt: '2026-01-18T09:00:00Z',
      updatedAt: '2026-03-30T12:00:00Z',
      updatedBy: 'u_5',
      dependencies: [],
      overrides: {
        env:   { prod: 'symbol' },
        tenant:{ northwind: { prod: 'both' } },
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
    },
    {
      key: 'support.escalationThreshold',
      name: 'Escalation threshold (minutes)',
      description: 'Minutes before an unresolved ticket is auto-escalated to a human agent.',
      type: 'number',
      default: 15,
      min: 1, max: 120,
      module: 'support',
      tags: ['support','sla'],
      owner: 'u_5',
      status: 'active',
      createdAt: '2025-12-01T10:00:00Z',
      updatedAt: '2026-04-15T10:10:00Z',
      updatedBy: 'u_5',
      dependencies: [],
      overrides: {
        env:   { dev: 5, qa: 5, stage: 10, prod: 15 },
        tenant:{ helios: { prod: 8 } },
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
    },
    {
      key: 'home.featuredCollections',
      name: 'Featured collections config',
      description: 'JSON array of curated home-page collections.',
      type: 'json',
      default: { items: [] },
      module: 'home',
      tags: ['content','home'],
      owner: 'u_5',
      status: 'active',
      createdAt: '2026-02-05T10:00:00Z',
      updatedAt: '2026-04-21T19:00:00Z',
      updatedBy: 'u_5',
      dependencies: [],
      overrides: {
        env:   { prod: { items: [
          { id: 'spring', title: 'Spring Essentials', slots: 6 },
          { id: 'new',    title: 'New arrivals',       slots: 4 },
        ] } },
        tenant: {},
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 0 },
    },
    {
      key: 'tracking.liveMap',
      name: 'Live tracking map',
      description: 'Real-time vehicle positions on the tracking dashboard.',
      type: 'boolean',
      default: false,
      module: 'tracking',
      tags: ['maps','realtime'],
      owner: 'u_3',
      status: 'active',
      createdAt: '2026-03-14T10:00:00Z',
      updatedAt: '2026-04-10T08:00:00Z',
      updatedBy: 'u_3',
      dependencies: [],
      overrides: {
        env:   { dev: true, qa: true, stage: true, prod: true },
        tenant:{ northwind: { prod: true } },
        platform: {},
        browser: {},
      },
      rollout: { enabled: false, percentage: 100 },
    },
  ];

  const THEMES = [
    { id: 'acme-light', name: 'Acme — Light', tenant: 'acme', fontFamily: 'Inter Tight', primaryColor: '#2E5BFF', secondaryColor: '#0B0D10', backgroundColor: '#FFFFFF', surfaceColor: '#F7F7F5', textColor: '#0B0D10', borderRadius: 10, logoUrl: '/logos/acme.svg', buttonStyle: 'solid', inputStyle: 'outlined' },
    { id: 'northwind', name: 'Northwind', tenant: 'northwind', fontFamily: 'IBM Plex Sans', primaryColor: '#0F766E', secondaryColor: '#052E2B', backgroundColor: '#FAFBFB', surfaceColor: '#F0F4F3', textColor: '#111827', borderRadius: 6, logoUrl: '/logos/northwind.svg', buttonStyle: 'solid', inputStyle: 'filled' },
    { id: 'helios-dark', name: 'Helios — Dark', tenant: 'helios', fontFamily: 'Söhne', primaryColor: '#EAB308', secondaryColor: '#F5F5F4', backgroundColor: '#0A0A0A', surfaceColor: '#141414', textColor: '#F5F5F4', borderRadius: 12, logoUrl: '/logos/helios.svg', buttonStyle: 'solid', inputStyle: 'outlined' },
    { id: 'orbit', name: 'Orbit', tenant: 'orbit', fontFamily: 'Geist', primaryColor: '#7C3AED', secondaryColor: '#1E1B4B', backgroundColor: '#FFFFFF', surfaceColor: '#F5F3FF', textColor: '#1E1B4B', borderRadius: 14, logoUrl: '/logos/orbit.svg', buttonStyle: 'pill', inputStyle: 'outlined' },
    { id: 'vanta', name: 'Vanta Health', tenant: 'vanta', fontFamily: 'Inter', primaryColor: '#0EA5E9', secondaryColor: '#082F49', backgroundColor: '#FFFFFF', surfaceColor: '#F0F9FF', textColor: '#082F49', borderRadius: 8, logoUrl: '/logos/vanta.svg', buttonStyle: 'solid', inputStyle: 'outlined' },
  ];

  const DEPLOYMENTS = [
    { id: 'dep_1042', tenant: 'acme',      env: 'prod',  version: 'v128', status: 'succeeded', at: '2026-04-22T06:12:00Z', by: 'u_3', items: 14, cdn: '/cdn/config/prod/acme.json',       duration: 4.2, note: 'Raise discount to 20%' },
    { id: 'dep_1041', tenant: 'helios',    env: 'prod',  version: 'v087', status: 'succeeded', at: '2026-04-22T04:55:00Z', by: 'u_3', items: 9,  cdn: '/cdn/config/prod/helios.json',     duration: 3.1, note: 'Gate chatbot to 10%' },
    { id: 'dep_1040', tenant: 'acme',      env: 'stage', version: 'v129', status: 'in_review', at: '2026-04-22T03:00:00Z', by: 'u_2', items: 14, cdn: '/cdn/config/stage/acme.json',      duration: 0,   note: 'Enable newPaymentFlow in prod' },
    { id: 'dep_1039', tenant: 'orbit',     env: 'prod',  version: 'v044', status: 'succeeded', at: '2026-04-21T22:11:00Z', by: 'u_3', items: 6,  cdn: '/cdn/config/prod/orbit.json',      duration: 2.8, note: 'Hero variant C for Orbit' },
    { id: 'dep_1038', tenant: 'northwind', env: 'prod',  version: 'v061', status: 'succeeded', at: '2026-04-21T18:45:00Z', by: 'u_3', items: 8,  cdn: '/cdn/config/prod/northwind.json',  duration: 3.5, note: 'Enable liveMap' },
    { id: 'dep_1037', tenant: 'vanta',     env: 'qa',    version: 'v023', status: 'succeeded', at: '2026-04-21T15:02:00Z', by: 'u_5', items: 5,  cdn: '/cdn/config/qa/vanta.json',        duration: 1.9, note: 'QA smoke' },
    { id: 'dep_1036', tenant: 'acme',      env: 'qa',    version: 'v256', status: 'succeeded', at: '2026-04-21T12:30:00Z', by: 'u_5', items: 14, cdn: '/cdn/config/qa/acme.json',         duration: 2.1, note: 'Regression pass' },
    { id: 'dep_1035', tenant: 'helios',    env: 'stage', version: 'v086', status: 'failed',    at: '2026-04-21T09:58:00Z', by: 'u_3', items: 9,  cdn: '/cdn/config/stage/helios.json',    duration: 0.8, note: 'Validation: invalid JSON' },
    { id: 'dep_1034', tenant: 'acme',      env: 'prod',  version: 'v127', status: 'succeeded', at: '2026-04-20T16:04:00Z', by: 'u_3', items: 14, cdn: '/cdn/config/prod/acme.json',       duration: 3.8, note: 'Weekly release' },
    { id: 'dep_1033', tenant: 'orbit',     env: 'prod',  version: 'v043', status: 'rolled_back', at: '2026-04-20T14:30:00Z', by: 'u_3', items: 6, cdn: '/cdn/config/prod/orbit.json',    duration: 1.2, note: 'Revert hero B→A' },
  ];

  const AUDIT = [
    { at: '2026-04-22T06:12:14Z', user: 'u_3', action: 'publish',   entity: 'pricing.discountPercentage', tenant: 'acme',      env: 'prod',  before: 15,   after: 20,   version: 'v128' },
    { at: '2026-04-22T06:10:02Z', user: 'u_2', action: 'update',    entity: 'pricing.discountPercentage', tenant: 'acme',      env: 'stage', before: 15,   after: 20,   version: 'draft' },
    { at: '2026-04-22T05:02:41Z', user: 'u_5', action: 'update',    entity: 'support.chatbotRollout',     tenant: 'helios',    env: 'prod',  before: 25,   after: 10,   version: 'v087' },
    { at: '2026-04-22T04:55:00Z', user: 'u_3', action: 'publish',   entity: 'support.chatbotRollout',     tenant: 'helios',    env: 'prod',  before: 25,   after: 10,   version: 'v087' },
    { at: '2026-04-22T04:48:10Z', user: 'u_2', action: 'update',    entity: 'search.useVectorIndex',      tenant: 'acme',      env: 'qa',    before: false,after: true, version: 'draft' },
    { at: '2026-04-22T03:00:00Z', user: 'u_2', action: 'submit',    entity: 'checkout.newPaymentFlow',    tenant: 'acme',      env: 'stage', before: false,after: true, version: 'v129' },
    { at: '2026-04-21T22:11:00Z', user: 'u_3', action: 'publish',   entity: 'home.heroVariant',           tenant: 'orbit',     env: 'prod',  before: 'B',  after: 'C',  version: 'v044' },
    { at: '2026-04-21T20:14:00Z', user: 'u_4', action: 'approve',   entity: 'home.heroVariant',           tenant: 'orbit',     env: 'prod',  before: null, after: null, version: 'v044' },
    { at: '2026-04-21T18:45:00Z', user: 'u_3', action: 'publish',   entity: 'tracking.liveMap',           tenant: 'northwind', env: 'prod',  before: false,after: true, version: 'v061' },
    { at: '2026-04-21T16:02:00Z', user: 'u_2', action: 'create',    entity: 'account.passkeyEnrollment',  tenant: 'acme',      env: 'dev',   before: null, after: false,version: 'draft' },
    { at: '2026-04-21T14:30:00Z', user: 'u_3', action: 'rollback',  entity: 'home.heroVariant',           tenant: 'orbit',     env: 'prod',  before: 'B',  after: 'A',  version: 'v042' },
    { at: '2026-04-21T11:11:00Z', user: 'u_1', action: 'rbac.grant',entity: 'user:u_5',                   tenant: null,        env: null,    before: 'Viewer', after: 'Developer', version: null },
    { at: '2026-04-21T09:58:00Z', user: 'u_3', action: 'publish.fail', entity: 'checkout.newPaymentFlow', tenant: 'helios',    env: 'stage', before: null, after: null, version: 'v086' },
    { at: '2026-04-20T16:04:00Z', user: 'u_3', action: 'publish',   entity: 'bulk',                       tenant: 'acme',      env: 'prod',  before: null, after: null, version: 'v127' },
  ];

  const APPROVALS = [
    { id: 'apr_21', flag: 'checkout.newPaymentFlow', tenant: 'acme', from: 'stage', to: 'prod', requestedBy: 'u_2', requestedAt: '2026-04-22T03:00:00Z', reviewers: ['u_4','u_1'], status: 'pending', diff: 2 },
    { id: 'apr_20', flag: 'pricing.discountPercentage', tenant: 'vanta', from: 'stage', to: 'prod', requestedBy: 'u_5', requestedAt: '2026-04-21T22:00:00Z', reviewers: ['u_4'], status: 'pending', diff: 1 },
    { id: 'apr_19', flag: 'search.useVectorIndex', tenant: 'acme', from: 'qa', to: 'stage', requestedBy: 'u_2', requestedAt: '2026-04-21T20:00:00Z', reviewers: ['u_4'], status: 'pending', diff: 1 },
  ];

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 0xFFFFFFFF;
  }

  function resolveFlag(flag, ctx) {
    const trace = [];
    let value = flag.default;
    trace.push({ layer: 'default', value });

    const ov = flag.overrides || {};
    if (ov.env && ctx.env in ov.env) { value = ov.env[ctx.env]; trace.push({ layer: `env:${ctx.env}`, value }); }
    if (ov.tenant && ov.tenant[ctx.tenant]) {
      const t = ov.tenant[ctx.tenant];
      if (ctx.env in t) { value = t[ctx.env]; trace.push({ layer: `tenant:${ctx.tenant}/${ctx.env}`, value }); }
      else if ('*' in t) { value = t['*']; trace.push({ layer: `tenant:${ctx.tenant}`, value }); }
    }
    if (ov.platform && ctx.platform in ov.platform) { value = ov.platform[ctx.platform]; trace.push({ layer: `platform:${ctx.platform}`, value }); }
    if (ov.browser && ctx.browser in ov.browser) { value = ov.browser[ctx.browser]; trace.push({ layer: `browser:${ctx.browser}`, value }); }

    if (flag.rollout && flag.rollout.enabled && flag.type === 'boolean') {
      const bucket = hash((ctx.userId || 'anon') + ':' + (flag.rollout.seed || flag.key));
      const on = bucket * 100 < flag.rollout.percentage;
      if (value === true && !on) { value = false; trace.push({ layer: `rollout:${flag.rollout.percentage}%`, value, note: 'user not in bucket' }); }
      else if (on) trace.push({ layer: `rollout:${flag.rollout.percentage}%`, value, note: 'user in bucket' });
    }

    return { value, trace };
  }

  function resolveAll(ctx) {
    const result = {};
    const traces = {};
    for (const f of FLAGS) {
      const r = resolveFlag(f, ctx);
      result[f.key] = r.value;
      traces[f.key] = r.trace;
    }
    return {
      meta: {
        tenant: ctx.tenant,
        environment: ctx.env,
        platform: ctx.platform,
        browser: ctx.browser,
        appVersion: ctx.appVersion,
        version: 'v' + (120 + Math.floor(hash(ctx.tenant + ctx.env) * 99)),
        publishedAt: '2026-04-22T06:12:00Z',
        cdnUrl: `https://cdn.fcc.io/cfg/${ctx.env}/${ctx.tenant}.json`,
        etag: 'W/"' + Math.floor(hash(ctx.tenant + ctx.env + JSON.stringify(result)) * 1e10).toString(16) + '"',
      },
      features: result,
      traces,
    };
  }

  function seriesFetches(h = 48) {
    const out = [];
    for (let i = 0; i < h; i++) {
      const base = 4200 + Math.sin(i / 3) * 400 + (i > 30 ? 800 : 0);
      const noise = (hash('f' + i) - 0.5) * 380;
      out.push(Math.max(0, Math.round(base + noise)));
    }
    return out;
  }

  function seriesPublishes(h = 48) {
    const out = [];
    for (let i = 0; i < h; i++) {
      out.push((hash('p' + i) < 0.18) ? Math.ceil(hash('q' + i) * 4) : 0);
    }
    return out;
  }

  return {
    TENANTS, ENVS, ROLES, USERS, FLAGS, THEMES, DEPLOYMENTS, AUDIT, APPROVALS,
    resolveFlag, resolveAll, seriesFetches, seriesPublishes, hash,
  };
})();
