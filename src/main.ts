/**
 * Arquivo de inicialização principal para o TaskflowFunctional MFE
 * Melhorado para tratar erros de runtime e extensões
 */

console.log('TaskflowFunctional MFE main.ts executing...');

// Suprimir erros de extensões do Chrome que causam runtime.lastError
window.addEventListener('error', (event) => {
  if (event.message.includes('Extension context invalidated') || 
      event.message.includes('runtime.lastError') ||
      event.message.includes('message channel closed')) {
    event.preventDefault();
    console.warn('Chrome extension error suppressed:', event.message);
    return false;
  }
  return true;
});

// Suprimir unhandled promise rejections relacionadas a extensões
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'string' && 
      (event.reason.includes('Extension context') || 
       event.reason.includes('runtime.lastError') ||
       event.reason.includes('message channel'))) {
    event.preventDefault();
    console.warn('Chrome extension promise rejection suppressed:', event.reason);
    return false;
  }
  return true;
});

/**
 * Import dinâmico do bootstrap com melhor tratamento de erros
 */
import('./bootstrap')
  .then(() => console.log('Bootstrap module loaded successfully'))
  .catch(err => {
    console.error('Error loading bootstrap module:', err);
  });

