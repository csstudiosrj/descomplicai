// DEPRECATED: getServerSideProps nao consegue ler localStorage.
// Verificacao de acesso movida para o cliente (useEffect).
// Mantido para compatibilidade ate todas as paginas serem atualizadas.
export async function getPainelServerSideProps(context) {
  return { props: { readOnly: false, evento: null } };
}