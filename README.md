# Líder Contabilidade — Portfólio

Site institucional (one page) da **Líder Contabilidade — Assessoria e Consultoria**, em branco e dourado, com animações e layout responsivo.

## Tecnologias

- HTML, CSS e JavaScript puros (sem build)
- [GSAP 3](https://gsap.com/) + ScrollTrigger: intro do hero, rolagem horizontal, parallax e textos que acendem com a rolagem
- [Lenis](https://lenis.darkroom.engineering/): rolagem suave
- Fontes: Cormorant Garamond, Cinzel e Montserrat (Google Fonts)

## Estrutura

```
index.html
assets/
  css/style.css
  js/main.js
  img/            fotos e artes do Instagram
vercel.json       cache e cabeçalhos
```

## Configuração de contato

No topo de `assets/js/main.js`:

```js
const CONFIG = {
  whatsapp: '5599981889169', // DDI + DDD + número, só dígitos
  instagram: 'lidercontabilidade',
};
```

Os botões de contato abrem o WhatsApp com mensagem pronta, e o formulário envia nome, telefone, assunto e mensagem.
Se `whatsapp` ficar vazio, os botões passam a abrir o Direct do Instagram.
O número exibido na seção de contato e no rodapé fica no `index.html` (busque por `98188-9169`).

## Textos de demonstração

Os textos sobre a contadora, os números (+10 anos, +300 clientes etc.) e o horário de atendimento são **demonstrativos**
e devem ser trocados pelos dados reais antes de divulgar o site.

## Rodar localmente

Qualquer servidor estático serve, por exemplo:

```bash
python -m http.server 5500
```
