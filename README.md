## Vobys WebHook Server

Este é a **API** para integrações via **WebHooks** do **Vobys** no **Discord** utilizada para automatizar algumas tarefas de infraestrutura.

Até o momento temos os seguintes integrações implementadas:

* SonarQube Analysis to GitHub Statuses

### Configurações

Algumas configurações podem ser realizadas através de um arquivo externo nomeado `config.json`. A seguir, um exemplo
deste arquivo:

```json
{
  "github": {
    "owner": "github",
    "token": "XYZ"
  },
  "gitlab": {
    "token": "XYZ"
  }
}
```

    github         :: Informações sobre o repositório do GitHub
        owner      :: Organização do GitHub para os repositórios
        token      :: O token de autenticação do GitHub
    gitlab         :: Informações sobre o repositório do GitLab
        token      :: O token de autenticação do GitLab

### Executando o Servidor

O seguinte comando executará a **API** com o `pm2`:

```bash
pm2 start bin/webhook
```

### Comandos PM2

Comandos PM2 podem ser usados através dos seguintes comandos:

#### Verificar os Logs do Serviço

```bash
pm2 logs webhook
```

#### Monitorando CPU/Uso de cada Processo

```bash
pm2 monit
```

#### Listando Processos Gerenciados

```bash
pm2 list
```

#### Obter mais Informações sobre um Processo

```bash
pm2 show [process-id]
```

#### Recarregar Todas Aplicações com 0s de Downtime

```bash
pm2 reload all
```
