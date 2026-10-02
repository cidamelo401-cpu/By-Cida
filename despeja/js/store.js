// Despeja! — armazenamento local (localStorage). Sem servidor, sem conta.
// Se o navegador bloquear o armazenamento, o app continua funcionando só durante a visita.
// Na fase final, este arquivo é o ponto de troca para o Supabase.

const CHAVE = 'despeja:v1';
let memoria = null;

const vazio = () => ({ itens: [], despejos: [], rascunho: '' });

function ler() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return { ...vazio(), ...JSON.parse(bruto) };
  } catch { /* storage indisponível ou corrompido */ }
  return memoria ? { ...vazio(), ...memoria } : vazio();
}

function gravar(dados) {
  memoria = dados;
  try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch { /* segue na memória */ }
}

// Mais novos primeiro
export const storeItens = () => ler().itens.slice().sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));

export function storeAdicionar(novos, despejo) {
  const d = ler();
  d.itens.push(...novos);
  if (despejo && !d.despejos.some((x) => x.id === despejo.id)) {
    d.despejos.push({ ...despejo, criadoEm: new Date().toISOString() });
  }
  gravar(d);
}

export function storeAtualizar(item) {
  const d = ler();
  d.itens = d.itens.map((i) => (i.id === item.id ? item : i));
  gravar(d);
}

export function storeRemover(id) {
  const d = ler();
  d.itens = d.itens.filter((i) => i.id !== id);
  gravar(d);
}

export const storeRascunho = () => ler().rascunho || '';
export function storeSalvarRascunho(texto) {
  const d = ler();
  d.rascunho = texto;
  gravar(d);
}
