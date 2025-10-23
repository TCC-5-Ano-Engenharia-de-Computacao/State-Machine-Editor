# State Machine Editor - Web Deployment

## 📦 Build Web Pronto

O arquivo `statemachine-editor-web.zip` contém o build otimizado para produção.

### Conteúdo
- `dist/public/` - Arquivos estáticos da aplicação
- `USER_GUIDE.md` - Guia de uso
- `example_statemachine.xml` - Arquivo de exemplo

## 🚀 Como Hospedar

### Opção 1: Servidor Web Simples (Nginx, Apache)

1. Extrair o ZIP
2. Copiar conteúdo de `dist/public/` para o diretório do servidor
3. Configurar servidor para servir `index.html` como fallback

**Nginx exemplo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/dist/public;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Opção 2: Serviços de Hospedagem Gratuitos

**Netlify:**
1. Criar conta em https://netlify.com
2. Arrastar pasta `dist/public` para o dashboard
3. Pronto! URL automática gerada

**Vercel:**
1. Criar conta em https://vercel.com
2. Instalar Vercel CLI: `npm i -g vercel`
3. Na pasta do projeto: `vercel --prod`

**GitHub Pages:**
1. Criar repositório no GitHub
2. Fazer upload do conteúdo de `dist/public`
3. Ativar GitHub Pages nas configurações
4. Acessar via `https://seu-usuario.github.io/repo-name`

**Cloudflare Pages:**
1. Criar conta em https://pages.cloudflare.com
2. Conectar repositório Git ou fazer upload manual
3. Build command: (vazio - já está buildado)
4. Output directory: `dist/public`

### Opção 3: Servidor Node.js

Criar arquivo `server.js`:
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist/public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Executar:
```bash
npm install express
node server.js
```

## 📱 Aplicação Standalone (Sem Servidor)

Você pode abrir `dist/public/index.html` diretamente no navegador, mas algumas funcionalidades podem não funcionar devido a restrições de CORS.

**Solução:** Usar um servidor HTTP local simples

**Python 3:**
```bash
cd dist/public
python3 -m http.server 8000
```

**Node.js (http-server):**
```bash
npx http-server dist/public -p 8000
```

Acesse: `http://localhost:8000`

## 🔧 Configurações Avançadas

### Cache e Performance

Adicionar headers de cache no servidor:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### HTTPS

Recomendado para produção. Serviços como Netlify, Vercel e Cloudflare fornecem HTTPS automático.

Para servidor próprio, use Let's Encrypt:
```bash
sudo certbot --nginx -d seu-dominio.com
```

## 📊 Tamanho do Build

- **Total:** ~1.4 MB (comprimido: ~350 KB)
- **HTML:** 349 KB
- **CSS:** 124 KB
- **JS:** 897 KB

## 🌐 Compatibilidade

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 📝 Notas

- A aplicação é 100% client-side (roda no navegador)
- Não requer banco de dados
- Todos os arquivos XML são processados localmente
- Nenhum dado é enviado para servidores externos

