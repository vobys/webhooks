## WebHooks Server

Este é um servidor de integrações via **WebHooks** utilizado para automatizar algumas tarefas de infraestrutura.

Até o momento temos as seguintes integrações implementadas:

* SonarQube Analysis to GitHub Statuses
* SonarQube Analysis to GitLab Statuses

### Configurações

As configurações são realizadas através de um arquivo externo nomeado `config.json`. A seguir, um exemplo
deste arquivo:

```json
{
  "github": {
    "owner": "github",
    "token": "XYZ",
    "repos": [
      {
        "name": "repo-name",
        "environments": [
          {
            "name": "Staging",
            "desc": "Deploy from CD Job",
            "location": "AWS Sample",
            "server": "10.0.0.10",
            "task": "deploy:webapp"
          },
          {
            "name": "Production",
            "desc": "Deploy from Approval Worflow",
            "location": "AWS Sample",
            "server": "10.0.0.11",
            "task": "approval:webapp"
          }
        ]
      }
    ]
  },
  "gitlab": {
    "token": "XYZ"
  }
}
```

    github         :: Informações sobre o repositório do GitHub
        owner      :: Organização do GitHub para os repositórios
        token      :: O token de autenticação do GitHub
        repos      :: Informações extras por repositório do GitHub (vide exemplo acima)
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
