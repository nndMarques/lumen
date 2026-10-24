# Ligar a conta e as notificações do Lumen (Supabase)

O app funciona sem nada disso. Estes passos ligam: **conta por e-mail**, **sincronização** entre aparelhos,
**cofre cifrado** da lista de confissão e **lembretes no celular** com o app fechado.

Você vai precisar de uns 30 a 40 minutos, uma conta no Supabase e o terminal do computador.

> Segurança: a chave `anon` e a URL podem ir para o código. A chave `service_role` e a chave privada VAPID
> **nunca** vão para o código nem para o GitHub. Elas ficam só nos "segredos" do Supabase.

---

## 1. Criar o projeto

1. Entre em <https://supabase.com> e crie uma conta (pode ser com o GitHub).
2. **New project**: nome `lumen`, escolha uma senha forte para o banco (guarde no gerenciador de senhas) e a região **South America (São Paulo)**.
3. Espere uns 2 minutos até ficar pronto.

## 2. Criar as tabelas e as regras de segurança

1. No menu: **SQL Editor** > **New query**.
2. Cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Deve aparecer "Success". Pode rodar de novo sem problema.

## 3. Login por código de 6 dígitos

O app usa um código no e-mail (sem senha). Isso funciona bem no iPhone com o app instalado, onde o link por e-mail abriria o Safari em vez do app.

1. **Authentication** > **Providers** > confirme que **Email** está ligado. Deixe "Confirm email" ligado.
2. **Authentication** > **Emails** (ou *Email Templates*) > **Magic link** e também **Confirm signup**.
   Troque o texto do corpo por algo assim, que mostra o código:

```html
<h2>Seu código do Lumen</h2>
<p>Digite este código no app para entrar:</p>
<p style="font-size:28px;letter-spacing:6px"><b>{{ .Token }}</b></p>
<p>Se você não pediu, pode ignorar este e-mail.</p>
```

3. Em **Authentication** > **URL Configuration**, coloque `https://nndmarques.github.io/lumen/` em *Site URL*.
4. O e-mail padrão do Supabase tem limite baixo de envios por hora. Para uso real, configure um envio próprio em
   **Project settings** > **Authentication** > **SMTP** (Resend, Brevo, etc.).

## 4. Conectar o app

1. **Project settings** > **API**. Copie:
   - **Project URL**
   - **anon public** key
2. Abra `js/config.js` e preencha `supabaseUrl` e `supabaseAnonKey`.
3. Salve e publique. O app passa a mostrar "Conta e sincronização" em Mais.

## 5. Notificações (lembrete com o app fechado)

### 5.1 Gerar as chaves VAPID

No terminal, na pasta do projeto:

```bash
npx web-push generate-vapid-keys
```

Isso mostra uma **Public Key** e uma **Private Key**.

- Cole a **pública** em `js/config.js` (`vapidPublicKey`).
- A **privada** vai só nos segredos (passo 5.3).

### 5.2 Instalar a ferramenta do Supabase e publicar a função

```bash
npm install -g supabase
supabase login
supabase link --project-ref SEU_REF
supabase functions deploy enviar-lembretes --no-verify-jwt
```

(`SEU_REF` é o código na URL do projeto, a parte antes de `.supabase.co`.)

### 5.3 Segredos da função

Invente um texto longo e aleatório para `LEMBRETE_SEGREDO` (é a "senha" do agendador).

```bash
supabase secrets set VAPID_PUBLICA="COLE_A_PUBLICA" VAPID_PRIVADA="COLE_A_PRIVADA" VAPID_ASSUNTO="mailto:seu@email.com" LEMBRETE_SEGREDO="UM_TEXTO_LONGO_E_ALEATORIO"
```

### 5.4 Agendar a função a cada minuto

1. **Database** > **Extensions**: ligue **pg_cron** e **pg_net**.
2. **SQL Editor**, rode (trocando os dois valores):

```sql
select cron.schedule(
  'lumen-lembretes',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://SEU_REF.supabase.co/functions/v1/enviar-lembretes',
    headers := jsonb_build_object('Content-Type','application/json','x-lumen-segredo','O_MESMO_LEMBRETE_SEGREDO'),
    body := '{}'::jsonb
  );
  $$
);
```

Para parar: `select cron.unschedule('lumen-lembretes');`

## 6. Testar

1. Abra o app, vá em **Mais** > **Conta**, digite seu e-mail e o código recebido.
2. Crie a **senha do cofre**. Marque algo no exame, abra o app em outro aparelho, entre e abra o cofre com a mesma senha.
3. Defina a **hora do lembrete do terço**, toque em **Ativar lembretes no celular** e aceite a permissão.
4. Escolha uma hora 2 minutos à frente e feche o app. O aviso deve chegar.

**iPhone:** as notificações só funcionam com o app **instalado na tela de início** (Compartilhar > Adicionar à Tela de Início) e iOS 16.4 ou mais novo.

## Cuidados com os dados (LGPD)

- A lista de confissão e as anotações são dado pessoal sensível (convicção religiosa). Elas vão cifradas, mas ainda assim:
  tenha uma **política de privacidade** pública, com seu contato, o que é guardado e como apagar.
- "Apagar minha conta" no app remove tudo do servidor.
- Antes de divulgar para muita gente, vale uma revisão jurídica dos textos de privacidade e termos de uso.
