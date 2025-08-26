const { withModuleFederationPlugin, shareAll } = require('@angular-architects/module-federation/webpack');

/**
 * Configuração do Module Federation otimizada para produção
 * com foco em evitar o erro "Shared module is not available for eager consumption"
 */
module.exports = withModuleFederationPlugin({
  name: 'taskflowFunctional',
  exposes: {
    './Module': './src/app/app.component.ts',
    './Routes': './src/app/app.routes.ts',
    './AnalyticsReportComponent': './src/app/features/reports/analytics-report.component.ts'
  },
  // Configuração de compartilhamento para produção
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: false, eager: false }),
  },
  // Usar um formato de biblioteca mais compatível
  library: { type: 'var', name: 'taskflowFunctional' },
});
