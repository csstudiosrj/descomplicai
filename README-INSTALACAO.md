# Instalação — Fluxo de Assinatura de Contratos

## Arquivos no pacote

| Arquivo | Ação |
|---------|------|
| `pages/assinar/[token].jsx` | Substituir |
| `components/contratos/ContratoCard.jsx` | Substituir |
| `pages/painel/contratos.jsx` | Substituir |
| `pages/api/contratos/assinar-noivos.js` | Criar (novo) |
| `pages/api/contratos/assinar.js` | Substituir |
| `pages/api/contratos/enviar.js` | Substituir |
| `pages/api/contratos/pdf.js` | Substituir |
| `components/contratos/ContratoEditor.jsx` | Substituir |
| `utils/pdfContrato.js` | Criar (novo) |
| `lib/email.js` | Substituir |

## Comandos para aplicar

```bash
# Descompactar na raiz do projeto
cd ~/descomplicai
unzip -o contratos-fluxo-assinatura.zip

# Verificar se o arquivo novo existe
ls pages/api/contratos/assinar-noivos.js
ls utils/pdfContrato.js
```

## Variável de ambiente

Adicione no Vercel (ou `.env.local`):
```
NEXT_PUBLIC_APP_URL=https://descomplicai.com
```

Se não tiver domínio custom, use a URL do Vercel:
```
NEXT_PUBLIC_APP_URL=https://descomplicai-lovat.vercel.app
```

## Fluxo validado

1. Criar contrato → status `rascunho`
2. Noivos clicam "Assinar contrato" → `assinado_noivos_em` preenchido
3. Botão "Enviar" libera → envia email ao fornecedor com link `/assinar/{token}`
4. Fornecedor abre link, preenche dados, assina
5. Sistema gera PDF automaticamente, atualiza `pdf_url`
6. Tela de confirmação mostra botão de download funcional
7. Email de notificação enviado aos noivos

## Observações

- O ícone usado no botão "Assinar contrato" é `fileText` (fallback seguro).
- Se quiser `fileSignature`, adicione ao `components/ui/Icon.jsx` ou peça pro Claude desenhar.
- Não foi criada tabela de logs — auditoria fica nos campos de timestamp do banco.
- O portal do fornecedor (`pages/fornecedor/painel.jsx`) não foi alterado; o email com link direto é suficiente para o MVP.
