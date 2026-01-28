
## Plano: Corrigir Erro "undefined" no Upload de Arquivos Grandes

### Problema Identificado
O upload de um arquivo MP3 de 96.93 MB falha com a mensagem "Upload falhou: undefined". Isso acontece porque:

1. O arquivo excede 50 MB, então usa o upload resumable (TUS)
2. Quando o TUS falha, o erro pode não ter a propriedade `message` padrão
3. O código tenta acessar `tusError.message` que é `undefined`

### Causa Raiz
Na linha 194 de `Upload.tsx`:
```typescript
throw new Error(`Upload falhou: ${tusError.message}. Use a aba "Transcrição"...`);
```
O objeto de erro do TUS tem estrutura diferente: `error.message` pode estar vazio, e o erro real está em `error.originalResponse`.

### Solução

Modificar **`src/pages/Upload.tsx`** para:

1. **Extrair mensagem de erro corretamente do TUS**:
```typescript
// Função auxiliar para extrair mensagem de erro do TUS
function extractTusErrorMessage(error: any): string {
  // Tentar obter do originalResponse
  if (error?.originalResponse) {
    const status = error.originalResponse.getStatus?.();
    const body = error.originalResponse.getBody?.();
    if (status && body) {
      return `Erro ${status}: ${body}`;
    }
    if (status) {
      return `Erro HTTP ${status}`;
    }
  }
  // Tentar obter message direto
  if (error?.message && error.message !== 'undefined') {
    return error.message;
  }
  // Tentar converter para string
  if (error?.toString && error.toString() !== '[object Object]') {
    return error.toString();
  }
  return 'Erro desconhecido no upload';
}
```

2. **Atualizar tratamento de erro no catch do TUS**:
```typescript
} catch (tusError: any) {
  console.error('TUS upload failed:', tusError);
  const errorMessage = extractTusErrorMessage(tusError);
  
  // Try compression as fallback for audio
  if (isAudio && fileSizeMB > 40) {
    toast.warning("Tentando comprimir mais o áudio...");
    try {
      fileToUpload = await compressAudio(selectedFile, 35);
      // ... resto do fallback
    } catch (fallbackError: any) {
      throw new Error(`Upload falhou: ${fallbackError.message || 'Erro na compressão'}. Use a aba "Transcrição" para arquivos grandes.`);
    }
  } else {
    throw new Error(`Upload falhou: ${errorMessage}. Use a aba "Transcrição" para arquivos grandes.`);
  }
}
```

3. **Melhorar logs para debug**:
```typescript
onError: (error) => {
  console.error('Resumable upload error details:', {
    message: error?.message,
    status: error?.originalResponse?.getStatus?.(),
    body: error?.originalResponse?.getBody?.()
  });
}
```

### Arquivos a Modificar

1. **`src/pages/Upload.tsx`**:
   - Adicionar função `extractTusErrorMessage`
   - Atualizar catch do TUS para usar a função
   - Melhorar logging de erros

### O que NÃO será alterado
- Toda a lógica de análise
- Edge functions
- Componentes de análise
- PDF e relatórios
- Qualquer funcionalidade existente de análise

### Resultado Esperado
- Mensagens de erro claras quando o upload falhar
- Logs detalhados para diagnóstico
- O usuário saberá exatamente o que aconteceu (ex: "Erro 413: Payload Too Large")
