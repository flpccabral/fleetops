import { MenuItem, Widget, ExtensionComponent } from '@fleetbase/ember-core/contracts';

/**
 * Header menu items and widgets are registered with translation keys, which
 * ember-ui's `translate-label` translates when they render. Consoles running an
 * ember-ui without that helper render the value as-is, so translate up front.
 */
function labelResolver(app) {
    if (app.factoryFor('helper:translate-label')) {
        return (key) => key;
    }

    const intl = app.lookup('service:intl');
    return (key) => intl.t(key);
}

export default {
    setupExtension(app, universe) {
        const label = labelResolver(app);
        const menuService = universe.getService('menu');
        const registryService = universe.getService('registry');
        const widgetService = universe.getService('widget');

        // Register header navigation
        menuService.registerHeaderMenuItem('Fleet-Ops', 'console.fleet-ops', {
            icon: 'route',
            priority: 0,
            description: label('fleet-ops.extension.description'),
            shortcuts: [
                {
                    id: 'fleet-ops-sc-radar',
                    title: label('fleet-ops.extension.shortcuts.radar.title'),
                    description: label('fleet-ops.extension.shortcuts.radar.description'),
                    icon: 'satellite-dish',
                    route: 'console.fleet-ops.management.index',
                    permission: 'fleet-ops list driver',
                },
                {
                    id: 'fleet-ops-sc-orders',
                    title: label('fleet-ops.extension.shortcuts.orders.title'),
                    description: label('fleet-ops.extension.shortcuts.orders.description'),
                    icon: 'boxes-stacked',
                    route: 'console.fleet-ops.operations.orders',
                    permission: 'fleet-ops list order',
                },
                {
                    id: 'fleet-ops-sc-places',
                    title: label('fleet-ops.extension.shortcuts.places.title'),
                    description: label('fleet-ops.extension.shortcuts.places.description'),
                    icon: 'location-dot',
                    route: 'console.fleet-ops.management.places',
                    permission: 'fleet-ops list place',
                },
                {
                    id: 'fleet-ops-sc-drivers',
                    title: label('fleet-ops.extension.shortcuts.drivers.title'),
                    description: label('fleet-ops.extension.shortcuts.drivers.description'),
                    icon: 'id-card',
                    route: 'console.fleet-ops.management.drivers',
                    permission: 'fleet-ops list driver',
                },
                {
                    id: 'fleet-ops-sc-vehicles',
                    title: label('fleet-ops.extension.shortcuts.vehicles.title'),
                    description: label('fleet-ops.extension.shortcuts.vehicles.description'),
                    icon: 'truck',
                    route: 'console.fleet-ops.management.vehicles',
                    permission: 'fleet-ops list vehicle',
                },
                {
                    id: 'fleet-ops-sc-trailers',
                    title: label('menu.trailers'),
                    description: label('trailer.navigation-description'),
                    icon: 'trailer',
                    route: 'console.fleet-ops.management.trailers',
                    permission: 'fleet-ops list trailer',
                },
                {
                    id: 'fleet-ops-sc-fleets',
                    title: label('fleet-ops.extension.shortcuts.fleets.title'),
                    description: label('fleet-ops.extension.shortcuts.fleets.description'),
                    icon: 'layer-group',
                    route: 'console.fleet-ops.management.fleets',
                    permission: 'fleet-ops list fleet',
                },
                {
                    id: 'fleet-ops-sc-service-rates',
                    title: label('fleet-ops.extension.shortcuts.service-rates.title'),
                    description: label('fleet-ops.extension.shortcuts.service-rates.description'),
                    icon: 'tags',
                    route: 'console.fleet-ops.operations.service-rates',
                    permission: 'fleet-ops list service-rate',
                },
                {
                    id: 'fleet-ops-sc-devices',
                    title: label('fleet-ops.extension.shortcuts.devices.title'),
                    description: label('fleet-ops.extension.shortcuts.devices.description'),
                    icon: 'microchip',
                    route: 'console.fleet-ops.connectivity.devices',
                    permission: 'fleet-ops list device',
                },
                {
                    id: 'fleet-ops-sc-reports',
                    title: label('fleet-ops.extension.shortcuts.reports.title'),
                    description: label('fleet-ops.extension.shortcuts.reports.description'),
                    icon: 'chart-bar',
                    route: 'console.fleet-ops.analytics.reports',
                    permission: 'iam list report',
                },
                {
                    id: 'fleet-ops-sc-orchestrator',
                    title: label('fleet-ops.extension.shortcuts.orchestrator.title'),
                    description: label('fleet-ops.extension.shortcuts.orchestrator.description'),
                    icon: 'diagram-project',
                    route: 'console.fleet-ops.operations.orchestrator',
                    permission: 'fleet-ops list order',
                },
            ],
        });

        // Register admin sections
        menuService.registerAdminMenuPanel(
            'Fleet-Ops Config',
            [
                new MenuItem({
                    title: 'Routing',
                    icon: 'route',
                    component: new ExtensionComponent('@fleetbase/fleetops-engine', 'admin/routing-settings'),
                }),
                new MenuItem({
                    title: 'Map',
                    icon: 'map',
                    component: new ExtensionComponent('@fleetbase/fleetops-engine', 'admin/map-settings'),
                }),
                new MenuItem({
                    title: 'Navigator App',
                    icon: 'location-arrow',
                    component: new ExtensionComponent('@fleetbase/fleetops-engine', 'admin/navigator-app'),
                }),
                new MenuItem({
                    title: 'Telematics',
                    icon: 'satellite-dish',
                    component: new ExtensionComponent('@fleetbase/fleetops-engine', 'admin/telematics-settings'),
                }),
            ],
            {
                slug: 'fleet-ops',
            }
        );

        // Register track order button
        menuService.registerMenuItem(
            'auth:login',
            new MenuItem({
                title: 'Track Order',
                route: 'virtual',
                slug: 'track-order',
                icon: 'barcode',
                type: 'default',
                // btn-auth (ember-ui): the sign-in page's neutral button, matching the
                // console's "Continue with ..." provider buttons, hover included.
                wrapperClass: 'btn-block btn-auth',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'order-tracking-lookup'),
                onClick: (menuItem) => {
                    universe.transitionMenuItem('virtual', menuItem);
                },
            })
        );

        menuService.registerMenuItem(
            'auth:login',
            new MenuItem({
                title: 'Inspection',
                route: 'virtual',
                slug: 'inspection',
                type: 'link',
                wrapperClass: 'hidden',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'public-inspection'),
                onClick: (menuItem) => {
                    universe.transitionMenuItem('virtual', menuItem);
                },
            })
        );

        // Register widgets
        this.registerWidgets(widgetService, label);

        // Create registries
        this.createRegistries(registryService);
        registryService.registerRenderableComponent('ai:action-preview:fleet-ops.create_order', new ExtensionComponent('@fleetbase/fleetops-engine', 'ai/create-order-preview'));

        // // Register console home guidance
        // this.registerHomeComponents(registryService);

        // Setup customer portal
        const isCustomerPortalInstalled = universe.extensionManager.isInstalled('@fleetbase/customer-portal-engine');
        if (isCustomerPortalInstalled) {
            universe.whenEngineLoaded('@fleetbase/customer-portal-engine', () => {
                universe.extensionManager.ensureEngineLoaded('@fleetbase/fleetops-engine');
            });
        }
    },

    registerWidgets(widgetService, label) {
        // `order` places a default widget on the default dashboard, which mixes widgets from
        // every extension; the grid fills rows first-fit, lowest order first (widgets without
        // one follow). The default layout is:
        //   10-40    KPI row: Radar, Revenue (ledger, 20), Active Orders, Drivers Online
        //   41-44    Ledger KPI row: Expenses, Net Income, Outstanding AR, Overdue AR
        //   50       Live Fleet Map, full width
        //   60-80    Revenue Trend, Top Drivers, Maintenance Overview, a third of the width each
        //   150-170  Ledger Recent Financial Activity + Cash Flow Summary | console Blog + GitHub
        const widgets = [
            // Legacy monolithic 13-tile widget — kept registered for one release as
            // users have it pinned to existing dashboards. The new KPI tile widgets
            // below supersede it. Scheduled for removal in the next major.
            new Widget({
                id: 'fleet-ops-key-metrics-widget',
                name: label('fleet-ops.extension.widgets.key-metrics.name'),
                description: label('fleet-ops.extension.widgets.key-metrics.description'),
                icon: 'truck',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/fleet-ops-key-metrics'),
                grid_options: { w: 12, h: 8, minW: 8, minH: 6 },
                category: 'Legacy',
                default: false,
            }),

            // Small KPI tile widgets — S-tier, each wraps <Widget::KpiTile> with a
            // fixed slug pointing at GET /fleet-ops/metrics/{slug}.
            new Widget({
                id: 'fleet-ops-kpi-earnings-widget',
                name: label('fleet-ops.extension.widgets.kpi-earnings.name'),
                description: label('fleet-ops.extension.widgets.kpi-earnings.description'),
                icon: 'sack-dollar',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/kpi-earnings'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-kpi-aov-widget',
                name: label('fleet-ops.extension.widgets.kpi-aov.name'),
                description: label('fleet-ops.extension.widgets.kpi-aov.description'),
                icon: 'receipt',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/kpi-aov'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-kpi-distance-widget',
                name: label('fleet-ops.extension.widgets.kpi-distance.name'),
                description: label('fleet-ops.extension.widgets.kpi-distance.description'),
                icon: 'route',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/kpi-distance'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-kpi-active-orders-widget',
                name: label('fleet-ops.extension.widgets.kpi-active-orders.name'),
                description: label('fleet-ops.extension.widgets.kpi-active-orders.description'),
                icon: 'bolt',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/kpi-active-orders'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                order: 30,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-kpi-drivers-online-widget',
                name: label('fleet-ops.extension.widgets.kpi-drivers-online.name'),
                description: label('fleet-ops.extension.widgets.kpi-drivers-online.description'),
                icon: 'id-card',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/kpi-drivers-online'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                order: 40,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-radar-widget',
                name: label('fleet-ops.extension.widgets.radar.name'),
                description: label('fleet-ops.extension.widgets.radar.description'),
                icon: 'satellite-dish',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/radar'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                order: 10,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-kpi-open-issues-widget',
                name: label('fleet-ops.extension.widgets.kpi-open-issues.name'),
                description: label('fleet-ops.extension.widgets.kpi-open-issues.description'),
                icon: 'triangle-exclamation',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/kpi-open-issues'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'KPI Tiles',
                default: false,
            }),

            // Analytics widgets — composed visualizations powered by /fleet-ops/analytics/*.
            new Widget({
                id: 'fleet-ops-operations-pulse-widget',
                name: label('fleet-ops.extension.widgets.operations-pulse.name'),
                description: label('fleet-ops.extension.widgets.operations-pulse.description'),
                icon: 'wave-pulse',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/operations-pulse'),
                grid_options: { w: 6, h: 6, minW: 5, minH: 5 },
                category: 'Analytics',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-live-fleet-widget',
                name: label('fleet-ops.extension.widgets.live-fleet.name'),
                description: label('fleet-ops.extension.widgets.live-fleet.description'),
                icon: 'map-location-dot',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/live-fleet'),
                grid_options: { w: 12, h: 12, minW: 8, minH: 8 },
                category: 'Maps',
                order: 50,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-revenue-trend-widget',
                name: label('fleet-ops.extension.widgets.revenue-trend.name'),
                description: label('fleet-ops.extension.widgets.revenue-trend.description'),
                icon: 'chart-line',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/revenue-trend'),
                grid_options: { w: 4, h: 9, minW: 4, minH: 7 },
                category: 'Analytics',
                order: 60,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-orders-by-status-widget',
                name: label('fleet-ops.extension.widgets.orders-by-status.name'),
                description: label('fleet-ops.extension.widgets.orders-by-status.description'),
                icon: 'chart-column',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/orders-by-status'),
                grid_options: { w: 6, h: 6, minW: 5, minH: 5 },
                category: 'Analytics',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-on-time-delivery-widget',
                name: label('fleet-ops.extension.widgets.on-time-delivery.name'),
                description: label('fleet-ops.extension.widgets.on-time-delivery.description'),
                icon: 'clock',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/on-time-delivery'),
                grid_options: { w: 3, h: 4, minW: 3, minH: 4 },
                category: 'Analytics',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-top-drivers-widget',
                name: label('fleet-ops.extension.widgets.top-drivers.name'),
                description: label('fleet-ops.extension.widgets.top-drivers.description'),
                icon: 'medal',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/top-drivers'),
                grid_options: { w: 4, h: 9, minW: 4, minH: 6 },
                category: 'Analytics',
                order: 70,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-fuel-efficiency-widget',
                name: label('fleet-ops.extension.widgets.fuel-efficiency.name'),
                description: label('fleet-ops.extension.widgets.fuel-efficiency.description'),
                icon: 'gas-pump',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/fuel-efficiency'),
                grid_options: { w: 6, h: 6, minW: 5, minH: 5 },
                category: 'Analytics',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-fuel-providers-widget',
                name: label('fleet-ops.extension.widgets.fuel-providers.name'),
                description: label('fleet-ops.extension.widgets.fuel-providers.description'),
                icon: 'gas-pump',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/fuel-providers'),
                grid_options: { w: 4, h: 5, minW: 4, minH: 5 },
                category: 'Analytics',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-issues-insights-widget',
                name: label('fleet-ops.extension.widgets.issues-insights.name'),
                description: label('fleet-ops.extension.widgets.issues-insights.description'),
                icon: 'triangle-exclamation',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/issues-insights'),
                grid_options: { w: 6, h: 6, minW: 5, minH: 5 },
                category: 'Analytics',
                default: false,
            }),
            new Widget({
                id: 'fleet-ops-maintenance-overview-widget',
                name: label('fleet-ops.extension.widgets.maintenance-overview.name'),
                description: label('fleet-ops.extension.widgets.maintenance-overview.description'),
                icon: 'wrench',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/maintenance-overview'),
                grid_options: { w: 4, h: 9, minW: 4, minH: 6 },
                category: 'Analytics',
                order: 80,
                default: true,
            }),
            new Widget({
                id: 'fleet-ops-geofence-violations-widget',
                name: label('fleet-ops.extension.widgets.geofence-violations.name'),
                description: label('fleet-ops.extension.widgets.geofence-violations.description'),
                icon: 'location-crosshairs',
                component: new ExtensionComponent('@fleetbase/fleetops-engine', 'widget/geofence-violations'),
                grid_options: { w: 6, h: 6, minW: 5, minH: 5 },
                category: 'Analytics',
                default: false,
            }),
        ];

        const defaultWidgets = widgets
            .filter((widget) => (typeof widget.isDefault === 'function' ? widget.isDefault() : widget.default === true))
            .map((widget) => {
                const definition = typeof widget.toObject === 'function' ? widget.toObject() : widget;

                return {
                    ...definition,
                    widgetId: definition.widgetId ?? definition.id,
                };
            });

        widgetService.registerWidgets('dashboard', widgets);

        if (typeof widgetService.registerDashboard === 'function') {
            widgetService.registerDashboard('fleet-ops');
        }

        widgetService.registerWidgets('fleet-ops', widgets);

        if (typeof widgetService.registerDefaultWidgets === 'function') {
            widgetService.registerDefaultWidgets('fleet-ops', defaultWidgets);
        }
    },

    registerHomeComponents(registryService) {
        registryService.registerRenderableComponent('console:home:before-dashboard', new ExtensionComponent('@fleetbase/fleetops-engine', 'home/getting-started-guidance'));
    },

    createRegistries(registryService) {
        registryService.createRegistries([
            'engine:fleet-ops',
            'fleet-ops:component:map:drawer',
            'fleet-ops:component:vehicle:details',
            'fleet-ops:component:driver:details',
            'fleet-ops:component:order-config-manager',
            'fleet-ops:component:contact:form',
            'fleet-ops:component:contact:form:details',
            'fleet-ops:component:customer:form',
            'fleet-ops:component:customer:form:details',
            'fleet-ops:component:driver:form',
            'fleet-ops:component:driver:form:details',
            'fleet-ops:component:fleet:form',
            'fleet-ops:component:fleet:form:details',
            'fleet-ops:component:place:form',
            'fleet-ops:component:place:form:details',
            'fleet-ops:component:vehicle:form',
            'fleet-ops:component:vehicle:form:details',
            'fleet-ops:component:vehicle:form:after-details',
            'fleet-ops:component:vehicle:form:start',
            'fleet-ops:component:vehicle:form:end',
            'fleet-ops:component:vehicle:card:header:start',
            'fleet-ops:component:vehicle:card:header:end',
            'fleet-ops:component:vehicle:card:footer:start',
            'fleet-ops:component:vehicle:card:footer:end',
            'fleet-ops:component:vendor:form:edit',
            'fleet-ops:component:vendor:form:edit:details',
            'fleet-ops:component:vendor:form:create',
            'fleet-ops:component:vendor:form:create:details',
            'fleet-ops:component:issue:form',
            'fleet-ops:component:issue:form:details',
            'fleet-ops:component:fuel-report:form',
            'fleet-ops:component:fuel-report:form:details',
            'fleet-ops:component:maintenance:form',
            'fleet-ops:component:maintenance:form:details',
            'fleet-ops:component:maintenance:details',
            'fleet-ops:component:inspection-form:form',
            'fleet-ops:component:inspection-form:details',
            'fleet-ops:component:inspection-submission:form',
            'fleet-ops:component:inspection-submission:details',
            'fleet-ops:component:public-inspection',
            'fleet-ops:component:work-order:form',
            'fleet-ops:component:work-order:form:details',
            'fleet-ops:component:work-order:details',
            'fleet-ops:component:equipment:form',
            'fleet-ops:component:equipment:form:details',
            'fleet-ops:component:equipment:details',
            'fleet-ops:component:part:form',
            'fleet-ops:component:part:form:details',
            'fleet-ops:component:part:details',
            'fleet-ops:contextmenu:vehicle',
            'fleet-ops:contextmenu:driver',
            'fleet-ops:component:order:details',
            'fleet-ops:component:order:form',
            'fleet-ops:component:order:form:start',
            'fleet-ops:component:order:form:end',
            'fleet-ops:component:order:form:details',
            'fleet-ops:component:order:form:details:start',
            'fleet-ops:component:order:form:details:end',
            'fleet-ops:component:order:form:details:after-details',
            'fleet-ops:component:order:form:payload:entity',
            'fleet-ops:component:order:form:payload:entity:form',
            'fleet-ops:template:settings:routing',
            'fleet-ops:template:settings:orchestrator',
            'fleet-ops:component:admin:routing-settings',
            'fleet-ops:component:admin:telematics-settings',
        ]);
    },
};
